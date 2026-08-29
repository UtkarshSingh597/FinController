import csv
import io
from datetime import UTC, datetime
from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user, get_db
from app.models.financial import (
    Customer,
    Expense,
    Order,
    OrderStatus,
    Payment,
    PaymentAttempt,
    PaymentStatus,
    Refund,
    Settlement,
    SettlementStatus,
)
from app.schemas.ingestion import CSVIngestionRequest, CSVIngestionResponse
from app.services.currency import normalize_to_usd

router = APIRouter(prefix="/ingestion", tags=["ingestion"])


@router.post("/json", response_model=CSVIngestionResponse)
def ingest_json_rows(
    payload: CSVIngestionRequest,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> CSVIngestionResponse:
    """Ingest batch structured transaction rows into authenticated tenant ledger."""
    org_id = current_user.organization_id
    orders_c = 0
    payments_c = 0
    expenses_c = 0
    refunds_c = 0
    settlements_c = 0
    errors: list[str] = []

    # Get or create generic customer for imports
    customer = (
        session.query(Customer)
        .filter_by(organization_id=org_id, email="import@fincontroller.local")
        .first()
    )
    if not customer:
        customer = Customer(
            organization_id=org_id,
            email="import@fincontroller.local",
            external_id=f"cust_imp_{uuid4().hex[:8]}",
            segment="standard",
        )
        session.add(customer)
        session.flush()

    for idx, row in enumerate(payload.rows):
        try:
            try:
                occurred_at = datetime.fromisoformat(row.date.replace("Z", "+00:00"))
            except ValueError:
                occurred_at = datetime.now(UTC)

            amount_usd = normalize_to_usd(Decimal(str(row.amount)), currency=row.currency)
            row_type = row.type.lower().strip()

            if row_type in ("order", "sales"):
                order = Order(
                    organization_id=org_id,
                    customer_id=customer.id,
                    external_id=f"csv_ord_{uuid4().hex[:8]}",
                    amount=amount_usd,
                    currency="USD",
                    status=OrderStatus.PAID,
                    occurred_at=occurred_at,
                )
                session.add(order)
                orders_c += 1

            elif row_type in ("payment", "transaction"):
                order = Order(
                    organization_id=org_id,
                    customer_id=customer.id,
                    external_id=f"csv_ord_{uuid4().hex[:8]}",
                    amount=amount_usd,
                    currency="USD",
                    status=OrderStatus.PAID,
                    occurred_at=occurred_at,
                )
                session.add(order)
                session.flush()

                payment = Payment(
                    organization_id=org_id,
                    order_id=order.id,
                    provider=row.provider or "manual_import",
                    method="bank_transfer",
                    amount=amount_usd,
                    fee_amount=Decimal("0.0"),
                    currency="USD",
                    status=PaymentStatus.SUCCEEDED,
                    occurred_at=occurred_at,
                )
                session.add(payment)
                session.flush()

                attempt = PaymentAttempt(
                    organization_id=org_id,
                    payment_id=payment.id,
                    attempt_number=1,
                    status=PaymentStatus.SUCCEEDED,
                    occurred_at=occurred_at,
                )
                session.add(attempt)
                payments_c += 1

            elif row_type in ("expense", "cost", "fee", "bill"):
                expense = Expense(
                    organization_id=org_id,
                    category=row.category or "operations",
                    amount=amount_usd,
                    currency="USD",
                    occurred_at=occurred_at,
                )
                session.add(expense)
                expenses_c += 1

            elif row_type in ("refund", "chargeback"):
                latest_p = session.query(Payment).filter_by(organization_id=org_id).first()
                if latest_p:
                    refund = Refund(
                        organization_id=org_id,
                        payment_id=latest_p.id,
                        amount=amount_usd,
                        reason=row.description or "Imported refund",
                        occurred_at=occurred_at,
                    )
                    session.add(refund)
                    refunds_c += 1
                else:
                    errors.append(f"Row {idx}: Refund skipped (no existing payments to link).")

            elif row_type in ("settlement", "payout"):
                settlement = Settlement(
                    organization_id=org_id,
                    provider=row.provider or "Bank Transfer",
                    expected_amount=amount_usd,
                    actual_amount=amount_usd,
                    currency="USD",
                    status=SettlementStatus.PAID,
                    expected_at=occurred_at,
                    settled_at=occurred_at,
                )
                session.add(settlement)
                settlements_c += 1

        except Exception as e:
            errors.append(f"Row {idx} parsing error: {str(e)}")

    session.commit()
    return CSVIngestionResponse(
        success=True,
        total_processed=len(payload.rows),
        orders_created=orders_c,
        payments_created=payments_c,
        expenses_created=expenses_c,
        refunds_created=refunds_c,
        settlements_created=settlements_c,
        errors=errors,
    )


@router.post("/csv-statement", response_model=CSVIngestionResponse)
async def upload_csv_statement(
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> CSVIngestionResponse:
    """Parse multipart uploaded CSV bank statement and insert into tenant ledger."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a CSV (.csv) file.",
        )

    content = await file.read()
    try:
        decoded = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        decoded = content.decode("latin1")

    reader = csv.DictReader(io.StringIO(decoded))
    rows: list[dict] = []
    for r in reader:
        clean_row = {k.strip().lower(): v.strip() for k, v in r.items() if k}
        rows.append(clean_row)

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file contains no data rows.",
        )

    converted_rows = []
    for r in rows:
        now_iso = datetime.now(UTC).isoformat()
        date_val = r.get("date") or r.get("timestamp") or r.get("occurred_at") or now_iso
        amt_str = r.get("amount") or r.get("value") or "0"
        clean_amt = amt_str.replace("$", "").replace(",", "").strip()
        try:
            amt_flt = float(clean_amt)
        except ValueError:
            amt_flt = 0.0

        type_val = r.get("type") or r.get("category") or ("expense" if amt_flt < 0 else "payment")
        desc_val = r.get("description") or r.get("memo") or r.get("name") or "CSV statement item"
        curr_val = r.get("currency") or "USD"

        converted_rows.append(
            CSVIngestionRequest(
                rows=[{
                    "date": str(date_val),
                    "amount": abs(amt_flt),
                    "type": str(type_val),
                    "description": str(desc_val),
                    "currency": str(curr_val),
                    "provider": r.get("provider", "csv_import"),
                    "category": r.get("expense_category", "operations"),
                }]
            ).rows[0]
        )

    return ingest_json_rows(
        payload=CSVIngestionRequest(rows=converted_rows),
        current_user=current_user,
        session=session,
    )

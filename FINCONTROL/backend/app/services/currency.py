from decimal import Decimal
from enum import StrEnum


class Currency(StrEnum):
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    JPY = "JPY"
    CAD = "CAD"
    AUD = "AUD"
    CHF = "CHF"


# Standard reference exchange rates to USD base
EXCHANGE_RATES_TO_USD: dict[Currency, Decimal] = {
    Currency.USD: Decimal("1.0"),
    Currency.EUR: Decimal("1.0850"),
    Currency.GBP: Decimal("1.2650"),
    Currency.JPY: Decimal("0.0065"),
    Currency.CAD: Decimal("0.7420"),
    Currency.AUD: Decimal("0.6550"),
    Currency.CHF: Decimal("1.1250"),
}


def convert_currency(
    amount: Decimal | float,
    *,
    from_currency: str | Currency,
    to_currency: str | Currency = Currency.USD,
) -> Decimal:
    """Deterministic multi-currency conversion utility."""
    amt_dec = Decimal(str(amount))
    from_curr = (
        Currency(from_currency.upper())
        if isinstance(from_currency, str)
        else from_currency
    )
    to_curr = (
        Currency(to_currency.upper())
        if isinstance(to_currency, str)
        else to_currency
    )

    if from_curr == to_curr:
        return amt_dec

    rate_from = EXCHANGE_RATES_TO_USD.get(from_curr, Decimal("1.0"))
    rate_to = EXCHANGE_RATES_TO_USD.get(to_curr, Decimal("1.0"))

    # Convert to USD baseline, then to target currency
    usd_amount = amt_dec * rate_from
    converted = usd_amount / rate_to
    return Decimal(str(round(converted, 2)))


def normalize_to_usd(amount: Decimal | float, *, currency: str) -> Decimal:
    """Normalize any transaction amount to USD baseline."""
    try:
        curr = Currency(currency.upper())
        return convert_currency(amount, from_currency=curr, to_currency=Currency.USD)
    except (ValueError, KeyError):
        # Default 1:1 if currency unrecognized
        return Decimal(str(amount))

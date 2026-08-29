from decimal import Decimal

from app.services.currency import Currency, convert_currency, normalize_to_usd


def test_currency_conversion_identity():
    res = convert_currency(
        Decimal("100.00"), from_currency=Currency.USD, to_currency=Currency.USD
    )
    assert res == Decimal("100.00")


def test_currency_conversion_eur_to_usd():
    # 100 EUR * 1.0850 = 108.50 USD
    res = convert_currency(Decimal("100.00"), from_currency="EUR", to_currency="USD")
    assert res == Decimal("108.50")


def test_currency_conversion_gbp_to_eur():
    # 100 GBP * 1.2650 = 126.50 USD / 1.0850 = 116.59 EUR
    res = convert_currency(Decimal("100.00"), from_currency="GBP", to_currency="EUR")
    assert res == Decimal("116.59")


def test_normalize_to_usd():
    assert normalize_to_usd(Decimal("200.00"), currency="EUR") == Decimal("217.00")
    assert normalize_to_usd(Decimal("50.00"), currency="UNKNOWN") == Decimal("50.00")

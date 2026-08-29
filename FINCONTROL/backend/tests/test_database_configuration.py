from app.core.config import get_settings


def test_default_database_url_uses_postgresql_driver() -> None:
    get_settings.cache_clear()

    assert get_settings().database_url.startswith("postgresql+psycopg://")

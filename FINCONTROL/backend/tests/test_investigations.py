from uuid import uuid4

from app.services.investigations import execute_investigation


def test_investigation_persists_labeled_evidence(client) -> None:
    override = next(iter(client.app.dependency_overrides.values()))
    generator = override()
    session = next(generator)
    result = execute_investigation(
        session, organization_id=uuid4(), user_id=uuid4(), question="What changed?"
    )
    assert result.evidence[0]["type"] == "fact"
    assert result.conclusion["type"] == "hypothesis"
    generator.close()

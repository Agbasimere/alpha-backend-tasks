from __future__ import annotations

from pathlib import Path
import sys

from app.database import Base, engine  # type: ignore[reportMissingImports]
from app.models import (  # type: ignore[reportMissingImports]
    Briefing,
    BriefingMetric,
    BriefingPoint,
    BriefingRisk,
    SampleItem,
)


def main() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    # Ensure python-service is importable when running from repo root
    project_root = Path(__file__).resolve().parent
    python_service_path = project_root / "python-service"
    if str(python_service_path) not in sys.path:
        sys.path.insert(0, str(python_service_path))

    main()


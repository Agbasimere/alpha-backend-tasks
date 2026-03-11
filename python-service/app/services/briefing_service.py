from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.briefing import Briefing, BriefingMetric, BriefingPoint, BriefingRisk
from app.schemas.briefing import (
    BriefingCreateSchema,
    BriefingMetricReadSchema,
    BriefingResponseSchema,
)

_TEMPLATE_DIR = Path(__file__).resolve().parents[1] / "templates"

_jinja_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATE_DIR)),
    autoescape=select_autoescape(enabled_extensions=("html", "xml"), default_for_string=True),
)


def _get_briefing_or_404(db: Session, briefing_id: int) -> Briefing:
    stmt = select(Briefing).where(Briefing.id == briefing_id)
    briefing = db.scalar(stmt)
    if briefing is None:
        raise LookupError(f"Briefing {briefing_id} not found")
    return briefing


def _sorted_points(briefing: Briefing) -> List[str]:
    return sorted((p.point_text or "").strip() for p in briefing.points)


def _sorted_risks(briefing: Briefing) -> List[str]:
    return sorted((r.risk_text or "").strip() for r in briefing.risks)


def _normalized_metrics(briefing: Briefing) -> List[BriefingMetricReadSchema]:
    metrics: List[BriefingMetricReadSchema] = []
    for m in briefing.metrics:
        label = (m.name or "").strip().title()
        metrics.append(BriefingMetricReadSchema(name=label, value=(m.value or "").strip()))
    return metrics


def _build_view_model(briefing: Briefing, generated_at: datetime) -> Dict[str, Any]:
    key_points = _sorted_points(briefing)
    risks = _sorted_risks(briefing)
    metrics = _normalized_metrics(briefing)

    title = f"{briefing.company_name} ({briefing.ticker}) – Briefing Report"

    return {
        "title": title,
        "company_name": briefing.company_name,
        "ticker": briefing.ticker,
        "sector": briefing.sector,
        "analyst_name": briefing.analyst_name,
        "summary": briefing.summary,
        "key_points": key_points,
        "risks": risks,
        "recommendation": briefing.recommendation,
        "metrics": metrics,
        "generated_at": generated_at,
    }


def create_briefing(db: Session, payload: BriefingCreateSchema) -> BriefingResponseSchema:
    briefing = Briefing(
        company_name=payload.company_name.strip(),
        ticker=payload.ticker.strip(),
        sector=payload.sector.strip() if payload.sector else None,
        analyst_name=payload.analyst_name.strip() if payload.analyst_name else None,
        summary=payload.summary.strip(),
        recommendation=payload.recommendation.strip(),
    )

    for text in payload.key_points:
        briefing.points.append(BriefingPoint(point_text=text.strip()))

    for text in payload.risks:
        briefing.risks.append(BriefingRisk(risk_text=text.strip()))

    if payload.metrics:
        for metric in payload.metrics:
            briefing.metrics.append(
                BriefingMetric(
                    name=metric.name.strip(),
                    value=metric.value.strip(),
                )
            )

    db.add(briefing)
    db.commit()
    db.refresh(briefing)

    return _to_response_schema(briefing)


def get_briefing(db: Session, briefing_id: int) -> BriefingResponseSchema:
    briefing = _get_briefing_or_404(db, briefing_id)
    return _to_response_schema(briefing)


def generate_report(db: Session, briefing_id: int) -> None:
    briefing = _get_briefing_or_404(db, briefing_id)

    generated_at = datetime.now(timezone.utc)
    view_model = _build_view_model(briefing, generated_at)

    template = _jinja_env.get_template("briefing_report.html")
    html = template.render(**view_model)

    briefing.is_generated = True
    briefing.generated_at = generated_at
    briefing.html_content = html

    db.add(briefing)
    db.commit()


def get_html(db: Session, briefing_id: int) -> str:
    briefing = _get_briefing_or_404(db, briefing_id)
    if not briefing.is_generated or not briefing.html_content:
        raise LookupError("Report has not been generated for this briefing.")
    return briefing.html_content


def _to_response_schema(briefing: Briefing) -> BriefingResponseSchema:
    key_points = _sorted_points(briefing)
    risks = _sorted_risks(briefing)
    metrics = _normalized_metrics(briefing)

    return BriefingResponseSchema(
        id=briefing.id,
        company_name=briefing.company_name,
        ticker=briefing.ticker,
        sector=briefing.sector,
        analyst_name=briefing.analyst_name,
        summary=briefing.summary,
        recommendation=briefing.recommendation,
        is_generated=briefing.is_generated,
        created_at=briefing.created_at,
        updated_at=briefing.updated_at,
        key_points=key_points,
        risks=risks,
        metrics=metrics,
    )


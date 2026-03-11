from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.briefing import BriefingCreateSchema, BriefingResponseSchema
from app.services import briefing_service
from app.models.briefing import Briefing

router = APIRouter(tags=["briefings"])


@router.post(
    "",
    response_model=BriefingResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_briefing(
    payload: BriefingCreateSchema,
    db: Annotated[Session, Depends(get_db)],
) -> BriefingResponseSchema:
    try:
        return briefing_service.create_briefing(db, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to create briefing. Please ensure metric names are unique.",
        ) from exc


@router.get(
    "/{briefing_id}",
    response_model=BriefingResponseSchema,
)
def get_briefing(
    briefing_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> BriefingResponseSchema:
    try:
        return briefing_service.get_briefing(db, briefing_id)
    except LookupError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.post(
    "/{briefing_id}/generate",
    status_code=status.HTTP_202_ACCEPTED,
)
def generate_briefing_report(
    briefing_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, str]:
    try:
        briefing_service.generate_report(db, briefing_id)
    except LookupError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    return {"status": "generated"}


@router.get(
    "/{briefing_id}/html",
    response_class=Response,
)
def get_briefing_html(
    briefing_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    try:
        html = briefing_service.get_html(db, briefing_id)
    except LookupError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    return Response(content=html, media_type="text/html")

@router.delete("/briefings/{briefing_id}")
def delete_briefing(briefing_id: int, db: Session = Depends(get_db)):
    briefing = db.query(Briefing).filter(Briefing.id == briefing_id).first()
    if not briefing:
        raise HTTPException(status_code=404, detail="Briefing not found")
    db.delete(briefing)
    db.commit()
    return {"status": "deleted"}


from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class BriefingMetricSchema(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    value: str = Field(min_length=1, max_length=255)


class BriefingCreateSchema(BaseModel):
    company_name: str = Field(min_length=1, max_length=255)
    ticker: str = Field(min_length=1, max_length=32)
    sector: Optional[str] = Field(default=None, max_length=255)
    analyst_name: Optional[str] = Field(default=None, max_length=255)
    summary: str = Field(min_length=1)
    recommendation: str = Field(min_length=1)
    key_points: List[str] = Field(min_length=2)
    risks: List[str] = Field(min_length=1)
    metrics: Optional[List[BriefingMetricSchema]] = None

    @field_validator("ticker")
    @classmethod
    def normalize_ticker(cls, v: str) -> str:
        return v.upper()

    @field_validator("key_points")
    @classmethod
    def validate_key_points(cls, v: List[str]) -> List[str]:
        if len(v) < 2:
            raise ValueError("At least 2 key points are required.")
        return v

    @field_validator("risks")
    @classmethod
    def validate_risks(cls, v: List[str]) -> List[str]:
        if len(v) < 1:
            raise ValueError("At least 1 risk is required.")
        return v

    @model_validator(mode="after")
    def validate_metric_names_unique(self) -> "BriefingCreateSchema":
        if self.metrics:
            names = [m.name for m in self.metrics]
            if len(names) != len(set(names)):
                raise ValueError("Metric names must be unique within a briefing.")
        return self


class BriefingMetricReadSchema(BaseModel):
    name: str
    value: str


class BriefingResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: str
    ticker: str
    sector: Optional[str]
    analyst_name: Optional[str]
    summary: str
    recommendation: str
    is_generated: bool
    created_at: datetime
    updated_at: datetime
    key_points: List[str]
    risks: List[str]
    metrics: List[BriefingMetricReadSchema]


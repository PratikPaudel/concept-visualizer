from pydantic import BaseModel
from typing import List, Optional


class VisualizationElement(BaseModel):
    label: str
    type: str
    position: Optional[str] = None
    description: Optional[str] = None


class VisualizationPlan(BaseModel):
    title: str
    layout: Optional[str] = None
    interaction: Optional[str] = None
    elements: List[VisualizationElement]


class ConceptRequest(BaseModel):
    concept: str


class ConceptResponse(BaseModel):
    category: str
    visualization: VisualizationPlan

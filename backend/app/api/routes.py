# Corrected version of app/api/routes.py

from fastapi import APIRouter
from app.models.concept import ConceptRequest, ConceptResponse
from app.services.gemini_client import generate_concept_visualization

router = APIRouter()


@router.post("/visualize", response_model=ConceptResponse)
async def visualize_concept(concept_request: ConceptRequest):
    # Call the service with the concept string from the request
    result = await generate_concept_visualization(concept_request.concept)

    # Correctly build the ConceptResponse using the keys from the result dictionary
    # The 'result' dictionary contains "category" and "visualization"
    return ConceptResponse(
        category=result["category"], visualization=result["visualization"]
    )

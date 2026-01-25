from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RecommendationRequest(BaseModel):
    user_id: str
    context: str

@app.get("/health")
def read_root():
    return {"status": "ok", "service": "ai"}

@app.post("/recommend")
def recommend(req: RecommendationRequest):
    # Placeholder for actual semantic search / recommendation logic
    # In v1.5+, this would connect to Vector DB or OpenAI API
    return {
        "recommendations": [
            {"id": "work-1", "score": 0.95, "reason": "Consistent with HCI interest"},
            {"id": "work-2", "score": 0.88, "reason": "High relevance to context"}
        ]
    }

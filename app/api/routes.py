from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_chain import ask_question

router = APIRouter()

# Define the expected structure of incoming requests
class QuestionRequest(BaseModel):
    car_model: str
    question: str

@router.post("/ask")
async def ask_manual(request: QuestionRequest):
    try:
        answer, sources = ask_question(request.car_model, request.question)
        
        # Only return sources if answer is not a greeting
        greeting_keywords = ["hello", "hi", "hey", "nice to meet"]
        is_greeting = any(word in answer.lower()[:50] for word in greeting_keywords)
        
        formatted_sources = [] if is_greeting else [
            {
                "page": doc.metadata.get('page', 'N/A'),
                "preview": doc.page_content[:200]
            } for doc in sources[:2]
        ]
        
        return {
            "answer": answer,
            "sources": formatted_sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
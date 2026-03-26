import traceback

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
        print(f"DEBUG: Received question for {request.car_model}: {request.question}")
        
        # This is likely where the crash is happening
        answer, sources = ask_question(request.car_model, request.question)
        
        print("DEBUG: Successfully got answer from rag_chain")

        # Greeting logic
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
        # This prints the EXACT error and line number to your Render Logs
        print("\n🚨 BACKEND CRASH DETECTED!")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        print("--- FULL TRACEBACK ---")
        print(traceback.format_exc())
        print("----------------------\n")
        
        # Still return the 500 so the frontend knows it failed
        raise HTTPException(status_code=500, detail=str(e))
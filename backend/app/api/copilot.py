from fastapi import APIRouter, HTTPException, status
from app.models.schemas import CopilotChatRequest, CopilotChatResponse
from app.rag.copilot import query_copilot
from datetime import datetime

router = APIRouter(prefix="/copilot", tags=["copilot"])

@router.post("/chat", response_model=CopilotChatResponse)
async def chat_with_copilot(req: CopilotChatRequest):
    """
    RAG chat endpoint. Receives current question and history, queries Llama 3 with playbooks context.
    """
    try:
        # Convert schema items to dict list
        hist_dicts = [{"role": h.role, "content": h.content} for h in req.history]
        response_text = await query_copilot(req.message, hist_dicts)
        
        return {
            "response": response_text,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Copilot encountered an error: {e}"
        )

"""AI Chatbot (RAG) API route."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: str = ""  # optional disaster context


@router.post("/chat")
async def chat(request: ChatRequest):
    """
    RAG-powered disaster management chatbot.
    Retrieves relevant information from historical data and provides structured answers.
    """
    user_message = request.messages[-1].content if request.messages else ""

    # Try RAG response, fall back to rule-based
    try:
        from rag.chatbot import get_response
        response = get_response(user_message, request.context)
        return {"response": response, "source": "rag"}
    except Exception:
        return {
            "response": _rule_based_response(user_message),
            "source": "rule_based",
            "note": "RAG module not initialized. Run: python pipelines/pipeline.py"
        }


def _rule_based_response(message: str) -> str:
    message_lower = message.lower()
    if any(w in message_lower for w in ["flood", "flooding", "water"]):
        return ("**Flood Response Protocol:**\n"
                "1. Evacuate low-lying areas immediately\n"
                "2. Deploy rescue boats to affected zones\n"
                "3. Set up relief camps on elevated ground\n"
                "4. Coordinate with NDRF teams\n"
                "5. Issue public alerts via SMS and radio\n\n"
                "Key contacts: NDRF: 011-24363260 | NDMA: 011-26701700")
    elif any(w in message_lower for w in ["earthquake", "quake", "tremor"]):
        return ("**Earthquake Response Protocol:**\n"
                "1. Search and rescue operations — first 72 hours critical\n"
                "2. Deploy heavy machinery for debris clearance\n"
                "3. Medical teams for injury triage\n"
                "4. Structural assessment before re-entry\n"
                "5. Aftershock monitoring alerts\n\n"
                "Helpline: 1078 (Disaster Management)")
    elif any(w in message_lower for w in ["cyclone", "hurricane", "storm"]):
        return ("**Cyclone Response Protocol:**\n"
                "1. Evacuate coastal areas — mandatory within 10km of coastline\n"
                "2. Secure boats and equipment\n"
                "3. Pre-position relief supplies\n"
                "4. Monitor IMD alerts every 3 hours\n"
                "5. Keep emergency power backup ready")
    elif any(w in message_lower for w in ["resource", "help", "need"]):
        return ("**Resource Allocation:**\n"
                "Use the Resources page to:\n"
                "- View available NDRF teams, medical units, and vehicles\n"
                "- Deploy resources to active incidents\n"
                "- Track real-time resource location\n\n"
                "For urgent needs, use the SOS Reports section.")
    else:
        return ("I'm the ERIP AI Assistant. I can help with:\n"
                "- **Disaster protocols** (flood, earthquake, cyclone)\n"
                "- **Resource allocation** recommendations\n"
                "- **Risk assessment** for specific regions\n"
                "- **Historical data** analysis\n\n"
                "What disaster scenario do you need help with?")

# backend/routers/stripe_webhook.py
import stripe, os, json
from fastapi import APIRouter, Request, Header, HTTPException
from firebase_admin import firestore

db = firestore.client()
router = APIRouter()

@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
):
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload,
            stripe_signature,
            os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook")

    # ✅ Payment success
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        uid = session["metadata"]["uid"]

        db.collection("users").document(uid).update({
            "plan": "pro"
        })

    return {"status": "ok"}

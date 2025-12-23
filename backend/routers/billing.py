import stripe
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth.firebase import get_current_user  # uid from Firebase token
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

router = APIRouter(prefix="/billing", tags=["billing"])

class CheckoutRequest(BaseModel):
    price_id: str  # Stripe Price ID

@router.post("/checkout")
def create_checkout(req: CheckoutRequest, user=Depends(get_current_user)):
    session = stripe.checkout.Session.create(
        mode="subscription",
        payment_method_types=["card"],
        customer_email=user["email"],
        line_items=[{
            "price": req.price_id,
            "quantity": 1,
        }],
        success_url=f"{os.getenv('FRONTEND_URL')}/?upgrade=success",
        cancel_url=f"{os.getenv('FRONTEND_URL')}/pricing",
        metadata={
            "uid": user["uid"]
        }
    )
    return {"url": session.url}

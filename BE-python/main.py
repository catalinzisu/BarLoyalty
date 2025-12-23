from fastapi import FastAPI
from pydantic import BaseModel
import qrcode
import io
import base64
import uuid
from datetime import datetime, timezone
import uvicorn
from typing import Dict, Any

# Initialize FastAPI app
app = FastAPI(title="QR Code Generator Microservice", version="1.0.0")


# Pydantic data model for transaction data
class TransactionData(BaseModel):
    user_id: int
    amount: float


# Response model matching Java Backend expectations
class QRCodeResponse(BaseModel):
    qr_code_base64: str
    hash: str


@app.post("/generate-qr", response_model=QRCodeResponse)
async def generate_qr(data: TransactionData) -> Dict[str, Any]:
    """
    Generate QR Code from transaction data.

    Args:
        data: TransactionData containing user_id and amount

    Returns:
        JSON object with base64 encoded QR code image and hash
    """
    try:
        # Generate unique hash combining user_id, amount, timestamp and UUID
        timestamp = datetime.now(timezone.utc).isoformat()
        unique_string = f"{data.user_id}_{data.amount}_{timestamp}_{uuid.uuid4()}"
        hash_value = str(uuid.uuid5(uuid.NAMESPACE_DNS, unique_string))

        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )

        # Add data to QR code
        qr.add_data(hash_value)
        qr.make(fit=True)

        # Create QR code image
        img = qr.make_image(fill_color="black", back_color="white")

        # Save image to memory buffer instead of disk
        img_buffer = io.BytesIO()
        img.save(img_buffer, format="PNG")
        img_buffer.seek(0)

        # Convert image bytes to Base64 string
        img_bytes = img_buffer.getvalue()
        qr_base64 = base64.b64encode(img_bytes).decode("utf-8")

        # Return response matching Java Backend expectations
        return {
            "qr_code_base64": qr_base64,
            "hash": hash_value
        }

    except Exception as e:
        raise Exception(f"Error generating QR code: {str(e)}")


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    return {"status": "healthy"}


# Server configuration
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000,
        log_level="info"
    )


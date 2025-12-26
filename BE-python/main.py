import os
import logging
import json
from io import BytesIO
from base64 import b64encode
import qrcode
import uuid
from datetime import datetime, timezone
import uvicorn
from typing import Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel
from prometheus_fastapi_instrumentator import Instrumentator

# Configure JSON logging
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "service": "python-qr-service" # <--- E bine sa pui numele serviciului pentru Loki
        }
        return json.dumps(log_data)

logger = logging.getLogger("qr_service")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)

# Initialize FastAPI app
app = FastAPI(title="QR Code Generator Microservice", version="1.0.0")

# <--- AICI ESTE FIX-UL PENTRU PROMETHEUS 404
# Asta creeaza automat ruta /metrics si colecteaza date despre request-uri
Instrumentator().instrument(app).expose(app)
# ---------------------------------------------------------

# Pydantic data models
class TransactionData(BaseModel):
    user_id: int
    amount: float

class ValidationRequest(BaseModel):
    qr_hash: str

class QRCodeResponse(BaseModel):
    qr_code_base64: str
    hash: str

class ValidationResponse(BaseModel):
    valid: bool
    timestamp: str

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    logger.info("Health check endpoint called")
    return {"status": "up"}

@app.post("/generate-qr", response_model=QRCodeResponse)
async def generate_qr(data: TransactionData) -> Dict[str, Any]:
    """
    Generate QR Code from transaction data.
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

        img_buffer = BytesIO()
        img.save(img_buffer, format="PNG")
        img_buffer.seek(0)

        img_bytes = img_buffer.getvalue()
        qr_base64 = b64encode(img_bytes).decode("utf-8")

        logger.info(f"QR code generated for user_id: {data.user_id}")

        return {
            "qr_code_base64": qr_base64,
            "hash": hash_value
        }

    except Exception as e:
        logger.error(f"Error generating QR code: {str(e)}")
        raise Exception(f"Error generating QR code: {str(e)}")

@app.post("/validate-qr", response_model=ValidationResponse)
async def validate_qr(data: ValidationRequest) -> Dict[str, Any]:
    logger.info(f"Validating QR hash: {data.qr_hash}")

    # Simple validation: check if hash is not empty
    is_valid = bool(data.qr_hash and len(data.qr_hash) > 0)

    logger.info(f"QR hash validation result: {is_valid}")

    return {
        "valid": is_valid,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Server configuration
if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    log_level = os.getenv("LOG_LEVEL", "info")

    logger.info(f"Starting QR Code Generator Microservice on {host}:{port}")

    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level=log_level
    )
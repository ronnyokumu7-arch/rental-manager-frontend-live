from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import get_settings
from fastapi import Request

settings = get_settings()

def get_client_ip(request: Request) -> str:
    # Check for proxy headers first, fall back to direct connection
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can be a comma-separated list; the first is the original client
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

limiter = Limiter(
    key_func=get_client_ip, # <-- Changed here
    storage_uri=settings.redis_url,
    strategy="moving-window"
)









import logging
from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("uvicorn.error")

async def global_exception_handler(request: Request, exc: Exception):
    # Log the actual error for your debugging
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    
    # Return a safe, sanitized response to the client
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "code": 500,
            "message": "An internal server error occurred. Please try again later."
        },
    )
# Don't forget to register it: app.add_exception_handler(Exception, global_exception_handler)

"""
Health AI Platform - ML Service Middleware
Custom middleware for request logging and error handling
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time
import logging
import json

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all incoming requests and outgoing responses"""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Log request details
        start_time = time.time()
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        logger.info(
            f"Incoming request: {request.method} {request.url.path} | "
            f"IP: {client_ip} | Query: {request.query_params}"
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log response details
            logger.info(
                f"Response: {request.method} {request.url.path} | "
                f"Status: {response.status_code} | Time: {process_time:.3f}s"
            )
            
            # Add processing time header
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Error in request: {request.method} {request.url.path} | "
                f"Time: {process_time:.3f}s | Error: {str(e)}",
                exc_info=True
            )
            raise


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Middleware to validate API keys for protected endpoints"""
    
    def __init__(self, app, api_key_header: str = "X-API-Key"):
        super().__init__(app)
        self.api_key_header = api_key_header
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip auth for health check and docs
        if request.url.path in ["/health", "/docs", "/openapi.json", "/"]:
            return await call_next(request)
        
        # Validate API key for protected routes
        if request.url.path.startswith("/api/v1/"):
            api_key = request.headers.get(self.api_key_header)
            
            if not api_key:
                from starlette.responses import JSONResponse
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Missing API key"}
                )
            
            # TODO: Validate API key against database or config
            # For now, just check if it exists
            if len(api_key) < 10:
                from starlette.responses import JSONResponse
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Invalid API key"}
                )
        
        return await call_next(request)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware"""
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.request_counts = {}
    
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old entries (older than 1 minute)
        self.request_counts = {
            ip: count for ip, count in self.request_counts.items()
            if current_time - count[0] < 60
        }
        
        # Check rate limit
        if client_ip in self.request_counts:
            request_count = self.request_counts[client_ip][1]
            if request_count >= self.requests_per_minute:
                from starlette.responses import JSONResponse
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Rate limit exceeded. Try again later."}
                )
            self.request_counts[client_ip] = (current_time, request_count + 1)
        else:
            self.request_counts[client_ip] = (current_time, 1)
        
        return await call_next(request)
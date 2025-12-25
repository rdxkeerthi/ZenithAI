from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Define lifecycle events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML models, connect to DB
    print("Startup: Loading ZenithAI models...")
    yield
    # Shutdown: Clean up resources
    print("Shutdown: Cleaning up...")

app = FastAPI(
    title="ZenithAI API",
    description="Enterprise Stress Detection Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration - Allow Frontend Access
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "ZenithAI Enterprise API System Online", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "component": "api-gateway"}

# Import Routers
from app.api.v1.endpoints import stress, assistant, reports
app.include_router(stress.router, prefix="/api/v1/stress", tags=["stress"])
app.include_router(assistant.router, prefix="/api/v1/assistant", tags=["assistant"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.db import create_db_and_tables
from app.api.routes import resources, skills, tracks
from fastapi.middleware.cors import CORSMiddleware 


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    create_db_and_tables()
    yield
    # Shutdown: cleanup if needed


app = FastAPI(title="WebAcademy API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],   # or ["GET", "POST", "OPTIONS"]
    allow_headers=["*"],
)

# Include routers
app.include_router(resources.router)
app.include_router(skills.router)
app.include_router(tracks.router)


@app.get("/health")
def health_check():
    return {"status": "healthy"}

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os

from app.database import engine
from app.models import Base
from app.routers import auth, egg, weather


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Toki", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(egg.router)
app.include_router(weather.router)


@app.get("/health")
def health():
    return {"status": "ok"}


# 정적 파일 서빙 (프론트엔드)
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        index = os.path.join(static_dir, "index.html")
        return FileResponse(index)

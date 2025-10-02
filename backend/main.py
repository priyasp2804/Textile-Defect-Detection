from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import db
from routes import auth, report, inspection

app = FastAPI(title="Textile Quality Checker Backend")

origins = [
    "http://localhost:5173",             # Local frontend
    "http://127.0.0.1:5173",             # Local frontend fallback
    "https://textile-defect-detection.vercel.app"   # Vercel deployed frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,               # Only these origins allowed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(report.router)
app.include_router(inspection.router)

@app.get("/ping")
async def ping():
    collections = await db.list_collection_names()
    return {"status": "ok", "db_collections": collections}

@app.get("/")
async def root():
    return {"message": "Textile Quality Checker Backend is running"}

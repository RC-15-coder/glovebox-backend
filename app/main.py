from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="Digital Glovebox API",
    description="RAG backend for automotive owner's manuals",
    version="1.0.0"
)

# Allow any frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routes we are about to create
app.include_router(router)

@app.get("/")
def read_root():
    return {"status": "Digital Glovebox API is running. Go to /docs to test it."}
from fastapi import FastAPI
from app.routers.briefings import router as briefing_router

app = FastAPI()

# Register briefing endpoints
app.include_router(briefing_router, prefix="/briefings")

@app.get("/")
def read_root():
    return {"message": "Briefing Report Generator API is running"}
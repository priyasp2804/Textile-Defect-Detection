# models/report.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Report(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: str
    image_url: Optional[str] = ""
    pdf_url: Optional[str] = ""
    defect_type: Optional[List[str]] = []
    predictions: Optional[list] = []
    description: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

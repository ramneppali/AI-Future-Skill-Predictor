from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class EmployeeInput(BaseModel):
    employee_id: str = Field(min_length=1, max_length=50)
    job_role: str
    department: str
    experience_years: int = Field(ge=0, le=50)
    current_skills: str
    skill_proficiency: str
    current_project_area: str
    technology_trend: str = "High"


class ChatMessage(BaseModel):
    role: str
    text: str = Field(min_length=1, max_length=4000)


class ChatInput(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    employee_id: Optional[str] = None
    history: List[ChatMessage] = Field(default_factory=list, max_length=20)

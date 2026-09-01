from sqlalchemy import Column,Integer,String,Text
from .database import Base
class EmployeePrediction(Base):
    __tablename__='employee_predictions'
    id=Column(Integer,primary_key=True,index=True)
    employee_id=Column(String(50),index=True,nullable=False)
    job_role=Column(String(120),nullable=False)
    department=Column(String(120),nullable=False)
    experience_years=Column(Integer,nullable=False)
    current_skills=Column(Text,nullable=False)
    skill_proficiency=Column(String(50),nullable=False)
    current_project_area=Column(String(150),nullable=False)
    technology_trend=Column(String(50),nullable=False)
    predicted_skills=Column(Text,nullable=False)
    skill_gaps=Column(Text,nullable=False)
    recommendations=Column(Text,nullable=False)

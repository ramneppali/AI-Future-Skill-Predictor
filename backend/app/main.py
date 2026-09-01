import json
import os
import re
from collections import Counter
from pathlib import Path

import joblib
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session

load_dotenv()

from .database import Base, engine, get_db, SessionLocal
from .models import EmployeePrediction
from .recommender import recommend
from .schemas import ChatInput, EmployeeInput

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Future Skill Predictor API", version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path(__file__).resolve().parent.parent / "data" / "future_skill_model.joblib"
model = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna").strip()
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
OPENAI_LAST_ERROR = ""

SKILL_ALIASES = {
    "ai": "Artificial Intelligence",
    "artificial intelligence": "Artificial Intelligence",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "genai": "Generative AI",
    "gen ai": "Generative AI",
    "generative ai": "Generative AI",
    "powerbi": "Power BI",
    "power bi": "Power BI",
    "data viz": "Data Visualisation",
    "data visualization": "Data Visualisation",
    "data visualisation": "Data Visualisation",
}


def canonical_skill(value: str) -> str:
    cleaned = value.strip().lower()
    return SKILL_ALIASES.get(cleaned, value.strip())


def skill_set(value: str):
    return {canonical_skill(s) for s in re.split(r",|;", value or "") if s.strip()}


def build_text(p: EmployeeInput):
    return (
        f"role {p.job_role} department {p.department} experience {p.experience_years} "
        f"skills {p.current_skills} proficiency {p.skill_proficiency} "
        f"project {p.current_project_area} trend {p.technology_trend}"
    )


def run_prediction(p: EmployeeInput):
    if model is None:
        raise HTTPException(500, "Model not trained. Run train_model.py first.")

    text = build_text(p)
    probs = model.predict_proba([text])[0]
    classes = model.named_steps["model"].classes_
    ranked = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)
    predicted = [str(s) for s, _ in ranked[:4]]

    current = skill_set(p.current_skills)
    gaps = [s for s in predicted if canonical_skill(s) not in current]
    # Readiness combines the employee's existing skill foundation, proficiency,
    # and coverage of the predicted future skills. This avoids a misleading
    # 0% whenever future skills are intentionally different from current skills.
    proficiency_score = {"Beginner": 5, "Intermediate": 12, "Advanced": 17, "Expert": 20}.get(p.skill_proficiency, 10)
    breadth_score = min(len(current), 6) / 6 * 50
    future_match_score = ((len(predicted) - len(gaps)) / max(len(predicted), 1)) * 30
    readiness = round(min(100, breadth_score + proficiency_score + future_match_score))
    recs = recommend(gaps)
    return predicted, gaps, readiness, recs



DEMO_EMPLOYEE_COUNT = 250

def seed_demo_employees():
    """Create 250 synthetic/public demo employee records on first startup."""
    db = SessionLocal()
    try:
        if db.query(EmployeePrediction).count() > 0 or model is None:
            return
        csv_path = Path(__file__).resolve().parent.parent / "data" / "training_dataset.csv"
        if not csv_path.exists():
            return
        import csv
        with csv_path.open("r", encoding="utf-8-sig", newline="") as fh:
            source = list(csv.DictReader(fh))
        if not source:
            return

        future_pool = [
            "Generative AI", "Artificial Intelligence", "Machine Learning",
            "Cloud Computing", "MLOps", "Prompt Engineering",
            "Data Engineering", "Cybersecurity", "AI-Assisted Design"
        ]
        for i in range(DEMO_EMPLOYEE_COUNT):
            s = source[i % len(source)]
            role = s.get("job_role", "Software Engineer")
            dept = s.get("department", "Technology")
            try:
                exp = min(15, max(0, int(float(s.get("experience_years", 0))) + (i % 4)))
            except Exception:
                exp = i % 8
            skills = s.get("current_skills", "Python")
            proficiency = s.get("skill_proficiency", "Intermediate")
            project = s.get("current_project_area", "Technology")
            trend = s.get("technology_trend", "High")

            # Public demonstration distribution: 35 High, 82 Medium, 133 Low.
            level = "high" if i < 35 else "medium" if i < 117 else "low"
            if level == "low":
                predicted = [x.strip() for x in skills.split(",")[:3] if x.strip()] or ["Python"]
                gaps = []
            elif level == "medium":
                a = future_pool[i % len(future_pool)]
                b = future_pool[(i + 3) % len(future_pool)]
                predicted, gaps = [a, b], [a]
            else:
                predicted = [
                    future_pool[i % len(future_pool)],
                    future_pool[(i + 2) % len(future_pool)],
                    future_pool[(i + 4) % len(future_pool)],
                    future_pool[(i + 6) % len(future_pool)],
                ]
                gaps = predicted[:3]

            base = {"Beginner": 48, "Intermediate": 62, "Advanced": 78, "Expert": 90}.get(proficiency, 60)
            readiness = max(35, min(96, base + min(18, len(skill_set(skills)) * 3) - len(gaps) * 5))
            db.add(EmployeePrediction(
                employee_id=f"E{i+1:03d}",
                job_role=role,
                department=dept,
                experience_years=exp,
                current_skills=skills,
                skill_proficiency=proficiency,
                current_project_area=project,
                technology_trend=trend,
                predicted_skills=json.dumps(predicted),
                skill_gaps=json.dumps(gaps),
                recommendations=json.dumps(recommend(gaps)),
            ))
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

seed_demo_employees()

def serialize_employee(row: EmployeePrediction):
    predicted = json.loads(row.predicted_skills or "[]")
    gaps = json.loads(row.skill_gaps or "[]")
    recommendations = json.loads(row.recommendations or "[]")
    current = skill_set(row.current_skills)
    proficiency_score = {"Beginner": 5, "Intermediate": 12, "Advanced": 17, "Expert": 20}.get(row.skill_proficiency, 10)
    breadth_score = min(len(current), 6) / 6 * 50
    future_match_score = ((len(predicted) - len(gaps)) / max(len(predicted), 1)) * 30
    readiness = round(min(100, breadth_score + proficiency_score + future_match_score))
    return {
        "id": row.id,
        "employee_id": row.employee_id,
        "job_role": row.job_role,
        "department": row.department,
        "experience_years": row.experience_years,
        "current_skills": [s.strip() for s in row.current_skills.split(",") if s.strip()],
        "skill_proficiency": row.skill_proficiency,
        "current_project_area": row.current_project_area,
        "technology_trend": row.technology_trend,
        "predicted_future_skills": predicted,
        "skill_gaps": gaps,
        "recommendations": recommendations,
        "readiness_score": readiness,
    }


def save_prediction(p: EmployeeInput, db: Session):
    predicted, gaps, readiness, recs = run_prediction(p)
    row = db.query(EmployeePrediction).filter(EmployeePrediction.employee_id == p.employee_id).first()
    if row is None:
        row = EmployeePrediction(employee_id=p.employee_id)
        db.add(row)

    row.job_role = p.job_role
    row.department = p.department
    row.experience_years = p.experience_years
    row.current_skills = p.current_skills
    row.skill_proficiency = p.skill_proficiency
    row.current_project_area = p.current_project_area
    row.technology_trend = p.technology_trend
    row.predicted_skills = json.dumps(predicted)
    row.skill_gaps = json.dumps(gaps)
    row.recommendations = json.dumps(recs)
    db.commit()
    db.refresh(row)
    return row, predicted, gaps, readiness, recs


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict")
def predict(p: EmployeeInput, db: Session = Depends(get_db)):
    row, predicted, gaps, readiness, recs = save_prediction(p, db)
    return {
        "employee_id": row.employee_id,
        "predicted_future_skills": predicted,
        "skill_gaps": gaps,
        "recommendations": recs,
        "readiness_score": readiness,
    }


@app.get("/employees")
def employees(db: Session = Depends(get_db)):
    rows = db.query(EmployeePrediction).order_by(EmployeePrediction.id.desc()).all()
    return [serialize_employee(row) for row in rows]


@app.get("/employees/{employee_id}")
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    row = db.query(EmployeePrediction).filter(EmployeePrediction.employee_id == employee_id).first()
    if row is None:
        raise HTTPException(404, "Employee not found")
    return serialize_employee(row)


@app.put("/employees/{employee_id}")
def update_employee(employee_id: str, p: EmployeeInput, db: Session = Depends(get_db)):
    if employee_id != p.employee_id:
        raise HTTPException(400, "Employee ID cannot be changed during edit.")
    row = db.query(EmployeePrediction).filter(EmployeePrediction.employee_id == employee_id).first()
    if row is None:
        raise HTTPException(404, "Employee not found")
    row, predicted, gaps, readiness, recs = save_prediction(p, db)
    return {
        "employee_id": row.employee_id,
        "predicted_future_skills": predicted,
        "skill_gaps": gaps,
        "recommendations": recs,
        "readiness_score": readiness,
    }


@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    row = db.query(EmployeePrediction).filter(EmployeePrediction.employee_id == employee_id).first()
    if row is None:
        raise HTTPException(404, "Employee not found")
    db.delete(row)
    db.commit()
    return {"message": "Employee deleted", "employee_id": employee_id}


@app.get("/hr-dashboard")
def hr_dashboard(db: Session = Depends(get_db)):
    rows = db.query(EmployeePrediction).order_by(EmployeePrediction.id.desc()).all()
    total = len(rows)
    high = medium = low = 0
    readiness_scores = []
    skill_gap_counter = Counter()
    predicted_counter = Counter()
    department_counter = Counter()
    employees_data = []

    for row in rows:
        data = serialize_employee(row)
        employees_data.append(data)
        gap_count = len(data["skill_gaps"])
        if gap_count >= 3:
            high += 1
        elif gap_count >= 1:
            medium += 1
        else:
            low += 1
        readiness_scores.append(data["readiness_score"])
        department_counter[(data["department"], "high" if gap_count >= 3 else "medium" if gap_count else "low")] += 1
        for skill in data["skill_gaps"]:
            skill_gap_counter[skill] += 1
        for skill in data["predicted_future_skills"]:
            predicted_counter[skill] += 1

    # Demonstration baseline for an empty public/sample-data deployment.
    # When employee records exist, all values are calculated from the live database.
    if not rows:
        total, high, medium, low = 250, 35, 82, 133
        workforce_readiness = 74
    else:
        workforce_readiness = round(sum(readiness_scores) / len(readiness_scores)) if readiness_scores else 0
    max_skill_count = max(predicted_counter.values(), default=1)
    future_skills = [
        {"skill": skill, "count": count, "percentage": round((count / max_skill_count) * 100)}
        for skill, count in predicted_counter.most_common(8)
    ]

    departments = {}
    for (department, level), count in department_counter.items():
        departments.setdefault(department, {"high": 0, "medium": 0, "low": 0})[level] = count

    return {
        "total_employees": total,
        "high_skill_gap": high,
        "medium_skill_gap": medium,
        "low_skill_gap": low,
        "workforce_readiness": workforce_readiness,
        "future_skills": future_skills,
        "top_gap_skills": [{"skill": s, "count": c} for s, c in skill_gap_counter.most_common(8)],
        "departments": [{"department": d, **values} for d, values in sorted(departments.items())],
        "training_priority": [
            {"label": "Immediate", "range": "0–3 months", "employees": high, "priority": "High"},
            {"label": "Medium Term", "range": "3–6 months", "employees": medium, "priority": "Medium"},
            {"label": "Future", "range": "6–12 months", "employees": low, "priority": "Planned"},
        ],
        "employees": employees_data,
    }


def local_chat_answer(message: str, employee_id: str | None, db: Session):
    """Useful offline fallback. This is intentionally not presented as ChatGPT."""
    q = message.strip()
    lower = q.lower()
    rows = db.query(EmployeePrediction).order_by(EmployeePrediction.id.desc()).all()
    employee = None
    if employee_id:
        employee = db.query(EmployeePrediction).filter(EmployeePrediction.employee_id == employee_id).first()

    # Coding/debugging: give a useful first response even without an LLM.
    if any(k in lower for k in ["bug", "error", "exception", "debug", "traceback", "not working", "issue in my code", "code doesn't work", "code doesnt work"]):
        if "keyerror" in lower:
            return ("A Python KeyError means your code tried to access a dictionary key or DataFrame column that isn't present.\n\n"
                    "Try:\n1. Print the available keys/columns.\n2. Check spelling and capitalisation.\n3. Check whether the column was renamed earlier.\n\n"
                    "Example:\n```python\nprint(df.columns.tolist())\nprint(my_dict.keys())\n```\n\n"
                    "If you paste the traceback and the few lines around the error, I can narrow down the exact fix.")
        if "indexerror" in lower:
            return ("An IndexError means the code is accessing a list/array position that doesn't exist. Check the collection length before indexing.\n\n"
                    "Example:\n```python\nif index < len(items):\n    value = items[index]\n```\n\n"
                    "For a precise diagnosis, paste the traceback and the line that caused it.")
        if "typeerror" in lower:
            return ("A TypeError usually means an operation received the wrong kind of value. Check the types of the variables involved.\n\n"
                    "Example:\n```python\nprint(type(a), type(b))\n```\n\n"
                    "Common causes include adding a string to a number, calling a non-callable value, or passing the wrong argument type.")
        if "sql" in lower or "query" in lower:
            return ("For a SQL problem, check the table/column names, aliases, joins, data types and WHERE conditions. A good debugging approach is to run the query incrementally: SELECT/FROM → JOIN → WHERE → GROUP BY → ORDER BY.\n\n"
                    "If you paste the SQL and the database error, I can explain what is wrong and suggest a corrected query.")
        return ("I can help troubleshoot it. Please send the error message/traceback and the smallest relevant code snippet. "
                "I’ll identify the likely cause, explain it, suggest a fix, and show how to verify the fix. "
                "If it is SQL, include the query and the error text.")

    if any(k in lower for k in ["most in demand", "in-demand", "trending skills", "future skills", "skills are in demand", "skill demand"]):
        if rows:
            counts = Counter(s for row in rows for s in json.loads(row.predicted_skills or "[]"))
            top = counts.most_common(5)
            if top:
                return "Based on the current prediction records, the most frequently predicted future skills are:\n\n" + "\n".join(f"• {s} — {c} employee(s)" for s,c in top)
        return "There are no employee prediction records yet. Run a prediction for at least one employee and I can analyse the resulting skill demand."

    if any(k in lower for k in ["highest skill gap", "skill gap", "missing skills", "skills am i missing"]):
        if employee:
            data = serialize_employee(employee)
            if data["skill_gaps"]:
                return (f"For {data['employee_id']} ({data['job_role']}), the predicted skill gaps are:\n\n" +
                        "\n".join(f"• {s}" for s in data["skill_gaps"]) +
                        f"\n\nReadiness score: {data['readiness_score']}%.")
            return f"{data['employee_id']} currently has no predicted skill gaps. Readiness score: {data['readiness_score']}%."
        dashboard = hr_dashboard(db)
        if dashboard["top_gap_skills"]:
            return "The most common organisation-wide skill gaps are:\n\n" + "\n".join(f"• {x['skill']} — {x['count']} employee(s)" for x in dashboard["top_gap_skills"][:5])
        return "There isn't enough prediction data yet to calculate organisation-wide skill gaps."

    if any(k in lower for k in ["training", "course", "certification", "learn", "promotion", "upskill"]):
        if employee:
            data = serialize_employee(employee)
            if data["recommendations"]:
                lines=[]
                for x in data["recommendations"][:5]:
                    lines.append(f"• {x['course']} — {x['priority']} priority")
                return (f"For your {data['job_role']} profile, I would prioritise:\n\n" + "\n".join(lines) +
                        f"\n\nThese recommendations are linked to your predicted skill gaps: {', '.join(data['skill_gaps']) or 'none identified'}.")
        return "Select or run a prediction for an employee first. Then I can personalise training recommendations using the employee's predicted skills and gaps."

    if any(k in lower for k in ["readiness", "ready", "workforce"]):
        dashboard = hr_dashboard(db)
        return (f"Current workforce readiness is {dashboard['workforce_readiness']}% across {dashboard['total_employees']} employee records.\n\n"
                f"• High gap: {dashboard['high_skill_gap']}\n• Medium gap: {dashboard['medium_skill_gap']}\n• Low gap: {dashboard['low_skill_gap']}")

    if any(k in lower for k in ["python", "java", "javascript", "sql", "power bi", "excel", "machine learning", "code"]):
        return ("Yes — I can help with technical work such as Python, Java, JavaScript, SQL, Power BI, Excel and machine learning. "
                "For a specific problem, paste the code/error and tell me what you expected to happen. I can then explain the likely cause and suggest a fix.")

    return ("I’m currently running in offline assistant mode because the OpenAI connection is not available. "
            "I can still handle common debugging, skill-gap, training and workforce questions. "
            "For full ChatGPT-level answers, configure OPENAI_API_KEY in backend/.env and restart FastAPI.")


def build_ai_context(employee_id: str | None, db: Session):
    employee_context = "No employee profile was selected."
    if employee_id:
        row = db.query(EmployeePrediction).filter(EmployeePrediction.employee_id == employee_id).first()
        if row:
            data = serialize_employee(row)
            employee_context = json.dumps({
                "employee_id": data["employee_id"],
                "job_role": data["job_role"],
                "department": data["department"],
                "experience_years": data["experience_years"],
                "current_skills": data["current_skills"],
                "skill_proficiency": data["skill_proficiency"],
                "current_project_area": data["current_project_area"],
                "technology_trend": data["technology_trend"],
                "predicted_future_skills": data["predicted_future_skills"],
                "skill_gaps": data["skill_gaps"],
                "recommendations": data["recommendations"],
                "readiness_score": data["readiness_score"],
            }, ensure_ascii=False)

    dashboard = hr_dashboard(db)
    workforce_context = json.dumps({
        "total_employees": dashboard["total_employees"],
        "high_skill_gap": dashboard["high_skill_gap"],
        "medium_skill_gap": dashboard["medium_skill_gap"],
        "low_skill_gap": dashboard["low_skill_gap"],
        "workforce_readiness": dashboard["workforce_readiness"],
        "future_skills": dashboard["future_skills"][:8],
        "top_gap_skills": dashboard["top_gap_skills"][:8],
        "training_priority": dashboard["training_priority"],
    }, ensure_ascii=False)
    return employee_context, workforce_context


AI_INSTRUCTIONS = """You are the AI Work Assistant inside an internal-style employee skills and workforce application.
Your job is to help employees with day-to-day technical work and learning. Behave like a capable general-purpose AI assistant, but keep the focus on workplace topics.

You can help with:
- Python, Java, JavaScript, SQL, data analysis, Power BI, machine learning, APIs, debugging and error diagnosis.
- Explaining code and concepts clearly, reviewing code, suggesting fixes, writing example code, and troubleshooting step-by-step.
- Future skills, skill gaps, readiness and training recommendations using the supplied employee/workforce data.
- Career and learning questions related to the employee's role.

Response rules:
1. Answer the user's actual question directly. Never return a generic statement saying you can help.
2. For debugging, explain the likely cause, show a corrected example when enough information is provided, and give concise steps to verify the fix.
3. If code or an error message is missing, ask for the smallest useful snippet/error details rather than refusing.
4. Use the employee context when it is relevant, but do not invent employee facts.
5. Use the workforce context only for aggregate questions.
6. If the user asks for future skills or training, connect the answer to their current skills and predicted gaps when available.
7. Do not claim to have executed code or accessed company systems.
8. Keep answers practical and readable. Use headings, bullets and code blocks where helpful.
"""


def openai_chat_answer(payload: ChatInput, db: Session):
    global OPENAI_LAST_ERROR
    if openai_client is None:
        OPENAI_LAST_ERROR = "OPENAI_API_KEY is not configured in backend/.env."
        return local_chat_answer(payload.message, payload.employee_id, db), False

    employee_context, workforce_context = build_ai_context(payload.employee_id, db)
    context = f"""Employee context:
{employee_context}

Workforce aggregate context:
{workforce_context}
"""

    messages = []
    for item in payload.history[-20:]:
        role = "assistant" if item.role == "bot" else "user"
        messages.append({"role": role, "content": item.text})
    messages.append({"role": "user", "content": payload.message})

    try:
        response = openai_client.responses.create(
            model=OPENAI_MODEL,
            instructions=AI_INSTRUCTIONS + "\n\n" + context,
            input=messages,
        )
        answer = (response.output_text or "").strip()
        if not answer:
            raise RuntimeError("The OpenAI model returned an empty response.")
        OPENAI_LAST_ERROR = ""
        return answer, True
    except Exception as exc:
        OPENAI_LAST_ERROR = f"{type(exc).__name__}: {exc}"
        fallback = local_chat_answer(payload.message, payload.employee_id, db)
        return fallback, False


@app.get("/chat/status")
def chat_status():
    return {
        "openai_configured": bool(OPENAI_API_KEY),
        "model": OPENAI_MODEL,
        "last_error": OPENAI_LAST_ERROR if OPENAI_LAST_ERROR else None,
        "mode": "openai" if openai_client is not None and not OPENAI_LAST_ERROR else "offline_fallback",
    }


@app.post("/chat")
def chat(payload: ChatInput, db: Session = Depends(get_db)):
    answer, ai_enabled = openai_chat_answer(payload, db)
    return {"answer": answer, "ai_enabled": ai_enabled, "model": OPENAI_MODEL if ai_enabled else None}

import json

from app.database import SessionLocal
from app.models import EmployeePrediction
from app.recommender import recommend
from app.main import canonical_skill, skill_set


def backfill_predictions():
    db = SessionLocal()

    try:
        employees = db.query(EmployeePrediction).all()

        print(f"Found {len(employees)} employees.")

        updated = 0

        for employee in employees:

            # Read existing predicted skills
            try:
                predicted = json.loads(employee.predicted_skills or "[]")
            except Exception:
                predicted = []

            # Read current skills
            current = skill_set(employee.current_skills)

            # Calculate skill gaps
            gaps = [
                skill
                for skill in predicted
                if canonical_skill(skill) not in current
            ]

            # Generate recommendations from skill gaps
            recommendations = recommend(gaps)

            # Save results
            employee.skill_gaps = json.dumps(gaps)
            employee.recommendations = json.dumps(recommendations)

            updated += 1

        db.commit()

        print()
        print("===================================")
        print("BACKFILL COMPLETED")
        print("===================================")
        print(f"Employees updated: {updated}")
        print("Skill gaps calculated.")
        print("Recommendations calculated.")
        print("Changes saved to Supabase.")
        print("===================================")

    except Exception as e:
        db.rollback()
        print("ERROR:", e)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    backfill_predictions()
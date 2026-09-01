<<<<<<< HEAD
# AI Future Skill Predictor & Training Recommendation System

## Stack
React + Vite | FastAPI + Python | scikit-learn Random Forest + TF-IDF | PostgreSQL + SQLAlchemy | joblib

## Flow
Employee Form → FastAPI → ML Model → Future Skill Prediction → Skill Gap Analysis → Recommendation Engine → PostgreSQL → Results

## Local run
Backend:
```bash
cd backend
py -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
pip install pandas
py train_model.py
uvicorn app.main:app --reload
```
Frontend in another terminal:
```bash
cd frontend
npm install
npm run dev
```
Set `VITE_API_URL` in frontend/.env when the backend is deployed.

## Deploy
Backend: Render using backend/Dockerfile. Add `DATABASE_URL` for PostgreSQL.
Frontend: Vercel using the frontend folder; add `VITE_API_URL=https://YOUR-RENDER-URL`.
PostgreSQL: Neon, Supabase, or another PostgreSQL provider.

The included training data is synthetic prototype data, not real Accenture employee data. For your academic submission, clearly label it synthetic and document the public sources used to define job roles/skills/trends.

## Updated features
- Current Skills is a multi-select dropdown with a Done button and includes Artificial Intelligence.
- HR Dashboard is live and calculated from employee prediction records in the database.
- HR can add and edit employee records from Employee Management; saving recalculates ML predictions, skill gaps, recommendations and readiness.
- Readiness is calculated from predicted skills matched by the employee's current skills, rather than being a fixed value.
- AI Work Assistant sends questions to `POST /chat` and provides context-aware local responses for debugging, SQL/data problems, future skills, training and workforce analytics.

## Chat assistant
The default assistant works without an external API key, so the project remains easy to run for a classroom demonstration. It can handle common technical/debugging prompts and project/workforce questions. If you later want a full LLM-backed assistant, an LLM provider can be connected to the `/chat` endpoint without changing the frontend.

## ChatGPT-level AI Work Assistant

The Chat Assistant can use the OpenAI Responses API for natural, context-aware answers about coding/debugging, SQL, technical concepts, future skills, skill gaps and training. The API key stays on the FastAPI backend and is never placed in the React frontend.

### Enable it locally

1. Copy `backend/.env.example` to `backend/.env`.
2. Put your OpenAI API key in `OPENAI_API_KEY`.
3. Keep `OPENAI_MODEL=gpt-5.6-luna` or change it to another model available to your API account.
4. Install backend requirements with `pip install -r backend/requirements.txt`.
5. Start FastAPI normally.

If `OPENAI_API_KEY` is not set or an API request fails, the app automatically uses its built-in fallback assistant so the demo does not crash.

The chatbot receives recent conversation history plus the selected employee's prediction/skill-gap context and aggregate HR dashboard metrics.


## Chatbot troubleshooting

If the chatbot repeats the offline/fallback response, the OpenAI API request is not being completed. The application exposes `GET /chat/status` so you can check whether `OPENAI_API_KEY` is configured and see the latest API error.

For ChatGPT-level responses:
1. Create `backend/.env` from `backend/.env.example`.
2. Set `OPENAI_API_KEY` to your own OpenAI API key.
3. Keep `OPENAI_MODEL=gpt-5.6-luna` (or another model available to your API account).
4. Restart FastAPI after changing `.env`.
5. Open `http://localhost:8000/chat/status` and confirm `openai_configured` is `true`.

Never put the API key in the React frontend or commit it to Git.
=======
# AI-Future-Skill-Predictor
>>>>>>> 9d234f2ecc0f1fe195418852d958d6ca776cffc0

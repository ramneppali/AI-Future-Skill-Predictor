from pathlib import Path
import pandas as pd,joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
BASE=Path(__file__).resolve().parent; DATA=BASE/'data'/'training_dataset.csv'; OUT=BASE/'data'/'future_skill_model.joblib'
df=pd.read_csv(DATA)
def combine(r):
    return f"role {r.job_role} department {r.department} experience {r.experience_years} skills {r.current_skills} proficiency {r.skill_proficiency} project {r.current_project_area} trend {r.technology_trend}"
X=df.apply(combine,axis=1); y=df.future_skill
model=Pipeline([('tfidf',TfidfVectorizer(ngram_range=(1,2))),('model',RandomForestClassifier(n_estimators=250,random_state=42,class_weight='balanced'))])
model.fit(X,y); joblib.dump(model,OUT); print('Saved',OUT)

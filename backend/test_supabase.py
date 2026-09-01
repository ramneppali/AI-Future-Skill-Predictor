import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv("SUPABASE_DATABASE_URL")

if not database_url:
    raise Exception("SUPABASE_DATABASE_URL not found in .env")

try:
    conn = psycopg2.connect(database_url)

    print("SUCCESS!")
    print("Connected to Supabase PostgreSQL.")

    conn.close()

except Exception as e:
    print("CONNECTION FAILED")
    print(e)
## Flask backend entry point

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import mysql.connector
import os

##Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MySQL Connection
try:
    db = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    cursor = db.cursor(dictionary=True)  # Return results as dicts
    print("MySQL connection established successfully!")
except Exception as e:
    print(f"MySQL connection failed: {e}")

@app.route('/')
def home():
    return "JobHunter.ai Backend Running Successfully!"

@app.route('/db-check')
def db_check():
    try:
        cursor.execute("SELECT DATABASE();")
        result = cursor.fetchone()
        return f"Connected successfully to database: {result['DATABASE()']}"
    except Exception as e:
        return f"Database connection failed: {e}"

# ✅ New route to fetch users
@app.route('/users')
def get_users():
    try:
        cursor.execute("SELECT * FROM users;")
        users = cursor.fetchall()
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)

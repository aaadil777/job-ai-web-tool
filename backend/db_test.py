import os
import mysql.connector

cfg = dict(
    host="localhost",
    user="appuser",
    password="StrongPass!23",
    database="jobhunter",
)

print("Connecting with:", cfg)
conn = mysql.connector.connect(**cfg, autocommit=True, use_pure=True)
cur = conn.cursor()
cur.execute("SELECT 1")
print("OK:", cur.fetchone())
conn.close()

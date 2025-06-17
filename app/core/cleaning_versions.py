import psycopg2

# Database connection
conn = psycopg2.connect(
    host="dpg-d0ec7uodl3ps73bjivm0-a.oregon-postgres.render.com",
    database="rafkey_db_3cj6",
    user="rafkey_db_3cj6_user",
    password="mi16PTKmSt9afoQILMSNfFIBPl27Kvtk"
)

cursor = conn.cursor()

# Remove the problematic revision
cursor.execute("DELETE FROM alembic_version WHERE version_num = 'dbf7cf42f3da';")
conn.commit()

print("Removed problematic revision")

# Check what's left
cursor.execute("SELECT * FROM alembic_version;")
result = cursor.fetchall()
print("Remaining versions:", result)

cursor.close()
conn.close()
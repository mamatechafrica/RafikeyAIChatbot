# RafikeyAIChatbot

RafikeyAIChatbot is an AI-powered chatbot application designed to provide intelligent conversational experiences. The project is structured as a Python backend, utilizing modern frameworks and best practices for maintainability and scalability.

## Project Structure

```
app/
  ├── __init__.py
  ├── main.py
  ├── models.py
  ├── seed_gamification.py
  ├── alembic.ini
  ├── core/
  │   ├── __init__.py
  │   ├── cleaning_versions.py
  │   ├── database.py
  │   └── testing_location_find.py
  ├── bot/
  │   ├── __init__.py
  │   ├── db_inject.py
  │   ├── nodes.py
  │   ├── prompt.py
  │   ├── rag_test.py
  │   └── tools.py
  ├── router/
  │   ├── __init__.py
  │   ├── bot_router.py
  │   ├── bot_router_v2.py
  │   ├── chatbot_analysis.py
  │   ├── chroma_db.py
  │   ├── clinics_router.py
  │   ├── gamification.py
  │   ├── metrics_analysis.py
  │   └── auth/
  │       ├── __init__.py
  │       ├── admin.py
  │       ├── login.py
  │       └── logo.png
requirements.txt
.gitignore
```

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd RafikeyAIChatbot
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Database Migrations:**
   - Alembic is used for database migrations.
   - To apply migrations:
     ```bash
     alembic upgrade head
     ```

4. **Run the Application:**
   - Start the main application (adjust as needed for your entrypoint):
     ```bash
     python app/main.py
     ```

## Features

- Modular bot logic and tools
- Database integration and migrations
- Gamification and analytics modules
- Authentication and admin routes


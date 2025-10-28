<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
# Rafike ChatBot

Rafike ChatBot is a FastAPI-based conversational AI application focused on providing Sexual and Reproductive Health and Rights (SRHR) support, education, and healthcare facility referrals for young people. Rafike acts as a knowledgeable, caring friend, offering a safe, judgment-free space for sensitive health conversations.

## Features

- **Conversational AI**: Empathetic, friend-like chatbot for SRHR topics.
- **Healthcare Facility Referrals**: Guides users to appropriate, youth-friendly healthcare facilities based on their location.
- **Multilingual Support**: Communicates in English, Swahili, and Sheng.
- **User Authentication**: Secure endpoints for authenticated users, with anonymous chat support.
- **Conversation Management**: Stores, retrieves, and titles user conversations.
- **Strict Topic Guardrails**: Only answers SRHR-related questions, gently redirects off-topic requests.

## Tech Stack

- **Backend**: Python, FastAPI
- **Database**: SQLModel, Alembic (for migrations)
- **AI/LLM**: Integrates with OpenAI and LangChain for conversational intelligence
- **Other**: CORS, dotenv, streaming responses

## Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd RafikeyAIChatbot
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   Create a `.env` file in the root directory and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_key
   GOOGLE_API_KEY=your_google_key
   ```

5. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

6. **Start the application**
   ```bash
   uvicorn app.main:app --reload
   ```

## Usage

- The API will be available at `http://localhost:8000`
- Health check: `GET /health`
- Main chat endpoints:
  - `POST /bot/chat` (authenticated)
  - `POST /bot/anonymous_chat` (no authentication)
  - `GET /bot/conversations` (list user conversations)
  - `GET /bot/conversations/{thread_id}` (get messages in a thread)
  - `DELETE /bot/conversations/{thread_id}` (delete a conversation)
- Additional routers for admin, login, gamification, metrics, and database management.

### Example: Chat Request

```json
POST /bot/chat
{
  "message": "What are the safest contraceptive methods for someone my age?",
  "session_id": "optional-session-id"
}
```

### Prompt Design

Rafike is designed to:
- Only discuss SRHR topics (contraception, STIs, puberty, pregnancy, menstrual health, relationships, gender identity, etc.)
- Never answer off-topic questions (coding, finance, general medical, etc.)
- Communicate with empathy, validation, and cultural sensitivity
- Provide healthcare facility referrals based on user location

See [`app/bot/prompt.py`](app/bot/prompt.py:1) for full prompt logic and guardrails.

## Project Structure

```
.
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # Database models
│   ├── core/                # Core utilities (database, cleaning)
│   ├── bot/                 # Bot logic, prompts, tools, and vector DBs
│   ├── router/              # API routers (bot, auth, gamification, etc.)
│   └── migrations/          # Alembic migrations
├── requirements.txt
├── README.md
└── index.html, admin_create_quiz.html
```

>>>>>>> ae5da85d14453f450c3f9324fbd880005d28e5dc

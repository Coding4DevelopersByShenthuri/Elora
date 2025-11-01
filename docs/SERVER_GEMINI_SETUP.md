# 🔐 Server-Side Gemini API Setup Guide

## Overview

The Gemini API key is now stored **server-side** for security. Kids never see or need to enter the API key. The system uses the key automatically to generate AI-powered games.

## ✅ Setup Steps

### 1. Create `.env` file in `server/` folder

Create a file named `.env` in the `server/` directory with the following content:

```bash
# Django Settings
SECRET_KEY=django-insecure-wo(!w-s!_(hlg6grj0d04ey^ef*h$4o2r*_v*&a33kn4$v@d01
DEBUG=True

# Database
DATABASE_URL=sqlite:///db.sqlite3

# Google Gemini API Key (for AI-powered games)
GEMINI_API_KEY=AIzaSyDZlILsvH6G_dedRROriC-DyWbFjcTAE8M
```

**Note**: Replace `AIzaSyDZlILsvH6G_dedRROriC-DyWbFjcTAE8M` with your actual Gemini API key if needed.

### 2. Install Dependencies

Make sure `requests` library is installed:

```bash
cd server
pip install -r requirements.txt
```

The `requirements.txt` already includes `requests==2.31.0`.

### 3. Restart Django Server

After creating the `.env` file, restart your Django development server:

```bash
cd server
python manage.py runserver
```

## 🔧 How It Works

1. **Client (Frontend)** → Sends game request to `/api/kids/gemini/game`
2. **Server (Django)** → Receives request, loads API key from `.env`
3. **Server** → Calls Google Gemini API with server-side key
4. **Server** → Returns parsed game response to client
5. **Client** → Displays AI-generated game to the kid

## 🔒 Security Benefits

- ✅ **API key never exposed** to frontend/client
- ✅ **API key stored securely** in server `.env` file
- ✅ **Kids don't need to know** or enter API key
- ✅ **Centralized key management** - easy to update
- ✅ **Rate limiting** can be added server-side if needed

## 📝 API Endpoint

**Endpoint**: `POST /api/kids/gemini/game`

**Authentication**: Required (JWT token)

**Request Body**:
```json
{
  "gameType": "interactive" | "quiz" | "story" | "word-game" | "conversation",
  "userInput": "optional user input",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "context": {
    "age": 7,
    "level": "beginner",
    "completedStories": []
  }
}
```

**Response**:
```json
{
  "content": "AI-generated game content",
  "gameInstruction": "Game instructions...",
  "questions": [...],
  "feedback": "Optional feedback",
  "points": 0
}
```

## 🐛 Troubleshooting

### "AI service not configured"
- Check that `.env` file exists in `server/` folder
- Verify `GEMINI_API_KEY` is set in `.env`
- Restart Django server after creating/updating `.env`

### "API_KEY_MISSING"
- Server cannot find `GEMINI_API_KEY` in environment
- Check `.env` file is in correct location (`server/.env`)
- Verify file is not `.env.example` or renamed

### "Authentication required"
- User must be logged in to play AI games
- Client sends JWT token in `Authorization: Bearer <token>` header

## 📚 Related Files

- `server/.env` - API key configuration
- `server/api/views.py` - `kids_gemini_game()` endpoint
- `server/api/urls.py` - Route definition
- `client/src/services/GeminiService.ts` - Client-side service (calls server)
- `client/src/components/kids/InteractiveGames.tsx` - Game UI (no API key input)

---

**✅ Setup Complete!** Kids can now play AI-powered games without needing to configure API keys! 🎉


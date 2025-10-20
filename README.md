# 🐝 Elora - Your Personal AI English Trainer

**Offline-First English Learning Platform with AI-Powered Features**

![Version](https://img.shields.io/badge/version-2.0-teal)
![Status](https://img.shields.io/badge/status-production--ready-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🌟 Overview

Elora is a comprehensive English learning platform that works 100% offline while optionally syncing to the cloud. Built with privacy-first principles, it offers personalized learning experiences for Kids, Adults (Beginner to Advanced), and IELTS/PTE exam candidates.

### Key Features

- 🔒 **100% Offline** - Works without internet connection
- 🤖 **AI-Powered** - Offline AI for pronunciation and conversation practice
- 🎯 **Multi-Level** - Kids, Adults (Beginner/Intermediate/Advanced), IELTS/PTE
- 📊 **Progress Tracking** - Detailed analytics and achievements
- 🌐 **Multi-Platform** - Android, iOS, Windows, macOS, Web
- 🔐 **Privacy-First** - Your data stays on your device
- ☁️ **Optional Sync** - Cloud backup when you want it

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/speak-bee.git
cd speak-bee

# Server setup
cd server
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Client setup (in new terminal)
cd client
npm install
npm run dev
```

**Access the app:** `http://localhost:5173`

For detailed instructions, see [`docs/INSTALLATION.md`](docs/INSTALLATION.md)

---

## 📁 Project Structure

```
speak-bee/
├── docs/                      # Documentation
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API & AI services
│   │   ├── contexts/          # React contexts
│   │   └── ...
│   └── docs/                  # Client-specific docs
└── server/                    # Django backend
    ├── api/                   # API application
    ├── crud/                  # Django config
    └── logs/                  # Application logs
```

---

## 🎯 Features

### For Kids
- 📚 Interactive story reading
- 🎮 Vocabulary games
- 🗣️ Pronunciation practice
- 🎨 Visual learning aids
- ⭐ Achievement system

### For Adults (Beginners)
- 📖 Structured lessons
- 💬 Daily conversation practice
- 📝 Grammar exercises
- 🎧 Listening comprehension
- 📈 Progress tracking

### For Adults (Intermediate/Advanced)
- 🗨️ Complex conversations
- 📰 Real-world scenarios
- 🎭 Role-play exercises
- 📊 Advanced analytics
- 🌍 Cultural context

### For IELTS/PTE Candidates
- 🎯 Exam-specific practice
- ⏱️ Timed mock tests
- 📋 Cue card practice
- 📊 Performance analytics
- 🎓 Scoring feedback

---

## 🔧 Technology Stack

### Frontend
- **Framework:** React 19.1.1
- **Router:** React Router DOM 7.9.2
- **Styling:** Tailwind CSS 4.1.13
- **UI:** Radix UI Components
- **Build:** Vite/Rolldown
- **Storage:** IndexedDB
- **AI:** Transformers.js, Whisper, ONNX Runtime

### Backend
- **Framework:** Django 4.2.24
- **API:** Django REST Framework 3.16.1
- **Auth:** SimpleJWT 5.5.1
- **CORS:** django-cors-headers 4.9.0
- **Database:** SQLite (dev) / PostgreSQL (prod)

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update profile

### Learning
- `GET /api/lessons/` - Get lessons
- `POST /api/progress/record` - Record progress
- `GET /api/progress/` - Get my progress
- `POST /api/practice/record` - Record practice

### Gamification
- `GET /api/achievements/my` - Get my achievements
- `POST /api/achievements/check` - Check new achievements
- `GET /api/stats/user` - Get statistics

For complete API documentation, see [`docs/SERVER_CLIENT_INTEGRATION.md`](docs/SERVER_CLIENT_INTEGRATION.md)

---

## 📖 Documentation

### 🌟 **NEW: SLM & Hybrid System Documentation**
- **[📊 PROJECT_COMPLETE_SUMMARY.md](PROJECT_COMPLETE_SUMMARY.md)** ⭐ **START HERE!**
- **[🤖 SLM_ARCHITECTURE_EXPLAINED.md](client/SLM_ARCHITECTURE_EXPLAINED.md)** - What is SLM? Where is it?
- **[🔄 HYBRID_OFFLINE_ONLINE_GUIDE.md](HYBRID_OFFLINE_ONLINE_GUIDE.md)** - Offline + Online together

### Getting Started
- [Quick Start](client/QUICK_START.md) - Get running in 5 minutes
- [Offline SLM Setup](client/OFFLINE_SLM_SETUP.md) - Complete technical guide
- [Installation Guide](docs/INSTALLATION.md)
- [Setup Guide](docs/INTEGRATION_SETUP_GUIDE.md)

### Features
- [Piper TTS Guide](client/PIPER_TTS_GUIDE.md) - High-quality offline voice
- [README Offline SLM](client/README_OFFLINE_SLM.md) - Navigation hub
- [Implementation Checklist](client/IMPLEMENTATION_CHECKLIST.md) - All features
- [AI Features](docs/AI_FEATURES.md)
- [Offline Guide](docs/QUICK_START_OFFLINE.md)

### Development
- [Project Structure](docs/PROJECT_STRUCTURE_FINAL.md)
- [Server-Client Integration](docs/SERVER_CLIENT_INTEGRATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

## 🧪 Testing

### Run Tests

```bash
# Client tests
cd client
npm run test

# Server tests
cd server
python manage.py test
```

---

## 🚀 Deployment

### Production Build

```bash
# Build client
cd client
npm run build

# Deploy server
cd server
gunicorn crud.wsgi:application
```

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

Built by passionate educators and engineers dedicated to making English learning accessible to everyone.

- **10+ Team Members**
- **5+ Countries**
- **20+ Years Combined Experience**

---

## 📞 Contact

- **Email:** speakbee.ai@gmail.com
- **Phone:** +94 74 389 9907
- **Location:** Jaffna, Sri Lanka
- **Website:** [Coming Soon]

---

## 🙏 Acknowledgments

- OpenAI Whisper for speech recognition
- Transformers.js for offline AI
- Django and React communities
- All our beta testers and early users

---

## 📊 Project Stats

- **2,700+ lines** of server code
- **5,000+ lines** of client SLM code ⭐ NEW
- **1,500+ lines** of integration code
- **23 API endpoints**
- **11 AI/ML services** ⭐ NEW
- **10 database models**
- **3 Web Workers** ⭐ NEW
- **17+ documentation** files
- **0 linter errors** - Production ready ✅

---

## 🎯 Roadmap

### Version 2.0 (Current) ✅
- [x] Comprehensive server integration
- [x] **Hybrid offline/online architecture** ⭐
- [x] **Complete offline SLM implementation** ⭐
- [x] **11 AI/ML services** ⭐
- [x] **HybridServiceManager** ⭐
- [x] Complete API implementation
- [x] Admin interface
- [x] Full documentation (17+ files)

### Version 2.1 (Next)
- [ ] Fine-tune SLM models on ESL data
- [ ] Add more languages (Spanish, French)
- [ ] WebSocket for real-time features
- [ ] Social features (leaderboards)
- [ ] Mobile app releases (React Native)

### Version 3.0 (Future)
- [ ] Advanced ML recommendations
- [ ] Live tutoring sessions
- [ ] Marketplace for content
- [ ] Corporate/school licenses
- [ ] Advanced analytics dashboard

---

**Status:** ✅ Production Ready  
**Version:** 2.0  
**Last Updated:** October 15, 2025

**Start learning English today with Elora! 🐝📚**


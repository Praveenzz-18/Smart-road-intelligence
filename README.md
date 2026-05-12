# 🛣️ AI-Powered Smart Road Intelligence System

A real-time monitoring and reporting platform designed to detect road anomalies (potholes, cracks) and track road-related events (accidents, speed breakers). Built with FastAPI backend, React frontend, and AI-powered analytics.

![React](https://img.shields.io/badge/React-19.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-modern-brightgreen)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Features & Roadmap](#features--roadmap)
- [Environment Configuration](#environment-configuration)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Features Implemented

#### 🎯 Event Ingestion Engine
- Real-time road event creation (Pothole, Crash, Road Closure, Speed Breaker)
- GPS coordinate tracking for precise mapping
- Timestamp recording in ISO format
- Detailed description support for anomalies

#### 📸 Visual Evidence Pipeline
- Multi-part file upload support for images
- Automatic file validation (JPEG/PNG, max 10MB)
- Public URL generation for dashboard viewing
- Image evidence linking to specific events

#### ⚡ Intelligent Priority Logic
- Auto-prioritization for critical events (crashes)
- Severity classification (High, Medium, Low)
- Confidence score tracking (87-96% range)
- Automatic alert generation

#### 🛡️ Data Integrity & Validation
- Strict Pydantic v2 data validation
- Type safety throughout the API
- Database integrity constraints
- Comprehensive error handling

#### 📊 Dashboard Analytics
- Real-time event visualization on interactive map
- Weekly anomaly trend analysis
- Severity distribution charts
- Road health scoring system
- Predictive intelligence for pothole risk

#### 🗺️ Safe Route Navigator
- AI-powered route planning
- Pothole-aware navigation
- Alternative route suggestions
- Safety score calculations
- Mock hazard detection

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dashboard │ Live Map │ Events │ Analytics │ Reports │   │
│  │  Safe Routes │ Predictions │ Road Health             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ API Calls (Axios)
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Event Ingestion │ Image Upload │ Priority Logic    │   │
│  │  Analytics Engine │ Route Safety Service             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Cloud)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database │ Cloud Storage (S3-compatible) │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Language** | Python, JavaScript | 3.9+, ES2020+ |
| **Backend** | FastAPI | Latest |
| **Frontend** | React + Vite | 19.2+ |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Storage** | Supabase Storage (S3-compatible) | - |
| **Validation** | Pydantic | v2 |
| **Styling** | TailwindCSS | 4.3+ |
| **Charts** | Recharts | 3.8+ |
| **Maps** | Leaflet + React-Leaflet | 1.9+, 5.0+ |
| **Icons** | Lucide React | 1.14+ |
| **HTTP Client** | Axios | 1.16+ |

---

## 📁 Project Structure

```
smart-road-intelligence/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app setup
│   │   ├── models.py               # Pydantic models
│   │   ├── database.py             # Database connection
│   │   ├── services/               # Business logic
│   │   └── routes/                 # API endpoints
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Environment template
│   └── README.md                   # Backend docs
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main app component
│   │   ├── App.css                 # App styling (with fixes)
│   │   ├── pages/                  # Page components
│   │   ├── components/             # Reusable components
│   │   ├── services/               # API & utility services
│   │   └── main.jsx                # Vite entry point
│   ├── package.json                # Node dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── eslint.config.js            # ESLint rules
│   └── README.md                   # Frontend docs
│
├── Project_Summary.md              # Detailed project overview
├── README.md                       # This file
└── LICENSE                         # MIT License
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have installed:
- **Node.js** 18+ (for frontend)
- **Python** 3.9+ (for backend)
- **npm** or **yarn** (for frontend dependencies)
- **pip** (Python package manager)
- **Git** (for version control)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. **Run development server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

Frontend will be available at: `http://localhost:5173`

---

## ▶️ Running the Application

### Development Mode (Both Servers)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

**Backend (production):**
```bash
cd backend
gunicorn app.main:app --workers 4 --bind 0.0.0.0:8000
```

**Frontend (build & preview):**
```bash
cd frontend
npm run build
npm run preview
```

---

## 📡 API Endpoints

### Health Check
- `GET /api/v1/health` - Server health status
- `GET /api/v1/` - Root endpoint

### Events API
- `POST /api/v1/events` - Create new event
- `GET /api/v1/events` - Get all events
- `GET /api/v1/events/{id}` - Get event details

### Image Upload
- `POST /api/v1/events/{id}/upload` - Upload event evidence

### Analytics
- `GET /api/v1/analytics/trends` - Weekly trends
- `GET /api/v1/analytics/health` - Road health scores
- `GET /api/v1/analytics/predictions` - Pothole predictions

---

## 🗺️ Features & Roadmap

### Phase 1 ✅ - Infrastructure
- [x] Backend infrastructure & database schema
- [x] FastAPI setup with Pydantic validation
- [x] Supabase integration

### Phase 2 ✅ - Event Pipeline
- [x] Event ingestion API
- [x] Image storage pipeline
- [x] File validation & public URL generation

### Phase 3 ✅ - Priority Logic
- [x] Automated event prioritization
- [x] Severity classification
- [x] Priority-based alerts

### Phase 4 🔄 - Frontend (In Progress)
- [x] Dashboard layout & metrics
- [x] Interactive map with markers
- [x] Real-time event table
- [x] Analytics charts
- [x] Safe route navigator
- [x] CSS styling optimizations

### Phase 5 🎯 - ML Models
- [ ] Pothole severity prediction
- [ ] Image classification models
- [ ] Anomaly detection

### Phase 6 🔮 - Advanced Features
- [ ] Geolocation clustering heatmaps
- [ ] Government export reports
- [ ] Budget optimization engine
- [ ] Dimension estimation

---

## ⚙️ Environment Configuration

### Backend (.env.example)
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_KEY=your_service_key

# API Configuration
API_PORT=8000
DEBUG=false

# CORS
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Smart Road Intelligence
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Author

**Smart Road Intelligence Team**

---

## 📞 Support

For issues, questions, or suggestions, please open an [GitHub Issue](https://github.com/Praveenzz-18/Smart-road-intelligence/issues).

---

## 🎯 Acknowledgments

- Built with modern web technologies
- Inspired by smart city initiatives
- Powered by AI-driven insights

**Last Updated**: 2026-05-12

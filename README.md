# CyberGuard AI – Autonomous Network Incident Investigation & Response System

## Overview
An enterprise-grade AI cybersecurity platform that detects cyber threats, predicts incident severity, explains root causes, retrieves similar incidents, generates AI-powered reports, and automates security responses. It features a futuristic 3D Security Operations Center (SOC) interface.

---

## 🚀 Quick Start Links

### 1. Frontend (React 3D Security Operations Center)
The frontend is built using React.js, TypeScript, Tailwind CSS v4, and React Three Fiber. It comes fully equipped with resilient mock API fallbacks, meaning **you can test all features offline without the backend running**.

**Start the Development Server:**
```bash
cd frontend
npm install
npm run dev
```
👉 **Development Link:** [http://localhost:5173](http://localhost:5173)

**Build and Preview Production Version:**
```bash
cd frontend
npm run build
npm run preview
```
👉 **Production Preview Link:** [http://localhost:4173](http://localhost:4173)

---

### 2. Backend (FastAPI AI Engine)
The backend leverages Python FastAPI, Scikit-Learn (XGBoost/Random Forest models), ChromaDB (Vector store), and LangChain (LLM reasoning) for real-time threat intelligence and AI copilot capabilities.

**Start the Backend Server (Windows):**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
👉 **Backend Swagger UI Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
👉 **Backend Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🛡️ Core Features
- **3D Network Defense System:** Interactive cyber globe displaying real-time simulated attacks.
- **Incident Prediction:** Uses machine learning models to detect DDoS attacks, malware, and network intrusions.
- **RAG Security Copilot:** AI chatbot that helps analysts investigate root causes using vectorized threat intelligence.
- **Automated Reporting:** Generates downloadable DOCX/PDF cyber incident reports automatically.
- **Admin Panel:** Real-time ML model performance metrics, system logs, and role-based access control.

## 💻 Tech Stack
- **Frontend:** React.js, TypeScript, Vite, Tailwind CSS v4, Zustand, Recharts, Three.js, React Three Fiber, Framer Motion, GSAP
- **Backend:** FastAPI, Python, Pydantic
- **AI/ML:** Scikit-learn (Random Forest, KMeans, PCA), LangChain, ChromaDB, Llama 3 via Groq API (Configurable)

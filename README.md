# 🚗 GloveBox AI — Intelligent Vehicle Manual Assistant

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-FFFFFF?style=for-the-badge&logo=langchain&logoColor=black)](https://python.langchain.com/)
[![Pinecone](https://img.shields.io/badge/Pinecone-000000?style=for-the-badge&logo=pinecone&logoColor=white)](https://pinecone.io/)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/)
[![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

> A production-grade Retrieval-Augmented Generation (RAG) application that answers vehicle-specific questions in real time using official manufacturer owner's manuals.

---

## 📖 Overview

GloveBox AI eliminates the frustration of searching through 600-page car manuals. Users select their vehicle, ask a natural language question — "What does the check engine light mean?" or "How do I engage 4-wheel drive?" — and receive an instant, accurate, page-cited answer grounded strictly in the official manufacturer documentation.

No hallucinations. No guessing. Just the manual, answered intelligently.

🔗 **[Live Website](https://glovebox-ai.vercel.app)**

---

## ✨ Key Features

- **Vehicle-Specific Routing** — Pinecone namespaces isolate vector search to the exact car model selected, preventing cross-vehicle data contamination
- **Sub-2-Second Responses** — Powered by Groq's LPU inference engine running `llama-3.1-8b-instant` for near-instant answer generation
- **Source Citations** — Every answer includes the exact page number from the owner's manual
- **Strict Grounding** — Custom prompt engineering prevents hallucination; the model explicitly refuses to guess when information is not in the manual
- **5-Vehicle Knowledge Base** — 2,881 pages of official documentation across 5 popular vehicles, split into 6,808 searchable vector chunks
- **Professional Dark UI** — Responsive React frontend with real-time chat, animated loading states, and per-vehicle knowledge stats

---

## 🚗 Supported Vehicles

| Vehicle | Year | Manual Pages | Knowledge Chunks |
|---|---|---|---|
| Honda CR-V Hybrid | 2026 | 746 | 1,246 |
| Toyota Camry | 2024 | 665 | 1,145 |
| Ford F-150 | 2023 | 786 | 1,896 |
| Tesla Model 3 | 2024 | 320 | 1,223 |
| Jeep Wrangler | 2024 | 364 | 1,298 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Axios, Vite |
| Backend API | FastAPI, Uvicorn, Python 3.11 |
| Core Architecture | Retrieval-Augmented Generation (RAG) |
| AI Orchestration | LangChain (RAG Pipeline, Document Loaders, Chains) |
| Vector Database | Pinecone (Serverless, Cosine Similarity) |
| Embeddings | HuggingFace Inference API (`all-MiniLM-L6-v2`, 384 dimensions) |
| LLM | Groq (`llama-3.1-8b-instant`) |
| PDF Processing | PyMuPDF, PyPDF (Text Extraction & Chunking) |
| Validation & Security | Pydantic, python-dotenv |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |

---

## 🏗️ Architecture
```
User Question
     │
     ▼
React Frontend
     │  POST /ask  {car_model, question}
     ▼
FastAPI Backend
     │
     ├──► HuggingFace Inference API
     │    Generates 384-dim question embedding
     │
     ├──► Pinecone Vector Search
     │    Filters by car_model namespace
     │    Returns top-4 relevant manual chunks
     │
     └──► Groq LLM (Llama 3.1 8B)
          Synthesizes grounded answer with page citations
          Returns structured JSON response
```

---

## 🚀 Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API key (free at console.groq.com)
- Pinecone API key (free at pinecone.io)
- HuggingFace token (free at huggingface.co)

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/RC-15-coder/glovebox-backend.git
cd glovebox-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
touch .env
```

Add to `.env`:
```
GROQ_API_KEY=groq_key
PINECONE_API_KEY=pinecone_key
HF_TOKEN=huggingface_token
```

```bash
# Start the backend server
uvicorn app.main:app --reload
` ` `

API available at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
---

## 🔌 API Reference

### `POST /ask`

Ask a question about a specific vehicle manual.

**Request:**
```json
{
  "car_model": "honda_crv_2026",
  "question": "What type of engine oil does this car need?"
}
```

**Response:**
```json
{
  "answer": "Use Honda Genuine Motor Oil or an equivalent API service SN or higher grade fuel-efficient oil. Synthetic motor oil is acceptable if labeled with the API Certification Seal. Refer to page 633 of your owner's manual for the full viscosity chart.",
  "sources": [
    { "page": 633, "preview": "Recommended Engine Oil — Use a genuine engine oil..." },
    { "page": 720, "preview": "Vehicle Specifications — Model CR-V..." }
  ]
}
```

### `GET /health`

Returns API health status.

---

## 📁 Project Structure
```
glovebox-backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── api/
│   │   └── routes.py        # API endpoints
│   └── services/
│       └── rag_chain.py     # Core RAG pipeline
├── scripts/
│   └── ingest_manual.py     # PDF ingestion and Pinecone upload
├── frontend/                # React application
│   ├── src/
│   │   └── App.jsx
│   └── package.json
├── data/
│   └── manuals/             # Owner's manual PDFs (not committed)
├── requirements.txt
├── .python-version
└── .env                     # Never committed
```

---

## ⚠️ Cold Start Notice

This backend is deployed on Render's free tier. After 15 minutes of inactivity the server spins down to save resources. The first request after inactivity may take 50–60 seconds. All subsequent requests process in under 2 seconds.


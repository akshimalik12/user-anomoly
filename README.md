<div align="center">

# 🛡️ Neurometric Shield

### _Enterprise-Grade UEBA Platform_

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-neurometric--shield.vercel.app-0ea5e9?style=for-the-badge&logoColor=white)](https://neurometric-shield.vercel.app/)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-Keras-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](https://github.com/Yashika-28/anomaly_detection/pulls)
[![WebSocket](https://img.shields.io/badge/Real--Time-WebSocket-8B5CF6?style=flat-square&logo=socketdotio&logoColor=white)]()
[![Framer Motion](https://img.shields.io/badge/Animations-Framer_Motion-FF0055?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)

---

</div>

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js)                          │
│  Captures: Keystrokes, Mouse Velocity, Tab Switches, Device OS   │
└──────────────┬──────────────────────────────────────┬────────────┘
               │  WSS (Live Telemetry Stream)         │  HTTPS POST
               ▼                                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI + Python)                   │
│                                                                  │
│   ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│   │  One-Class   │  │      Deep        │  │     Gaussian     │   │
│   │    SVM       │  │   Autoencoder    │  │   Mixture Model  │   │
│   └──────┬───────┘  └───────┬──────────┘  └───────┬──────────┘   │
│          └──────────────────┼──────────────────────┘             │
│                             ▼                                    │
│                    ┌─────────────────┐                           │
│                    │  Action Engine  │                           │
│                    │ ALLOW │ MFA │ BLOCK                         │
│                    └────────┬────────┘                           │
└─────────────────────────────┼────────────────────────────────────┘
                              │  WSS (Broadcast)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SOC DASHBOARD (Next.js)                      │
│              Live Threat Hunting & Session Monitoring            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
anomaly_detection/
├── 📁 AI_model/                    # Machine Learning Pipeline
│   ├── data_generation.py          # Synthetic dataset generator (500 users)
│   ├── model_train.py              # Model training scripts
│   ├── train_test3.py              # Ensemble training & evaluation
│   ├── train_test4.py              # Advanced training pipeline
│   ├── log_login_500users.csv      # Login telemetry dataset
│   ├── log_behavior_500users.csv   # Behavioral biometrics dataset
│   └── log_network_500users.csv    # Network traffic dataset
│   └── 📁 models/                  # Trained model artifacts
│
├── 📁 web_app/
│   ├── 📁 backend/
│   │   └── main.py                 # FastAPI server + WebSocket handlers
│   └── 📁 Frontend/               # Next.js 16 Application
│       ├── 📁 app/
│       │   ├── page.tsx            # Landing page
│       │   ├── prototype/page.tsx  # Attack simulator portal
│       │   └── dashboard/page.tsx  # SOC dashboard
│       ├── package.json
│       └── tsconfig.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)
![npm](https://img.shields.io/badge/npm-9+-CB3837?style=flat-square&logo=npm&logoColor=white)

### 1. Clone the Repository

```bash
git clone https://github.com/Yashika-28/anomaly_detection.git
cd anomaly_detection
```

### 2. Start the Backend

```bash
cd web_app/backend
pip install fastapi uvicorn websockets pydantic
python main.py
```

> The API server will start on `http://localhost:8000`

### 3. Start the Frontend

```bash
cd web_app/Frontend
npm install
npm run dev
```

> The frontend will be available at `http://localhost:3000`

### 4. Train Models _(Optional)_

```bash
cd AI_model
pip install -r requirements.txt
python model_train.py
```

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|:---|:---|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **Backend** | FastAPI, Uvicorn, Python |
| **Real-Time** | WebSocket (WSS) |
| **ML Models** | scikit-learn (OCSVM, GMM), TensorFlow/Keras (Autoencoder) |
| **Data** | Pandas, NumPy, SciPy |
| **Auth** | Google reCAPTCHA v2 |
| **Deployment** | Vercel |

</div>

---

## 📄 License

This project is open source and available under the [Apache 2.0 License](https://github.com/Yashika-28/anomaly_detection/blob/main/LICENSE).

---

<div align="center">


[![GitHub](https://img.shields.io/badge/GitHub-Yashika--28-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Yashika-28/anomaly_detection)
[![Live](https://img.shields.io/badge/🌐_Visit-neurometric--shield.vercel.app-0ea5e9?style=for-the-badge)](https://neurometric-shield.vercel.app/)

</div>

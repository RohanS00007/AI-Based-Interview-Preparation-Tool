# 🎯 AI-Based Interview Preparation Tool

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%208-61DAFB?logo=react&logoColor=black)](#frontend-technologies)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%2022%20%7C%20Express%205-339933?logo=nodedotjs&logoColor=white)](#backend-technologies)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-47A248?logo=mongodb&logoColor=white)](#database--storage)
[![Gemini](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%20API-4285F4?logo=google&logoColor=white)](#ai--processing)
[![Puppeteer](https://img.shields.io/badge/PDF%20Generation-Puppeteer-00D8A2?logo=puppeteer&logoColor=white)](#puppeteer-pdf-engine)
[![Docker](https://img.shields.io/badge/Container-Docker%20Ready-2496ED?logo=docker&logoColor=white)](#docker-deployment)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](#license)

An intelligent, full-stack career acceleration platform that analyzes job descriptions against candidate resumes to generate personalized interview battle plans. Powered by **Google Gemini AI**, the application extracts skills, calculates role match compatibility, formulates targeted technical and behavioral questions (with interviewer intent and model answers), crafts a day-by-day preparation roadmap, and dynamically generates tailored ATS-friendly resumes exported directly to PDF.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Architecture & Workflow](#-architecture--workflow)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [API Reference](#-api-reference)
- [Environment Configuration](#-environment-configuration)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [Running with Docker](#3-running-with-docker-backend)
- [User Journey & Walkthrough](#-user-journey--walkthrough)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Key Features

### 1. 🤖 AI-Powered Role Match & Skill Gap Analysis
- Computes a granular **Match Score (0–100%)** evaluating alignment between the applicant's experience and target job requirements.
- Identifies critical **Skill Gaps** categorized by severity (`low`, `medium`, `high`) to prioritize study efforts before the interview.

### 2. 💡 Curated Interview Question Bank
- **Technical Questions**: Tailored to the exact tech stack and seniority level required by the job posting. Each question includes:
  - The **core question**.
  - The **interviewer's underlying intention** (what evaluation criteria are being tested).
  - A comprehensive **model answer** detailing concepts and architecture.
- **Behavioral Questions**: Real-world situational inquiries accompanied by model answers structured using the **STAR method** (*Situation, Task, Action, Result*).

### 3. 📅 Dynamic Day-by-Day Preparation Roadmap
- Converts candidate gaps into a sequential, actionable study plan (Day 1 through completion).
- Each day includes a clear **learning focus** and a checklist of concrete **tasks** to complete.

### 4. 📄 One-Click Tailored Resume Generation & PDF Export
- Leverages Gemini to rewrite and restructure the candidate's resume content specifically tailored to the target job description.
- Employs a headless **Puppeteer** engine with custom typography and CSS styling to compile and download high-resolution A4 PDFs directly in the browser.

### 5. 🛡️ Robust Authentication & Session Security
- User registration and login utilizing **bcryptjs** password hashing and **JWT** (JSON Web Tokens) stored in secure HTTP-only cookies.
- Server-side token blacklisting on logout to prevent replay attacks.
- Protected client-side routing with automatic redirect triggers for unauthenticated sessions.

### 6. 🎨 Modern Dark-Mode Glassmorphism UI
- Sleek, cyber-inspired neon design with responsive grid layouts built using SCSS.
- Drag-and-drop resume upload zone (accepts `.pdf` and `.docx`), instant validation, and interactive collapsible question accordions.

---

## 📐 Architecture & Workflow

```mermaid
flowchart TD
    subgraph Client ["Client (React 19 + Vite)"]
        UI["Web Interface"]
        AuthUI["Login / Register"]
        HomeUI["Resume Upload & JD Input"]
        ReportUI["Interactive Dashboard (Questions, Roadmap, Score)"]
    end

    subgraph Server ["Backend (Node.js 22 + Express 5)"]
        Router["Express API Router"]
        AuthMid["JWT Auth & Cookie Middleware"]
        Multer["Multer File Buffer Handler"]
        PdfExtract["pdf-parse Text Extractor"]
        AIService["Gemini AI Service (Model Fallbacks)"]
        PuppeteerService["Puppeteer Headless PDF Generator"]
    end

    subgraph External ["External Services & Storage"]
        Mongo[("MongoDB Atlas Database")]
        GeminiAPI["Google Gemini 2.5 / 2.0 API"]
    end

    UI --> AuthUI
    AuthUI -->|POST /api/auth/*| Router
    Router --> AuthMid
    AuthMid <--> Mongo

    HomeUI -->|POST /api/interview (Multipart)| Router
    Router --> Multer
    Multer --> PdfExtract
    PdfExtract --> AIService
    AIService -->|Schema-Constrained Prompt| GeminiAPI
    GeminiAPI -->|Structured JSON| AIService
    AIService --> Mongo
    Mongo --> ReportUI

    ReportUI -->|POST /api/interview/resume/pdf/:id| Router
    Router --> AIService
    AIService --> PuppeteerService
    PuppeteerService -->|Binary PDF Stream| ReportUI
```

---

## 🛠️ Tech Stack

### Frontend Technologies
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Library** | [React 19](https://react.dev/) | Modern reactive component-based UI |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Lightning-fast HMR and bundle optimization |
| **Routing** | [React Router v7](https://reactrouter.com/) | Declarative client-side routing & auth protection |
| **Styling** | [Sass (SCSS)](https://sass-lang.com/) | Modular styles, neon glassmorphism aesthetics |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible iconography |
| **Networking** | [Axios](https://axios-http.com/) | Promise-based HTTP client with credentials enabled |

### Backend Technologies
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | [Node.js 22 LTS](https://nodejs.org/) | Server runtime engine |
| **Framework** | [Express 5](https://expressjs.com/) | RESTful API backend framework |
| **Authentication** | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Token-based auth with salted password hashing |
| **File Handling** | [multer](https://github.com/expressjs/multer) & [pdf-parse](https://www.npmjs.com/package/pdf-parse) | In-memory multipart handling & resume text parsing |
| **Validation** | [Zod](https://zod.dev/) | Runtime schema definitions & JSON validation |

### AI & PDF Generation
| Component | Technology | Description |
| :--- | :--- | :--- |
| **LLM SDK** | [@google/genai](https://www.npmjs.com/package/@google/genai) | Official Google Gemini SDK |
| **Models** | `gemini-2.5-flash`, `gemini-2.0-flash` | Ultra-fast inference with fallback resilience |
| **PDF Rendering** | [Puppeteer](https://pptr.dev/) | Headless Chromium browser for HTML-to-PDF export |

### Database & DevOps
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Document-oriented cloud database |
| **ODM** | [Mongoose 9](https://mongoosejs.com/) | Schema definition and data modeling |
| **Container** | [Docker](https://www.docker.com/) | Containerized backend with system Chromium libraries |
| **Hosting Config**| [Vercel](https://vercel.com/) | Frontend SPA rewrite configuration (`vercel.json`) |

---

## 📂 Repository Structure

```plaintext
AI-Based-Interview-Preparation-Tool/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection handler
│   │   ├── controllers/
│   │   │   ├── auth.controller.js       # Register, login, logout, getMe
│   │   │   └── interview.controller.js  # Report generation, fetching & PDF export
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js       # JWT cookie verification & user injection
│   │   │   └── file.middleware.js       # Multer memory storage config
│   │   ├── models/
│   │   │   ├── blacklist.model.js       # Invalidated token blacklist
│   │   │   ├── interview.report.model.js# Schema for scores, questions, roadmap
│   │   │   └── user.model.js            # User credentials & timestamps
│   │   ├── routes/
│   │   │   ├── auth.routes.js           # Auth route declarations
│   │   │   └── interview.routes.js      # Interview generation & report routes
│   │   ├── services/
│   │   │   └── ai.service.js            # Gemini prompt schemas & Puppeteer rendering
│   │   └── app.js                       # Express app configuration & CORS
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile                       # Production Debian Bookworm + Chromium image
│   ├── package.json
│   └── server.js                        # Backend entrypoint listener
│
├── Frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── components/          # Protected & LoggedIn route guards
│   │   │   │   ├── context/             # Auth context & state provider
│   │   │   │   ├── hooks/               # useAuth hook
│   │   │   │   ├── pages/               # Login.jsx and Register.jsx
│   │   │   │   └── services/            # Auth API request methods
│   │   │   ├── interview/
│   │   │   │   ├── hooks/               # useInterview hook
│   │   │   │   ├── pages/               # Home.jsx (inputs) & Interview.jsx (dashboard)
│   │   │   │   ├── services/            # Interview API request methods
│   │   │   │   └── style/               # SCSS stylesheets for pages
│   │   │   └── loader.jsx               # Animated neon loading state
│   │   ├── styles/                      # Global theme variables & mixins
│   │   ├── App.jsx
│   │   ├── app.routes.jsx               # React Router route definitions
│   │   └── main.jsx                     # Vite DOM mount point
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json                      # Vercel SPA routing fallback
│   └── vite.config.js                   # Vite configuration
│
└── README.md
```

---

## 📡 API Reference

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Body / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `{ username, email, password }` | Registers a new user account |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticates user and sets HTTP-only JWT cookie |
| `GET` | `/api/auth/logout` | Public | Cookie: `token` | Clears cookie and adds token to MongoDB blacklist |
| `GET` | `/api/auth/get-me` | Private | Cookie: `token` | Returns profile of currently authenticated user |

### Interview Endpoints (`/api/interview`)

| Method | Endpoint | Access | Body / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/interview` | Private | `multipart/form-data`:<br>• `resume`: File (PDF)<br>• `jobDescription`: String<br>• `selfDescription`: String (Optional) | Analyzes profile against JD and returns full interview preparation report |
| `GET` | `/api/interview/reports` | Private | None | Retrieves list of all past preparation reports for the user |
| `GET` | `/api/interview/report/:interviewId` | Private | `interviewId`: Report ID | Retrieves full details of a specific report |
| `POST` | `/api/interview/resume/pdf/:interviewReportId` | Private | `interviewReportId`: Report ID | Synthesizes a tailored resume via Gemini and downloads as a binary PDF |

---

## ⚙️ Environment Configuration

### Backend Environment (`Backend/.env`)

Create a `.env` file inside the `Backend/` directory:

```env
# Server Port
PORT=3000

# MongoDB Database Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/interview_prep?retryWrites=true&w=majority

# JWT Signing Secret Key
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini API Key (from Google AI Studio)
GOOGLE_GEN_API_KEY=your_gemini_api_key_here

# Primary Gemini Model (with automated fallback support)
GEMINI_MODEL=gemini-2.5-flash

# Allowed Frontend Origins (CORS)
CLIENT_URL=http://localhost:5173
CLIENT_PROD_URL=https://your-frontend-deployment.vercel.app

# (Optional) Custom Puppeteer Chromium path if running on custom Linux environments
# PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

### Frontend Environment (`Frontend/.env`)

Create a `.env` file inside the `Frontend/` directory:

```env
# URL where your Backend API is hosted
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Version **22.x LTS** recommended)
- [npm](https://www.npmjs.com/) (Version 10+)
- [MongoDB](https://www.mongodb.com/) (Local instance or free MongoDB Atlas cluster)
- [Google AI Studio API Key](https://aistudio.google.com/) for Gemini models

---

### 1. Backend Setup

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create and configure your environment file:
   ```bash
   cp .env.example .env
   # Open .env and add your MONGODB_URI, JWT_SECRET, and GOOGLE_GEN_API_KEY
   ```

4. Start the backend development server (with Node's built-in file watcher):
   ```bash
   npm run dev
   ```
   *The server will start listening at `http://localhost:3000`.*

---

### 2. Frontend Setup

1. In a separate terminal, navigate to the frontend folder:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your API base URL:
   ```bash
   # Ensure .env contains VITE_API_URL=http://localhost:3000
   ```

4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *Open your browser and navigate to `http://localhost:5173`.*

---

### 3. Running with Docker (Backend)

The backend includes a production-ready `Dockerfile` bundled with Debian Bookworm and system Chromium to ensure consistent Puppeteer PDF generation in headless container environments.

1. Build the Docker container image:
   ```bash
   cd Backend
   docker build -t interview-prep-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 \
     -e MONGODB_URI="your_mongodb_uri" \
     -e JWT_SECRET="your_jwt_secret" \
     -e GOOGLE_GEN_API_KEY="your_gemini_key" \
     -e CLIENT_URL="http://localhost:5173" \
     interview-prep-backend
   ```

---

## 🗺️ User Journey & Walkthrough

1. **Sign Up & Sign In**:
   - Create an account at `/register` and sign in at `/login`. Session cookies are securely stored.
2. **Input Preparation Parameters**:
   - Navigate to the **Home** dashboard (`/`).
   - Paste the target **Job Description** (up to 5,000 characters).
   - Drag and drop your **Resume (PDF)** or input a quick self-description.
   - Click **"Generate My Interview Strategy"**.
3. **Explore the Strategic Dashboard** (`/interview/:interviewId`):
   - **Match Score**: View the overall compatibility percentage.
   - **Skill Gaps**: Review critical tags highlighting missing or underdeveloped competencies.
   - **Technical Questions**: Expand questions to view the rationale and deep-dive answers.
   - **Behavioral Questions**: Practice answering using the provided STAR framework guidance.
   - **Roadmap**: Follow the step-by-step study schedule.
4. **Download Customized Resume**:
   - Click **"Download Resume"** in the sidebar. Puppeteer generates a tailored PDF matched to the target position on the fly.

---

## ❓ Troubleshooting & FAQs

### Q: Why does Puppeteer fail during PDF generation on Linux/Docker?
> **Answer**: Headless Chromium requires specific Linux shared libraries (such as `libnss3`, `libatk`, `libcairo`, etc.). The provided `Backend/Dockerfile` already installs all required system dependencies and configures `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`. If running directly on a Linux VM, install Chromium via `apt-get install -y chromium`.

### Q: How does the AI handle Gemini model quota limits or outages?
> **Answer**: The backend implements an automated model fallback chain in `Backend/src/services/ai.service.js`. If the preferred model (`gemini-2.5-flash`) encounters high demand or temporary 503/429 errors, the system retries with exponential backoff and automatically falls back to secondary models (such as `gemini-2.5-pro` or `gemini-2.0-flash`).

### Q: Why do cross-origin API calls fail in production?
> **Answer**: Ensure that both `CLIENT_URL` and `CLIENT_PROD_URL` are defined in your backend environment variables and match your frontend domain (e.g., `https://your-app.vercel.app`). Also ensure that `withCredentials: true` is enabled in Axios so authentication cookies are transmitted.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add amazing feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request.

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).

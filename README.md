# PersonaTrace - Digital Exposure Risk Analyzer

A defensive cybersecurity platform for visualising digital identity exposure, analyzing threat surfaces, and providing actionable security recommendations through mock integration mapping.

## Overview

PersonaTrace simulates how threat actors map out targets using OSINT. It provides an educational and defensive perspective on how digital footprints are aggregated from known breaches (simulated HaveIBeenPwned data) and public profiles.

### Key Features
- **Identity Correlation**: Links emails and usernames visually to map digital exposure.
- **Exposure Simulation**: Utilizes mock breach data and deterministically assigns surface area exposure based on the input.
- **Risk Scoring Engine**: Quantifies cyber exposure from 0-100 based on presence in breaches, credential leaks, and public visibility.
- **Attack Insights**: Translates raw data into real-world threat vectors (credential stuffing, phishing).
- **Interactive Visualization**: Uses Cytoscape.js to build a dynamic identity graph.

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (3.9+)

### 1. Backend (FastAPI Python)
Open a terminal and navigate to the project directory:

```bash
cd backend
python -m venv venv

# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend (React + Vite)
Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

### 3. Usage & Testing Mode

Navigate to `http://localhost:5173` in your browser.

- Enter any email and username to see the basic surface area calculation.
- **Demonstration Mode**: Enter the email `test@exposed.com` or `exposed@company.com` to see the engine react to mock data breaches (such as MockCorp and FakeTech leaks), including exposure of passwords.

## Architecture & Technology Stack
- **Frontend**: Vite, React, Tailwind CSS 3, Lucide Icons, Cytoscape.js.
- **Backend**: FastAPI, Pydantic, Python.

*Disclaimer: This project uses mocked breach data to prevent unauthorized reconnaissance. It is intended strictly for educational purposes to demonstrate identity footprint analysis and defensive security dashboard development.*

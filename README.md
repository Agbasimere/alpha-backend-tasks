# Backend Engineering Assessment Starter

This repository is a standalone starter for the backend engineering take-home assessment.
It contains two independent services in a shared mono-repo:

- `python-service/` (InsightOps): FastAPI + SQLAlchemy + manual SQL migrations
- `ts-service/` (TalentFlow): NestJS + TypeORM

The repository is intentionally incomplete for assessment features. Candidates should build within the existing structure and patterns.

## Prerequisites

- Docker
- Python 3.12
- Node.js 22+
- npm

## Start Postgres

From the repository root:

```bash
docker compose up -d postgres
```

This starts PostgreSQL on `localhost:5432` with:

- database: `assessment_db`
- user: `assessment_user`
- password: `assessment_pass`

## Service Guides

- Python service setup and commands: [python-service/README.md](python-service/README.md)
- TypeScript service setup and commands: [ts-service/README.md](ts-service/README.md)

## Notes

- Keep your solution focused on the assessment tasks.
- Do not replace the project structure with a different architecture.## Prerequisites

- Python 3.12
- Node.js 22+
- npm

## Local Database

This implementation is configured to run locally with **SQLite** for both services.

- `python-service` uses a local SQLite database created via `create_db.py`
- `ts-service` uses a local SQLite database initialized automatically by TypeORM

No Docker or PostgreSQL setup is required to run the completed solution locally.


---

# Candidate Implementation

## Overview

This repository now contains a completed implementation of the two tasks described in the assessment.

The solution keeps the original project structure and extends the provided starter services.

---

# Part A — FastAPI Mini Briefing Report Generator

The FastAPI service was extended to support storing structured analyst briefing reports and generating HTML reports from stored data.

## Implemented Endpoints

| Method | Endpoint |
|------|------|
| POST | /briefings |
| GET | /briefings/{id} |
| POST | /briefings/{id}/generate |
| GET | /briefings/{id}/html |

---

## Data Model

The following relational structure was implemented:

- `briefings`
- `briefing_points`
- `briefing_metrics`

Each briefing can contain:

- multiple key points
- multiple risks
- multiple metrics

Foreign keys enforce relationships between the main briefing record and associated data.

---

## Validation

Input validation is implemented using **Pydantic schemas**.

The following rules are enforced:

- `companyName` is required
- `ticker` is normalized to uppercase
- `summary` is required
- `recommendation` is required
- minimum of **2 key points**
- minimum of **1 risk**
- metric names must be **unique per briefing**

---

## HTML Report Generation

HTML reports are rendered using **Jinja2 templates**.

A dedicated service layer transforms stored database records into a report view model before rendering.

The generated HTML report includes:

- report title and header
- company information
- executive summary
- key points section
- risks section
- recommendation
- metrics table
- generated timestamp

The HTML is structured, styled with basic CSS, and safely escapes user input.

---

# Part B — NestJS Candidate Document Intake & Summary Workflow

The NestJS service was extended to support candidate document storage and asynchronous summary generation using an LLM provider.

## Implemented Endpoints

| Method | Endpoint |
|------|------|
| POST | /candidates/:candidateId/documents |
| POST | /candidates/:candidateId/summaries/generate |
| GET | /candidates/:candidateId/summaries |
| GET | /candidates/:candidateId/summaries/:summaryId |

---

## Document Upload

Candidate documents store:

- `candidateId`
- `documentType`
- `fileName`
- `storageKey`
- `rawText`
- `uploadedAt`

Documents are saved locally under an `uploads/` directory.

---

## Asynchronous Summary Generation

Summary generation is implemented using a **queue/worker architecture**.

Workflow:

1. Recruiter uploads candidate document
2. Client requests summary generation
3. A summary job is queued
4. A worker processes the job asynchronously
5. The worker loads candidate documents
6. The worker calls the LLM provider
7. Structured summary output is stored

This ensures the API request is **non-blocking**.

---

## Candidate Summary Model

The summary entity stores:

- `status` (pending, completed, failed)
- `score`
- `strengths`
- `concerns`
- `summary`
- `recommendedDecision`
- `provider`
- `promptVersion`
- `errorMessage`
- timestamps

---

## LLM Provider

A provider abstraction was introduced:

```
SummarizationProvider
```

The current implementation uses:

```
GeminiSummarizationProvider
```

This keeps the business logic independent from any specific LLM vendor and allows future providers to be swapped in without modifying core services.

---

## Access Control

Recruiters belong to a workspace.

All candidate operations verify that the candidate belongs to the requesting user’s workspace before allowing access.

Workspace access is enforced in the service layer before any document or summary operations are performed.

---

# Running the Services

## Python Service

```bash
cd python-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python create_db.py
uvicorn main:app --reload
```

API documentation is available at:

```
http://127.0.0.1:8000/docs
```

---

## TypeScript Service

```bash
cd ts-service
npm install
npm run start:dev
```

Swagger documentation is available at:

```
http://localhost:3000/docs
```

---

# Environment Variables

Create a `.env` file inside the `ts-service` directory.

Example configuration:

```
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

A template file is provided as `.env.example`.

---

# Notes

Design decisions and additional implementation details are documented in **NOTES.md**.
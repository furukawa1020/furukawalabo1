# Architecture

## Overview
**Furukawa Archive OS** is a polyglot microservices system designed to archive and visualize the research, works, and achievements of Kotaro Furukawa.

## Services

### 1. Web Frontend (`apps/web`)
*   **Tech**: React 18, Vite, TypeScrip, Tailwind CSS.
*   **Role**: PWA rendering, Routing, SEO (OGP), UI/UX.
*   **Pages**: `/research` (Poster), `/works` (Grid), `/achievements` (Timeline), `/blog`.

### 2. Core API (`apps/api`)
*   **Tech**: Ruby on Rails 7.1 (API Mode).
*   **Role**:
    *   **DB**: PostgreSQL Source of Truth.
    *   **Resources**: `Works` (Synced), `Donations` (Stripe), `CookieLog`.
    *   **Management**: Admin endpoints.

### 3. Edge Gateway (`apps/edge`)
*   **Tech**: Rust (Axum).
*   **Role**: Entry point, Rate Limiting, Request Routing (Proxy to Web/API).
*   **Port**: 8000 (Internal/Public).

### 4. Worker (`apps/worker`)
*   **Tech**: Go.
*   **Role**:
    *   **Protopedia Sync**: Periodically (6h) fetches works from Protopedia API and upserts to Rails DB.
    *   **Health Check**: Monitors external links.

### 5. AI Service (`apps/ai`)
*   **Tech**: Python (FastAPI).
*   **Role**: (v1.0) Placeholder for semantic search and recommendation engine.

## Data Flow
1.  **User Visits**: `Edge (8000)` -> `Web (3000)`.
2.  **User Views Works**: `Web` -> `Edge` -> `API (8080)` -> `DB`.
3.  **Background**: `Worker` -> `Protopedia` -> `DB`.
4.  **Donation**: `Web` -> `Stripe` -> `Webhook` -> `API` -> `DB`.

## Infrastructure
*   **Docker Compose**: Orchestrates all services + Redis + Postgres.
*   **Volumes**: `db_data` (Postgres persistence).

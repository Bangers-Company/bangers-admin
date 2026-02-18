# Ralph Agent Configuration — Bangers Admin

## Build Instructions

```bash
npm run build
```

## Dev Server

```bash
npm run dev
```

## Lint

```bash
npm run lint
```

## Install Dependencies

```bash
npm install
```

## Add shadcn Components

```bash
npx shadcn@latest add <component-name>
```

## Environment Setup

Requires `.env` file:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Backend Dependency

The Laravel backend must be running at `http://localhost:8080` for API calls:
```bash
cd ../bangers-backend && docker compose up -d
```

## Pre-requisites
- Node.js 18+
- npm
- Backend running on port 8080 (PostgreSQL + Laravel via Docker)

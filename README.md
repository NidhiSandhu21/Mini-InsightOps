# Full Stack InsightOps Dashboard

## Overview
This is a full-stack application with a Next.js frontend and an Express.js backend. It provides a real-time InsightOps dashboard with Role-Based Access Control (RBAC).

## Architecture
- **Frontend**: Next.js (TypeScript), Tailwind CSS, Shadcn UI, Leaflet, Recharts.
- **Backend**: Express (TypeScript), In-memory data store.
- **Auth**: JWT-based authentication with mocked users.

## Prerequisites
- Node.js (v18+)
- npm

## Getting Started

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   The backend runs on `http://localhost:4000`.

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:3000`.

## Users (Mocked)
- **Admin**: `admin@test.com` / `password` (Full access)
- **Analyst**: `analyst@test.com` / `password` (Create/Edit events, no user management)
- **Viewer**: `viewer@test.com` / `password` (Read-only)

## Deployment
### Backend
- Build the project: `npm run build`
- Start: `npm start`
- Can be deployed to any Node.js hosting (Render, Railway, Heroku).

### Frontend
- Build: `npm run build`
- Start: `npm start`
- Optimized for Vercel deployment.

## Verification
RBAC flows were manually verified and optionally via internal scripts.

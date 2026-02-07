# Development & AI Usage Notes

## Summary
This project was built with a strong focus on clean structure, type safety, and proper role-based security.
AI tools were used only to speed up routine tasks, so more time could be spent on:

-   **Core Architecture & State Management**
-   **Security Enforcment (RBAC)**
-   **User experience & Error Handling**

---

## 🛠️ Manual Engineering Highlights
*These critical aspects were designed, implemented, and verified manually:*

The following areas were fully designed, implemented, and validated manually:

*   **Security**: Implemented server-side middleware (authMiddleware, requireRole) to enforce authentication and RBAC at the API level, independent of the UI.
*   **Persistence**: Built a lightweight JSON-based persistence layer to maintain data across server restarts without introducing a database dependency.
*   **Business Logic**: Implemented non-trivial filtering logic for dashboard queries, including compound AND/OR conditions across date ranges, severity, and categories.
*   **Rate Limiting**: Secured public-facing endpoints using express-rate-limit.

---

## 🤖 AI Productivity Usage
*AI was used to accelerate the following non-critical paths:*

### 1. Project Scaffolding
Accelerated creation of standard configuration files such as tsconfig.json and tailwind.config.ts.

### 2. Test Data Generation
Generated realistic seed data (200 events with geographic coordinates and varied severity levels) to support development and validation of map and dashboard features.

### 3. API & Library Reference
Used as a quick syntax and usage reference for third-party libraries (e.g., react-leaflet, recharts) to avoid context switching during implementation.

---

## 🔍 Validation & Refactoring
*All generated code was subject to rigorous review and heavy refactoring:*

*   **Seed Logic:** Refined date generation to ensure all events fall within a realistic 90-day window and exclude future timestamps.
*   **Typing:** Defined explicit TypeScript interfaces for domain models (Event, User) and API responses to enforce end-to-end type safety.
*   **Rendering Fixes:** Refactored the map component to correctly handle SSR constraints and eliminate window is not defined issues common with Leaflet.

---

## 🔮 Future Roadmap (Prototype to Production)
*   **Database:** Migrate from JSON file persistence to PostgreSQL with Prisma/Drizzle ORM.
*   **Testing:** Add integration tests for critical user flows (Login -> View Dashboard -> Edit Event).
*   **Deployment:** Containerize the application with Docker for easy orchestration.

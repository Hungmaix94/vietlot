You are a senior full-stack engineer.

Build a web application with the following requirements:

TECH STACK
- Frontend: Next.js (App Router), React, TypeScript, TailwindCSS
- Backend: Next.js API routes
- Database: PostgreSQL (Prisma ORM)
- Auth: Simple username + fixed password (no OAuth)
- State/data fetching: React Query
- Use clean, performant, production-ready code
- Package manager: yarn (or pnpm)

FUNCTIONAL REQUIREMENTS

1. AUTHENTICATION
- Login with:
  - username (string)
  - password (fixed value, configurable via ENV)
- Roles:
  - USER
  - ADMIN
- After login, redirect based on role

2. LUCKY SPIN (VÒNG QUAY MAY MẮN)
- User can spin once per session
- Spin result is a number of tickets: 1 → 5
- Probability is configurable, example:
  - 1 ticket: 10%
  - 2 tickets: 20%
  - 3 tickets: 30%
  - 4 tickets: 25%
  - 5 tickets: 15%
- Store spin result in database

3. VIETLOT POWER 6/55 FORM
- Based on spin result N:
  - User can submit exactly N lottery tickets
- Each ticket:
  - 6 unique numbers
  - Range: 1 → 55
- Validation on both frontend & backend

4. AI NUMBER GENERATOR
- Button "Generate with AI"
- AI generates 6 numbers (1–55, no duplicate)
- Logic:
  - Weighted randomness (not purely random)
  - Favor historical frequency & spread
  - Explain briefly why these numbers were chosen
- AI logic implemented as a service function (mock AI is acceptable)

5. SUBMIT FLOW
- User fills tickets → submit
- Store:
  - userId
  - spinResult
  - tickets (array of numbers)
  - createdAt

6. ADMIN DASHBOARD
- Admin can:
  - View all submissions
  - Filter by user / date
  - View ticket details per submission

DATABASE MODELS (suggest & implement)
- User
- SpinResult
- TicketSubmission

NON-FUNCTIONAL
- Responsive UI
- Clear folder structure
- Proper error handling
- No over-engineering
- Security basics (server validation, role guard)

OUTPUT REQUIRED
- Database schema (Prisma)
- API routes
- Key React components
- Auth & role guard logic
- AI number generation logic
- Brief explanation of architecture
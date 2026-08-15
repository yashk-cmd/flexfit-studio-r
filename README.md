# FlexFit Studio

**Gym Management Platform — Project 1 Refactor**

A behavior-preserving refactor of an existing gym management application for the 2026 i12 HR Drive Hackathon — Computer Science Project.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white" alt="Next.js 15">
  <img src="https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/tRPC-API-2596BE" alt="tRPC">
  <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F" alt="Drizzle ORM">
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Vitest-Tests-6E9F18?logo=vitest&logoColor=white" alt="Vitest">
</p>

## Table of Contents

- [About the Project](#about-the-project)
- [Project Brief](#project-brief)
- [Core Features](#core-features)
- [Project 1 Requirements](#project-1-requirements)
- [Refactoring Objective](#refactoring-objective)
- [Engineering Approach](#engineering-approach)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Refactoring Areas](#refactoring-areas)
- [Database Strategy](#database-strategy)
- [Behavior Preservation](#behavior-preservation)
- [Testing Strategy](#testing-strategy)
- [Quick Start](#quick-start)
- [Development Commands](#development-commands)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Verification Checklist](#final-verification-checklist)
- [Documentation](#documentation)
- [Engineering Principles](#engineering-principles)
- [Hackathon Evaluation](#hackathon-evaluation)
- [AI-Assisted Development](#ai-assisted-development)
- [Project Status](#project-status)
- [Submission](#submission)
- [License](#license)

---

## About the Project

FlexFit Studio is a full-stack gym management application covering the workflows of:

- Members
- Staff
- Trainers
- Administrators
- Corporate customers

The application manages gym operations such as memberships, classes, credits, bookings, waitlists, attendance, trainer schedules, corporate credit pools, payments, refunds, and reporting.

The original project was supplied as a working codebase built with:

- Next.js 15
- TypeScript
- tRPC
- Drizzle ORM
- SQLite
- Tailwind CSS

The challenge was to restructure the existing application **without changing how it behaves**.

## Project Brief

The project was part of the **2026 i12 HR Drive Hackathon — Computer Science Project**.

The event is an individual engineering challenge focused on:

- Clear communication
- Organized documentation
- Code quality
- Handling an unfamiliar problem

Two projects were provided:

| Project | Deliverable |
|---|---|
| Project 1 | FlexFit Studio refactor |
| Project 2 | AI detector for admissions essays |

This repository focuses on **Project 1: FlexFit Studio Refactor**.

> The original challenge specifically asks the developer to **clone** the repository rather than fork it, and push the completed work to their own repository.

## Core Features

**Member Management** — Members can maintain memberships, purchase or use membership plans, use class credits, book classes, cancel bookings, reschedule bookings, join waitlists, and receive notifications.

**Class Management** — Class schedules, capacity, booking availability, waitlists, cancelled classes, timing rules, and trainer schedules.

**Booking Management** — Creating bookings, checking class capacity, consuming credits, handling waitlists, cancelling and rescheduling bookings, applying booking policies, and handling edge cases.

**Front Desk / Kiosk** — Front-desk operations, kiosk operations, member attendance, check-ins, and booking-related operations.

**Trainer Management** — Trainer schedules, assigned classes, and attendance-related operations.

**Corporate Management** — Corporate customers can purchase credit pools, provide credits to employees, and allow employees to use corporate credits in corporate booking workflows. Corporate workflows have their own business rules rather than being treated as identical to normal member bookings.

**Administration** — Staff management, trainer management, company management, attendance, announcements, notifications, revenue reports, administrative reporting, and payment/refund workflows.

## Project 1 Requirements

The central requirement is:

> **The application must behave exactly the same after the refactor.**

That means the refactor must protect:

- **Inputs** — existing valid and invalid inputs should continue to be handled correctly
- **Outputs** — existing workflows should return the same expected results
- **Errors** — existing validation and error behavior should not be casually changed
- **Edge Cases** — existing boundary conditions and unusual cases must remain understood and protected
- **Business Rules** — rules such as booking, cancellation, rescheduling, credits, waitlists, and corporate booking policies must continue to work

### What the Refactor Is Trying to Solve

The original application has accumulated code from multiple developers over time, without coordination between them. The resulting engineering problem is therefore not simply *"make the application work,"* it is:

> Make an already-working application easier for another engineer to understand and maintain without breaking what already works.

The refactor focuses on:

- Responsibility boundaries
- Duplication
- Large files
- Business-rule organization
- Service boundaries
- Testability
- Documentation
- Maintainability

## Refactoring Objective

The core principle is:

> **Change the structure, not the behavior.**

The goal is not to introduce unnecessary technology — it's to make the existing system easier to reason about.

## Engineering Approach

The refactor follows four major principles.

### 1. Separate Responsibilities

- A tRPC router should primarily define the API boundary.
- Business workflows should live in service modules.
- Deterministic business rules should live in policy modules.
- Database access should remain within the persistence layer.

### 2. Centralize Repeated Logic

When the same business rule is implemented in several places, it becomes difficult to guarantee that all copies remain consistent. The refactor moves reusable rules into shared modules where appropriate, including:

- Booking policies
- Rescheduling policies
- Time calculations
- Corporate booking rules

### 3. Split Unrelated Responsibilities

A file that performs multiple unrelated jobs becomes harder to understand and harder to change safely. The refactor separates workflows such as booking, rescheduling, corporate booking, and reporting into clearer service boundaries.

### 4. Avoid Unnecessary Rewrites

The project does not require changing technologies. The existing stack remains Next.js, TypeScript, tRPC, Drizzle ORM, SQLite, and Tailwind CSS. The database model is also intentionally preserved.

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 · App Router |
| Language | TypeScript |
| API | tRPC |
| ORM | Drizzle ORM |
| Database | SQLite |
| Styling | Tailwind CSS |
| Testing | Vitest |

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────┐
│             Next.js App              │
│         Pages / UI / Routes          │
└──────────────────┬────────────────---┘
                    │
                    ▼
┌─────────────────────────────────────┐
│             tRPC Routers             │
│         API / Input Boundary         │
└──────────────────┬────────────────---┘
                    │
                    ▼
┌─────────────────────────────────────┐
│            Service Layer             │
│      Business Workflows / Rules      │
└──────────────────┬────────────────---┘
                    │
                    ▼
┌─────────────────────────────────────┐
│             Drizzle ORM              │
│           Persistence Layer          │
└──────────────────┬────────────────---┘
                    │
                    ▼
┌─────────────────────────────────────┐
│                SQLite                │
└─────────────────────────────────────┘
```

### Layer Responsibilities

**Next.js App** — Pages, routes, UI composition, application navigation.

**tRPC Routers** — API procedures, input validation at the API boundary, authentication/authorization boundaries, calling the appropriate business workflow.

**Services** — Business workflows, multi-step operations, database coordination, business-level orchestration.

**Policies** — Deterministic business rules, time boundaries, booking constraints, rescheduling rules, reusable calculations.

**Database Layer** — Drizzle ORM, SQLite persistence, existing schema, existing seed data.

## Project Structure

```
src/
├── app/
│   └── ...                      # Next.js App Router pages
│
├── components/
│   └── ...                      # Shared UI components
│
├── db/
│   ├── index.ts                 # Database client
│   ├── schema.ts                # Drizzle schema
│   └── seed.ts                  # Development seed data
│
├── lib/
│   └── ...                      # Shared utilities
│
└── server/
    ├── routers/
    │   └── ...                  # tRPC API procedures
    │
    └── services/
        ├── booking-service.ts
        ├── booking-policy.ts
        ├── corporate-booking-service.ts
        ├── admin-report-service.ts
        ├── reschedule-service.ts
        ├── reschedule-policy.ts
        └── time-policy.ts

tests/
└── booking-policy.test.ts

documents/
└── ...                          # Project documentation
```

> The exact folder layout is an engineering decision rather than a requirement of the challenge. The important point is that the resulting structure has clear responsibilities and can be defended.

## Refactoring Areas

### Booking

Booking logic is one of the most important business workflows. The original implementation combined validation, membership handling, credit handling, capacity checks, booking creation, cancellation, waitlist behavior, and attendance-related behavior into a single place. The refactor separates these concerns:

```
tRPC booking procedure
        │
        ▼
Booking service
        │
        ├── Booking policy
        ├── Time policy
        └── Database operations
```

**Result:** the API boundary no longer needs to contain the entire booking workflow. The workflow becomes easier to read, test, reason about, and modify — while preserving existing behavior.

### Rescheduling

Rescheduling is separated into:

```
src/server/services/reschedule-service.ts
src/server/services/reschedule-policy.ts
```

The service is responsible for the workflow. The policy is responsible for deterministic rescheduling rules. This avoids mixing policy decisions with database orchestration.

### Corporate Booking

Corporate booking is kept separate from normal member booking because corporate accounts have different business constraints. The corporate workflow is handled through a dedicated service boundary:

```
src/server/services/corporate-booking-service.ts
```

This avoids creating a large generic booking abstraction simply for the sake of reuse.

### Administrative Reporting

Reporting is treated as a separate responsibility. Administrative report operations are extracted into:

```
src/server/services/admin-report-service.ts
```

This separates reporting queries/calculations from the tRPC API boundary.

## Database Strategy

### Database Was Intentionally Preserved

The challenge explicitly allows either keeping the existing database or changing the data model if there is a strong reason. This implementation chooses to **keep the existing database**.

```
SQLite
   │
   ▼
Drizzle ORM
   │
   ├── src/db/schema.ts
   ├── src/db/index.ts
   └── src/db/seed.ts
```

**Why?** A database redesign was not necessary to achieve the primary objective of Project 1. The core engineering problem is application structure rather than persistence technology. Changing the schema without a clear behavioral requirement would also increase the risk of introducing regressions.

Therefore: **the refactor changes the organization of application logic while keeping the persistence model stable.**

## Behavior Preservation

Behavior preservation is the most important constraint in this project. The refactor is designed to preserve existing application workflows, tRPC procedures, validation, errors, business rules, edge cases, and database behavior.

### Examples of Protected Business Rules

The regression tests currently cover policy behavior such as:

| Rule | Behavior |
|---|---|
| Booking Time | Calculates the time remaining before a class starts |
| Unlimited Credits | A credit value of 999 or greater is treated as unlimited |
| Cancellation Boundary | The existing 12-hour cancellation boundary is preserved |
| No-Credit Refund | A booking that used no credits does not receive a credit refund |
| Rescheduling Boundary | Allowed at exactly four hours before class, rejected inside the four-hour window |
| Corporate Cancellation | The corporate cancellation window remains at 24 hours |

These are examples of existing behavior that the refactor protects through explicit regression tests.

## Testing Strategy

The project uses **Vitest** for deterministic policy and regression testing.

### Current Test Suite

`tests/booking-policy.test.ts` covers:

```
Booking policies
├── calculates hours until a class starts
├── treats 999 or more credits as unlimited
├── uses the 12-hour cancellation boundary
└── does not refund a booking that used no credits

Reschedule policies
├── allows rescheduling at exactly four hours
└── rejects rescheduling inside the four-hour window

Corporate booking policy
└── keeps the corporate cancellation window at 24 hours
```

**Current Result:** 7 tests · 7 passing · 0 failing

### Verification Commands

```bash
# Run Tests
npm test

# Type Check
npx tsc --noEmit

# Production Build
npm run build
```

A successful verification should produce:

```
Tests        → passing
TypeScript   → no errors
Next.js      → production build succeeds
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- Git

> SQLite does not require a separate server.

### Clone

```bash
git clone <your-private-repository-url>
cd flexfit-studio
```

### Install

```bash
npm install
```

### Initialize Database

```bash
npm run db:push
```

### Seed Development Data

```bash
npm run db:seed
```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development Commands

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm test` | Run Vitest tests |
| `npx tsc --noEmit` | Run TypeScript type checking |
| `npm run db:push` | Apply Drizzle schema |
| `npm run db:seed` | Seed development database |
| `npm run db:reset` | Reset/reseed database if supported by the project |

## Development Workflow

The refactor follows an incremental workflow:

```
Understand existing behavior
          │
          ▼
Identify duplication / responsibility problems
          │
          ▼
Make one focused structural change
          │
          ▼
Run tests
          │
          ▼
Run TypeScript checks
          │
          ▼
Run production build
          │
          ▼
Manually verify affected workflow
          │
          ▼
Document the decision
          │
          ▼
Review git diff
```

Structural changes are made incrementally rather than rewriting the entire application at once.

## Troubleshooting

<details>
<summary><strong>npm: ENOENT: process.cwd</strong></summary>

This means the terminal is probably inside a directory that no longer exists.

```bash
cd ~
cd ~/Downloads/flexfit-studio
pwd
ls
npm install
```

</details>

<details>
<summary><strong>pnpm: command not found</strong></summary>

The project can be run using npm:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

If the repository is intended to use pnpm and you want to install it:

```bash
npm install -g pnpm
```

</details>

<details>
<summary><strong>TypeScript Error</strong></summary>

```bash
npx tsc --noEmit
```

Fix the first source error reported, then run the command again.

</details>

<details>
<summary><strong>Production Build Error</strong></summary>

```bash
npm run build
```

Read the first application/source error reported by Next.js.

> Do not automatically run `npm audit fix --force`. Dependency upgrades can introduce unrelated breaking changes and are not a substitute for fixing an application error.

</details>

<details>
<summary><strong>Multiple Lockfiles Warning</strong></summary>

Next.js may report:

```
Next.js inferred your workspace root...
Detected additional lockfiles...
```

This usually indicates that more than one package manager lockfile is visible to Next.js. It does not necessarily mean the application is broken. Use one package manager consistently for the repository and avoid deleting lockfiles blindly.

</details>

## Documentation

The challenge provides an empty `documents/` directory for project notes. Recommended documentation for the completed submission includes:

```
documents/
├── architecture.md
├── behavior-inventory.md
├── refactoring-decisions.md
├── test-strategy.md
└── known-issues.md
```

| File | Should explain |
|---|---|
| `architecture.md` | Why the chosen structure exists, what each layer owns, why routers and services are separated, where business policies live |
| `behavior-inventory.md` | Discovered behavior: booking, cancellation, rescheduling, credit, waitlist, corporate, and error rules |
| `refactoring-decisions.md` | What was changed, why it was changed, what alternatives were considered, why the chosen approach was safer |
| `test-strategy.md` | What was tested, why those behaviors matter, what is covered automatically vs. verified manually |
| `known-issues.md` | Suspicious or questionable existing behavior that was intentionally left unchanged rather than silently modified |

## Engineering Principles

- **Single Responsibility** — a module should have one clear reason to change.
- **Separation of Concerns** — API transport, business workflows, business policies, and persistence should not be unnecessarily mixed.
- **Centralized Business Rules** — rules that need to remain consistent should have a single implementation.
- **Minimal Abstraction** — do not introduce abstractions simply to make the architecture look more complex.
- **Preserve Before Improving** — a behavior that looks unusual is not automatically a bug; changing it without understanding its consequences can create a regression.
- **Make Decisions Defensible** — every significant structural decision should have a reason that another engineer can understand.

### What This Project Demonstrates

- Reading and understanding an unfamiliar codebase
- Discovering existing behavior rather than assuming it
- Refactoring without blindly rewriting
- Identifying responsibility boundaries
- Reducing duplicated business logic
- Creating meaningful service boundaries
- Preserving existing business rules
- Adding regression tests around important behavior
- Keeping the database stable when a redesign is unnecessary
- Documenting engineering decisions
- Validating changes with tests and production builds

## Final Verification Checklist

**Application**
- [ ] Application starts successfully
- [ ] Main page loads
- [ ] Login works
- [ ] Member dashboard works
- [ ] Class schedule works
- [ ] Membership plans work
- [ ] Booking workflow verified
- [ ] Cancellation workflow verified
- [ ] Rescheduling workflow verified
- [ ] Waitlist workflow verified
- [ ] Front-desk workflow verified
- [ ] Kiosk workflow verified
- [ ] Attendance workflow verified
- [ ] Trainer workflow verified
- [ ] Corporate workflow verified
- [ ] Admin workflow verified
- [ ] Revenue/reporting workflow verified
- [ ] Payment/refund workflow verified
- [ ] Notifications verified

**Code**
- [ ] `npm test` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] No unintended database changes
- [ ] No unrelated dependency changes
- [ ] No debug code remains
- [ ] No unnecessary commented-out code remains
- [ ] `git diff` reviewed

**Documentation**
- [ ] README reviewed
- [ ] Architecture documented
- [ ] Behavior inventory documented
- [ ] Refactoring decisions documented
- [ ] Testing strategy documented
- [ ] Known issues documented

**Git**
- [ ] Repository cloned rather than forked
- [ ] Work pushed to the required repository
- [ ] Only intended files committed
- [ ] Commit history reviewed
- [ ] Repository visibility matches submission requirements

## Hackathon Evaluation

According to the project brief, the work is evaluated primarily on:

| Criterion | What It Demonstrates |
|---|---|
| Communication | Can another engineer understand your decisions? |
| Documentation | Did you record behavior, decisions, and limitations? |
| Code Quality | Is the resulting structure maintainable and coherent? |
| Unfamiliar Problems | Can you investigate and solve problems without a predefined solution? |

The challenge explicitly states that there is no single correct folder structure. The important question is whether the structure makes sense, preserves behavior, reduces unnecessary complexity, and can be explained and defended.

## AI-Assisted Development

The challenge permits AI-assisted development. The important requirement is to understand and take responsibility for everything that ends up in the repository. AI usage should therefore be disclosed honestly in the final submission.

A suitable disclosure can describe:

- Which AI tools were used
- What they were used for
- Whether generated code was reviewed
- How behavior was verified
- What decisions were made manually

> AI assistance does not replace understanding the resulting architecture or verifying behavior.

## Project Status

Current local verification:

| Check | Status |
|---|---|
| Dependencies installed | ✅ |
| Database schema applied | ✅ |
| Development seed completed | ✅ |
| Tests | ✅ 7/7 |
| TypeScript | ✅ |
| Production build | ✅ |
| Next.js routes generated | ✅ |

## Submission

| | |
|---|---|
| **Project** | FlexFit Studio — Project 1 Refactor |
| **Submission Type** | Individual submission |
| **Repository** | Pushed to the developer's required repository per hackathon submission instructions |

**Recommended submission materials:**

- GitHub repository
- Professional README
- Architecture/refactoring documentation
- Regression tests
- Optional walkthrough video
- Submission form entry

## License

This repository is a hackathon project submission.

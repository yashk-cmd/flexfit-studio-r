FlexFit Studio

Gym Management Platform · Project 1 Refactor

A behavior-preserving refactor of a production-style gym management application built for the 2026 i12 HR Drive Hackathon — Computer Science Project.









Overview

FlexFit Studio is a full-stack gym management application supporting members, staff, trainers, administrators, and corporate customers.

Core capabilities

Member memberships and class bookings

Membership credits and credit consumption

Booking cancellation and rescheduling

Class waitlists

Front-desk and kiosk operations

Trainer management and schedules

Attendance and check-ins

Corporate credit pools and employee bookings

Revenue and administrative reporting

Payments and refunds

Notifications

Project 1 Objective

The objective was not to rebuild FlexFit Studio or redesign its product behavior.

The task was to take an existing working codebase and restructure it into software that is easier to understand, maintain, test, and extend while preserving its existing behavior.

Change the structure, not the behavior.

The refactor focuses on code organization, responsibility boundaries, duplicated business logic, testability, and documentation.

Engineering Goals

1. Separation of Responsibilities

Separate:

tRPC/API concerns

business workflows

deterministic business policies

database operations

2. Reduced Duplication

Move repeated business rules and calculations into shared modules.

3. Smaller Modules

Break apart large routers that had accumulated multiple unrelated responsibilities.

4. Behavior Preservation

Preserve existing:

inputs

outputs

validation

errors

edge cases

business rules

database behavior

Technology Stack

Layer

Technology

Framework

Next.js 15 · App Router

Language

TypeScript

API

tRPC

ORM

Drizzle ORM

Database

SQLite

Styling

Tailwind CSS

Testing

Vitest

The existing application stack was retained rather than replaced.

Quick Start

Prerequisites

Install:

Node.js 20+

npm

Git

SQLite does not require a separate database server.

1. Clone the repository

git clone <your-private-repository-url>
cd flexfit-studio

2. Install dependencies

npm install

3. Initialize the database

Apply the existing Drizzle schema:

npm run db:push

Seed the development database:

npm run db:seed

The seed script creates the local development dataset.

4. Start the application

npm run dev

Open:

http://localhost:3000

5. Verify the project

Run the tests:

npm test

Run TypeScript checks:

npx tsc --noEmit

Create a production build:

npm run build

Quick command reference

# Install
npm install

# Database
npm run db:push
npm run db:seed

# Development
npm run dev

# Testing
npm test

# Type checking
npx tsc --noEmit

# Production build
npm run build

Note: Run db:push and db:seed after installing dependencies. They can also be run again when you need to recreate the local development database.

For detailed setup, reset instructions, troubleshooting, and development guidance, see INSTALLATION_GUIDE.md.

Architecture

The original backend contained large tRPC routers that mixed API handling, validation, business logic, database operations, and reporting.

The refactored architecture separates these responsibilities:

Next.js App
    |
    v
tRPC Routers
    |
    v
Service Layer
    |
    +-- Business Workflows
    |
    +-- Business Policies
    |
    v
Drizzle ORM
    |
    v
SQLite

Responsibility boundaries

Layer

Responsibility

app/

Next.js routes and pages

components/

Shared UI components

routers/

tRPC procedures and API boundary

services/

Business workflows

*-policy.ts

Deterministic business rules

db/

Existing database and persistence layer

tests/

Regression and policy tests

documents/

Architecture and refactoring documentation

Project Structure

src/
├── app/
│   └── ...                      # Next.js App Router pages
│
├── components/
│   └── ...                      # Shared UI components
│
├── db/
│   ├── index.ts                 # Existing database client
│   ├── schema.ts                # Existing Drizzle schema
│   └── seed.ts                  # Existing seed data
│
├── lib/
│   └── ...                      # Shared utilities
│
└── server/
    ├── routers/
    │   └── ...                  # tRPC API boundary
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
├── architecture.md
├── behavior-inventory.md
├── refactoring-decisions.md
├── test-strategy.md
└── known-issues.md

Refactoring Highlights

Booking

The original booking router contained several responsibilities:

Booking validation

Membership and credit handling

Capacity checks

Booking creation

Cancellation

Waitlist handling

Attendance-related operations

These responsibilities were separated so the router primarily acts as the API boundary while workflow logic is handled by the service layer.

routers/bookings.ts
        |
        v
services/booking-service.ts
        |
        +-- booking-policy.ts
        |
        +-- time-policy.ts
        |
        v
      Drizzle

Why?

A large router becomes difficult to reason about when API handling and business workflows are mixed together.

The refactor makes the booking workflow independently understandable and testable without changing the public application workflow.

Rescheduling

Rescheduling logic was extracted into:

src/server/services/reschedule-service.ts
src/server/services/reschedule-policy.ts

Validation and policy rules are centralized instead of being duplicated across procedures.

This keeps rules such as rescheduling time boundaries in one place.

Corporate Bookings

Corporate booking workflows were extracted into:

src/server/services/corporate-booking-service.ts

Corporate rules remain separate from normal member booking rules because the two workflows have different business constraints.

The goal was not to force every booking workflow into one generic abstraction.

Administrative Reporting

Reporting operations were extracted from the large admin router into:

src/server/services/admin-report-service.ts

This keeps report queries and calculations separate from the tRPC transport layer.

Database Strategy

The persistence layer was intentionally kept stable.

The refactor does not redesign the database model.

The existing:

SQLite
Drizzle ORM
src/db/schema.ts
src/db/index.ts
src/db/seed.ts

remain the foundation of the application.

This was a deliberate engineering decision. The challenge permits database changes, but a database redesign was not necessary to achieve the structural improvements required by Project 1.

The refactor therefore concentrates on the application layer above persistence.

Behavior Preservation

Behavior preservation is the central constraint of Project 1.

The refactor aims to preserve:

Existing application workflows

Existing tRPC procedure behavior

Existing validation rules

Existing business boundaries

Existing database interactions

Existing error behavior

Existing edge cases

When questionable existing behavior was discovered, it was not silently rewritten merely because it looked unusual.

Such cases are recorded in:

documents/behavior-inventory.md
documents/known-issues.md
documents/refactoring-decisions.md

Testing & Verification

Vitest is used for deterministic business-policy regression tests.

Current coverage

Booking time calculations

Unlimited credit behavior

Cancellation boundaries

No-credit refund behavior

Rescheduling boundaries

Invalid rescheduling

Corporate cancellation timing

Run:

npm test

Current verification:

7 / 7 tests passing

Type checking

npx tsc --noEmit

Production build

npm run build

Current verification includes:

7/7 tests passing

0 TypeScript errors

Successful Next.js production build

17 application routes generated

Automated checks are complemented by manual verification of the major member, staff, admin, and corporate workflows.

A small unit-test suite alone cannot prove complete application-level behavior preservation, so manual regression testing remains part of the verification process.

Development Commands

Command

Description

npm run dev

Start the development server

npm run build

Create a production build

npm run start

Start the production server

npm test

Run Vitest tests

npx tsc --noEmit

Run TypeScript type checking

npm run db:push

Apply the existing Drizzle schema

npm run db:seed

Seed the local development database

npm run db:reset

Reset and reseed the local development database

Development Workflow

1. Understand existing behavior
          |
          v
2. Identify responsibility or duplication
          |
          v
3. Make one focused refactor
          |
          v
4. Run regression tests
          |
          v
5. Run TypeScript checks
          |
          v
6. Run production build
          |
          v
7. Manually verify affected workflow
          |
          v
8. Document the decision

This keeps structural changes measurable and reduces the chance of accidental behavior changes.

Documentation

The documents/ directory contains the reasoning behind the refactor.

Document

Purpose

architecture.md

Describes the resulting application structure

behavior-inventory.md

Records discovered application behavior

refactoring-decisions.md

Explains significant architectural decisions

test-strategy.md

Describes regression and verification strategy

known-issues.md

Records suspicious behavior that was intentionally preserved or documented

Design Principles

Single Responsibility

A module should have one clear reason to change.

Thin API Boundaries

tRPC routers should expose procedures and handle API-level concerns rather than contain entire business workflows.

Centralized Policies

Rules that are reused or require a single source of truth should live in dedicated policy modules.

Minimal Abstraction

Abstractions are introduced when they solve a real problem, not simply to increase the number of layers.

Preserve Before Improving

In a behavior-preserving refactor, unusual behavior is not automatically a bug.

Changing it without understanding its impact can create a regression.

Troubleshooting

npm reports ENOENT: process.cwd

This normally means the terminal is currently inside a directory that has been deleted or moved.

Run:

cd ~

Then navigate back to the project:

cd ~/Downloads/flexfit-studio

Verify:

pwd
ls

Then retry the npm command.

pnpm: command not found

You can use npm instead:

npm install
npm run db:push
npm run db:seed
npm run dev

Or install pnpm:

npm install -g pnpm

TypeScript errors

Run:

npx tsc --noEmit

Fix the first reported source error before continuing.

Production build errors

Run:

npm run build

Fix the first application/source error reported by Next.js.

Avoid immediately running:

npm audit fix --force

Dependency upgrades are unrelated to the behavior-preserving refactor and can introduce new compatibility problems.

Multiple lockfile warning

Next.js may warn that it detected multiple lockfiles.

This is a workspace-root warning and does not necessarily indicate an application failure.

For example:

Next.js inferred your workspace root...
Detected additional lockfiles:
pnpm-lock.yaml

The application can still build successfully. Avoid deleting lockfiles blindly; choose one package manager for normal development and keep the repository's intended lockfile.

Final Verification Checklist

Before submission:

Application starts successfully

Database initializes successfully

Seed data loads successfully

Member login verified

Class booking verified

Cancellation verified

Rescheduling verified

Waitlist verified

Front-desk workflows verified

Attendance verified

Trainer workflows verified

Corporate workflows verified

Admin reports verified

npm test passes

npx tsc --noEmit passes

npm run build passes

Documentation reviewed

git diff reviewed

Only intended changes committed

Repository pushed to the required GitHub repository

Hackathon Context

2026 i12 HR Drive Hackathon — Computer Science Project

Item

Detail

Project

FlexFit Studio Refactor

Submission

Individual

Project Window

1–15 August 2026

Evaluation

Communication, documentation, code quality, unfamiliar-problem handling

AI-assisted development is permitted by the challenge. Tools used during development should be disclosed honestly as part of the final submission process.

License

This repository is a hackathon project submission.

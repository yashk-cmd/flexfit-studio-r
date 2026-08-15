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

Payments, refunds, and notifications

Project 1 objective

The challenge was not to rebuild the application or redesign its product behavior.

The objective was to take an existing working codebase and restructure it into software that is easier to understand, maintain, test, and extend — while preserving its existing behavior.

Change the structure, not the behavior.

Engineering Goals

The refactor focuses on four areas:

Separation of responsibilities — keep API transport, business workflows, policies, and persistence concerns distinct.

Reduced duplication — move repeated business rules and calculations into shared modules.

Smaller, understandable modules — break apart large routers with unrelated responsibilities.

Behavior preservation — preserve existing inputs, outputs, errors, edge cases, and database behavior wherever possible.

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

Architecture

The original application contained large server routers that combined API handling, validation, business logic, database operations, and reporting.

The refactored architecture separates these responsibilities:

┌───────────────────────────────┐
│          Next.js App          │
│       Pages / Components      │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│          tRPC Routers         │
│       API / Input Boundary    │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│           Services            │
│   Business Workflows / Rules  │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│         Drizzle ORM           │
│       Existing DB Layer       │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│            SQLite             │
└───────────────────────────────┘

Project Structure

src/
├── app/                         # Next.js App Router pages
├── components/                  # Shared UI components
├── db/
│   ├── index.ts                 # Existing database client
│   ├── schema.ts                # Existing Drizzle schema
│   └── seed.ts                  # Existing seed data
├── lib/                         # Shared utilities
└── server/
    ├── routers/                 # tRPC API boundary
    └── services/                # Business workflows and policies

tests/
└── booking-policy.test.ts       # Regression / policy tests

documents/
├── architecture.md
├── behavior-inventory.md
├── refactoring-decisions.md
├── test-strategy.md
└── known-issues.md

Refactoring Highlights

Booking

The original booking router contained multiple responsibilities:

Booking validation

Membership and credit handling

Capacity checks

Booking creation

Cancellation

Waitlist behavior

Attendance-related operations

These responsibilities were separated so that the router remains primarily an API boundary while workflow logic lives in the service layer.

routers/bookings.ts
        │
        ▼
services/booking-service.ts
        │
        ├── booking-policy.ts
        └── time-policy.ts

Result: booking logic is easier to understand, test, and modify without changing the public workflow.

Rescheduling

Rescheduling logic was separated into:

services/reschedule-service.ts
services/reschedule-policy.ts

Validation and policy rules are centralized instead of being duplicated across procedures.

Corporate Bookings

Corporate booking workflows were extracted into:

services/corporate-booking-service.ts

Corporate rules remain separate from normal member booking rules because the two workflows have different business constraints.

Administrative Reporting

Reporting operations were extracted from the large admin router into:

services/admin-report-service.ts

This keeps reporting queries and calculations separate from the tRPC transport layer.

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

This was a deliberate decision: the challenge permits database changes, but they were not necessary to achieve the structural improvements required by Project 1.

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

When questionable existing behavior was discovered, it was not silently rewritten merely because it looked unusual. Such cases are recorded in the project documentation where appropriate.

See:

documents/behavior-inventory.md
documents/known-issues.md
documents/refactoring-decisions.md

Testing & Verification

Vitest is used for deterministic business-policy regression tests.

Current coverage includes:

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

Type-check:

npx tsc --noEmit

Production build:

npm run build

The project has been verified with:

7/7 tests passing

0 TypeScript errors

Successful Next.js production build

17 application routes generated

Automated checks are complemented by manual verification of the major member, staff, admin, and corporate workflows because complete behavior preservation cannot be established from a small unit-test suite alone.

Getting Started

Requirements

Node.js 20+

npm

No separate SQLite server is required.

Installation

Clone your repository:

git clone <your-private-repository-url>
cd flexfit-studio

Install dependencies:

npm install

Initialize the existing database schema:

npm run db:push

Seed the development database:

npm run db:seed

Start the application:

npm run dev

Open:

http://localhost:3000

For detailed setup and troubleshooting:

Installation Guide

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

Understand existing behavior
          │
          ▼
Identify responsibility / duplication
          │
          ▼
Make one focused refactor
          │
          ▼
Run regression tests
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

Rules that are reused or need a single source of truth should live in dedicated policy modules.

Minimal Abstraction

Abstractions are introduced when they solve a real problem, not simply to increase the number of layers.

Preserve Before Improving

In a behavior-preserving refactor, an unusual behavior is not automatically a bug. Changing it without understanding its impact can create a regression.

Final Verification Checklist

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

Project: FlexFit Studio Refactor
Submission: Individual
Project window: 1–15 August 2026

The project is evaluated around:

Clear communication

Organized documentation

Code quality

Handling an unfamiliar codebase and problem

AI-assisted development is permitted by the challenge. Any tools used during development should be disclosed honestly as part of the final submission process.

License

This repository is a hackathon project submission.
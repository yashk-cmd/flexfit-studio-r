FlexFit Studio

Gym Management Platform — Project 1 Refactor

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

Table of Contents

About the Project

Project Brief

Core Features

Project 1 Requirements

Refactoring Objective

Engineering Approach

Technology Stack

Architecture

Project Structure

Refactoring Areas

Database Strategy

Behavior Preservation

Testing Strategy

Quick Start

Development Commands

Development Workflow

Troubleshooting

Verification Checklist

Documentation

Engineering Principles

Hackathon Evaluation

AI-Assisted Development

License

About the Project

FlexFit Studio is a full-stack gym management application covering the workflows of:

Members

Staff

Trainers

Administrators

Corporate customers

The application manages gym operations such as memberships, classes, credits, bookings, waitlists, attendance, trainer schedules, corporate credit pools, payments, refunds, and reporting.

The original project was supplied as a working codebase built with:

Next.js 15

TypeScript

tRPC

Drizzle ORM

SQLite

Tailwind CSS

The challenge was to restructure the existing application without changing how it behaves.

Project Brief

The project was part of the:

2026 i12 HR Drive Hackathon — Computer Science Project

The event is an individual engineering challenge focused on:

Clear communication

Organized documentation

Code quality

Handling an unfamiliar problem

Two projects were provided.

Project

Deliverable

Project 1

FlexFit Studio refactor

Project 2

AI detector for admissions essays

This repository focuses on Project 1: FlexFit Studio Refactor.

The original challenge specifically asks the developer to clone the repository rather than fork it and push the completed work to their own repository.

Core Features

FlexFit Studio supports the following application areas.

Member Management

Members can:

Maintain memberships

Purchase or use membership plans

Use class credits

Book classes

Cancel bookings

Reschedule bookings

Join waitlists

Receive notifications

Class Management

The system supports:

Class schedules

Class capacity

Booking availability

Waitlists

Cancelled classes

Class timing rules

Trainer schedules

Booking Management

Booking workflows include:

Creating bookings

Checking class capacity

Consuming credits

Handling waitlists

Cancelling bookings

Rescheduling bookings

Applying booking policies

Handling booking edge cases

Front Desk / Kiosk

Staff-facing workflows include:

Front-desk operations

Kiosk operations

Member attendance

Check-ins

Booking-related operations

Trainer Management

Trainer workflows include:

Trainer schedules

Assigned classes

Attendance-related operations

Corporate Management

Corporate customers can:

Purchase credit pools

Provide credits to employees

Allow employees to use corporate credits

Participate in corporate booking workflows

Corporate workflows have their own business rules rather than being treated as identical to normal member bookings.

Administration

Administrative functionality includes:

Staff management

Trainer management

Company management

Attendance

Announcements

Notifications

Revenue reports

Administrative reporting

Payment/refund workflows

Project 1 Requirements

The central requirement is:

The application must behave exactly the same after the refactor.

That means the refactor must protect:

Inputs

Existing valid and invalid inputs should continue to be handled correctly.

Outputs

Existing workflows should return the same expected results.

Errors

Existing validation and error behavior should not be casually changed.

Edge Cases

Existing boundary conditions and unusual cases must remain understood and protected.

Business Rules

Rules such as booking, cancellation, rescheduling, credits, waitlists, and corporate booking policies must continue to work.

What The Refactor Is Trying To Solve

The original application has accumulated code from multiple developers over time.

The challenge describes it as a project that has passed through several developers who did not coordinate with each other.

The resulting engineering problem is therefore not simply:

"Make the application work."

It is:

Make an already-working application easier for another engineer to understand and maintain without breaking what already works.

The refactor focuses on:

Responsibility boundaries

Duplication

Large files

Business-rule organization

Service boundaries

Testability

Documentation

Maintainability

Refactoring Objective

The core principle is:

Change the structure, not the behavior.

The goal is not to introduce unnecessary technology.

The goal is to make the existing system easier to reason about.

Engineering Approach

The refactor follows four major principles.

1. Separate Responsibilities

A tRPC router should primarily define the API boundary.

Business workflows should live in service modules.

Deterministic business rules should live in policy modules.

Database access should remain within the persistence layer.

2. Centralize Repeated Logic

When the same business rule is implemented in several places, it becomes difficult to guarantee that all copies remain consistent.

The refactor moves reusable rules into shared modules where appropriate.

Examples include:

Booking policies

Rescheduling policies

Time calculations

Corporate booking rules

3. Split Unrelated Responsibilities

A file that performs multiple unrelated jobs becomes harder to understand and harder to change safely.

The refactor therefore separates workflows such as:

Booking

Rescheduling

Corporate booking

Reporting

into clearer service boundaries.

4. Avoid Unnecessary Rewrites

The project does not require changing technologies.

The existing stack remains:

Next.js
TypeScript
tRPC
Drizzle ORM
SQLite
Tailwind CSS

The database model is also intentionally preserved.

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

Architecture

High-Level Architecture

┌─────────────────────────────────────┐
│             Next.js App             │
│         Pages / UI / Routes         │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│             tRPC Routers             │
│          API / Input Boundary        │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│            Service Layer             │
│       Business Workflows / Rules     │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│             Drizzle ORM              │
│           Persistence Layer          │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│                SQLite                 │
└─────────────────────────────────────┘

Layer Responsibilities

Next.js App

Responsible for:

Pages

Routes

UI composition

Application navigation

tRPC Routers

Responsible for:

API procedures

Input validation at the API boundary

Authentication/authorization boundaries

Calling the appropriate business workflow

Services

Responsible for:

Business workflows

Multi-step operations

Database coordination

Business-level orchestration

Policies

Responsible for:

Deterministic business rules

Time boundaries

Booking constraints

Rescheduling rules

Reusable calculations

Database Layer

Responsible for:

Drizzle ORM

SQLite persistence

Existing schema

Existing seed data

Project Structure

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

The exact folder layout is an engineering decision rather than a requirement of the challenge. The important point is that the resulting structure has clear responsibilities and can be defended.

Refactoring Areas

Booking

Booking logic is one of the most important business workflows.

The original implementation combined responsibilities such as:

Validation

Membership handling

Credit handling

Capacity checks

Booking creation

Cancellation

Waitlist behavior

Attendance-related behavior

The refactor separates these concerns.

tRPC booking procedure
        │
        ▼
Booking service
        │
        ├── Booking policy
        ├── Time policy
        └── Database operations

Result

The API boundary no longer needs to contain the entire booking workflow.

The workflow becomes easier to:

read

test

reason about

modify

while preserving the existing behavior.

Rescheduling

Rescheduling is separated into:

src/server/services/reschedule-service.ts
src/server/services/reschedule-policy.ts

The service is responsible for the workflow.

The policy is responsible for deterministic rescheduling rules.

This avoids mixing policy decisions with database orchestration.

Corporate Booking

Corporate booking is kept separate from normal member booking because corporate accounts have different business constraints.

The corporate workflow is handled through a dedicated service boundary:

src/server/services/corporate-booking-service.ts

This avoids creating a large generic booking abstraction simply for the sake of reuse.

Administrative Reporting

Reporting is treated as a separate responsibility.

Administrative report operations are extracted into:

src/server/services/admin-report-service.ts

This separates reporting queries/calculations from the tRPC API boundary.

Database Strategy

Database Was Intentionally Preserved

The challenge explicitly allows either:

keeping the existing database

changing the data model if there is a strong reason

This implementation chooses to keep the existing database.

The existing persistence stack remains:

SQLite
   │
   ▼
Drizzle ORM
   │
   ├── src/db/schema.ts
   ├── src/db/index.ts
   └── src/db/seed.ts

Why?

A database redesign was not necessary to achieve the primary objective of Project 1.

The core engineering problem is application structure rather than persistence technology.

Changing the schema without a clear behavioral requirement would also increase the risk of introducing regressions.

Therefore:

The refactor changes the organization of application logic while keeping the persistence model stable.

Behavior Preservation

Behavior preservation is the most important constraint in this project.

The refactor is designed to preserve:

Existing application workflows

Existing tRPC procedures

Existing validation

Existing errors

Existing business rules

Existing edge cases

Existing database behavior

Examples of Protected Business Rules

The regression tests currently cover policy behavior such as:

Booking Time

The application calculates the time remaining before a class starts.

Unlimited Credits

A credit value of 999 or greater is treated as unlimited.

Cancellation Boundary

The existing 12-hour cancellation boundary is preserved.

No-Credit Refund

A booking that used no credits does not receive a credit refund.

Rescheduling Boundary

Rescheduling is allowed at exactly four hours before the class and rejected inside the four-hour window.

Corporate Cancellation

The corporate cancellation window remains at 24 hours.

These are examples of existing behavior that the refactor protects through explicit regression tests.

Testing Strategy

The project uses Vitest for deterministic policy and regression testing.

Current Test Suite

The current test file is:

tests/booking-policy.test.ts

It covers:

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

Current Result

7 tests
7 passing
0 failing

Verification Commands

Run Tests

npm test

Type Check

npx tsc --noEmit

Production Build

npm run build

A successful verification should produce:

Tests        → passing
TypeScript   → no errors
Next.js      → production build succeeds

Quick Start

Prerequisites

Install:

Node.js 20+

npm

Git

SQLite does not require a separate server.

Clone

git clone <your-private-repository-url>
cd flexfit-studio

Install

npm install

Initialize Database

npm run db:push

Seed Development Data

npm run db:seed

Start Development Server

npm run dev

Open:

http://localhost:3000

Development Commands

Command

Purpose

npm install

Install dependencies

npm run dev

Start development server

npm run build

Create production build

npm run start

Start production server

npm test

Run Vitest tests

npx tsc --noEmit

Run TypeScript type checking

npm run db:push

Apply Drizzle schema

npm run db:seed

Seed development database

npm run db:reset

Reset/reseed database if supported by the project

Development Workflow

The refactor follows an incremental workflow.

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

The important part is that structural changes are made incrementally rather than rewriting the entire application at once.

Troubleshooting

npm: ENOENT: process.cwd

This means the terminal is probably inside a directory that no longer exists.

Run:

cd ~

Then return to the project:

cd ~/Downloads/flexfit-studio

Verify:

pwd
ls

Then run:

npm install

pnpm: command not found

The project can be run using npm:

npm install
npm run db:push
npm run db:seed
npm run dev

If the repository is intended to use pnpm and you want to install it:

npm install -g pnpm

TypeScript Error

Run:

npx tsc --noEmit

Fix the first source error reported.

Then run the command again.

Production Build Error

Run:

npm run build

Read the first application/source error reported by Next.js.

Do not automatically run:

npm audit fix --force

Dependency upgrades can introduce unrelated breaking changes and are not a substitute for fixing an application error.

Multiple Lockfiles Warning

Next.js may report:

Next.js inferred your workspace root...
Detected additional lockfiles...

This usually indicates that more than one package manager lockfile is visible to Next.js.

It does not necessarily mean the application is broken.

Use one package manager consistently for the repository and avoid deleting lockfiles blindly.

Documentation

The challenge provides an empty documents/ directory for project notes.

Recommended documentation for the completed submission includes:

documents/
├── architecture.md
├── behavior-inventory.md
├── refactoring-decisions.md
├── test-strategy.md
└── known-issues.md

architecture.md

Should explain:

Why the chosen structure exists

What each layer owns

Why routers and services are separated

Where business policies live

behavior-inventory.md

Should record discovered behavior such as:

Booking rules

Cancellation rules

Rescheduling rules

Credit behavior

Waitlist behavior

Corporate rules

Error behavior

refactoring-decisions.md

Should explain important decisions:

What was changed

Why it was changed

What alternatives were considered

Why the chosen approach was safer

test-strategy.md

Should explain:

What was tested

Why those behaviors matter

What is covered automatically

What is verified manually

known-issues.md

Should document suspicious or questionable existing behavior that was intentionally left unchanged rather than silently modifying it.

Engineering Principles

Single Responsibility

A module should have one clear reason to change.

Separation of Concerns

API transport, business workflows, business policies, and persistence should not be unnecessarily mixed.

Centralized Business Rules

Rules that need to remain consistent should have a single implementation.

Minimal Abstraction

Do not introduce abstractions simply to make the architecture look more complex.

Preserve Before Improving

A behavior that looks unusual is not automatically a bug.

In a refactoring project, changing it without understanding its consequences can create a regression.

Make Decisions Defensible

Every significant structural decision should have a reason that another engineer can understand.

What This Project Demonstrates

This project is intended to demonstrate the ability to:

Read and understand an unfamiliar codebase

Discover existing behavior rather than assuming it

Refactor without blindly rewriting

Identify responsibility boundaries

Reduce duplicated business logic

Create meaningful service boundaries

Preserve existing business rules

Add regression tests around important behavior

Keep the database stable when a redesign is unnecessary

Document engineering decisions

Validate changes with tests and production builds

Final Verification Checklist

Before submission:

Application

Application starts successfully

Main page loads

Login works

Member dashboard works

Class schedule works

Membership plans work

Booking workflow verified

Cancellation workflow verified

Rescheduling workflow verified

Waitlist workflow verified

Front-desk workflow verified

Kiosk workflow verified

Attendance workflow verified

Trainer workflow verified

Corporate workflow verified

Admin workflow verified

Revenue/reporting workflow verified

Payment/refund workflow verified

Notifications verified

Code

npm test passes

npx tsc --noEmit passes

npm run build passes

No unintended database changes

No unrelated dependency changes

No debug code remains

No unnecessary commented-out code remains

git diff reviewed

Documentation

README reviewed

Architecture documented

Behavior inventory documented

Refactoring decisions documented

Testing strategy documented

Known issues documented

Git

Repository cloned rather than forked

Work pushed to the required repository

Only intended files committed

Commit history reviewed

Repository visibility matches submission requirements

Hackathon Evaluation

According to the project brief, the work is evaluated primarily on:

Criterion

What it demonstrates

Communication

Can another engineer understand your decisions?

Documentation

Did you record behavior, decisions, and limitations?

Code Quality

Is the resulting structure maintainable and coherent?

Unfamiliar Problems

Can you investigate and solve problems without a predefined solution?

The challenge explicitly states that there is no single correct folder structure.

The important question is whether the structure:

Makes sense

Preserves behavior

Reduces unnecessary complexity

Can be explained and defended

AI-Assisted Development

The challenge permits AI-assisted development.

The important requirement is to understand and take responsibility for everything that ends up in the repository.

AI usage should therefore be disclosed honestly in the final submission.

A suitable disclosure can describe:

Which AI tools were used

What they were used for

Whether generated code was reviewed

How behavior was verified

What decisions were made manually

AI assistance does not replace understanding the resulting architecture or verifying behavior.

Project Status

Current local verification:

Check

Status

Dependencies installed

✅

Database schema applied

✅

Development seed completed

✅

Tests

✅ 7/7

TypeScript

✅

Production build

✅

Next.js routes generated

✅

Submission

Project

FlexFit Studio — Project 1 Refactor

Submission Type

Individual submission.

Repository

The completed project should be pushed to the developer's required repository according to the hackathon submission instructions.

Recommended submission materials

GitHub repository

Professional README

Architecture/refactoring documentation

Regression tests

Optional walkthrough video

Submission form entry

License

This repository is a hackathon project submission.

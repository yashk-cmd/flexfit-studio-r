FlexFit Studio — Installation & Start Guide

This guide is for running the Project 1 FlexFit Studio refactor locally.

1. Prerequisites

Install:

Node.js 20 or newer

npm

Check versions:

node -v
npm -v

The original project uses pnpm. If you prefer pnpm:

npm install -g pnpm
pnpm -v

You do not need to install SQLite separately.

2. Enter the Project

Example:

cd ~/Downloads/flexfit-studio

Verify that you are in the project:

pwd
ls

You should see:

package.json
src
documents
tests
drizzle.config.ts
next.config.mjs

3. Install Dependencies

npm

npm install

or pnpm

pnpm install

Do not run both package managers unnecessarily. Pick one for normal development.

4. Create the Local Database

The application uses the existing SQLite/Drizzle setup.

Run:

npm run db:push

This applies:

src/db/schema.ts

to the local SQLite database.

Then seed the development data:

npm run db:seed

A successful seed should report approximately:

users:          16
plans:           6
memberships:    12
classes:        96
bookings:      791
checkins:       96
notifications:   5

The exact output should come from the project's seed script.

5. Start the Development Server

Run:

npm run dev

You should see something similar to:

▲ Next.js 15.x
- Local: http://localhost:3000
✓ Ready

Open:

http://localhost:3000

6. Test Login

Admin

Email:    admin@flexfit.test
Password: admin123

Trainer

Email:    arjun@flexfit.test
Password: trainer123

Member

Email:    rahul.k@example.com
Password: member123

Every seeded member uses:

member123

Additional member accounts are defined in:

src/db/seed.ts

7. Verify the Main Workflows

Member

Check:

Login
Dashboard
Plans
Schedule
Book a class
Cancel a booking
Reschedule a booking
Join/view waitlist
Notifications

Staff/Admin

Check:

Kiosk / front desk
Attendance
Trainer management
Companies
Revenue reports
Announcements
Refund/payment workflows

Corporate

Check:

Company
Credit pool
Employee credits
Corporate booking
Corporate cancellation

The purpose of this manual pass is to confirm that the refactor preserved the existing behavior.

8. Run Automated Tests

Stop the dev server if you want a clean verification environment, then run:

npm test

Expected current result:

7 tests passed

The tests cover the extracted policy behavior, including:

booking time calculation

unlimited credit threshold

cancellation boundary

no-credit refund behavior

rescheduling boundary

corporate cancellation boundary

9. Type Check

Run:

npx tsc --noEmit

There should be no TypeScript errors.

10. Production Build

Run:

npm run build

Expected:

✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

The current project generates 17 application routes during the production build.

11. Start the Production Build

After a successful build:

npm run start

Then open:

http://localhost:3000

12. Reset the Development Database

If local data becomes inconsistent:

npm run db:reset

This command:

deletes the local SQLite database

applies the existing schema

runs the existing seed script

It is destructive and should only be used for local development.

13. Recommended Development Workflow

Use this sequence when making changes:

1. Start from the current working project
          ↓
2. Understand existing behavior
          ↓
3. Make one focused refactor
          ↓
4. Run tests
          ↓
5. Run TypeScript check
          ↓
6. Run production build
          ↓
7. Manually verify affected workflow
          ↓
8. Document the decision

Commands:

npm test
npx tsc --noEmit
npm run build

14. Important Warning About Builds

Do not run:

npm run build

while:

npm run dev

is actively running.

Stop the development server first:

Ctrl + C

Then build.

For type checking while development is running, use:

npx tsc --noEmit

15. Database Policy for This Project

The hackathon asks for a refactor of the working application.

The final refactor therefore intentionally keeps:

src/db/schema.ts
src/db/seed.ts
src/db/index.ts
SQLite
Drizzle ORM

unchanged.

Do not modify the schema merely to make the architecture look more sophisticated.

16. Final Pre-Submission Commands

Run these from the project root:

npm install
npm run db:push
npm run db:seed
npm test
npx tsc --noEmit
npm run build

Then start the application:

npm run dev

Perform the manual workflow checks and then inspect Git:

git status
git diff

Only commit the intended Project 1 changes.

17. Troubleshooting

npm: ENOENT: process.cwd

Your terminal is probably inside a directory that was deleted or moved.

Run:

cd ~

Then enter the actual project directory again:

cd ~/Downloads/flexfit-studio

Verify:

pwd
ls

Then retry npm.

pnpm: command not found

Install pnpm:

npm install -g pnpm

If npm installed it but the shell cannot find it, continue with npm instead:

npm install
npm run db:push
npm run db:seed
npm run dev

TypeScript error

Run:

npx tsc --noEmit

Fix the reported source error before attempting to submit.

Build error

Run:

npm run build

Read the first TypeScript/source error. Do not immediately change dependencies or run:

npm audit fix --force

Dependency upgrades are unrelated to the refactoring objective and can introduce behavior changes.

Quick Start

For an already configured machine:

cd ~/Downloads/flexfit-studio
npm install
npm run db:push
npm run db:seed
npm run dev

Open:

http://localhost:3000

For final verification:

npm test
npx tsc --noEmit
npm run build
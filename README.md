# Health Clinic App

A small Express.js application for managing clinic users and appointments (patients and staff). The app uses EJS for server-side views, MySQL for data storage, and sessions for authentication.

This repository part of the coursework for Dynamic Web Applications. It implements user registration and login, patient booking/search, and staff appointment and patient-management interfaces.

## Contents

- `index.js` — application entry point and Express configuration
- `package.json` — Node dependencies
- `db/` — SQL scripts to create the schema and insert test data (`create_db.sql`, `insert_test_data.sql`)
- `routes/` — Express route handlers (`main.js`, `auth.js`, `patient.js`, `staff.js`)
- `views/` — EJS templates for pages and partials
- `public/` — static assets (CSS)
- `helpers/` — small helper utilities (e.g. `path.js`)

## Features

- Patient registration and login
- Staff login
- Patients can book, view, search and cancel appointments
- Staff can view and manage their appointments, search patients and add notes
- MySQL database with sample data provided

## Tech stack

- Node.js (Express)
- EJS templating
- MySQL (mysql2)
- express-session for session management
- bcrypt for password hashing
- express-validator for input validation

## Prerequisites

- Node.js (v16+ recommended)
- MySQL server (local or remote)
- Git (optional)

## Quick start

1. Install dependencies

```bash
npm install
```

2. Create the database and seed test data

The SQL scripts live in the `db/` folder. `create_db.sql` will create a `health` database and a `health_app` user. `insert_test_data.sql` inserts sample users, patients, staff and appointments.

Run the scripts using your MySQL root/admin account (or adapt to your setup):

```bash
# Create DB and user
mysql -u root -p < db/create_db.sql

# Insert sample data (connect as root or as the new health_app user)
mysql -u root -p health < db/insert_test_data.sql
```

Note: `create_db.sql` creates a MySQL user `health_app`@`localhost` with password `qwertyuiop`. Change this in production.

3. Create a `.env` file in the project root with the database connection settings. Example `.env`:

```env
HEALTH_HOST=localhost
HEALTH_USER=health_app
HEALTH_PASSWORD=qwertyuiop
HEALTH_DATABASE=health
BASE_PATH=
```

4. Start the app

```bash
# Run directly with node
node index.js
```

Open http://localhost:8000 in your browser (the app uses port 8000 by default).

## Environment variables

- `HEALTH_HOST` — MySQL host (e.g. `localhost`)
- `HEALTH_USER` — DB user (default in scripts: `health_app`)
- `HEALTH_PASSWORD` — DB password (default in scripts: `qwertyuiop`)
- `HEALTH_DATABASE` — DB name (`health` by default)
- `BASE_PATH` — optional base path prefix for the app (defaults to `""`)

If you add a production deployment, you should also move the session secret out of `index.js` and into an environment variable.

## Important files and structure

- `index.js` — configures Express, session middleware, view engine, global `db` pool and loads routes.
- `routes/auth.js` — registration, login and logout routes. Uses `bcrypt` to hash passwords and `express-validator` for validation.
- `routes/patient.js` — patient-only pages (dashboard, book appointment, search, cancel).
- `routes/staff.js` — staff-only pages (dashboard, appointments, patient search and patient details).
- `db/create_db.sql` — schema creation and user creation.
- `db/insert_test_data.sql` — seed data (sample users/patients/staff/appointments).

## Routes (overview)

Public:

- GET / — Home page
- GET /about — About page

Auth:

- GET /auth/register — Register page
- POST /auth/register — Register
- GET /auth/login — Login page
- POST /auth/login — Login
- GET /auth/logout — Logout

Patient (requires login as patient):

- GET /patient/dashboard — Patient dashboard (upcoming/past/cancelled appointments)
- GET /patient/book — Book appointment form
- POST /patient/book — Submit booking
- GET /patient/search — Search appointments
- POST /patient/search — Execute search
- POST /patient/appointments/:id/cancel — Cancel an appointment

Staff (requires login as staff):

- GET /staff/dashboard — Staff dashboard
- GET /staff/appointments — Staff appointments (today/upcoming/past/cancelled)
- POST /staff/appointments/:id/cancel — Cancel appointment (staff)
- GET /staff/patient-search — Patient search form
- POST /staff/patient-search — Execute patient search
- GET /staff/patients/:id — View patient details
- POST /staff/patients/:id/notes — Add notes for a patient

All forms use server-side validation via `express-validator` and render validation errors back to the views.

## Sample data & test users

Sample data is provided in `db/insert_test_data.sql`. The SQL creates several patient and staff accounts. The sample SQL also contains a convenience MySQL user `health_app` with password `qwertyuiop` (change this for real deployments).

If you need test login credentials, either register a new patient through the UI or insert a new user using the SQL scripts with a bcrypt-hashed password.

## Security notes

- The application stores the session secret directly in `index.js`. For production move it to an environment variable.
- Change the MySQL seed password and remove default test accounts in production.
- Use HTTPS and secure cookie flags when deploying publicly.

## Acknowledgements

This project was created as part of a coursework exercise for Dynamic Web Applications.

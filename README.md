# IELTS Mock Platform

IELTS Mock Platform is a web application for running IELTS-style practice exams online. Students can register, buy an Academic or General package, upload payment proof, wait for admin approval, and then take timed mock tests. Admins can review payments, manage users, and upload test content from the dashboard.

## What This Project Does

### For students
- Create an account and log in
- View Academic and General IELTS packages
- Upload a payment slip for a package
- Start tests after admin approval
- Take timed Listening, Reading, and Writing tests
- View results and attempt history
- Request a live Speaking appointment by email or WhatsApp

### For admins
- Log in with an admin account
- Approve or reject student payments
- Manage users and reset passwords
- Create, edit, and delete test modules
- Upload listening audio and other test content
- Track subscriptions and student progress

## Tech Stack

- Next.js 15
- React 19
- MySQL
- JWT authentication
- Tailwind CSS
- Formidable for file uploads

## Before You Start

Make sure you have:

- Node.js 18 or later
- npm
- MySQL running locally
- Git

If you use XAMPP, the default setup usually works with:

- `DB_HOST=localhost`
- `DB_USER=root`
- `DB_PASSWORD=`
- `DB_PORT=3306`

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database

Create a MySQL database named `mockpaperilets`.

```sql
CREATE DATABASE mockpaperilets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Create `.env.local`

Add this file in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mockpaperilets
DB_PORT=3306
JWT_SECRET=replace_this_with_a_long_random_secret
```

### 4. Initialize the database

```bash
npm run init-db
```

What this does:

- Creates the MySQL tables
- Creates an admin user
- Prints the admin password in the terminal

Important:

- Admin email is `admin@ielts.com`
- The password is generated randomly
- Save the password immediately because it is shown only once
- `npm run init-db` resets the schema, so do not run it on a database you want to keep

### 5. Start the app

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## How The Platform Works

### Student flow

1. Register a new account.
2. Log in.
3. Open the dashboard.
4. Choose Academic or General.
5. Buy a package and upload a payment slip.
6. Wait for admin approval.
7. Start available modules.
8. Use the Speaking page to request a live appointment.

### Admin flow

1. Log in with the admin account created by `npm run init-db`.
2. Open the admin dashboard to review payments.
3. Approve or reject subscriptions.
4. Add test content from the admin content pages.
5. Manage users when needed.

## Main Pages

- `/` - public landing page
- `/register` - student registration
- `/login` - login page
- `/dashboard` - student dashboard
- `/profile` - student profile
- `/speaking-appointment` - speaking slot request page
- `/admin/dashboard` - subscription and payment approval
- `/admin/content` - content upload and pack creation
- `/admin/quizzes` - module management
- `/admin/users` - user management

## Useful Commands

- `npm run dev` - start local development server
- `npm run build` - create production build
- `npm run start` - run production build
- `npm run init-db` - create or reset database tables and admin account

## Project Structure

```text
pages/                Frontend pages and API routes
pages/admin/          Admin screens
pages/api/            Backend API endpoints
models/               Data models and database queries
lib/mysql.js          MySQL connection pool
scripts/schema.sql    Database schema
scripts/init-db.js    Database setup script
public/uploads/       Uploaded payment slips and module files
```

## Important Notes

- The current app uses MySQL.
- Some older files in this repository still mention MongoDB from an earlier version.
- For setup, follow this README and the MySQL scripts, not the older MongoDB notes.
- Uploaded files are stored locally inside `public/uploads`.
- `.env.local` is ignored by Git.

## Troubleshooting

### Database connection failed

- Make sure MySQL is running
- Make sure `mockpaperilets` exists
- Check the values in `.env.local`

### Login or token errors

- Make sure `JWT_SECRET` is set
- Clear browser storage or log out and log back in

### No tests appear on the dashboard

- The admin still needs to create modules or packs
- Check `/admin/content` and `/admin/quizzes`

### `npm run init-db` removed old data

- That is expected
- The schema file recreates the tables from scratch

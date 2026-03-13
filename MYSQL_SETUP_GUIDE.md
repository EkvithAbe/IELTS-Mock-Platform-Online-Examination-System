# MySQL Database Setup Guide

## Database Configuration

This application now uses **MySQL** instead of MongoDB. Follow these steps to set up and configure your database.

---

## Prerequisites

- **XAMPP** (or similar) with MySQL installed
- **phpMyAdmin** running
- Node.js and npm installed

---

## Step 1: Database Creation

The database `mockpaperilets` should already be created in your phpMyAdmin. If not:

1. Open phpMyAdmin (usually at `http://localhost/phpmyadmin`)
2. Click on "New" in the left sidebar
3. Enter database name: `mockpaperilets`
4. Select collation: `utf8mb4_unicode_ci`
5. Click "Create"

---

## Step 2: Environment Variables

Create or update your `.env.local` file in the project root with the following MySQL configuration:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mockpaperilets
DB_PORT=3306

# JWT Secret (keep this secure)
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production

# Node Environment
NODE_ENV=development
```

### Environment Variables Explained:

- **DB_HOST**: MySQL server host (default: `localhost`)
- **DB_USER**: MySQL username (default: `root` for XAMPP)
- **DB_PASSWORD**: MySQL password (empty by default for XAMPP)
- **DB_NAME**: Database name (`mockpaperilets`)
- **DB_PORT**: MySQL port (default: `3306`)
- **JWT_SECRET**: Secret key for JWT token generation (change this!)

---

## Step 3: Initialize Database

Run the initialization script to create all tables and the admin user:

```bash
npm run init-db
```

This script will:
- Create all necessary tables (users, tests, test_modules, subscriptions, bookings, attempts, results)
- Create an admin user with the following credentials:
  - **Email**: `admin@gmail.com`
  - **Password**: `admin@123`

⚠️ **Important**: Change the admin password after first login!

---

## Step 4: Verify Database Setup

1. Open phpMyAdmin
2. Select the `mockpaperilets` database
3. You should see 7 tables:
   - `users`
   - `tests`
   - `test_modules`
   - `subscriptions`
   - `bookings`
   - `attempts`
   - `results`

---

## Step 5: Start the Application

```bash
npm run dev
```

The application should now connect to MySQL successfully!

---

## Database Schema Overview

### Users Table
Stores user accounts (students and admins)
- Fields: id, name, email, phone, password, role, is_active, etc.

### Tests Table
Stores full IELTS tests
- Fields: id, title, description, type, price, duration, sections, etc.

### Test Modules Table
Stores individual test modules (listening, reading, writing, speaking)
- Fields: id, title, test_type, module_type, price, duration, questions, etc.

### Subscriptions Table
Stores user subscriptions to test modules
- Fields: id, user_id, test_type, test_module, price, status, payment_status, etc.

### Bookings Table
Stores user bookings for full tests
- Fields: id, user_id, test_id, payment_status, test_status, etc.

### Attempts Table
Stores user attempts at test modules
- Fields: id, user_id, test_module_id, attempt_number, status, answers, scores, etc.

### Results Table
Stores final results for completed tests
- Fields: id, booking_id, user_id, test_id, listening_score, reading_score, writing_score, speaking_score, overall_score, etc.

---

## Troubleshooting

### Connection Errors

If you see "MySQL connection error":
1. Make sure XAMPP MySQL service is running
2. Verify your `.env.local` credentials
3. Check that the database `mockpaperilets` exists
4. Ensure MySQL is running on port 3306

### Port Conflicts

If port 3306 is in use:
1. Stop other MySQL services
2. Or change the port in XAMPP and update `DB_PORT` in `.env.local`

### Permission Issues

If you get "Access denied":
1. Check your MySQL username and password
2. Make sure the user has permissions on the database
3. In phpMyAdmin, check user privileges

---

## Re-initializing Database

If you need to reset the database:

1. Drop all tables manually in phpMyAdmin, OR
2. Run the initialization script again (it will drop and recreate tables):

```bash
npm run init-db
```

⚠️ **Warning**: This will delete all existing data!

---

## Admin Credentials

**Default Admin Account:**
- Email: `admin@gmail.com`
- Password: `admin@123`

Please change the password immediately after first login for security!

---

## Migration Notes

This application has been migrated from MongoDB to MySQL:
- All Mongoose models have been replaced with MySQL query-based models
- Field names follow MySQL snake_case convention (e.g., `user_id` instead of `userId`)
- JSON fields are used for complex nested data
- All functionality remains the same

---

## Additional Commands

### View Database Connection Status
The application will log connection status on startup:
- ✅ MySQL connected successfully
- ❌ MySQL connection error: [error message]

### Manual Database Queries
You can use phpMyAdmin to:
- View and edit data
- Run custom SQL queries
- Export/import data
- Monitor database performance

---

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MySQL service is running
4. Check phpMyAdmin for database structure

---

**Last Updated**: October 2025

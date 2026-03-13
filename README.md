# IELTS Mock Platform

A comprehensive online IELTS (International English Language Testing System) preparation platform built with Next.js and MySQL. This platform enables students to purchase, take, and review IELTS practice tests while administrators manage subscriptions, grade tests, and oversee the system.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [User Roles & Workflows](#user-roles--workflows)
- [Admin Access](#admin-access)
- [API Documentation](#api-documentation)
- [Testing the System](#testing-the-system)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

### For Students
- User registration and authentication with JWT
- Browse IELTS test packages (Academic & General Training)
- Purchase test packages with payment receipt upload
- Access to 4 test modules per package: Listening, Reading, Writing, Speaking
- Take timed practice tests with auto-save functionality
- Review test results and performance analytics
- Track purchased tests and attempt history
- View detailed answer explanations

### For Administrators
- Admin dashboard for subscription management
- Approve/reject student payment requests
- View payment receipts and transaction details
- User management (view, edit, reset passwords)
- Grade Writing and Speaking tests manually
- Monitor system activity and user progress
- Manage test content and quiz packages

### System Features
- Secure authentication with JWT tokens
- File upload for payment receipts (images/PDFs)
- Real-time quiz timer with auto-submit
- Question navigation and flagging system
- Automatic grading for objective questions
- Manual grading workflow for Writing/Speaking
- Responsive design for all devices
- Status tracking (pending, active, expired, cancelled)

## Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with server-side rendering
- **React 19.1.0** - UI library
- **TailwindCSS 4** - Utility-first CSS framework
- **Recharts 3.5.1** - Data visualization for analytics

### Backend
- **Node.js** - JavaScript runtime
- **Next.js API Routes** - Serverless API endpoints
- **MySQL 2** - Relational database with mysql2 driver
- **JWT (jsonwebtoken 9.0.2)** - Authentication tokens
- **bcryptjs 3.0.2** - Password hashing

### Additional Libraries
- **Formidable 3.5.1** - File upload handling
- **Nodemailer 7.0.11** - Email notifications
- **Google APIs 168.0.0** - Google Calendar integration
- **Twilio 5.10.7** - SMS notifications
- **React Big Calendar 1.19.4** - Calendar/scheduling interface
- **date-fns 4.1.0** - Date manipulation
- **moment-timezone 0.6.0** - Timezone handling

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MySQL** (version 5.7 or higher) - [Download](https://dev.mysql.com/downloads/)
  - XAMPP (recommended for beginners) - [Download](https://www.apachefriends.org/)
  - Or standalone MySQL Server
- **Git** - [Download](https://git-scm.com/)
- **Code editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ielts-mock-platform
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, MySQL driver, and all dependencies listed in `package.json`.

## Database Setup

### Option 1: Using XAMPP (Recommended for Beginners)

1. **Install and Start XAMPP**
   - Download and install XAMPP
   - Open XAMPP Control Panel
   - Start **Apache** and **MySQL** services

2. **Create Database**
   - Open phpMyAdmin at `http://localhost/phpmyadmin`
   - Click "New" in the left sidebar
   - Database name: `mockpaperilets`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

3. **Initialize Database Tables**
   ```bash
   npm run init-db
   ```

   This script will:
   - Create all necessary tables (users, tests, test_modules, subscriptions, bookings, attempts, results)
   - Create an admin user with default credentials (see Admin Access section)

### Option 2: Using MySQL Command Line

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE mockpaperilets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
exit

# Run initialization script
npm run init-db
```

### Database Schema

The application uses 7 main tables:

- **users** - User accounts (students and admins)
- **tests** - Full IELTS test packages
- **test_modules** - Individual test modules (Listening, Reading, etc.)
- **subscriptions** - User subscriptions and payment records
- **bookings** - Test bookings and scheduling
- **attempts** - User test attempts and answers
- **results** - Final test results and scores

## Environment Configuration

Create a `.env.local` file in the project root:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mockpaperilets
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

# Node Environment
NODE_ENV=development

# Optional: Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional: Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Optional: Google Calendar API
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Environment Variables Explained

| Variable | Description | Required |
|----------|-------------|----------|
| DB_HOST | MySQL server hostname | Yes |
| DB_USER | MySQL username | Yes |
| DB_PASSWORD | MySQL password (empty for XAMPP default) | Yes |
| DB_NAME | Database name | Yes |
| DB_PORT | MySQL port (default 3306) | Yes |
| JWT_SECRET | Secret key for JWT tokens (use strong random string) | Yes |
| NODE_ENV | Environment mode (development/production) | Yes |
| EMAIL_* | Email server configuration for notifications | No |
| TWILIO_* | SMS notification configuration | No |
| GOOGLE_* | Google Calendar integration | No |

### Important Security Notes

- **Never commit `.env.local` to version control** (it's in .gitignore)
- **Change JWT_SECRET** to a strong random string in production
- **Use app-specific passwords** for email (not your main password)
- **Secure database credentials** especially in production

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at: **http://localhost:3000**

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm start` | Start production server |
| `npm run init-db` | Initialize database tables and admin user |

## Project Structure

```
ielts-mock-platform/
├── components/           # Reusable React components
│   ├── Layout.js        # Main layout wrapper
│   ├── Navbar.js        # Navigation bar
│   └── ...
├── data/                # Static data and constants
├── database/            # Database configuration and migrations
├── lib/                 # Utility functions and helpers
│   ├── mysql.js         # MySQL connection pool
│   ├── auth.js          # Authentication utilities
│   └── ...
├── models/              # Data models (if using ORM pattern)
├── pages/               # Next.js pages (auto-routing)
│   ├── _app.js          # Global app wrapper
│   ├── index.js         # Homepage
│   ├── login.js         # Student/Admin login
│   ├── register.js      # Student registration
│   ├── dashboard.js     # Student dashboard
│   ├── profile.js       # User profile page
│   ├── subscription.js  # Browse test packages
│   ├── my-tests.js      # View purchased tests
│   ├── about.js         # About page
│   ├── contact.js       # Contact page
│   ├── admin/           # Admin pages
│   │   ├── dashboard.js # Admin dashboard
│   │   └── users.js     # User management
│   ├── api/             # API routes (backend)
│   │   ├── auth/        # Authentication endpoints
│   │   ├── subscriptions/  # Subscription management
│   │   ├── test-modules/   # Test content APIs
│   │   ├── attempts/    # Test attempt APIs
│   │   ├── admin/       # Admin APIs
│   │   └── ...
│   ├── buy-quiz/        # Quiz purchase pages
│   ├── my-purchased-tests/ # View unlocked tests
│   ├── test/            # Test details and info
│   ├── attempt/         # Take test interface
│   ├── test-attempt/    # Test taking pages
│   ├── test-results/    # View results
│   └── payment/         # Payment processing
├── public/              # Static files
│   ├── uploads/         # User uploaded files
│   │   └── payment-receipts/  # Payment proof images
│   └── ...
├── scripts/             # Utility scripts
│   ├── init-db.js       # Database initialization
│   └── ...
├── .env.local           # Environment variables (not in git)
├── package.json         # Project dependencies
├── tailwind.config.js   # TailwindCSS configuration
└── README.md            # This file
```

## User Roles & Workflows

### Student Workflow

1. **Registration & Login**
   - Register at `/register` with name, email, phone, password
   - Login at `/login`
   - Redirected to `/dashboard`

2. **Browse Test Packages**
   - Dashboard shows two tabs: Academic IELTS & General Training IELTS
   - Each tab displays available quiz packages
   - Locked packages show price ($50 default) and lock icon
   - Unlocked packages show green checkmark

3. **Purchase a Test Package**
   - Click on locked package → Redirected to `/buy-quiz/[type]?quizId=[id]`
   - Fill purchase form:
     - Personal information (name, email, phone, address)
     - Payment method (Bank Transfer / Online Payment)
     - Transaction ID
     - Upload payment receipt (image/PDF, max 5MB)
     - Additional notes
   - Submit request (status: pending)
   - Return to dashboard

4. **Wait for Admin Approval**
   - Dashboard shows "Pending Payments" count
   - Quiz remains locked until approved

5. **Access Unlocked Tests**
   - After admin approval, quiz shows "Unlocked" status
   - Click quiz → Go to `/my-purchased-tests/[type]?quizId=[id]`
   - View 4 test modules:
     - Listening Test (30 min, 40 questions)
     - Reading Test (60 min, 40 questions)
     - Writing Test (60 min, 2 tasks)
     - Speaking Test (15 min, 3 parts)

6. **Take a Test**
   - Click "Start Test" → Go to test attempt page
   - Features:
     - Timer (auto-submit when expired)
     - Question navigation sidebar
     - Flag questions for review
     - Auto-save answers
     - Previous/Next navigation
   - Submit when complete

7. **View Results**
   - Listening & Reading: Instant grading with score and grade
   - Writing & Speaking: Pending manual grading by admin
   - Review mode: See correct answers and explanations

### Administrator Workflow

1. **Admin Login**
   - Login at `/login` with admin credentials
   - Redirected to `/admin/dashboard`

2. **Manage Subscriptions**
   - View all subscription requests
   - Filter by status: All / Pending / Approved / Rejected
   - For each subscription:
     - View customer details
     - Check payment receipt
     - Verify transaction information
   - Actions:
     - **Approve**: Unlocks quiz for student
     - **Reject**: Keeps quiz locked, optionally add rejection reason
     - **View**: See full details

3. **Manage Users**
   - Go to `/admin/users`
   - View all registered users
   - Search and filter users
   - Reset user passwords
   - Activate/deactivate accounts

4. **Grade Manual Tests**
   - View pending Writing/Speaking attempts
   - Review student responses
   - Assign scores based on IELTS criteria
   - Provide feedback
   - Submit grades (student notified)

## Admin Access

### Default Admin Credentials

After running `npm run init-db`, an admin account is created:

- **Email:** `admin@gmail.com`
- **Password:** `admin@123`

**IMPORTANT:** Change this password immediately after first login!

### Admin Routes

- `/admin/dashboard` - Subscription management
- `/admin/users` - User management
- `/admin/tests` - Test content management (if implemented)
- `/admin/grading` - Manual grading interface (if implemented)

## API Documentation

### Authentication APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new student |
| `/api/auth/login` | POST | Login (student/admin) |
| `/api/auth/logout` | POST | Logout and clear session |
| `/api/auth/forgot-password` | POST | Request password reset |

### Student APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subscriptions` | GET | Get user subscriptions |
| `/api/my-subscriptions` | GET | Get purchased tests |
| `/api/test-modules/[id]` | GET | Get test module details |
| `/api/attempts/create` | POST | Start new test attempt |
| `/api/attempts/[id]` | GET | Get attempt details |
| `/api/attempts/[id]/save` | POST | Save answers (auto-save) |
| `/api/attempts/[id]/submit` | POST | Submit test attempt |
| `/api/test-results/[id]` | GET | Get test results |
| `/api/quiz-purchase/submit` | POST | Submit quiz purchase request |

### Admin APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/subscriptions` | GET | List all subscriptions |
| `/api/admin/subscriptions/[id]/approve` | POST | Approve payment |
| `/api/admin/subscriptions/[id]/reject` | POST | Reject payment |
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/[id]` | GET | Get user details |
| `/api/admin/users/reset-password` | POST | Reset user password |

### Request/Response Examples

**Login Request:**
```json
POST /api/auth/login
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "student@example.com",
    "role": "student"
  }
}
```

## Testing the System

### Quick Test Guide (5 Minutes)

1. **Start Services**
   ```bash
   # Start MySQL (if using XAMPP, start from control panel)
   # Start the application
   npm run dev
   ```

2. **Create Test Account**
   - Go to http://localhost:3000/register
   - Register with: test@example.com / password123

3. **Purchase a Test**
   - Login and go to Dashboard
   - Click on any locked quiz package
   - Fill purchase form with dummy data
   - Upload any image as payment receipt
   - Submit

4. **Approve as Admin**
   - Logout
   - Login as admin (admin@gmail.com / admin@123)
   - Go to Admin Dashboard
   - Find your subscription request
   - Click "Approve"

5. **Take the Test**
   - Logout and login as student again
   - Dashboard now shows quiz as "Unlocked"
   - Click quiz → See 4 test modules
   - Click "Start Test" on any module
   - Answer questions
   - Submit test

6. **View Results**
   - See your score and grade
   - Review correct/incorrect answers

### End-to-End Testing Checklist

- [ ] Student registration works
- [ ] Student can login
- [ ] Dashboard displays correctly
- [ ] Quiz packages show locked status
- [ ] Purchase form accepts input and file upload
- [ ] Admin can see subscription requests
- [ ] Admin can approve/reject subscriptions
- [ ] Approved quiz unlocks for student
- [ ] Student can access all 4 test modules
- [ ] Test timer counts down correctly
- [ ] Answers auto-save
- [ ] Questions can be flagged
- [ ] Test submits successfully
- [ ] Results display correctly
- [ ] Review mode shows correct answers

## Deployment

### Prerequisites for Production

- **VPS or Cloud Hosting** (AWS, DigitalOcean, Azure, etc.)
- **Domain name** (optional but recommended)
- **SSL certificate** (Let's Encrypt recommended)
- **Production MySQL database**
- **Email service** (for notifications)

### Deployment Steps

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Set Production Environment Variables**
   ```env
   NODE_ENV=production
   DB_HOST=your-production-db-host
   DB_USER=your-production-db-user
   DB_PASSWORD=strong-production-password
   JWT_SECRET=very-strong-random-secret-key
   ```

3. **Deploy to Server**
   - Upload files via FTP/SFTP or use Git
   - Install dependencies: `npm install --production`
   - Run database initialization: `npm run init-db`
   - Start with PM2 (process manager):
     ```bash
     npm install -g pm2
     pm2 start npm --name "ielts-platform" -- start
     pm2 save
     pm2 startup
     ```

4. **Configure Nginx (Reverse Proxy)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Deployment Platforms

**Vercel (Easiest for Next.js)**
- Connect GitHub repository
- Add environment variables in dashboard
- Deploy automatically on push

**Railway / Render**
- Connect repository
- Configure build command: `npm run build`
- Configure start command: `npm start`
- Add environment variables

**AWS / DigitalOcean / Azure**
- Use VM or container service
- Follow manual deployment steps above

## Troubleshooting

### Common Issues and Solutions

#### Database Connection Errors

**Problem:** "MySQL connection error" or "Cannot connect to database"

**Solutions:**
- Verify MySQL service is running (XAMPP Control Panel or `sudo service mysql status`)
- Check `.env.local` credentials match your MySQL setup
- Ensure database `mockpaperilets` exists
- Check MySQL port (default 3306) is not blocked by firewall
- Try: `mysql -u root -p` to test connection manually

#### Login Issues

**Problem:** "Invalid credentials" or login doesn't work

**Solutions:**
- Verify user exists in database (check phpMyAdmin)
- Ensure password was hashed correctly (bcryptjs)
- Check JWT_SECRET is set in `.env.local`
- Clear browser cookies and try again
- Check browser console for errors (F12)

#### File Upload Fails

**Problem:** Payment receipt upload fails

**Solutions:**
- Check file size (max 5MB)
- Ensure `/public/uploads/payment-receipts/` directory exists
- Verify directory has write permissions: `chmod 755 public/uploads`
- Check file type (only images and PDFs allowed)
- Look at server logs for detailed error

#### Tests Not Showing

**Problem:** "No tests available" after purchasing

**Solutions:**
- Verify subscription status is "active" in database
- Check admin approved the payment
- Refresh page or clear browser cache
- Check browser console for API errors
- Verify test modules exist in database

#### Port 3000 Already in Use

**Problem:** "Port 3000 is already in use"

**Solutions:**
```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port
PORT=3001 npm run dev
```

#### Build Errors

**Problem:** Errors during `npm run build`

**Solutions:**
- Delete `node_modules` and `.next` folder
- Run `npm install` again
- Check Node.js version (should be 18+)
- Clear npm cache: `npm cache clean --force`
- Check for syntax errors in code

### Getting Help

If you encounter issues not listed here:

1. **Check Console Logs**
   - Backend: Terminal where `npm run dev` is running
   - Frontend: Browser console (F12 → Console tab)

2. **Check Database**
   - Use phpMyAdmin to verify data
   - Run SQL queries to check table contents

3. **Enable Debug Mode**
   ```env
   NODE_ENV=development
   DEBUG=*
   ```

4. **Common Commands**
   ```bash
   # Restart development server
   Ctrl+C then npm run dev

   # Reset database
   npm run init-db

   # Check Node/npm versions
   node --version
   npm --version

   # View MySQL logs (Linux)
   sudo tail -f /var/log/mysql/error.log
   ```

## Additional Documentation

For more detailed information, see:

- **QUICK_START.md** - Quick setup guide with sample data
- **COMPLETE_FLOW_SUMMARY.md** - Detailed user journey walkthrough
- **MYSQL_SETUP_GUIDE.md** - In-depth database configuration
- **CUSTOMER_FLOW_GUIDE.md** - Student workflow documentation
- **ADMIN_SYSTEM_GUIDE.md** - Admin features and management

## Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is proprietary software. All rights reserved.

For licensing inquiries, please contact the project owner.

---



**Built with Next.js | MySQL | TailwindCSS**

Last Updated: January 2026

# MongoDB Atlas Setup Guide

## Step 1: Create Account & Cluster (Free)

1. **Go to**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with Google/email
3. **Choose**: M0 Sandbox (FREE forever)
4. **Provider**: AWS
5. **Region**: Choose closest to you (e.g., Mumbai/Singapore)
6. **Cluster Name**: Leave as default or name it "ielts-cluster"
7. Click **"Create Deployment"**

## Step 2: Create Database User

1. **Security Quickstart** will appear
2. **Username**: `ielts_user`
3. **Password**: Click "Autogenerate Secure Password" and **COPY IT**
4. Click **"Create Database User"**

## Step 3: Allow Network Access

1. **IP Access List** section
2. Click **"Add My Current IP Address"**
3. OR for testing: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Finish and Close"**

## Step 4: Get Connection String

1. Click **"Connect"** button on your cluster
2. Choose **"Drivers"**
3. Select: **Driver: Node.js**, **Version: 6.8 or later**
4. **Copy** the connection string - it looks like:
   ```
   mongodb+srv://ielts_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace** `<password>` with the password you copied in Step 2

## Step 5: Update Your .env.local

Replace the MONGODB_URI line with your new connection string:
```
MONGODB_URI=mongodb+srv://ielts_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ielts_mock_platform?retryWrites=true&w=majority
```

**Important**: Add `/ielts_mock_platform` before the `?` to specify the database name.

## Step 6: Restart Dev Server

```bash
# Stop the current server (Ctrl+C in terminal)
npm run dev
```

Done! Your app should connect successfully.

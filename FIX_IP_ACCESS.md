# Fix MongoDB Atlas Network Access

## Your cluster is RUNNING but connection fails = IP blocked

### Step 1: Check Network Access

1. In MongoDB Atlas (left sidebar)
2. Click **"Network Access"** (under SECURITY section)
3. Look at the IP Access List

### Step 2: What You'll See

**If you see your current IP:**
- It might have expired
- Click "Edit" and extend it

**If you DON'T see any IPs or see old IPs:**
- Your current IP is blocked
- Need to add it

### Step 3: Add Your Current IP

1. Click **"+ ADD IP ADDRESS"** (green button, top right)
2. Click **"ADD CURRENT IP ADDRESS"**
3. OR for testing: Click **"ALLOW ACCESS FROM ANYWHERE"**
   - Enter: `0.0.0.0/0`
   - Description: "Testing"
   - Click "Confirm"
4. Wait 1-2 minutes for changes to apply

### Step 4: Test Connection

After adding IP, test again:
```bash
node test-connection.js
```

Should show: ✅ SUCCESS!

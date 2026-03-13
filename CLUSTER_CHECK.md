# Check if Your MongoDB Cluster is Paused

## Step 1: Login to MongoDB Atlas
https://cloud.mongodb.com/

## Step 2: Look for Your Cluster Status

You should see your "Mockpaper" cluster with one of these statuses:

### ✅ If Status Shows "Running" (Green)
- Your cluster is active
- We have a different problem (firewall/network)
- Share a screenshot

### ⏸️ If Status Shows "Paused" (Yellow)
- Click the "Resume" button
- Wait 1-2 minutes for it to start
- Then try login/register again

### ❌ If NO Cluster Found
- The cluster was deleted
- You need to create a new one
- Your old data is lost

### 🔄 If Status Shows "Creating" or "Starting"
- Wait 2-3 minutes
- Refresh the page
- Try again

## Step 3: After Resuming (if paused)

1. Wait for status to turn green "Running"
2. In terminal, restart your dev server:
   ```bash
   # Press Ctrl+C to stop current server
   npm run dev
   ```
3. Try login/register again

## Step 4: If Still Not Working

Click "Connect" on your cluster and get a fresh connection string:
1. Click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Share it here

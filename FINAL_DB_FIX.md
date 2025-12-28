# 🔧 FIX DATABASE CONNECTION ISSUE

## Your Railway API Token: `7bd2925b-0817-4511-a197-de7b6679e3c0`

## PROBLEM: Still getting `ECONNREFUSED` error

## SOLUTION: Check & Fix Railway Database Setup

### Step 1: Open Railway Dashboard
Go to: https://railway.app/dashboard

### Step 2: Select Your EarnFlow Project
Find your project (should show your GitHub repo name)

### Step 3: Check PostgreSQL Service
- [ ] Do you see **"PostgreSQL"** in the services list?
- [ ] Is the status **"Running"** (green dot)?

**IF NO PostgreSQL:**
- Click **"+ Add"**
- Choose **"Database"**
- Select **"PostgreSQL"**
- Wait 2 minutes for provisioning

### Step 4: Check Environment Variables
- Click **"Variables"** in the left sidebar
- Look for these variables:
  - [ ] `DATABASE_URL` (should exist if PostgreSQL is added)
  - [ ] `JWT_SECRET` (you need to add this)

**IF DATABASE_URL MISSING:**
- Railway sometimes doesn't set it automatically
- Follow the MANUAL_DB_SETUP.md guide

### Step 5: Add JWT_SECRET (Required)
- In Variables tab, click **"Add Variable"**
- Name: `JWT_SECRET`
- Value: `your-super-secret-jwt-key-here-make-it-long` (e.g., `mySecureJWTKey123!@#$%^&*()`)
- Click Save

### Step 6: Redeploy
- Go to **"Deployments"** tab
- Click **"Redeploy"** button
- Wait for deployment to complete (shows "SUCCESS")

### Step 7: Check Logs
- In Deployments tab, click the latest deployment
- Check **"Logs"** for any errors
- Look for:
  - ✅ "Initializing Railway PostgreSQL database..."
  - ✅ "Database initialized successfully!"

### Step 8: Test Registration
```bash
curl -X POST https://your-railway-url.up.railway.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@earnflow.com","password":"password123","name":"Test User"}'
```

## QUICK CHECKLIST:
- [ ] PostgreSQL service exists and is running
- [ ] DATABASE_URL variable is set
- [ ] JWT_SECRET variable is set
- [ ] Latest deployment shows SUCCESS
- [ ] No ECONNREFUSED in logs

**Go to Railway dashboard and check these steps!** 🚀
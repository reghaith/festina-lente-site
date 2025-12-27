# 🚨 QUICK FIX: Add PostgreSQL to Railway

## PROBLEM: `ECONNREFUSED` = No database connection

## SOLUTION (3 minutes):

### 1. Open Railway Dashboard
Go to: https://railway.app/dashboard
Select your EarnFlow project

### 2. Add PostgreSQL Database
- Click **"+ Add"** button
- Choose **"Database"**
- Select **"PostgreSQL"**
- Click **"Add PostgreSQL"**

### 3. Wait & Check Variables
- Wait 2 minutes for provisioning
- Go to **"Variables"** tab
- Confirm `DATABASE_URL` is there ✅

### 4. Redeploy
- Go to **"Deployments"** tab
- Click **"Redeploy"** 
- Wait for success ✅

### 5. Test Registration Again
Try registering: `test@earnflow.com` / `password123`

## IF STILL BROKEN:
- Check Railway logs for errors
- Verify DATABASE_URL format is correct
- Make sure PostgreSQL shows "Running" status

**This will fix the connection error!** 🎯
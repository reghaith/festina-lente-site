# 🔧 FIX DATABASE CONNECTION ERROR

## The Error:
```
ECONNREFUSED - Can't connect to PostgreSQL database
```

## This means DATABASE_URL is missing in Railway!

## SOLUTION:

### Step 1: Check if PostgreSQL is added to your Railway project
1. Go to: https://railway.app/dashboard
2. Select your EarnFlow project
3. Look for **"PostgreSQL"** in the services list
4. If you don't see it, you need to add it!

### Step 2: Add PostgreSQL Database (if missing)
1. In your project dashboard, click **"+ Add"**
2. Choose **"Database"**
3. Select **"PostgreSQL"**
4. Click **"Add PostgreSQL"**
5. Wait for it to provision (~2 minutes)

### Step 3: Verify DATABASE_URL is set
1. In your project, click on **"Variables"** in the left sidebar
2. Look for **"DATABASE_URL"** 
3. It should be automatically set by Railway
4. If not, Railway will show it after adding PostgreSQL

### Step 4: Redeploy
1. Go back to your **"Deployments"** tab
2. Click **"Redeploy"** to restart with the database
3. Wait for deployment to complete

### Step 5: Test Again
Try registering again after the redeploy completes.

## If DATABASE_URL is still missing:
- Railway sometimes takes a few minutes to set it
- Try refreshing the Variables page
- Check Railway status/logs for any issues

## Your DATABASE_URL should look like:
```
postgresql://postgres:[password]@containers-us-west-[number].railway.app:5432/railway
```

**Add PostgreSQL to your Railway project and redeploy!** 🚀
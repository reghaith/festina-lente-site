# 🎉 PERFECT! You have the DATABASE_URL

## Your DATABASE_URL:
```
postgresql://postgres:FYRLXPkUBerivHpZjVNdLvrzwgBlImsz@postgres.railway.internal:5432/railway
```

## NOW COMPLETE THE SETUP:

### Step 1: Open Railway Dashboard
**Link:** https://railway.com/project/7e79ae64-bbe6-47b2-8b56-164e663ecd21

### Step 2: Add Environment Variables
1. Click **"Variables"** tab
2. Click **"Add Variable"**
3. **Name:** `DATABASE_URL`
4. **Value:** `postgresql://postgres:FYRLXPkUBerivHpZjVNdLvrzwgBlImsz@postgres.railway.internal:5432/railway`
5. Click **"Save"**

### Step 3: Add JWT_SECRET
1. Click **"Add Variable"** again
2. **Name:** `JWT_SECRET`
3. **Value:** `superSecretJWTKey123!@#$%^&*()`
4. Click **"Save"**

### Step 4: Redeploy
1. Click **"Deployments"** tab
2. Click **"Redeploy"** button
3. Wait for deployment to complete (shows "SUCCESS" ✅)

### Step 5: Test Registration
```bash
# Get your URL from the top of Railway dashboard
curl -X POST https://your-railway-url.up.railway.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"live@test.com","password":"password123","name":"Live Test"}'
```

## WHAT YOU SHOULD SEE:
- ✅ Variables tab shows DATABASE_URL and JWT_SECRET
- ✅ Deployments tab shows SUCCESS
- ✅ Registration works without ECONNREFUSED errors

## IF STILL BROKEN:
- Check Railway logs for database connection errors
- Verify the DATABASE_URL is exactly as shown above
- Make sure PostgreSQL service is running (green status)

**You have everything you need! Add those variables and redeploy!** 🚀
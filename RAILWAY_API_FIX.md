# 🚀 USING RAILWAY API TO FIX DATABASE

## Your API Token: `7bd2925b-0817-4511-a197-de7b6679e3c0`

## Since CLI isn't working, let's use Railway Dashboard directly:

### STEP 1: Open Your Railway Project
**Click this link:** https://railway.com/project/7e79ae64-bbe6-47b2-8b56-164e663ecd21/service/032dfa75-9915-44aa-ba64-b9b70450abd2?environmentId=e4e0e6fc-eda2-403d-a759-786ef33cfcb6

### STEP 2: CHECK FOR POSTGRESQL
- Look at the services list on the left
- Do you see **"PostgreSQL"**?
- If NO: Click **"+ Add"** → **"Database"** → **"PostgreSQL"** → **"Add PostgreSQL"**

### STEP 3: CHECK VARIABLES
- Click **"Variables"** tab
- Look for `DATABASE_URL`
- If missing, Railway will set it automatically after adding PostgreSQL

### STEP 4: ADD JWT_SECRET
- In Variables tab, click **"Add Variable"**
- Name: `JWT_SECRET`
- Value: `superSecretJWTKey123!@#$%^&*()_+-=[]{}|;:,.<>?`
- Click **"Save"**

### STEP 5: REDEPLOY
- Click **"Deployments"** tab
- Click **"Redeploy"** button
- Wait for deployment to show **"SUCCESS"** ✅

### STEP 6: CHECK LOGS
- Click on the latest deployment
- Click **"Logs"** tab
- Look for:
  - ✅ "Initializing Railway PostgreSQL database..."
  - ✅ "Database initialized successfully!"
  - ❌ No ECONNREFUSED errors

### STEP 7: TEST REGISTRATION
```bash
# Get your site URL from Railway dashboard top
curl -X POST https://your-site-url.up.railway.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@earnflow.com","password":"password123","name":"Test User"}'
```

## WHAT TO TELL ME:
- Do you see PostgreSQL in services?
- Is DATABASE_URL in Variables?
- What do the deployment logs show?
- Did redeploy succeed?

**Open that Railway link and check these steps!** 🚀
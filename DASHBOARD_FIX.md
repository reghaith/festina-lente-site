# 🚨 RAILWAY CLI SYNTAX ISSUES - USE DASHBOARD INSTEAD

## The CLI commands have changed. Use Railway Dashboard instead:

### STEP 1: Open Railway Dashboard
**Direct Link:** https://railway.com/project/7e79ae64-bbe6-47b2-8b56-164e663ecd21

### STEP 2: CHECK POSTGRESQL
- In the left sidebar, you should see:
  - ✅ **festina-lente-site** (your app)
  - ✅ **Postgres** (your database)

### STEP 3: SET JWT_SECRET
1. Click **"Variables"** tab (top of page)
2. Click **"Add Variable"**
3. **Name:** `JWT_SECRET`
4. **Value:** `superSecretJWTKey123!@#$%^&*()`
5. Click **"Save"**

### STEP 4: VERIFY DATABASE_URL
- In the Variables tab, look for `DATABASE_URL`
- If it's missing, you need to set it manually:
  1. Click on **"Postgres"** service
  2. Go to **"Variables"** tab (inside Postgres)
  3. Copy: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
  4. Go back to main Variables
  5. Add: `DATABASE_URL=postgresql://[PGUSER]:[PGPASSWORD]@[PGHOST]:[PGPORT]/[PGDATABASE]`

### STEP 5: REDEPLOY
- Click **"Deployments"** tab
- Click **"Redeploy"** button
- Wait for "SUCCESS" ✅

### STEP 6: GET YOUR URL
- Your site URL is shown at the top of the dashboard
- It looks like: `https://something.up.railway.app`

### STEP 7: TEST
```bash
# Replace with your actual URL
curl -X POST https://your-railway-url.up.railway.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"dashboard@test.com","password":"password123","name":"Dashboard Test"}'
```

## QUICK CHECKLIST:
- [ ] PostgreSQL service exists and is running
- [ ] JWT_SECRET is set in Variables
- [ ] DATABASE_URL is set in Variables
- [ ] Latest deployment shows SUCCESS
- [ ] Registration works without ECONNREFUSED

**Go to the Railway dashboard link above and follow steps 3-5!** 🚀
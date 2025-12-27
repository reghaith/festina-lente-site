# 🚨 MANUAL DATABASE_URL SETUP

## If Railway isn't auto-setting DATABASE_URL:

### Step 1: Get Database Connection Details
1. Railway Dashboard → Your Project → PostgreSQL service
2. Click on the PostgreSQL service
3. Go to "Variables" tab
4. Copy these values:
   - `PGHOST` (host)
   - `PGPORT` (port, usually 5432)
   - `PGDATABASE` (database name)
   - `PGUSER` (username)
   - `PGPASSWORD` (password)

### Step 2: Create DATABASE_URL Manually
1. Go to Project Variables (main project, not PostgreSQL service)
2. Add new variable: `DATABASE_URL`
3. Value format:
```
postgresql://[PGUSER]:[PGPASSWORD]@[PGHOST]:[PGPORT]/[PGDATABASE]
```

Example:
```
postgresql://postgres:abc123def456@containers-us-west-123.railway.app:5432/railway
```

### Step 3: Redeploy
- Deployments tab → Redeploy
- Test registration again

### Step 4: Verify Connection
Check Railway logs for:
- "Initializing Railway PostgreSQL database..." ✅
- "Database initialized successfully!" ✅
- No ECONNREFUSED errors

## IF STILL BROKEN:
The PostgreSQL service might not be properly attached. Try:
1. Remove PostgreSQL service
2. Add it again
3. Wait for provisioning
4. Check if DATABASE_URL appears

**This should fix the connection issue!** 🎯
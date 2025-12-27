# 🔍 TROUBLESHOOT DATABASE CONNECTION

## Current Error: Still getting ECONNREFUSED

## CHECKLIST - Verify These:

### 1. PostgreSQL Added to Railway
- [ ] Railway Dashboard → Your Project
- [ ] See "PostgreSQL" in services list
- [ ] Status shows "Running" (green)

### 2. DATABASE_URL Environment Variable
- [ ] Project Dashboard → Variables tab
- [ ] Look for: `DATABASE_URL`
- [ ] Should look like: `postgresql://postgres:[password]@[host]:5432/railway`

### 3. Redeploy After Adding Database
- [ ] Deployments tab → Click "Redeploy"
- [ ] Wait for "SUCCESS" status
- [ ] Check deployment logs for errors

### 4. Test Database Connection
Try this curl command to test:
```bash
curl https://your-railway-url.up.railway.app/api/health
```

## IF DATABASE_URL is MISSING:
Railway sometimes doesn't set it automatically. Try:
1. Remove and re-add PostgreSQL service
2. Or manually add DATABASE_URL variable

## IF DATABASE_URL EXISTS but still errors:
The connection string format might be wrong. Railway uses:
```
postgresql://postgres:[password]@containers-us-west-[number].railway.app:5432/railway
```

## ALTERNATIVE: Check Railway Logs
1. Railway Dashboard → Deployments
2. Click latest deployment
3. Check "Logs" for database connection errors

## LET ME KNOW:
- Do you see PostgreSQL in your services?
- Do you see DATABASE_URL in Variables?
- What do the deployment logs show?

We can fix this step by step! 🚀
# 🎯 CORRECTED RAILWAY CLI COMMANDS

## Since you're already linked to the project, run these commands:

### 1. Check current services:
```bash
railway service
```
*(Should show your app and postgres)*

### 2. Add PostgreSQL (if not present):
```bash
railway add postgres
```

### 3. Set JWT secret:
```bash
railway variables set JWT_SECRET=superSecretJWTKey123!@#$%^&*()
```

### 4. Check variables:
```bash
railway variables
```
*(Should show DATABASE_URL and JWT_SECRET)*

### 5. Redeploy:
```bash
railway up
```

### 6. Get site URL:
```bash
railway domain
```

## IF DATABASE_URL IS MISSING:
```bash
# Get postgres connection details
railway variables --service postgres

# Then set DATABASE_URL manually
railway variables set DATABASE_URL=postgresql://[PGUSER]:[PGPASSWORD]@[PGHOST]:[PGPORT]/[PGDATABASE]
```

## TEST REGISTRATION:
```bash
curl -X POST https://your-site-url/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"fixed@test.com","password":"password123","name":"Fixed"}'
```

## RUN THESE NOW:
1. `railway add postgres` (if postgres not listed)
2. `railway variables set JWT_SECRET=superSecretJWTKey123!@#$%^&*()`
3. `railway up`
4. `railway domain`
5. Test registration

**You're already linked to the project - just add postgres and redeploy!** 🚀
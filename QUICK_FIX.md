# 🚀 QUICK FIX COMMANDS

## You're already logged in and linked! Run these:

```bash
# Check current services
railway service

# Add PostgreSQL (if not shown)
railway add postgres

# Set JWT secret
railway variables set JWT_SECRET=superSecretJWTKey123!@#$%^&*()

# Check variables (should show DATABASE_URL)
railway variables

# Redeploy
railway up

# Get your site URL
railway domain
```

## THEN TEST:
```bash
curl -X POST https://your-site-url/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"working@test.com","password":"password123","name":"Working"}'
```

## IF DATABASE_URL STILL MISSING:
```bash
# Get postgres variables
railway variables --service postgres

# Manually set DATABASE_URL
railway variables set DATABASE_URL=postgresql://[PGUSER]:[PGPASSWORD]@[PGHOST]:[PGPORT]/[PGDATABASE]
```

**Run these commands in order!** 🎯
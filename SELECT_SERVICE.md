# 🎯 SELECT THE APP SERVICE

## In Railway CLI, select:
**festina-lente-site** (your main app)

## NOT Postgres (that's the database)

## After selecting:
```bash
railway status
# Check if app is running
```

## Then check database:
```bash
railway services
# Should show both app and Postgres
```

## Check variables:
```bash
railway variables
# Should show DATABASE_URL and JWT_SECRET
```

## If DATABASE_URL missing:
```bash
railway variables set DATABASE_URL=postgresql://postgres:[password]@containers-us-west-[number].railway.app:5432/railway
# Get the connection details from Postgres service variables
```

**Select "festina-lente-site" (not Postgres)!** 🚀
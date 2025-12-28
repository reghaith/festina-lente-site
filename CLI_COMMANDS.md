# 🚀 RAILWAY CLI COMMANDS TO FIX DATABASE

## Now that you're logged in, run these commands:

### 1. Link to your EarnFlow project:
```bash
cd Desktop/earnflow-nextjs
railway link
# Select your EarnFlow project from the list
```

### 2. Check current services:
```bash
railway services
# Should show your app service, check if PostgreSQL exists
```

### 3. Add PostgreSQL database:
```bash
railway add postgresql
# This adds PostgreSQL to your project
```

### 4. Set environment variables:
```bash
railway variables set JWT_SECRET=superSecretJWTKey123!@#$%^&*()
# This adds the JWT secret
```

### 5. Redeploy:
```bash
railway deploy
# Or railway up
```

### 6. Check variables:
```bash
railway variables
# Should show DATABASE_URL and JWT_SECRET
```

### 7. Get your site URL:
```bash
railway domain
# Shows your live site URL
```

## AFTER RUNNING THESE:

### Test registration:
```bash
curl -X POST https://your-site-url/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@earnflow.com","password":"password123","name":"CLI Test"}'
```

## WHAT TO RUN FIRST:
Open Terminal and run:
```bash
cd Desktop/earnflow-nextjs
railway link
```

Then follow the prompts to select your project!

**Run `railway link` first!** 🎯
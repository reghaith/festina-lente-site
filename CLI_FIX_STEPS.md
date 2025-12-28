# 🎯 RAILWAY CLI COMMANDS TO RUN

## Since you're logged in, run these commands in your Terminal:

### 1. Go to project folder:
```bash
cd Desktop/earnflow-nextjs
```

### 2. Link to your EarnFlow project:
```bash
railway link
```
**Select your EarnFlow project from the list**

### 3. Check current services:
```bash
railway services
```
**This shows what services are running**

### 4. Add PostgreSQL:
```bash
railway add postgresql
```
**This adds the database**

### 5. Set JWT secret:
```bash
railway variables set JWT_SECRET=superSecretJWTKey123!@#$%^&*()
```

### 6. Redeploy:
```bash
railway up
```

### 7. Check variables:
```bash
railway variables
```
**Should show DATABASE_URL and JWT_SECRET**

### 8. Get site URL:
```bash
railway domain
```
**Shows your live site URL**

## TEST REGISTRATION:
```bash
curl -X POST https://your-site-url/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"cli@test.com","password":"password123","name":"CLI Test"}'
```

## RUN THESE IN ORDER:
1. `railway link` (select your project)
2. `railway add postgresql`
3. `railway variables set JWT_SECRET=superSecretJWTKey123!@#$%^&*()`
4. `railway up`
5. `railway domain` (get your URL)
6. Test registration

**Start with `railway link`!** 🚀
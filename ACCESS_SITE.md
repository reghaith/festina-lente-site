# 🚀 Access Your Railway EarnFlow Site

## Find Your Site URL:
1. Go to https://railway.app/dashboard
2. Select your EarnFlow project
3. Copy the **Deployment URL** (looks like: `https://earnflow-production.up.railway.app`)

## Test Your Live Site:

### Register a New User:
```bash
curl -X POST https://your-railway-url.up.railway.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@railway.com","password":"password123","name":"Railway Test User"}'
```

### Login:
```bash
curl -X POST https://your-railway-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@railway.com","password":"password123"}'
```

### Visit in Browser:
- Open your Railway URL in any web browser
- Try the registration and login forms
- Access the dashboard after logging in

## Check Deployment Status:
- Railway Dashboard → Your Project → Deployments
- Should show "SUCCESS" ✅
- View logs if there are any issues

## If Site Isn't Loading:
1. Wait 2-3 minutes after deployment
2. Check Railway logs for errors
3. Verify JWT_SECRET environment variable is set
4. Make sure database initialized (check logs)

Your EarnFlow app is now live on Railway with PostgreSQL! 🎉
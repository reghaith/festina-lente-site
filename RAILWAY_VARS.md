# Railway Environment Variables Setup

After pushing the Supabase code to GitHub, Railway will auto-redeploy. You need to add these environment variables:

## In Railway Dashboard:
1. Go to your EarnFlow project
2. Click "Variables" in the left sidebar
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-supabase-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-supabase-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-supabase-service-role-key]
```

## How to get your Supabase keys:
1. Go to https://supabase.com/dashboard
2. Select your EarnFlow project
3. Go to Settings → API
4. Copy the URL and keys

## Test after deployment:
```bash
# Test registration
curl -X POST https://your-railway-url.up.railway.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@railway.com","password":"password123","name":"Railway Test"}'

# Test login
curl -X POST https://your-railway-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@railway.com","password":"password123"}'
```

Railway will show the deployment status. Once it redeploys successfully, your EarnFlow app will be live with Supabase! 🚀
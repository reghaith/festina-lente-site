# Railway Deployment Guide

## Option 1: Connect GitHub Repo (Recommended)
1. Push your code to GitHub
2. Connect Railway to your GitHub repo
3. Automatic deployments on every push

## Option 2: Direct Upload
1. Create Railway project
2. Use Railway CLI to deploy directly

## Environment Variables to Set in Railway:
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Commands:
```bash
# Login to Railway
railway login

# Link project
railway link

# Set environment variables
railway variables set NEXT_PUBLIC_SUPABASE_URL=your-url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Deploy
railway deploy
```
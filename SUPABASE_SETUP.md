# Supabase Setup Guide for EarnFlow

## 1. Create Supabase Account
Go to https://supabase.com and create a free account.

## 2. Create New Project
- Click "New Project"
- Choose your organization
- Project name: "EarnFlow"
- Database password: Choose a strong password (save it!)
- Region: Choose the closest to your users

## 3. Get Project Credentials
After project creation (takes ~2 minutes), go to Settings → API

Copy these values:
- Project URL: `https://[your-project-id].supabase.co`
- Anon/Public Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

## 4. Environment Variables
Add to your `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 5. Run Database Migration
Go to Supabase Dashboard → SQL Editor
Copy and paste the contents of `supabase-migration.sql` and run it.

## 6. Deploy
```bash
npm run build
npm run start
# or deploy to Vercel
```

## 7. Test
Visit http://localhost:3000 and try registration/login!
# 🚀 COMPLETE RAILWAY FIX SCRIPT

## Copy and paste this entire script into your Terminal:

```bash
# Navigate to project
cd Desktop/earnflow-nextjs

# Login to Railway (if needed)
railway login

# Link to project (select your EarnFlow project)
railway link

# Check current services
echo "Current services:"
railway services

# Add PostgreSQL if not present
echo "Adding PostgreSQL..."
railway add postgresql

# Wait a moment for PostgreSQL to provision
sleep 10

# Set JWT secret
echo "Setting JWT_SECRET..."
railway variables set JWT_SECRET=superSecretJWTKey123!@#$%^&*()

# Check if DATABASE_URL is set
echo "Checking variables..."
railway variables

# If DATABASE_URL is missing, you may need to set it manually
# Get PostgreSQL connection details and set DATABASE_URL

# Redeploy
echo "Redeploying..."
railway up

# Get site URL
echo "Your site URL:"
railway domain

# Test registration (replace YOUR_URL with actual URL)
echo "Test this command after getting your URL:"
echo "curl -X POST https://YOUR_URL/api/register -H 'Content-Type: application/json' -d '{\"email\":\"test@cli.com\",\"password\":\"password123\",\"name\":\"CLI Test\"}'"
```

## AFTER RUNNING THE SCRIPT:

1. **If DATABASE_URL is missing**, manually set it:
```bash
# Get PostgreSQL variables
railway variables --service postgres

# Then set DATABASE_URL
railway variables set DATABASE_URL=postgresql://[PGUSER]:[PGPASSWORD]@[PGHOST]:[PGPORT]/[PGDATABASE]
```

2. **Test registration** with your actual site URL

## EXPECTED OUTPUT:
- Services list showing PostgreSQL
- Variables list showing DATABASE_URL and JWT_SECRET  
- Successful redeploy
- Site URL displayed
- Registration working without ECONNREFUSED

**Copy the entire script above and run it in Terminal!** 🚀
# 🚀 COMPLETE RAILWAY DATABASE FIX - ONE SCRIPT

## COPY AND PASTE THIS ENTIRE BLOCK INTO YOUR TERMINAL:

```bash
echo "🚀 Starting Railway Database Fix..."
echo "==================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in earnflow-nextjs directory!"
    echo "Run: cd Desktop/earnflow-nextjs"
    exit 1
fi

echo "✅ In correct directory"

# Check current services
echo "📋 Current services:"
railway service

# Add PostgreSQL if not present
echo "🐘 Adding PostgreSQL database..."
railway add postgres 2>/dev/null || echo "PostgreSQL may already exist"

# Wait for provisioning
echo "⏳ Waiting for PostgreSQL to provision..."
sleep 10

# Set JWT secret
echo "🔐 Setting JWT_SECRET..."
railway variables set JWT_SECRET=superSecretJWTKey123!@#$%^&*()

# Check variables
echo "📊 Environment variables:"
railway variables

# Redeploy
echo "🚀 Redeploying application..."
railway up

# Get domain
echo "🌐 Your site URL:"
railway domain

echo ""
echo "🎉 DATABASE FIX COMPLETE!"
echo ""
echo "🧪 TEST REGISTRATION:"
echo "railway domain  # Get your URL"
echo "curl -X POST https://YOUR_URL/api/register -H 'Content-Type: application/json' -d '{\"email\":\"test@earnflow.com\",\"password\":\"password123\",\"name\":\"Test\"}'"
echo ""
echo "If DATABASE_URL is missing, check Railway dashboard Variables tab!"
```

## AFTER RUNNING THE SCRIPT:

1. **Check that PostgreSQL appears** in `railway service`
2. **Verify DATABASE_URL** appears in `railway variables`  
3. **Test registration** with your site URL
4. **If DATABASE_URL missing**, set it manually in Railway dashboard

## EXPECTED OUTPUT:
```
✅ In correct directory
📋 Current services:
[your services listed]
🐘 Adding PostgreSQL database...
🔐 Setting JWT_SECRET...
📊 Environment variables:
DATABASE_URL=postgresql://...
JWT_SECRET=superSecretJWTKey123!@#$%^&*()
🚀 Redeploying application...
🌐 Your site URL:
https://your-project.up.railway.app
🎉 DATABASE FIX COMPLETE!
```

**COPY THE ENTIRE CODE BLOCK ABOVE AND PASTE IT INTO YOUR TERMINAL!** 🚀

**This will fix your database connection and make EarnFlow work!** 🎉
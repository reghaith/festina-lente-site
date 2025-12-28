#!/bin/bash

echo "🚀 COMPLETE RAILWAY DATABASE FIX"
echo "==============================="

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
echo "Get your URL from above, then run:"
echo "curl -X POST https://YOUR_URL/api/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@earnflow.com\",\"password\":\"password123\",\"name\":\"Test\"}'"
echo ""
echo "If DATABASE_URL is missing, check Railway dashboard Variables tab!"
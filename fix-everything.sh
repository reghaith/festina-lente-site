#!/bin/bash

# 🚀 COMPLETE RAILWAY DATABASE FIX - ONE SCRIPT TO RULE THEM ALL
# Copy and paste this entire script into your terminal

set -e  # Exit on any error

echo "🚀 RAILWAY DATABASE FIX - ONE SCRIPT"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Error: Not in earnflow-nextjs directory!"
    echo "Run: cd Desktop/earnflow-nextjs"
    exit 1
fi

echo "✅ In correct directory: earnflow-nextjs"

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Error: Railway CLI not installed"
    echo "Install with: npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI available"

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔑 Not logged in to Railway. Please run:"
    echo "railway login"
    exit 1
fi

echo "✅ Logged in to Railway"

# Link to project (skip if already linked)
if ! railway status &> /dev/null; then
    echo "🔗 Project not linked. Please run:"
    echo "railway link"
    echo "Then select your earnflow project"
    exit 1
fi

echo "✅ Project linked"

# Check current services
echo "📋 Checking current services..."
SERVICES=$(railway service 2>/dev/null || echo "")
echo "Current services: $SERVICES"

# Check if PostgreSQL exists
if echo "$SERVICES" | grep -q "postgres\|postgresql"; then
    echo "✅ PostgreSQL already exists"
else
    echo "🐘 Adding PostgreSQL database..."
    if railway add postgres; then
        echo "✅ PostgreSQL added successfully"
        echo "⏳ Waiting 15 seconds for provisioning..."
        sleep 15
    else
        echo "⚠️  PostgreSQL add failed or already exists"
    fi
fi

# Set JWT secret (skip if already exists)
echo "🔐 Checking/Setting JWT_SECRET..."
CURRENT_VARS=$(railway variables 2>/dev/null || echo "")
if echo "$CURRENT_VARS" | grep -q "JWT_SECRET"; then
    echo "✅ JWT_SECRET already set"
else
    echo "Setting JWT_SECRET..."
    railway variables set JWT_SECRET="superSecretJWTKey123!@#\$%^&*()"
    echo "✅ JWT_SECRET set"
fi

# Check DATABASE_URL
if echo "$CURRENT_VARS" | grep -q "DATABASE_URL"; then
    echo "✅ DATABASE_URL found"
else
    echo "⚠️  DATABASE_URL not found - check Railway dashboard Variables tab"
    echo "You may need to manually set DATABASE_URL using PostgreSQL connection details"
fi

# Show final variables
echo "📊 Final environment variables:"
railway variables

# Redeploy
echo "🚀 Redeploying application..."
if railway up; then
    echo "✅ Redeploy initiated"
else
    echo "⚠️  Redeploy may have failed - check Railway dashboard"
fi

# Get domain
echo "🌐 Your site URL:"
DOMAIN=$(railway domain 2>/dev/null || echo "Check Railway dashboard for URL")
echo "$DOMAIN"

echo ""
echo "🎉 SETUP COMPLETE!"
echo "================="
echo ""
echo "🧪 TEST YOUR SITE:"
echo ""
if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "Check Railway dashboard for URL" ]; then
    echo "curl -X POST $DOMAIN/api/register \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"email\":\"test@earnflow.com\",\"password\":\"password123\",\"name\":\"Test User\"}'"
    echo ""
    echo "🌐 Visit: $DOMAIN"
else
    echo "1. Get your URL: railway domain"
    echo "2. Test with:"
    echo "curl -X POST https://YOUR_URL/api/register \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"email\":\"test@earnflow.com\",\"password\":\"password123\",\"name\":\"Test User\"}'"
fi

echo ""
echo "If DATABASE_URL is missing:"
echo "1. Go to Railway dashboard → Variables tab"
echo "2. Get PostgreSQL connection details from PostgreSQL service"
echo "3. Set: DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]"
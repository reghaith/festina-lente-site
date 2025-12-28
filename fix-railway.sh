#!/bin/bash

echo "🚀 Railway Database Fix Script"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Not in the earnflow-nextjs directory!"
    echo "Run: cd Desktop/earnflow-nextjs"
    exit 1
fi

# Login to Railway
echo "Logging in to Railway..."
railway login

# Link to project
echo "Linking to project..."
railway link

# Check services
echo "Current services:"
railway service

# Add PostgreSQL
echo "Adding PostgreSQL database..."
railway add postgres

# Wait for provisioning
echo "Waiting for PostgreSQL to provision..."
sleep 15

# Set environment variables
echo "Setting JWT_SECRET..."
railway variables set JWT_SECRET=superSecretJWTKey123!@#$%^&*()

# Check variables
echo "Environment variables:"
railway variables

# Redeploy
echo "Redeploying application..."
railway up

# Get domain
echo "Your site URL:"
railway domain

echo ""
echo "🎉 Setup complete!"
echo "If DATABASE_URL is missing, check Railway dashboard and set it manually."
echo "Test registration with: curl -X POST https://YOUR_URL/api/register -H 'Content-Type: application/json' -d '{\"email\":\"test@cli.com\",\"password\":\"password123\",\"name\":\"CLI Test\"}'"
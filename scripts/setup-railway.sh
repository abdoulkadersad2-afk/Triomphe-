#!/bin/bash
set -e

echo "🚀 Triomphe - Railway Deployment Setup"
echo "========================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Initialize Railway project
echo "🔧 Initializing Railway project..."
railway init

# Create .env.example for reference
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/triomphe

# JWT
JWT_SECRET=change_me_to_a_secure_random_string
JWT_EXPIRE=7d

# API
NODE_ENV=production
PORT=8000
API_URL=https://your-railway-domain.com/api

# Frontend
VITE_API_URL=/api
EOF

echo "✅ Configuration files created"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Railway dashboard:"
echo "   - DATABASE_URL (PostgreSQL plugin)"
echo "   - JWT_SECRET"
echo "   - API_URL"
echo ""
echo "2. Deploy:"
echo "   railway up"
echo ""
echo "3. Check status:"
echo "   railway status"
echo ""
echo "📚 For more info: https://docs.railway.app"

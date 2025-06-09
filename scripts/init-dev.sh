#!/bin/bash
RanchOS Development Environment Initialization
echo "🚀 Initializing RanchOS Development Environment..."
Install dependencies
echo "📦 Installing dependencies..."
npm install
Create .env.local file
echo "🔐 Creating environment file..."
cat > .env.local << 'EOL'
RanchOS Environment Variables
NEXT_PUBLIC_APP_NAME=RanchOS
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
EOL
echo "✅ Development environment ready!"
echo ""
echo "🎯 Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Check docs/planning/IMPLEMENTATION_PLAN.md for the roadmap"
echo ""
echo "🚀 Happy coding! Welcome to the future of complex systems prediction."

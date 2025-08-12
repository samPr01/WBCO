#!/bin/bash

# WBCO Deployment Script
echo "🚀 Starting WBCO deployment..."

# Check if we're in the right directory
if [ ! -f "client/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd client
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output: client/dist/"
    echo ""
    echo "🎉 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Connect to Netlify"
    echo "3. Set build command: cd client && npm install && npm run build"
    echo "4. Set publish directory: client/dist"
    echo "5. Deploy! 🚀"
else
    echo "❌ Build failed!"
    exit 1
fi


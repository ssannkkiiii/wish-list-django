#!/bin/bash

# Wish List Django Application Startup Script

echo "🚀 Starting Wish List Django Application..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before running again."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

echo "🐳 Starting services with Docker Compose..."

# Start services
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec web python manage.py migrate

# Create superuser if it doesn't exist
echo "👤 Creating superuser..."
docker-compose exec web python manage.py create_superuser --username admin --email admin@example.com --password admin123

# Test Redis connection
echo "🔴 Testing Redis connection..."
docker-compose exec web python manage.py test_redis

# Collect static files
echo "📁 Collecting static files..."
docker-compose exec web python manage.py collectstatic --noinput

echo "✅ Application started successfully!"
echo ""
echo "🌐 Frontend: http://localhost:8000"
echo "🔧 Admin: http://localhost:8000/admin"
echo "📊 API: http://localhost:8000/api/v1/"
echo ""
echo "👤 Admin credentials:"
echo "   Username: admin"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "📝 To stop the application, run: docker-compose down"
echo "📋 To view logs, run: docker-compose logs -f"

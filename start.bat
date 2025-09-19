@echo off
REM Wish List Django Application Startup Script for Windows

echo 🚀 Starting Wish List Django Application...

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env file with your configuration before running again.
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose is not installed. Please install docker-compose and try again.
    pause
    exit /b 1
)

echo 🐳 Starting services with Docker Compose...

REM Start services
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose ps

REM Run database migrations
echo 🗄️  Running database migrations...
docker-compose exec web python manage.py migrate

REM Create superuser if it doesn't exist
echo 👤 Creating superuser...
docker-compose exec web python manage.py create_superuser --username admin --email admin@example.com --password admin123

REM Test Redis connection
echo 🔴 Testing Redis connection...
docker-compose exec web python manage.py test_redis

REM Collect static files
echo 📁 Collecting static files...
docker-compose exec web python manage.py collectstatic --noinput

echo ✅ Application started successfully!
echo.
echo 🌐 Frontend: http://localhost:8000
echo 🔧 Admin: http://localhost:8000/admin
echo 📊 API: http://localhost:8000/api/v1/
echo.
echo 👤 Admin credentials:
echo    Username: admin
echo    Email: admin@example.com
echo    Password: admin123
echo.
echo 📝 To stop the application, run: docker-compose down
echo 📋 To view logs, run: docker-compose logs -f
echo.
pause

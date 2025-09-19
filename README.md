# Wish List Django API

A professional Django REST API for managing wish lists with user authentication, product categorization, and comprehensive error handling.

## Features

- **User Authentication**: JWT-based authentication with registration, login, logout, and profile management
- **Product Management**: Create, read, update, and delete products with categories
- **Category System**: Organize products with slug-based categories
- **Security**: Comprehensive security settings, CORS configuration, and input validation
- **Error Handling**: Professional error handling with detailed error messages
- **Docker Support**: Complete Docker and Docker Compose setup
- **Database**: PostgreSQL with Redis caching
- **API Documentation**: RESTful API with proper HTTP status codes

## Tech Stack

- **Backend**: Django 5.2.6, Django REST Framework
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Authentication**: JWT (Simple JWT)
- **Containerization**: Docker, Docker Compose
- **WSGI Server**: Gunicorn

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wish-list-django
   ```

2. **Create environment file**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the API**
   - API: http://localhost:8000/api/v1/
   - Admin: http://localhost:8000/admin/

### Local Development

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. **Run the server**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/logout/` - User logout
- `GET /api/v1/auth/profile/` - Get user profile
- `PUT /api/v1/auth/profile/` - Update user profile
- `POST /api/v1/auth/change-password/` - Change password
- `POST /api/v1/auth/token/refresh/` - Refresh JWT token

### Categories
- `GET /api/v1/tasks/categories/` - List all categories
- `POST /api/v1/tasks/categories/` - Create new category
- `GET /api/v1/tasks/categories/{slug}/` - Get category details
- `PUT /api/v1/tasks/categories/{slug}/` - Update category
- `DELETE /api/v1/tasks/categories/{slug}/` - Delete category

### Products
- `GET /api/v1/tasks/products/` - List all products
- `POST /api/v1/tasks/products/` - Create new product
- `GET /api/v1/tasks/products/{id}/` - Get product details
- `PUT /api/v1/tasks/products/{id}/` - Update product
- `DELETE /api/v1/tasks/products/{id}/` - Delete product

## Environment Variables

Create a `.env` file with the following variables:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
POSTGRES_DB=wishlist_db
POSTGRES_USER=wishlist_user
POSTGRES_PASSWORD=your-password-here
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Project Structure

```
wish-list-django/
├── backend/
│   ├── apps/
│   │   ├── accounts/          # User authentication app
│   │   └── tasks/             # Products and categories app
│   ├── conf/                  # Django settings
│   └── manage.py
├── frontend/                  # Frontend application (if any)
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```

## Security Features

- JWT token authentication with refresh token rotation
- Password validation and secure password hashing
- CORS configuration for cross-origin requests
- XSS protection and content type sniffing prevention
- HSTS headers for secure connections
- Input validation and sanitization
- SQL injection prevention

## Development

### Running Tests
```bash
python manage.py test
```

### Code Quality
```bash
# Install development dependencies
pip install black flake8 isort

# Format code
black .

# Check code style
flake8 .

# Sort imports
isort .
```

### Database Migrations
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

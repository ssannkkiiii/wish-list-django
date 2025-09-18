# Copilot Instructions for wish-list-django

## Project Overview
This is a Django-based backend project for a wish list application. The main code resides in the `backend/` directory, with configuration in `backend/conf/`.

## Architecture
- **Entry Point:** `backend/manage.py` is the main entry for Django commands.
- **Configuration:** All Django settings, URLs, and ASGI/WSGI setup are in `backend/conf/`.
- **Settings:** `settings.py` configures installed apps, middleware, database, and other Django settings.
- **URL Routing:** `urls.py` defines the main URL patterns for the backend.
- **ASGI/WSGI:** `asgi.py` and `wsgi.py` provide server interfaces for deployment.

## Developer Workflows
- **Run Server:**
  ```powershell
  cd backend; python manage.py runserver
  ```
- **Migrations:**
  ```powershell
  cd backend; python manage.py makemigrations; python manage.py migrate
  ```
- **Create Superuser:**
  ```powershell
  cd backend; python manage.py createsuperuser
  ```
- **Testing:**
  ```powershell
  cd backend; python manage.py test
  ```
- **Requirements:**
  All Python dependencies are listed in `requirements.txt` at the project root. Install with:
  ```powershell
  pip install -r requirements.txt
  ```

## Patterns & Conventions
- **App Structure:** All Django apps should be placed under `backend/`.
- **Settings:** Use environment variables for secrets and deployment-specific settings. See `settings.py` for examples.
- **Static/Media Files:** Configure static and media file handling in `settings.py` for production.
- **Branching:** The current branch is `auth`, indicating ongoing authentication-related work.

## Integration Points
- **External Dependencies:**
  - Django (see `requirements.txt`)
  - Any additional packages should be added to `requirements.txt` and installed in the environment.
- **Deployment:** Use `wsgi.py` or `asgi.py` for server deployment (e.g., Gunicorn, Daphne).

## Key Files
- `backend/manage.py`: Django command-line utility
- `backend/conf/settings.py`: Main settings
- `backend/conf/urls.py`: URL routing
- `requirements.txt`: Python dependencies

## Example: Adding a New App
1. Create the app:
   ```powershell
   cd backend; python manage.py startapp <appname>
   ```
2. Add the app to `INSTALLED_APPS` in `settings.py`.
3. Create models, views, and URLs as needed.

---
For questions or unclear conventions, review `README.md` or ask for clarification.

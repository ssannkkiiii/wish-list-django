# Wish List Frontend

A modern, responsive frontend for the Django Wish List application built with vanilla HTML, CSS, and JavaScript.

## Features

- **Modern UI/UX**: Clean, professional design with smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Authentication**: Complete login/register system with JWT tokens
- **Product Management**: Create, read, update, and delete products
- **Category Management**: Organize products with categories
- **Real-time Updates**: Live data updates without page refresh
- **Search & Filter**: Advanced search and filtering capabilities
- **Dashboard**: Overview of your wish list with statistics
- **Profile Management**: Update profile and change password

## File Structure

```
frontend/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # All CSS styles
├── js/
│   ├── api.js             # API integration
│   ├── auth.js            # Authentication management
│   ├── products.js        # Product management
│   ├── categories.js      # Category management
│   ├── profile.js         # Profile management
│   └── app.js             # Main application logic
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Django backend running on `http://localhost:8000`

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd wish-list-django
   ```

2. **Start the Django backend**
   ```bash
   # Using Docker (recommended)
   docker-compose up --build
   
   # Or manually
   python manage.py runserver
   ```

3. **Open the frontend**
   - Simply open `frontend/index.html` in your web browser
   - Or serve it using a local server:
     ```bash
     # Using Python
     cd frontend
     python -m http.server 8001
     # Then visit http://localhost:8001
     ```

## Usage

### Authentication

1. **Register**: Create a new account with username, email, and password
2. **Login**: Sign in with your email and password
3. **Profile**: Update your profile information and change password

### Managing Products

1. **Add Product**: Click "Add Product" button and fill in the form
2. **Edit Product**: Click the edit button on any product card
3. **Delete Product**: Click the delete button and confirm
4. **Search**: Use the search box to find specific products
5. **Filter**: Filter products by category
6. **Sort**: Sort products by name, price, or date

### Managing Categories

1. **Add Category**: Click "Add Category" button and fill in the form
2. **Edit Category**: Click the edit button on any category card
3. **Delete Category**: Click the delete button and confirm

### Dashboard

- View statistics about your wish list
- See recent products
- Quick access to all features

## API Integration

The frontend communicates with the Django backend through REST API calls:

- **Authentication**: JWT token-based authentication
- **Products**: Full CRUD operations
- **Categories**: Full CRUD operations
- **Profile**: User profile management
- **Caching**: Redis-based caching for better performance

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Features in Detail

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

### User Experience
- Smooth animations and transitions
- Loading indicators
- Toast notifications
- Modal dialogs
- Form validation

### Performance
- Lazy loading of images
- Debounced search
- Efficient API calls
- Client-side caching

### Security
- JWT token authentication
- Secure API communication
- Input validation
- XSS protection

## Customization

### Styling
Edit `css/style.css` to customize:
- Colors and themes
- Typography
- Layout and spacing
- Animations

### Functionality
Edit the JavaScript files to add:
- New features
- API endpoints
- Validation rules
- UI components

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure Django backend is running
   - Check CORS settings
   - Verify API URL in `js/api.js`

2. **Authentication Issues**
   - Clear browser storage
   - Check token expiration
   - Verify login credentials

3. **Styling Issues**
   - Clear browser cache
   - Check CSS file loading
   - Verify responsive breakpoints

### Debug Mode

Enable debug mode by opening browser developer tools:
1. Press F12 or right-click → Inspect
2. Go to Console tab
3. Look for error messages
4. Check Network tab for API calls

## Development

### Adding New Features

1. **Create new JavaScript module** in `js/` directory
2. **Add HTML structure** in `index.html`
3. **Style with CSS** in `css/style.css`
4. **Integrate with API** using `api.js`

### Code Style

- Use modern JavaScript (ES6+)
- Follow consistent naming conventions
- Add comments for complex logic
- Use meaningful variable names

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

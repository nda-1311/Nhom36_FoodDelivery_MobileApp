# 🍔 Food Delivery API - Backend

Backend API server for the Food Delivery App - Nhom 36

## 📋 Overview

This is a RESTful API server built with **Express.js** and **TypeScript**, providing backend services for the Food Delivery mobile application.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Code Quality**: ESLint + Prettier

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/       # Route controllers
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   └── types/            # TypeScript types
├── database/
│   ├── migrations/       # Database migrations
│   └── seeds/            # Test data
├── tests/                # Test files
├── logs/                 # Log files
└── uploads/              # Uploaded files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- PostgreSQL 14+

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env with your configuration
   nano .env
   ```

4. **Database setup**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run migrate

   # Seed database (optional)
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run migrate      # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with test data

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
```

## 📡 API Endpoints

### Authentication

```
POST   /api/v1/auth/login           # User login
POST   /api/v1/auth/register        # User registration
POST   /api/v1/auth/logout          # User logout
POST   /api/v1/auth/refresh         # Refresh access token
POST   /api/v1/auth/forgot-password # Request password reset
POST   /api/v1/auth/reset-password  # Reset password with token
GET    /api/v1/auth/profile         # Get user profile
PUT    /api/v1/auth/profile         # Update user profile
```

### Restaurants & Food

```
GET    /api/v1/restaurants          # List restaurants
GET    /api/v1/restaurants/:id      # Get restaurant details
GET    /api/v1/food-items           # List food items
GET    /api/v1/food-items/:id       # Get food item details
GET    /api/v1/categories           # List food categories
```

### Cart & Orders

```
GET    /api/v1/cart                 # Get user cart
POST   /api/v1/cart/items           # Add item to cart
PUT    /api/v1/cart/items/:id       # Update cart item
DELETE /api/v1/cart/items/:id       # Remove from cart
POST   /api/v1/orders               # Create order
GET    /api/v1/orders               # Get user orders
GET    /api/v1/orders/:id           # Get order details
PUT    /api/v1/orders/:id/status    # Update order status
```

### Admin (Protected)

```
GET    /api/v1/admin/dashboard      # Admin dashboard stats
GET    /api/v1/admin/users          # Manage users
GET    /api/v1/admin/orders         # Manage all orders
GET    /api/v1/admin/restaurants    # Manage restaurants
POST   /api/v1/admin/food-items     # Create food item
PUT    /api/v1/admin/food-items/:id # Update food item
DELETE /api/v1/admin/food-items/:id # Delete food item
```

### Health Check

```
GET    /health                      # Server health status
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login** with email/password to get access + refresh tokens
2. **Include** access token in Authorization header: `Bearer <token>`
3. **Refresh** tokens when access token expires
4. **Logout** to invalidate refresh token

### Token Expiry

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

## 🌐 Real-time Features

WebSocket connection available at `ws://localhost:5001`

### Events

```javascript
// Chat
socket.emit('chat-message', { roomId, message, userId });
socket.on('chat-message', data => {});

// Order Updates
socket.emit('order-update', { orderId, status, userId });
socket.on('order-update', data => {});

// Location Tracking
socket.emit('location-update', { orderId, lat, lng });
socket.on('location-update', data => {});

// Notifications
socket.on('notification', data => {});
```

## 📊 Database Schema

### Main Tables

- **users** - User accounts and profiles
- **restaurants** - Restaurant information
- **food_items** - Food menu items
- **categories** - Food categories
- **cart_items** - Shopping cart items
- **orders** - Order records
- **order_items** - Items within orders
- **favorites** - User favorite items
- **admin_config** - Admin user configuration

## 🔒 Security Features

- **JWT Authentication** with secure tokens
- **Password Hashing** using bcrypt
- **Input Validation** with Joi schemas
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Helmet.js** for security headers
- **SQL Injection Protection** via Prisma ORM

## 📝 Environment Variables

```env
# Application
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# CORS
CORS_ORIGIN=http://localhost:19006

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.ts

# Run with coverage
npm run test:coverage

# Watch mode during development
npm run test:watch
```

### Test Structure

- **Unit Tests**: Individual functions and methods
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user workflows

## 📈 Monitoring & Logging

### Logging Levels

- **Error**: Application errors and exceptions
- **Warn**: Warning messages
- **Info**: General application info
- **Http**: HTTP request logs
- **Debug**: Detailed debug information

### Log Files

- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs combined

## 🐳 Docker Support

```bash
# Build Docker image
docker build -t food-delivery-api .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f api
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set secure JWT secrets
- [ ] Configure SMTP for emails
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Deployment Options

- **VPS/Cloud**: Deploy to DigitalOcean, AWS EC2, etc.
- **Container**: Docker deployment with orchestration
- **Serverless**: AWS Lambda, Vercel Functions
- **Platform**: Railway, Render, Heroku

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- Use **TypeScript** for all new code
- Follow **ESLint** rules
- Format with **Prettier**
- Write **JSDoc** comments for functions
- Add **tests** for new features

## 📚 Documentation

- **API Documentation**: Available at `/api/docs` (Swagger UI)
- **Database Schema**: See `database/schema.sql`
- **Architecture**: See `../ARCHITECTURE_PLAN.md`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**

   ```bash
   # Check PostgreSQL is running
   sudo systemctl status postgresql

   # Verify connection string in .env
   # Check database exists and credentials are correct
   ```

2. **Port Already in Use**

   ```bash
   # Find process using port 5000
   lsof -i :5000

   # Kill process or change PORT in .env
   ```

3. **JWT Token Invalid**
   ```bash
   # Check JWT_SECRET in .env matches
   # Verify token hasn't expired
   # Check Authorization header format: "Bearer <token>"
   ```

## 📞 Support

- **Issues**: Open GitHub issue
- **Documentation**: Check README and inline comments
- **Team**: Contact Nhom 36 development team

---

Made with ❤️ by **Nhom 36** - Mobile App Development

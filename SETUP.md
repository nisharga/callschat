# CallsChat Development Setup Guide

This guide will help you set up the CallsChat development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **PostgreSQL** (v14 or higher)
- **Redis** (v6 or higher)
- **Docker** (optional, for containerized development)
- **Git**

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/callschat.git
cd callschat
```

## 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

## 3. Environment Configuration

### Backend Environment Setup

1. Copy the environment template:
```bash
cp backend/.env.example backend/.env
```

2. Fill in the required environment variables:
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/callschat?schema=public"

# JWT (generate secure random keys)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# AWS S3 (for media storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=callschat-media

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Twilio (for SMS OTP)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend Environment Setup

1. Web App:
```bash
cp apps/web-app/.env.example apps/web-app/.env.local
```

2. Admin Panel:
```bash
cp apps/admin-panel/.env.example apps/admin-panel/.env.local
```

3. Mobile App (create `apps/mobile-app/.env`):
```bash
API_URL=http://localhost:3001
```

## 4. Database Setup

### Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis
cd infrastructure/docker
docker-compose up -d postgres redis

# Check if containers are running
docker-compose ps
```

### Manual Setup

#### PostgreSQL
1. Install PostgreSQL on your system
2. Create a database:
```sql
CREATE DATABASE callschat;
```

#### Redis
1. Install Redis on your system
2. Start Redis server:
```bash
redis-server
```

## 5. Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed database with sample data
npm run db:seed
```

## 6. Start Development Servers

### Option 1: Start All Services
```bash
npm run dev
```

### Option 2: Start Individual Services

**Backend:**
```bash
npm run backend
```

**Web App:**
```bash
npm run web
```

**Admin Panel:**
```bash
npm run admin
```

**Mobile App:**
```bash
npm run mobile
```

## 7. Access Your Applications

Once all services are running:

- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Web App**: http://localhost:3000
- **Admin Panel**: http://localhost:3002
- **Mobile App**: Available via Expo (check terminal for QR code)

## 8. Testing

```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test --workspace=@callschat/backend

# Run tests with coverage
npm run test:cov
```

## 9. Development Tools

### Prisma Studio (Database GUI)
```bash
npm run db:studio
```

### Linting
```bash
# Lint all packages
npm run lint

# Fix linting issues
npm run format
```

### Building
```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=@callschat/backend
```

## 10. Docker Development (Optional)

For complete containerized development:

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
docker-compose -f infrastructure/docker/docker-compose.yml logs -f
```

## Troubleshooting

### Common Issues

**Issue: PostgreSQL connection fails**
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in .env file
- Ensure database exists: `psql -U postgres -l`

**Issue: Redis connection fails**
- Verify Redis is running: `redis-cli ping`
- Check Redis configuration in .env file

**Issue: Port already in use**
```bash
# Find process using the port
lsof -i :3001
# Kill the process
kill -9 <PID>
```

**Issue: Prisma client generation fails**
```bash
# Clean and regenerate
rm -rf node_modules prisma/migrations
npm install
npm run db:generate
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Additional Resources

- [API Documentation](./API.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Architecture Overview](./ARCHITECTURE.md)

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/callschat/issues
- Email: support@callschat.com
- Discord: https://discord.gg/callschat

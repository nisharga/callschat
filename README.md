# CallsChat - Privacy-Focused Communication Platform

A comprehensive, privacy-focused communication platform with end-to-end encryption, WebRTC calling, and community features.

## Architecture Overview

### Monorepo Structure
```
callschat/
├── apps/
│   ├── mobile-app/          # React Native mobile application
│   ├── web-app/             # Next.js web application
│   └── admin-panel/         # Next.js admin panel
├── backend/                # NestJS backend API
├── shared/                 # Shared types, constants, utilities
└── infrastructure/         # Docker, AWS, nginx configurations
```

### Technology Stack

#### Frontend Mobile
- **React Native** with Expo
- **TypeScript**
- **React Navigation** for navigation
- **React Query** for data fetching
- **Zustand** for state management
- **Socket.IO Client** for real-time features
- **WebRTC** for voice/video calls

#### Web App
- **Next.js 14** with App Router
- **TypeScript**
- **TailwindCSS** for styling
- **React Query** for data fetching
- **Socket.IO Client** for real-time
- **WebRTC** for calls

#### Backend
- **NestJS** with TypeScript
- **Prisma ORM** with PostgreSQL
- **Socket.IO** for WebSocket
- **WebRTC** signaling server
- **Redis** for caching and sessions
- **AWS S3** for media storage
- **Firebase** for push notifications

#### Database
- **PostgreSQL** as primary database
- **Redis** for caching and real-time state

#### Infrastructure
- **Docker Compose** for local development
- **AWS** for production deployment
- **nginx** as reverse proxy

## Features

### MVP Features
- Phone OTP Registration
- CallsChat ID Generation
- Hidden Phone Number
- Profile Setup
- 1-to-1 Chat
- Group Chat
- Voice Call
- Video Call
- QR Code Connect
- Contact Requests
- Block and Report
- Privacy Center
- Push Notifications
- Admin Dashboard

### Advanced Features
- End-to-end encryption for messages
- Self-destructing messages
- Privacy-locked communities
- AI Assistant integration
- Digital wallet
- Business verification
- Content moderation
- Multi-device support

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database
- Redis server
- AWS account (for S3)
- Firebase account (for FCM)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start infrastructure services:
```bash
npm run docker:up
```

4. Run database migrations:
```bash
npm run db:migrate
npm run db:generate
```

5. Start development servers:
```bash
# Start all services
npm run dev

# Or start individually
npm run backend
npm run mobile
npm run web
npm run admin
```

## Development Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Lint all packages
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services

## Environment Variables

See `.env.example` for required environment variables for each service.

## Database Schema

The database schema is defined in `backend/prisma/schema.prisma` and includes:
- Users with privacy settings
- Devices and multi-device support
- Conversations (1-to-1 and groups)
- Messages with encryption
- Calls and call history
- Communities and groups
- Reports and moderation
- And more...

## Deployment

### Local Development
Use Docker Compose for local development:
```bash
cd infrastructure
docker-compose up -d
```

### Production
Deploy to AWS using the provided infrastructure configuration in `infrastructure/aws/`.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT

## Security

For security concerns, please email security@callschat.com
# callschat

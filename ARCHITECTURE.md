# CallsChat Architecture Documentation

## Overview

CallsChat is a privacy-focused communication platform built with a modern microservices-oriented monorepo architecture. The system prioritizes end-to-end encryption, user privacy, and real-time communication.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Mobile App     │    Web App      │     Admin Panel         │
│  (React Native) │    (Next.js)    │     (Next.js)           │
└────────┬────────┴────────┬────────┴──────────┬──────────────┘
         │                 │                   │
         └─────────────────┴───────────────────┘
                           │
         ┌─────────────────┴───────────────────┐
         │         API Gateway / Nginx          │
         └─────────────────┬───────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                      Backend Services                        │
├───────────────────────────┬────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              NestJS Backend API                          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │  Auth Service  │  Chat Service  │  Call Service          │ │
│ │  User Service  │  Media Service │  Notification Service  │ │
│ │  Contact Svc   │  Community Svc │  Wallet Service        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              WebSocket Gateway                           │ │
│ │              (Socket.IO)                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              WebRTC Signaling Server                     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Data & Infrastructure Layer               │
├───────────────────┬──────────────────┬──────────────────────┤
│   PostgreSQL      │     Redis        │     AWS S3          │
│   (Prisma ORM)    │    (Caching)     │   (Media Storage)   │
├───────────────────┴──────────────────┴──────────────────────┤
│                   Firebase Cloud Messaging                   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

#### Mobile App
- **Framework**: React Native with Expo
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Data Fetching**: React Query
- **Real-time**: Socket.IO Client
- **WebRTC**: react-native-webrtc
- **Storage**: Expo SecureStore

#### Web App
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Real-time**: Socket.IO Client
- **WebRTC**: Simple-peer

#### Admin Panel
- **Framework**: Next.js 14
- **UI Components**: Radix UI + shadcn/ui
- **Data Visualization**: Recharts
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod

### Backend

- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Caching**: Redis
- **Real-time**: Socket.IO
- **WebRTC**: Custom signaling server
- **Media Storage**: AWS S3
- **Notifications**: Firebase Cloud Messaging
- **Authentication**: JWT + OTP

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions (planned)
- **Monitoring**: Winston Logger
- **Testing**: Jest

## Core Services

### 1. Authentication Service
- Phone-based OTP registration/login
- JWT token management
- Session management
- Multi-device support
- Secure refresh token mechanism

### 2. Chat Service
- One-to-one messaging
- Group chats
- End-to-end encryption
- Message reactions
- Typing indicators
- Read receipts
- Message forwarding
- Self-destructing messages

### 3. Call Service
- Voice calls
- Video calls
- Group calls
- WebRTC signaling
- TURN/STUN integration
- Call recording (with consent)

### 4. Contact Service
- Contact requests
- Contact management
- Blocking/unblocking
- Favorite contacts
- QR code connections

### 5. Community Service
- Public/private communities
- Community posts
- Member management
- Admin roles
- Community guidelines

### 6. Media Service
- Image/video upload
- Presigned URLs
- Media optimization
- S3 integration
- File validation

### 7. Notification Service
- Push notifications (FCM)
- In-app notifications
- Notification preferences
- Batch notifications

### 8. Privacy Service
- Privacy settings management
- Profile visibility controls
- Last seen privacy
- Online status privacy
- Screenshot protection

### 9. Wallet Service
- Digital wallet
- Transaction management
- Balance tracking
- Verification levels

## Database Schema

### Key Models

**User**
- Primary user model with encrypted phone data
- CallsChat ID generation
- Privacy settings relationship
- Multi-device support

**Conversation**
- One-to-one, group, and community conversations
- Member management
- Conversation settings

**Message**
- Encrypted message content
- Media attachments
- Reactions and replies
- Status tracking

**Call**
- Voice/video call records
- Participant tracking
- Duration and quality metrics

**Community**
- Public/private communities
- Member roles
- Post management

## Security Architecture

### Encryption
- End-to-end encryption for messages
- Phone number encryption
- Secure token storage
- Environment variable management

### Privacy
- Hidden phone numbers
- CallsChat ID system
- Privacy settings per feature
- Data retention policies
- Right to deletion

### Rate Limiting
- API endpoint throttling
- OTP attempt limiting
- File upload limits
- Message frequency limits

## Real-time Communication

### WebSocket Events
- Message events (sent, delivered, read)
- Typing indicators
- Online/offline status
- Call signaling
- Notification pushes

### WebRTC Flow
1. Call initiation
2. Signaling via WebSocket
3. SDP offer/answer exchange
4. ICE candidate exchange
5. Direct P2P connection
6. TURN fallback if needed

## Caching Strategy

### Redis Usage
- Session storage
- Online status tracking
- Rate limiting counters
- Message queue
- Cache for frequently accessed data

### Cache Invalidation
- TTL-based expiration
- Event-driven invalidation
- Manual cache clearing

## API Design

### RESTful Conventions
- Versioned endpoints (`/api/v1`)
- Standard HTTP methods
- Proper status codes
- Consistent response format

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "errors": []
}
```

## Deployment Architecture

### Development
- Docker Compose for local development
- Hot reload for all services
- Shared environment configuration

### Production
- AWS ECS/EKS for containerized services
- RDS for PostgreSQL
- ElastiCache for Redis
- CloudFront for CDN
- Route53 for DNS
- Application Load Balancer

## Monitoring & Observability

### Logging
- Structured logging with Winston
- Log levels (error, warn, info, debug)
- Request/response logging
- Error tracking

### Metrics (Planned)
- API response times
- Database query performance
- WebSocket connection metrics
- Error rates
- User activity tracking

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Shared Redis cache
- Database connection pooling
- Load balancing

### Database Optimization
- Indexed queries
- Connection pooling
- Query optimization
- Regular maintenance

### CDN Strategy
- Static asset delivery
- Media file caching
- Geographic distribution

## Development Workflow

### Monorepo Management
- Shared types and utilities
- Consistent coding standards
- Centralized dependency management
- Efficient build processes

### Code Organization
```
callschat/
├── apps/              # Frontend applications
├── backend/          # NestJS backend
├── shared/           # Shared packages
└── infrastructure/   # Docker, configs
```

## Future Enhancements

### Planned Features
- AI-powered moderation
- Advanced analytics
- Business verification
- Payment integration
- Voice messages
- Stories feature
- Multi-language support

### Technical Improvements
- GraphQL API alternative
- Microservices migration
- Event-driven architecture
- Advanced caching strategies
- Database sharding
- CDN optimization

## Contributing

When contributing to CallsChat:
1. Follow the established code patterns
2. Maintain TypeScript strict mode compliance
3. Add proper error handling
4. Include unit tests
5. Update documentation
6. Follow security best practices

For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

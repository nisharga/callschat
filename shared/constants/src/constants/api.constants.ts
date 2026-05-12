// API Constants
export const API_ROUTES = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    DELETE_ACCOUNT: '/auth/delete-account',
  },

  // Users
  USERS: {
    BASE: '/users',
    ME: '/users/me',
    PROFILE: '/users/profile',
    PRIVACY: '/users/privacy',
    SEARCH: '/users/search',
    BY_ID: (id: string) => `/users/${id}`,
    BY_CALLSCHAT_ID: (callschatId: string) => `/users/callschat-id/${callschatId}`,
    QR_CODE: '/users/qr-code',
    VERIFY_QR: '/users/verify-qr',
  },

  // Contacts
  CONTACTS: {
    BASE: '/contacts',
    REQUESTS: '/contacts/requests',
    SEND_REQUEST: '/contacts/request',
    ACCEPT_REQUEST: (requestId: string) => `/contacts/request/${requestId}/accept`,
    DECLINE_REQUEST: (requestId: string) => `/contacts/request/${requestId}/decline`,
    BLOCK: '/contacts/block',
    UNBLOCK: (userId: string) => `/contacts/unblock/${userId}`,
    BLOCKED_LIST: '/contacts/blocked',
    FAVORITES: '/contacts/favorites',
  },

  // Chats
  CHATS: {
    BASE: '/chats',
    CONVERSATIONS: '/chats/conversations',
    CONVERSATION_BY_ID: (id: string) => `/chats/conversations/${id}`,
    MESSAGES: (conversationId: string) => `/chats/conversations/${conversationId}/messages`,
    MESSAGE_BY_ID: (conversationId: string, messageId: string) =>
      `/chats/conversations/${conversationId}/messages/${messageId}`,
    TYPING: (conversationId: string) => `/chats/conversations/${conversationId}/typing`,
    READ_RECEIPT: (conversationId: string) => `/chats/conversations/${conversationId}/read`,
    MARK_READ: '/chats/mark-read',
  },

  // Calls
  CALLS: {
    BASE: '/calls',
    INITIATE: '/calls/initiate',
    ANSWER: (callId: string) => `/calls/${callId}/answer`,
    DECLINE: (callId: string) => `/calls/${callId}/decline`,
    END: (callId: string) => `/calls/${callId}/end`,
    HISTORY: '/calls/history',
    ACTIVE_CALL: '/calls/active',
  },

  // Communities
  COMMUNITIES: {
    BASE: '/communities',
    MY_COMMUNITIES: '/communities/my',
    DISCOVER: '/communities/discover',
    BY_ID: (id: string) => `/communities/${id}`,
    BY_USERNAME: (username: string) => `/communities/username/${username}`,
    MEMBERS: (id: string) => `/communities/${id}/members`,
    POSTS: (id: string) => `/communities/${id}/posts`,
    JOIN: (id: string) => `/communities/${id}/join`,
    LEAVE: (id: string) => `/communities/${id}/leave`,
    INVITE: (id: string) => `/communities/${id}/invite`,
  },

  // Media
  MEDIA: {
    UPLOAD: '/media/upload',
    UPLOAD_MULTIPLE: '/media/upload/multiple',
    PRESIGNED_URL: '/media/presigned-url',
    DELETE: (mediaId: string) => `/media/${mediaId}`,
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (notificationId: string) => `/notifications/${notificationId}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    REGISTER_DEVICE: '/notifications/register-device',
    UNREGISTER_DEVICE: '/notifications/unregister-device',
  },

  // Reports
  REPORTS: {
    BASE: '/reports',
    USER: (userId: string) => `/reports/user/${userId}`,
    MESSAGE: (messageId: string) => `/reports/message/${messageId}`,
    COMMUNITY: (communityId: string) => `/reports/community/${communityId}`,
  },

  // Wallet
  WALLET: {
    BASE: '/wallet',
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
    VERIFY: '/wallet/verify',
  },

  // Admin
  ADMIN: {
    BASE: '/admin',
    USERS: '/admin/users',
    USER_BY_ID: (userId: string) => `/admin/users/${userId}`,
    REPORTS: '/admin/reports',
    COMMUNITIES: '/admin/communities',
    ANALYTICS: '/admin/analytics',
    MODERATION: '/admin/moderation',
    VERIFICATIONS: '/admin/verifications',
    SETTINGS: '/admin/settings',
  },
} as const;

// WebSocket Events
export const WS_EVENTS = {
  // Connection
  CONNECT: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Authentication
  AUTHENTICATE: 'authenticate',
  AUTHENTICATION_SUCCESS: 'authentication_success',
  AUTHENTICATION_FAILED: 'authentication_failed',

  // Messaging
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_DELETED: 'message_deleted',

  // Typing
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',

  // Calls
  CALL_INITIATED: 'call_initiated',
  CALL_ANSWERED: 'call_answered',
  CALL_DECLINED: 'call_declined',
  CALL_ENDED: 'call_ended',
  CALL_SIGNAL: 'call_signal',

  // Presence
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  USER_TYPING: 'user_typing',

  // Notifications
  NOTIFICATION: 'notification',

  // Communities
  COMMUNITY_JOINED: 'community_joined',
  COMMUNITY_LEFT: 'community_left',
  COMMUNITY_POST: 'community_post',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  CONVERSATION_NOT_FOUND: 'Conversation not found',
  MESSAGE_NOT_FOUND: 'Message not found',
  INVALID_OTP: 'Invalid OTP code',
  OTP_EXPIRED: 'OTP has expired',
  TOO_MANY_ATTEMPTS: 'Too many attempts. Please try again later',
  USER_ALREADY_EXISTS: 'User already exists',
  CONTACT_REQUEST_EXISTS: 'Contact request already exists',
  ALREADY_CONTACTS: 'Already in contacts',
  ALREADY_IN_COMMUNITY: 'Already a member of this community',
  ACCESS_DENIED: 'Access denied',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File too large',
  UPLOAD_FAILED: 'Upload failed',
  CALL_FAILED: 'Call failed',
  USER_OFFLINE: 'User is offline',
  USER_BLOCKED: 'User is blocked',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Time Constants (in milliseconds)
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,

  OTP_EXPIRY: 5 * 60 * 1000, // 5 minutes
  REFRESH_TOKEN_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days
  ACCESS_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  CONTACT_REQUEST_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_VOICE_NOTE_SIZE: 25 * 1024 * 1024, // 25MB

  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/aac', 'audio/mpeg'],
  ALLOWED_FILE_TYPES: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip'],
} as const;

// Message Limits
export const MESSAGE_LIMITS = {
  MAX_TEXT_LENGTH: 4000,
  MAX_GROUP_SIZE: 1024,
  MAX_FORWARD_COUNT: 10,
  MAX_MESSAGE_RETENTION_DAYS: 30, // For self-destructing messages
} as const;

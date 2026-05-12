// MVP Feature Flags
export const MVP_FEATURES = [
  'Phone OTP Registration',
  'CallsChat ID Generation',
  'Hidden Phone Number',
  'Profile Setup',
  '1-to-1 Chat',
  'Group Chat',
  'Voice Call',
  'Video Call',
  'QR Code Connect',
  'Contact Requests',
  'Block and Report',
  'Privacy Center',
  'Push Notifications',
  'Admin Dashboard',
] as const;

export type MVPFeature = typeof MVP_FEATURES[number];

// Feature flags for development/production
export const FEATURE_FLAGS = {
  // Core Features
  ENABLE_AUTHENTICATION: true,
  ENABLE_REGISTRATION: true,
  ENABLE_PHONE_OTP: true,

  // Chat Features
  ENABLE_ONE_TO_ONE_CHAT: true,
  ENABLE_GROUP_CHAT: true,
  ENABLE_VOICE_CALLS: true,
  ENABLE_VIDEO_CALLS: true,
  ENABLE_MESSAGE_REACTIONS: true,
  ENABLE_MESSAGE_FORWARDING: true,
  ENABLE_SELF_DESTRUCTING_MESSAGES: true,

  // Privacy Features
  ENABLE_PRIVACY_CENTER: true,
  ENABLE_END_TO_END_ENCRYPTION: true,
  ENABLE_SCREENSHOT_PROTECTION: true,
  ENABLE_HIDE_LAST_SEEN: true,
  ENABLE_HIDE_ONLINE_STATUS: true,

  // Social Features
  ENABLE_CONTACT_REQUESTS: true,
  ENABLE_BLOCKING: true,
  ENABLE_REPORTING: true,
  ENABLE_QR_CODE_CONNECT: true,
  ENABLE_DISCOVER: true,

  // Community Features
  ENABLE_COMMUNITIES: true,
  ENABLE_COMMUNITY_POSTS: true,
  ENABLE_VERIFIED_COMMUNITIES: true,

  // Advanced Features
  ENABLE_WALLET: true,
  ENABLE_AI_ASSISTANT: true,
  ENABLE_BUSINESS_VERIFICATION: true,

  // Admin Features
  ENABLE_ADMIN_PANEL: true,
  ENABLE_CONTENT_MODERATION: true,
  ENABLE_ANALYTICS: true,

  // Media Features
  ENABLE_MEDIA_UPLOAD: true,
  ENABLE_VOICE_NOTES: true,
  ENABLE_VIDEO_MESSAGES: true,

  // Notification Features
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_IN_APP_NOTIFICATIONS: true,
  ENABLE_EMAIL_NOTIFICATIONS: false, // Future feature

  // Development
  ENABLE_DEBUG_MODE: process.env.NODE_ENV === 'development',
 _ENABLE_LOGGING: process.env.NODE_ENV === 'development',
} as const;

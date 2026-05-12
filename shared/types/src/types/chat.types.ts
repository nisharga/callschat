// Chat & Message Types
export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  avatar?: string;
  createdBy: string;
  isMuted: boolean;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  members: ConversationMember[];
  lastMessage?: Message;
  unreadCount?: number;
}

export enum ConversationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  GROUP = 'GROUP',
  COMMUNITY = 'COMMUNITY',
  BROADCAST = 'BROADCAST',
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  role: MemberRole;
  mutedUntil?: Date;
  joinedAt: Date;
  leftAt?: Date;
  user?: User;
}

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: MessageType;
  encryptedContent?: string;
  plainContent?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  mediaMetadata?: any;
  replyToId?: string;
  forwardCount: number;
  status: MessageStatus;
  expiresAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  sender?: User;
  reactions?: MessageReaction[];
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  VOICE_NOTE = 'VOICE_NOTE',
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  SYSTEM = 'SYSTEM',
  POLL = 'POLL',
  STORY = 'STORY',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  STICKER = 'STICKER',
  GIF = 'GIF',
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
  user?: User;
}

// DTOs
export interface CreateConversationDto {
  type: ConversationType;
  participantIds: string[];
  title?: string;
  avatar?: string;
}

export interface SendMessageDto {
  conversationId: string;
  messageType: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  mediaMetadata?: any;
  replyToId?: string;
  expiresAt?: Date;
}

export interface UpdateConversationDto {
  title?: string;
  avatar?: string;
  isMuted?: boolean;
  pinned?: boolean;
}

export interface AddMemberDto {
  userIds: string[];
}

export interface RemoveMemberDto {
  userIds: string[];
}

export interface UpdateMemberRoleDto {
  userId: string;
  role: MemberRole;
}

// WebSocket Events
export interface MessageEventPayload {
  messageId: string;
  conversationId: string;
  senderId: string;
  messageType: MessageType;
  content?: string;
  mediaUrl?: string;
  status: MessageStatus;
  createdAt: Date;
}

export interface TypingEventPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageReadEventPayload {
  conversationId: string;
  userId: string;
  messageIds: string[];
  readAt: Date;
}

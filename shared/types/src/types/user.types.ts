// User Types
export interface User {
  id: string;
  phoneHash: string;
  phoneEncrypted: string;
  callschatId: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  country?: string;
  status: UserStatus;
  isOnline: boolean;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
  BANNED = 'BANNED',
}

export interface UserPrivacySettings {
  id: string;
  userId: string;
  phoneVisibility: PrivacyLevel;
  profileVisibility: PrivacyLevel;
  lastSeenVisibility: PrivacyLevel;
  onlineStatusVisible: boolean;
  readReceipts: boolean;
  typingIndicator: boolean;
  screenshotProtection: boolean;
  allowDigitalKey: boolean;
  allowQRScan: boolean;
  profilePhoto: PrivacyLevel;
  about: PrivacyLevel;
}

export enum PrivacyLevel {
  EVERYONE = 'EVERYONE',
  CONTACTS = 'CONTACTS',
  NONE = 'NONE',
  HIDDEN = 'HIDDEN',
}

export interface Device {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: DeviceType;
  deviceToken?: string;
  ipAddress?: string;
  lastActive: Date;
  trusted: boolean;
  createdAt: Date;
}

export enum DeviceType {
  MOBILE_IOS = 'MOBILE_IOS',
  MOBILE_ANDROID = 'MOBILE_ANDROID',
  WEB = 'WEB',
  DESKTOP = 'DESKTOP',
}

// DTOs
export interface CreateUserDto {
  phoneHash: string;
  phoneEncrypted: string;
  country?: string;
}

export interface UpdateUserDto {
  username?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  country?: string;
}

export interface UpdatePrivacySettingsDto {
  phoneVisibility?: PrivacyLevel;
  profileVisibility?: PrivacyLevel;
  lastSeenVisibility?: PrivacyLevel;
  onlineStatusVisible?: boolean;
  readReceipts?: boolean;
  typingIndicator?: boolean;
  screenshotProtection?: boolean;
  allowDigitalKey?: boolean;
  allowQRScan?: boolean;
  profilePhoto?: PrivacyLevel;
  about?: PrivacyLevel;
}

// Authentication
export interface LoginDto {
  phoneHash: string;
  otpCode: string;
  deviceName: string;
  deviceType: DeviceType;
  deviceToken?: string;
}

export interface RegisterDto {
  phoneEncrypted: string;
  otpCode: string;
  deviceName: string;
  deviceType: DeviceType;
  deviceToken?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CurrentUserData {
  id: string;
  callschatId: string;
  phoneHash: string;
}

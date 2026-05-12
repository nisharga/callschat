// Call Types
export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  callType: CallType;
  status: CallStatus;
  isEncrypted: boolean;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  qualityScore?: number;
  recordingUrl?: string;
  caller?: User;
  receiver?: User;
  participants?: CallParticipant[];
}

export enum CallType {
  VOICE = 'VOICE',
  VIDEO = 'VIDEO',
  GROUP_VOICE = 'GROUP_VOICE',
  GROUP_VIDEO = 'GROUP_VIDEO',
}

export enum CallStatus {
  INITIATED = 'INITIATED',
  RINGING = 'RINGING',
  CONNECTED = 'CONNECTED',
  ENDED = 'ENDED',
  MISSED = 'MISSED',
  DECLINED = 'DECLINED',
  FAILED = 'FAILED',
}

export interface CallParticipant {
  id: string;
  callId: string;
  userId: string;
  joinedAt: Date;
  leftAt?: Date;
  duration?: number;
  user?: User;
}

// DTOs
export interface InitiateCallDto {
  receiverId: string;
  callType: CallType;
  isEncrypted?: boolean;
}

export interface AnswerCallDto {
  callId: string;
}

export interface DeclineCallDto {
  callId: string;
  reason?: string;
}

export interface EndCallDto {
  callId: string;
  duration?: number;
  qualityScore?: number;
}

// WebRTC Signaling
export interface WebRTCSignalingPayload {
  callId: string;
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-ended';
  sdp?: RTCSessionDescription;
  candidate?: RTCIceCandidate;
}

export interface CallEventPayload {
  callId: string;
  callerId: string;
  receiverId: string;
  callType: CallType;
  status: CallStatus;
  initiatedAt: Date;
}

export interface CallEndEventPayload {
  callId: string;
  reason: 'ended' | 'declined' | 'failed' | 'timeout';
  duration?: number;
}

// TURN/STUN Configuration
export interface RTCConfig {
  iceServers: RTCIceServer[];
}

export interface RTCIceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class WebrtcService {
  private readonly logger = new Logger(WebrtcService.name);
  private readonly activeCalls = new Map<string, Set<string>>();

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly websocket: WebsocketGateway,
  ) {}

  async getRTCConfig() {
    return {
      iceServers: [
        {
          urls: this.config.get('STUN_SERVER_URL', 'stun:stun.l.google.com:19302'),
        },
        {
          urls: this.config.get('TURN_SERVER_URL'),
          username: this.config.get('TURN_USERNAME'),
          credential: this.config.get('TURN_CREDENTIAL'),
        },
      ],
    };
  }

  async initiateCall(callerId: string, receiverId: string, callType: string) {
    // Check if receiver is online
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
      select: { isOnline: true, callschatId: true },
    });

    if (!receiver) {
      throw new Error('Receiver not found');
    }

    if (!receiver.isOnline) {
      throw new Error('Receiver is offline');
    }

    // Create call record
    const call = await this.prisma.call.create({
      data: {
        callerId,
        receiverId,
        callType: callType.toUpperCase(),
        status: 'INITIATED',
        isEncrypted: true,
      },
      include: {
        caller: { select: { callschatId: true, displayName: true, avatar: true } },
        receiver: { select: { callschatId: true, displayName: true, avatar: true } },
      },
    });

    // Add to active calls tracking
    this.activeCalls.set(call.id, new Set([callerId]));

    // Notify receiver via WebSocket
    await this.websocket.notifyCallInitiated(call, receiverId);

    this.logger.log(`Call initiated: ${call.id} from ${callerId} to ${receiverId}`);

    return call;
  }

  async answerCall(callId: string, userId: string) {
    const call = await this.prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new Error('Call not found');
    }

    if (call.receiverId !== userId) {
      throw new Error('Not authorized to answer this call');
    }

    if (call.status !== 'INITIATED' && call.status !== 'RINGING') {
      throw new Error('Call cannot be answered');
    }

    // Update call status
    const updatedCall = await this.prisma.call.update({
      where: { id: callId },
      data: {
        status: 'CONNECTED',
        startedAt: new Date(),
      },
    });

    // Add receiver to active calls
    const participants = this.activeCalls.get(callId);
    if (participants) {
      participants.add(userId);
    } else {
      this.activeCalls.set(callId, new Set([call.callerId, userId]));
    }

    // Notify caller that call was answered
    await this.websocket.notifyCallAnswered(callId, userId);

    this.logger.log(`Call answered: ${callId} by ${userId}`);

    return updatedCall;
  }

  async declineCall(callId: string, userId: string, reason?: string) {
    const call = await this.prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new Error('Call not found');
    }

    if (call.receiverId !== userId) {
      throw new Error('Not authorized to decline this call');
    }

    // Update call status
    const updatedCall = await this.prisma.call.update({
      where: { id: callId },
      data: {
        status: 'DECLINED',
      },
    });

    // Remove from active calls
    this.activeCalls.delete(callId);

    // Notify caller that call was declined
    await this.websocket.notifyCallEnded(callId, 'declined');

    this.logger.log(`Call declined: ${callId} by ${userId}. Reason: ${reason}`);

    return updatedCall;
  }

  async endCall(callId: string, userId: string, duration?: number, qualityScore?: number) {
    const call = await this.prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new Error('Call not found');
    }

    if (call.callerId !== userId && call.receiverId !== userId) {
      throw new Error('Not authorized to end this call');
    }

    const endedAt = new Date();
    const callDuration = duration || (call.startedAt ? Math.floor((endedAt.getTime() - new Date(call.startedAt).getTime()) / 1000) : 0);

    // Update call record
    const updatedCall = await this.prisma.call.update({
      where: { id: callId },
      data: {
        status: 'ENDED',
        endedAt,
        duration: callDuration,
        qualityScore,
      },
    });

    // Remove from active calls
    this.activeCalls.delete(callId);

    // Notify other participant
    await this.websocket.notifyCallEnded(callId, 'ended', callDuration);

    this.logger.log(`Call ended: ${callId}. Duration: ${callDuration}s`);

    return updatedCall;
  }

  async handleSignaling(callId: string, userId: string, signal: any) {
    const call = await this.prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new Error('Call not found');
    }

    // Check if user is part of the call
    if (call.callerId !== userId && call.receiverId !== userId) {
      throw new Error('Not authorized for this call');
    }

    // Determine target user
    const targetUserId = call.callerId === userId ? call.receiverId : call.callerId;

    // Send signaling data to target user
    await this.websocket.sendToUser(targetUserId, 'call_signal', {
      callId,
      type: signal.type,
      sdp: signal.sdp,
      candidate: signal.candidate,
      senderId: userId,
    });

    this.logger.debug(`Signaling data sent for call: ${callId}`);
  }

  async addCallParticipant(callId: string, userId: string) {
    const participant = await this.prisma.callParticipant.create({
      data: {
        callId,
        userId,
        joinedAt: new Date(),
      },
    });

    const participants = this.activeCalls.get(callId);
    if (participants) {
      participants.add(userId);
    }

    return participant;
  }

  async removeCallParticipant(callId: string, userId: string) {
    const participant = await this.prisma.callParticipant.findFirst({
      where: { callId, userId },
    });

    if (participant) {
      const leftAt = new Date();
      const duration = participant ? Math.floor((leftAt.getTime() - new Date(participant.joinedAt).getTime()) / 1000) : 0;

      await this.prisma.callParticipant.update({
        where: { id: participant.id },
        data: {
          leftAt,
          duration,
        },
      });

      const participants = this.activeCalls.get(callId);
      if (participants) {
        participants.delete(userId);
      }
    }
  }

  getActiveCallParticipants(callId: string): string[] {
    const participants = this.activeCalls.get(callId);
    return participants ? Array.from(participants) : [];
  }

  isCallActive(callId: string): boolean {
    return this.activeCalls.has(callId);
  }
}

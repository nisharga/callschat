import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
  namespace: '/socket.io',
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationsService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Connection refused: No token provided`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store user socket mapping
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);

      // Join user's personal room
      await client.join(`user:${userId}`);

      // Update user online status
      await this.updateUserOnlineStatus(userId, true);

      // Get user's active conversations and join those rooms
      const conversations = await this.prisma.conversationMember.findMany({
        where: { userId, leftAt: null },
        include: { conversation: true },
      });

      for (const member of conversations) {
        await client.join(`conversation:${member.conversationId}`);
      }

      // Emit online status to contacts
      this.server.to(`user:${userId}`).emit('user_online', { userId });

      this.logger.log(`User ${userId} connected. Socket ID: ${client.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) return;

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Remove socket from user's socket set
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          // Update user offline status if no more connections
          await this.updateUserOnlineStatus(userId, false);
          this.server.to(`user:${userId}`).emit('user_offline', { userId });
        }
      }

      this.logger.log(`User ${userId} disconnected. Socket ID: ${client.id}`);
    } catch (error) {
      this.logger.error(`Disconnect error: ${error.message}`);
    }
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @MessageBody() data: { token: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const payload = this.jwtService.verify(data.token);
      client.data.userId = payload.sub;
      return { event: 'authentication_success', data: { userId: payload.sub } };
    } catch (error) {
      return { event: 'authentication_failed', data: { error: error.message } };
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }

    // Check if user is member of conversation
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        id: data.conversationId,
        userId,
        leftAt: null,
      },
    });

    if (!member) {
      return { event: 'error', data: { message: 'Not a member' } };
    }

    await client.join(`conversation:${data.conversationId}`);
    return { event: 'conversation_joined', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`conversation:${data.conversationId}`);
    return { event: 'conversation_left', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    client.to(`conversation:${data.conversationId}`).emit('user_typing', {
      conversationId: data.conversationId,
      userId,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    client.to(`conversation:${data.conversationId}`).emit('user_typing', {
      conversationId: data.conversationId,
      userId,
      isTyping: false,
    });
  }

  @SubscribeMessage('message_read')
  async handleMessageRead(
    @MessageBody() data: { conversationId: string; messageIds: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const readAt = new Date();

    // Update message status in database
    await this.prisma.message.updateMany({
      where: {
        id: { in: data.messageIds },
        conversationId: data.conversationId,
        senderId: { not: userId }, // Don't update own messages
      },
      data: { status: 'READ' },
    });

    // Notify other participants
    client.to(`conversation:${data.conversationId}`).emit('message_read', {
      conversationId: data.conversationId,
      userId,
      messageIds: data.messageIds,
      readAt,
    });
  }

  // Helper methods for other services to use

  async notifyNewMessage(message: any, conversationId: string) {
    this.server.to(`conversation:${conversationId}`).emit('message_received', {
      messageId: message.id,
      conversationId,
      senderId: message.senderId,
      messageType: message.messageType,
      content: message.plainContent,
      mediaUrl: message.mediaUrl,
      status: message.status,
      createdAt: message.createdAt,
    });

    // Send push notification to offline users
    const members = await this.prisma.conversationMember.findMany({
      where: { conversationId, leftAt: null },
      include: { user: true },
    });

    for (const member of members) {
      if (member.userId !== message.senderId && !member.user.isOnline) {
        await this.notifications.sendPushNotification(member.userId, {
          type: 'MESSAGE',
          title: 'New Message',
          body: message.plainContent || 'Sent a media',
          data: {
            conversationId,
            messageId: message.id,
          },
        });
      }
    }
  }

  async notifyCallInitiated(call: any, recipientId: string) {
    this.server.to(`user:${recipientId}`).emit('call_initiated', {
      callId: call.id,
      callerId: call.callerId,
      receiverId: call.receiverId,
      callType: call.callType,
      status: call.status,
      initiatedAt: call.createdAt,
    });
  }

  async notifyCallAnswered(callId: string, participantId: string) {
    this.server.to(`call:${callId}`).emit('call_answered', {
      callId,
      participantId,
    });
  }

  async notifyCallEnded(callId: string, reason: string, duration?: number) {
    this.server.to(`call:${callId}`).emit('call_ended', {
      callId,
      reason,
      duration,
    });
  }

  async notifyUserStatusChange(userId: string, isOnline: boolean) {
    const event = isOnline ? 'user_online' : 'user_offline';
    this.server.emit(event, { userId, timestamp: new Date() });
  }

  async notifyNotificationCreated(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  private extractToken(client: Socket): string | undefined {
    const auth = client.handshake.auth.token || client.handshake.headers.authorization;
    if (!auth) return undefined;
    return auth.replace('Bearer ', '');
  }

  private async updateUserOnlineStatus(userId: string, isOnline: boolean) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeenAt: new Date(),
      },
    });

    // Cache online status in Redis
    await this.redis.set(`user:${userId}:online`, isOnline.toString(), 300); // 5 minutes
  }

  // Get online status of users
  async getUsersOnlineStatus(userIds: string[]): Promise<Map<string, boolean>> {
    const statusMap = new Map<string, boolean>();

    for (const userId of userIds) {
      const online = await this.redis.get(`user:${userId}:online`);
      statusMap.set(userId, online === 'true');
    }

    return statusMap;
  }

  // Send notification to specific user
  async sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Broadcast to all users
  async broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}

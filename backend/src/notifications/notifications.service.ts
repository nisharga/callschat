import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly firebaseApp: admin.app.App;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const serviceAccount = {
        projectId: this.configService.get('FIREBASE_PROJECT_ID'),
        privateKey: this.configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
      };

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.logger.log('Firebase initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase', error);
    }
  }

  async registerDevice(userId: string, deviceToken: string, deviceInfo: any) {
    try {
      // Check if device already exists
      const existingDevice = await this.prisma.device.findFirst({
        where: { deviceToken },
      });

      if (existingDevice) {
        // Update device if it belongs to a different user
        if (existingDevice.userId !== userId) {
          await this.prisma.device.update({
            where: { id: existingDevice.id },
            data: { userId, deviceName: deviceInfo.deviceName },
          });
        }
      } else {
        // Create new device
        await this.prisma.device.create({
          data: {
            userId,
            deviceToken,
            deviceName: deviceInfo.deviceName,
            deviceType: deviceInfo.deviceType,
            ipAddress: deviceInfo.ipAddress,
          },
        });
      }

      this.logger.log(`Device registered for user: ${userId}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error registering device', error);
      throw new Error('Failed to register device');
    }
  }

  async unregisterDevice(deviceToken: string) {
    try {
      await this.prisma.device.deleteMany({
        where: { deviceToken },
      });

      this.logger.log('Device unregistered successfully');
      return { success: true };
    } catch (error) {
      this.logger.error('Error unregistering device', error);
      throw new Error('Failed to unregister device');
    }
  }

  async sendPushNotification(userId: string, notification: {
    type: string;
    title: string;
    body: string;
    data?: any;
  }) {
    try {
      // Get user's devices
      const devices = await this.prisma.device.findMany({
        where: { userId },
        select: { deviceToken: true },
      });

      if (devices.length === 0) {
        this.logger.warn(`No devices found for user: ${userId}`);
        return;
      }

      const deviceTokens = devices.map((device) => device.deviceToken);

      // Create FCM message
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        tokens: deviceTokens,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: notification.type,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // Send notification
      const response = await admin.messaging().sendMulticast(message);

      this.logger.log(`Push notification sent to user: ${userId}. Success: ${response.successCount}, Failed: ${response.failureCount}`);

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error?.code === 'messaging/invalid-registration-token') {
            invalidTokens.push(deviceTokens[idx]);
          }
        });

        if (invalidTokens.length > 0) {
          await this.prisma.device.deleteMany({
            where: { deviceToken: { in: invalidTokens } },
          });
          this.logger.log(`Removed ${invalidTokens.length} invalid device tokens`);
        }
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error('Error sending push notification', error);
      throw new Error('Failed to send push notification');
    }
  }

  async sendBulkNotifications(userIds: string[], notification: {
    type: string;
    title: string;
    body: string;
    data?: any;
  }) {
    try {
      // Get all devices for all users
      const devices = await this.prisma.device.findMany({
        where: { userId: { in: userIds } },
        select: { deviceToken: true },
      });

      const deviceTokens = devices.map((device) => device.deviceToken);

      if (deviceTokens.length === 0) {
        this.logger.warn('No devices found for the specified users');
        return;
      }

      // Create FCM message
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        tokens: deviceTokens,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: notification.type,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // Send notification
      const response = await admin.messaging().sendMulticast(message);

      this.logger.log(`Bulk push notification sent. Success: ${response.successCount}, Failed: ${response.failureCount}`);

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error('Error sending bulk push notification', error);
      throw new Error('Failed to send bulk notifications');
    }
  }

  async createNotification(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    try {
      // Create notification in database
      const createdNotification = await this.prisma.notification.create({
        data: {
          userId,
          type: notification.type as any,
          title: notification.title,
          message: notification.message,
          data: notification.data,
        },
      });

      // Send push notification
      await this.sendPushNotification(userId, {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
      });

      return createdNotification;
    } catch (error) {
      this.logger.error('Error creating notification', error);
      throw new Error('Failed to create notification');
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      const updated = await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return updated;
    } catch (error) {
      this.logger.error('Error marking notification as read', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllNotificationsAsRead(userId: string) {
    try {
      await this.prisma.notification.updateMany({
        where: { userId, read: false },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error marking all notifications as read', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        this.prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.notification.count({
          where: { userId },
        }),
      ]);

      const unreadCount = await this.prisma.notification.count({
        where: { userId, read: false },
      });

      return {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      };
    } catch (error) {
      this.logger.error('Error getting notifications', error);
      throw new Error('Failed to get notifications');
    }
  }

  async deleteNotification(notificationId: string, userId: string) {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await this.prisma.notification.delete({
        where: { id: notificationId },
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error deleting notification', error);
      throw new Error('Failed to delete notification');
    }
  }

  async sendSilentNotification(userId: string, data: any) {
    try {
      const devices = await this.prisma.device.findMany({
        where: { userId },
        select: { deviceToken: true },
      });

      if (devices.length === 0) {
        this.logger.warn(`No devices found for user: ${userId}`);
        return;
      }

      const deviceTokens = devices.map((device) => device.deviceToken);

      const message: admin.messaging.MulticastMessage = {
        data: data,
        tokens: deviceTokens,
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              'content-available': 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendMulticast(message);

      this.logger.log(`Silent notification sent to user: ${userId}. Success: ${response.successCount}, Failed: ${response.failureCount}`);

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error('Error sending silent notification', error);
      throw new Error('Failed to send silent notification');
    }
  }
}

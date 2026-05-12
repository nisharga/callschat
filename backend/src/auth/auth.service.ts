import { Injectable, Logger, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {}

  async sendOtp(phoneEncrypted: string, type: 'REGISTER' | 'LOGIN' = 'REGISTER') {
    try {
      const phoneHash = this.hashPhone(phoneEncrypted);

      // Check if user exists for registration
      if (type === 'REGISTER') {
        const existingUser = await this.prisma.user.findUnique({
          where: { phoneHash },
        });

        if (existingUser) {
          throw new ConflictException('User already exists with this phone number');
        }
      }

      // Generate and store OTP
      const otp = await this.otpService.generateOtp(phoneHash, type);

      // Send OTP via SMS (using Twilio or similar service)
      await this.sendOtpSms(phoneEncrypted, otp);

      this.logger.log(`OTP sent for ${type}: ${phoneHash}`);

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresAt: otp.expiresAt,
      };
    } catch (error) {
      this.logger.error('Error sending OTP', error);
      throw error;
    }
  }

  async register(dto: any, deviceInfo: any) {
    try {
      const phoneHash = this.hashPhone(dto.phoneEncrypted);

      // Verify OTP
      const isValidOtp = await this.otpService.verifyOtp(
        phoneHash,
        dto.otpCode,
        'REGISTER',
      );

      if (!isValidOtp) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }

      // Generate CallsChat ID
      const callschatId = await this.generateCallschatId();

      // Create user
      const user = await this.prisma.user.create({
        data: {
          phoneHash,
          phoneEncrypted: dto.phoneEncrypted,
          callschatId,
          status: 'ACTIVE',
          privacySettings: {
            create: {},
          },
          devices: {
            create: {
              deviceName: deviceInfo.deviceName,
              deviceType: deviceInfo.deviceType,
              deviceToken: deviceInfo.deviceToken,
              ipAddress: deviceInfo.ipAddress,
            },
          },
        },
        include: {
          privacySettings: true,
          devices: true,
        },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id, deviceInfo.deviceToken);

      this.logger.log(`User registered successfully: ${user.id}`);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Error during registration', error);
      throw error;
    }
  }

  async login(dto: any, deviceInfo: any) {
    try {
      const phoneHash = this.hashPhone(dto.phoneEncrypted);

      // Verify OTP
      const isValidOtp = await this.otpService.verifyOtp(
        phoneHash,
        dto.otpCode,
        'LOGIN',
      );

      if (!isValidOtp) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { phoneHash },
        include: {
          privacySettings: true,
          devices: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Update or create device
      if (deviceInfo.deviceToken) {
        await this.prisma.device.upsert({
          where: { deviceToken: deviceInfo.deviceToken },
          create: {
            userId: user.id,
            deviceName: deviceInfo.deviceName,
            deviceType: deviceInfo.deviceType,
            deviceToken: deviceInfo.deviceToken,
            ipAddress: deviceInfo.ipAddress,
          },
          update: {
            lastActive: new Date(),
            trusted: true,
          },
        });
      }

      // Update online status
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isOnline: true,
          lastSeenAt: new Date(),
        },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id, deviceInfo.deviceToken);

      this.logger.log(`User logged in successfully: ${user.id}`);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Error during login', error);
      throw error;
    }
  }

  async logout(userId: string, deviceToken?: string) {
    try {
      // Delete refresh token session
      if (deviceToken) {
        await this.prisma.device.deleteMany({
          where: { deviceToken },
        });
      }

      // Update online status
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: false,
          lastSeenAt: new Date(),
        },
      });

      this.logger.log(`User logged out successfully: ${userId}`);

      return { success: true };
    } catch (error) {
      this.logger.error('Error during logout', error);
      throw error;
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Check if session exists
      const session = await this.prisma.session.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || session.userId !== payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(session.userId);

      // Delete old session
      await this.prisma.session.delete({
        where: { id: session.id },
      });

      return tokens;
    } catch (error) {
      this.logger.error('Error refreshing tokens', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyCurrentUser(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        callschatId: true,
        phoneHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateTokens(userId: string, deviceToken?: string) {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
    ]);

    // Store refresh token session
    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        deviceInfo: deviceToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }

  private async generateCallschatId(): Promise<string> {
    let callschatId: string;
    let isUnique = false;

    while (!isUnique) {
      callschatId = this.generateRandomString(10);
      const existing = await this.prisma.user.findUnique({
        where: { callschatId },
      });
      isUnique = !existing;
    }

    return callschatId;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous characters
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private hashPhone(phoneEncrypted: string): string {
    // Use a secure hash function
    return bcrypt.hashSync(phoneEncrypted, 10);
  }

  private async sendOtpSms(phoneEncrypted: string, otp: string) {
    // Implement SMS sending logic using Twilio or similar service
    // For now, this is a placeholder
    this.logger.log(`SMS OTP: ${otp} for phone: ${phoneEncrypted}`);
    // TODO: Integrate with actual SMS service
  }

  private sanitizeUser(user: any) {
    const { phoneHash, phoneEncrypted, ...sanitized } = user;
    return sanitized;
  }

  async deleteAccount(userId: string) {
    try {
      // Soft delete user
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          status: 'DELETED',
          phoneHash: `deleted_${userId}_${Date.now()}`,
          callschatId: `deleted_${userId}_${Date.now()}`,
        },
      });

      // Delete all sessions
      await this.prisma.session.deleteMany({
        where: { userId },
      });

      this.logger.log(`Account deleted successfully: ${userId}`);

      return { success: true };
    } catch (error) {
      this.logger.error('Error deleting account', error);
      throw new Error('Failed to delete account');
    }
  }
}

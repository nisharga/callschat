import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_ATTEMPTS = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async generateOtp(phoneHash: string, type: 'REGISTER' | 'LOGIN' | 'PHONE_CHANGE' | 'ACCOUNT_DELETE') {
    try {
      // Delete any existing unverified OTPs for this phone
      await this.prisma.oTP.deleteMany({
        where: {
          phoneHash,
          verified: false,
        },
      });

      // Generate 6-digit OTP
      const code = this.generateOtpCode();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY);

      // Store OTP in database
      const otp = await this.prisma.oTP.create({
        data: {
          phoneHash,
          code,
          type,
          expiresAt,
        },
      });

      this.logger.log(`OTP generated for ${phoneHash}, type: ${type}`);

      return otp;
    } catch (error) {
      this.logger.error('Error generating OTP', error);
      throw new Error('Failed to generate OTP');
    }
  }

  async verifyOtp(phoneHash: string, code: string, type: string): Promise<boolean> {
    try {
      // Find valid OTP
      const otp = await this.prisma.oTP.findFirst({
        where: {
          phoneHash,
          code,
          type,
          verified: false,
          expiresAt: {
            gte: new Date(),
          },
        },
      });

      if (!otp) {
        this.logger.warn(`Invalid OTP attempt for ${phoneHash}`);
        return false;
      }

      // Check attempts
      if (otp.attempts >= this.MAX_ATTEMPTS) {
        // Delete OTP after max attempts
        await this.prisma.oTP.delete({
          where: { id: otp.id },
        });
        this.logger.warn(`OTP max attempts reached for ${phoneHash}`);
        return false;
      }

      // Increment attempts
      await this.prisma.oTP.update({
        where: { id: otp.id },
        data: {
          attempts: otp.attempts + 1,
          verified: true,
        },
      });

      this.logger.log(`OTP verified successfully for ${phoneHash}`);

      return true;
    } catch (error) {
      this.logger.error('Error verifying OTP', error);
      return false;
    }
  }

  async resendOtp(phoneHash: string, type: 'REGISTER' | 'LOGIN' | 'PHONE_CHANGE' | 'ACCOUNT_DELETE') {
    try {
      // Check if there's a recent unverified OTP (within 1 minute)
      const recentOtp = await this.prisma.oTP.findFirst({
        where: {
          phoneHash,
          type,
          verified: false,
          createdAt: {
            gte: new Date(Date.now() - 60 * 1000), // 1 minute ago
          },
        },
      });

      if (recentOtp) {
        throw new Error('Please wait before requesting a new OTP');
      }

      // Generate new OTP
      return this.generateOtp(phoneHash, type);
    } catch (error) {
      this.logger.error('Error resending OTP', error);
      throw error;
    }
  }

  private generateOtpCode(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async cleanupExpiredOtps() {
    try {
      const result = await this.prisma.oTP.deleteMany({
        where: {
          OR: [
            {
              expiresAt: {
                lt: new Date(),
              },
            },
            {
              verified: true,
              createdAt: {
                lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
              },
            },
          ],
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired OTPs`);
    } catch (error) {
      this.logger.error('Error cleaning up OTPs', error);
    }
  }
}

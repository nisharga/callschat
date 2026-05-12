import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get('AWS_S3_BUCKET');
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string }> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${randomUUID()}.${fileExtension}`;
      const key = `${folder}/${userId}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          userId,
          originalName: file.originalname,
          uploadDate: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const url = `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);

      return { url, key };
    } catch (error) {
      this.logger.error('Error uploading file to S3', error);
      throw new Error('Failed to upload file');
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    userId: string,
    folder: string = 'uploads',
  ): Promise<Array<{ url: string; key: string }>> {
    const uploadPromises = files.map((file) => this.uploadFile(file, userId, folder));
    return Promise.all(uploadPromises);
  }

  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      return url;
    } catch (error) {
      this.logger.error('Error generating presigned URL', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error('Error deleting file from S3', error);
      throw new Error('Failed to delete file');
    }
  }

  async deleteMultipleFiles(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.deleteFile(key)));
      this.logger.log(`Multiple files deleted successfully: ${keys.length} files`);
    } catch (error) {
      this.logger.error('Error deleting multiple files from S3', error);
      throw new Error('Failed to delete files');
    }
  }

  generateUploadKey(userId: string, fileName: string, folder: string = 'uploads'): string {
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;
    return `${folder}/${userId}/${uniqueFileName}`;
  }

  getFileKeyFromUrl(url: string): string {
    const urlParts = url.split('/');
    const bucketIndex = urlParts.findIndex((part) => part === this.bucketName);
    return bucketIndex !== -1 ? urlParts.slice(bucketIndex + 1).join('/') : '';
  }

  async getFileMetadata(key: string): Promise<any> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata,
      };
    } catch (error) {
      this.logger.error('Error getting file metadata', error);
      throw new Error('Failed to get file metadata');
    }
  }

  validateImageFile(mimeType: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(mimeType);
  }

  validateVideoFile(mimeType: string): boolean {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    return allowedTypes.includes(mimeType);
  }

  validateAudioFile(mimeType: string): boolean {
    const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/aac', 'audio/mpeg'];
    return allowedTypes.includes(mimeType);
  }

  validateFile(mimeType: string, maxSize: number): { valid: boolean; error?: string } {
    const imageMaxSize = 10 * 1024 * 1024; // 10MB
    const videoMaxSize = 100 * 1024 * 1024; // 100MB
    const audioMaxSize = 25 * 1024 * 1024; // 25MB

    if (this.validateImageFile(mimeType)) {
      if (maxSize > imageMaxSize) {
        return { valid: false, error: 'Image size exceeds 10MB limit' };
      }
      return { valid: true };
    }

    if (this.validateVideoFile(mimeType)) {
      if (maxSize > videoMaxSize) {
        return { valid: false, error: 'Video size exceeds 100MB limit' };
      }
      return { valid: true };
    }

    if (this.validateAudioFile(mimeType)) {
      if (maxSize > audioMaxSize) {
        return { valid: false, error: 'Audio size exceeds 25MB limit' };
      }
      return { valid: true };
    }

    return { valid: false, error: 'Invalid file type' };
  }

  async generatePresignedPostUrl(
    userId: string,
    fileName: string,
    contentType: string,
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string; fields: Record<string, string> }> {
    try {
      const key = this.generateUploadKey(userId, fileName, folder);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      return {
        url,
        key,
        fields: {
          'Content-Type': contentType,
        },
      };
    } catch (error) {
      this.logger.error('Error generating presigned POST URL', error);
      throw new Error('Failed to generate upload URL');
    }
  }
}

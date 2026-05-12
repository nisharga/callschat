import { Module } from '@nestjs/common';
import { WebrtcService } from './webrtc.service';
import { WebrtcController } from './webrtc.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WebrtcController],
  providers: [WebrtcService],
  exports: [WebrtcService],
})
export class WebrtcModule {}

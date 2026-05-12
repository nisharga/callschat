import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WebrtcService } from './webrtc.service';

@Controller('calls')
@UseGuards(JwtAuthGuard)
export class WebrtcController {
  constructor(private readonly webrtcService: WebrtcService) {}

  @Get('rtc-config')
  async getRTCConfig() {
    return this.webrtcService.getRTCConfig();
  }

  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  async initiateCall(
    @CurrentUser() user: any,
    @Body() data: { receiverId: string; callType: string },
  ) {
    return this.webrtcService.initiateCall(
      user.id,
      data.receiverId,
      data.callType,
    );
  }

  @Post(':callId/answer')
  @HttpCode(HttpStatus.OK)
  async answerCall(
    @Param('callId') callId: string,
    @CurrentUser() user: any,
  ) {
    return this.webrtcService.answerCall(callId, user.id);
  }

  @Post(':callId/decline')
  @HttpCode(HttpStatus.OK)
  async declineCall(
    @Param('callId') callId: string,
    @CurrentUser() user: any,
    @Body() data?: { reason?: string },
  ) {
    return this.webrtcService.declineCall(callId, user.id, data?.reason);
  }

  @Post(':callId/end')
  @HttpCode(HttpStatus.OK)
  async endCall(
    @Param('callId') callId: string,
    @CurrentUser() user: any,
    @Body() data?: { duration?: number; qualityScore?: number },
  ) {
    return this.webrtcService.endCall(
      callId,
      user.id,
      data?.duration,
      data?.qualityScore,
    );
  }

  @Post(':callId/signal')
  @HttpCode(HttpStatus.OK)
  async handleSignaling(
    @Param('callId') callId: string,
    @CurrentUser() user: any,
    @Body() signal: any,
  ) {
    return this.webrtcService.handleSignaling(callId, user.id, signal);
  }

  @Get(':callId/participants')
  async getCallParticipants(@Param('callId') callId: string) {
    return {
      participants: this.webrtcService.getActiveCallParticipants(callId),
    };
  }
}

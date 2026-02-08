import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ChatIdApiParam } from '@waha/nestjs/params/ChatIdApiParam';
import {
  SessionApiParam,
  WorkingSessionParam,
} from '@waha/nestjs/params/SessionApiParam';

import { SessionManager } from '../core/abc/manager.abc';
import { WhatsappSession } from '../core/abc/session.abc';
import {
  WAHAChatPresences,
} from '../structures/presence.dto';
import { PoliciesGuard } from '@waha/core/auth/policies.guard';
import { CheckPolicies } from '@waha/core/auth/policies.decorator';
import { CanSession, FromParam } from '@waha/core/auth/policies';

import { Action } from '@waha/core/auth/casl.types';

@ApiSecurity('api_key')
@Controller('api/:session/presence')
@ApiTags('✅ Presence')
@UseGuards(PoliciesGuard)
@CheckPolicies(CanSession(Action.Use, FromParam('session')))
export class PresenceController {
  constructor(private manager: SessionManager) {}

  @Get('')
  @SessionApiParam
  @ApiOperation({ summary: 'Get all subscribed presence information.' })
  getPresenceAll(
    @WorkingSessionParam session: WhatsappSession,
  ): Promise<WAHAChatPresences[]> {
    return session.getPresences();
  }

  @Get(':chatId')
  @SessionApiParam
  @ChatIdApiParam
  @ApiOperation({
    summary:
      "Get the presence for the chat id. If it hasn't been subscribed - it also subscribes to it.",
  })
  getPresence(
    @WorkingSessionParam session: WhatsappSession,
    @Param('chatId') chatId: string,
  ): Promise<WAHAChatPresences> {
    return session.getPresence(chatId);
  }

  @Post(':chatId/subscribe')
  @SessionApiParam
  @ChatIdApiParam
  @ApiOperation({
    summary: 'Subscribe to presence events for the chat.',
  })
  subscribe(
    @WorkingSessionParam session: WhatsappSession,
    @Param('chatId') chatId: string,
  ): Promise<void> {
    return session.subscribePresence(chatId);
  }
}

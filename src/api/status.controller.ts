import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  SessionApiParam,
  WorkingSessionParam,
} from '@waha/nestjs/params/SessionApiParam';
import { NewMessageIDResponse } from '@waha/structures/chatting.dto';

import { SessionManager } from '../core/abc/manager.abc';
import { WhatsappSession } from '../core/abc/session.abc';
import { PoliciesGuard } from '@waha/core/auth/policies.guard';
import { CheckPolicies } from '@waha/core/auth/policies.decorator';
import { CanSession, FromParam } from '@waha/core/auth/policies';

import { Action } from '@waha/core/auth/casl.types';

@ApiSecurity('api_key')
@Controller('api/:session/status')
@ApiTags('🟢 Status')
@UseGuards(PoliciesGuard)
@CheckPolicies(CanSession(Action.Use, FromParam('session')))
class StatusController {
  constructor(private manager: SessionManager) {}

  @Get('new-message-id')
  @SessionApiParam
  @ApiOperation({
    summary: 'Generate message ID you can use to batch contacts',
  })
  async getNewMessageId(
    @WorkingSessionParam session: WhatsappSession,
  ): Promise<NewMessageIDResponse> {
    const id = await session.generateNewMessageId();
    return { id: id };
  }
}

export { StatusController };

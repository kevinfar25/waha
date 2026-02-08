import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { WhatsappSession } from '@waha/core/abc/session.abc';
import { ChatIdApiParam } from '@waha/nestjs/params/ChatIdApiParam';
import {
  SessionApiParam,
  WorkingSessionParam,
} from '@waha/nestjs/params/SessionApiParam';
import { Label } from '@waha/structures/labels.dto';

import { SessionManager } from '../core/abc/manager.abc';
import { PoliciesGuard } from '@waha/core/auth/policies.guard';
import { CheckPolicies } from '@waha/core/auth/policies.decorator';
import { CanSession, FromParam } from '@waha/core/auth/policies';

import { Action } from '@waha/core/auth/casl.types';

@ApiSecurity('api_key')
@Controller('api/:session/labels')
@ApiTags('🏷️ Labels')
@UseGuards(PoliciesGuard)
@CheckPolicies(CanSession(Action.Use, FromParam('session')))
export class LabelsController {
  constructor(private manager: SessionManager) {}

  @Get('/')
  @SessionApiParam
  @ApiOperation({ summary: 'Get all labels' })
  getAll(@WorkingSessionParam session: WhatsappSession): Promise<Label[]> {
    return session.getLabels();
  }

  @Get('/chats/:chatId')
  @SessionApiParam
  @ChatIdApiParam
  @ApiOperation({ summary: 'Get labels for the chat' })
  getChatLabels(
    @WorkingSessionParam session: WhatsappSession,
    @Param('chatId') chatId: string,
  ): Promise<Label[]> {
    return session.getChatLabels(chatId);
  }

  @Get('/:labelId/chats')
  @SessionApiParam
  @ApiOperation({ summary: 'Get chats by label' })
  getChatsByLabel(
    @WorkingSessionParam session: WhatsappSession,
    @Param('labelId') labelId: string,
  ) {
    return session.getChatsByLabelId(labelId);
  }
}

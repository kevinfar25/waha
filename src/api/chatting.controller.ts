import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  GetChatMessagesFilter,
  transformAck,
} from '@waha/structures/chats.dto';

import { SessionManager } from '../core/abc/manager.abc';
import {
  CheckNumberStatusQuery,
  GetMessageQuery,
  WANumberExistResult,
} from '../structures/chatting.dto';
import { PoliciesGuard } from '@waha/core/auth/policies.guard';
import { CheckPolicies } from '@waha/core/auth/policies.decorator';
import { CanSession, FromQuery } from '@waha/core/auth/policies';

import { Action } from '@waha/core/auth/casl.types';

@ApiSecurity('api_key')
@Controller('api')
@ApiTags('📤 Chatting')
@UseGuards(PoliciesGuard)
export class ChattingController {
  constructor(private manager: SessionManager) {}

  @Get('/messages')
  @ApiOperation({
    summary: 'Get messages in a chat',
    description: 'DEPRECATED. Use "GET /api/chats/{id}/messages" instead',
    deprecated: true,
  })
  @CheckPolicies(CanSession(Action.Use, FromQuery('session')))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getMessages(
    @Query() query: GetMessageQuery,
    @Query() filter: GetChatMessagesFilter,
  ) {
    filter = transformAck(filter);
    const whatsapp = await this.manager.getWorkingSession(query.session);
    return whatsapp.getChatMessages(query.chatId, query, filter);
  }

  @Get('/checkNumberStatus')
  @ApiOperation({
    summary: 'Check number status',
    description: 'DEPRECATED. Use "POST /contacts/check-exists" instead',
    deprecated: true,
  })
  @CheckPolicies(CanSession(Action.Use, FromQuery('session')))
  async DEPRECATED_checkNumberStatus(
    @Query() request: CheckNumberStatusQuery,
  ): Promise<WANumberExistResult> {
    const whatsapp = await this.manager.getWorkingSession(request.session);
    return whatsapp.checkNumberStatus(request);
  }
}

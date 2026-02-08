import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
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
  ChatPictureQuery,
  ChatPictureResponse,
  ChatsPaginationParams,
  ChatSummary,
  GetChatMessageQuery,
  GetChatMessagesFilter,
  GetChatMessagesQuery,
  MessageSortField,
  OverviewBodyRequest,
  OverviewFilter,
  OverviewPaginationParams,
  transformAck,
} from '../structures/chats.dto';
import { SortOrder } from '@waha/structures/pagination.dto';
import { PoliciesGuard } from '@waha/core/auth/policies.guard';
import { CheckPolicies } from '@waha/core/auth/policies.decorator';
import { CanSession, FromParam } from '@waha/core/auth/policies';

import { Action } from '@waha/core/auth/casl.types';

@ApiSecurity('api_key')
@Controller('api/:session/chats')
@ApiTags('💬 Chats')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(PoliciesGuard)
@CheckPolicies(CanSession(Action.Use, FromParam('session')))
class ChatsController {
  constructor(private manager: SessionManager) {}

  @Get('')
  @SessionApiParam
  @ApiOperation({ summary: 'Get chats' })
  getChats(
    @WorkingSessionParam session: WhatsappSession,
    @Query() pagination: ChatsPaginationParams,
  ) {
    return session.getChats(pagination);
  }

  @Get('overview')
  @SessionApiParam
  @ApiOperation({
    summary:
      'Get chats overview. Includes all necessary things to build UI "your chats overview" page - chat id, name, picture, last message. Sorting by last message timestamp',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getChatsOverview(
    @WorkingSessionParam session: WhatsappSession,
    @Query() pagination: OverviewPaginationParams,
    @Query() filter: OverviewFilter,
  ): Promise<ChatSummary[]> {
    return session.getChatsOverview(pagination, filter);
  }

  @Post('overview')
  @SessionApiParam
  @ApiOperation({
    summary:
      'Get chats overview. Use POST if you have too many "ids" params - GET can limit it',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  postChatsOverview(
    @WorkingSessionParam session: WhatsappSession,
    @Body() body: OverviewBodyRequest,
  ): Promise<ChatSummary[]> {
    return session.getChatsOverview(body.pagination, body.filter);
  }

  @Get(':chatId/picture')
  @SessionApiParam
  @ApiOperation({ summary: 'Gets chat picture' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getChatPicture(
    @WorkingSessionParam session: WhatsappSession,
    @Param('chatId') chatId: string,
    @Query() query: ChatPictureQuery,
  ): Promise<ChatPictureResponse> {
    const url = await session.getContactProfilePicture(chatId, query.refresh);
    return { url: url };
  }

  @Get(':chatId/messages')
  @SessionApiParam
  @ApiOperation({ summary: 'Gets messages in the chat' })
  @ChatIdApiParam
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getChatMessages(
    @Query() query: GetChatMessagesQuery,
    @Query() filter: GetChatMessagesFilter,
    @WorkingSessionParam session: WhatsappSession,
    @Param('chatId') chatId: string,
  ) {
    if (query.sortBy == MessageSortField.MESSAGE_TIMESTAMP) {
      query.sortBy = MessageSortField.TIMESTAMP;
    }
    query.sortBy = query.sortBy || MessageSortField.TIMESTAMP;
    query.sortOrder = query.sortOrder || SortOrder.DESC;
    filter = transformAck(filter);
    return session.getChatMessages(chatId, query, filter);
  }

  @Get(':chatId/messages/:messageId')
  @SessionApiParam
  @ApiOperation({ summary: 'Gets message by id' })
  @ChatIdApiParam
  async getChatMessage(
    @Query() query: GetChatMessageQuery,
    @WorkingSessionParam session: WhatsappSession,
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
  ) {
    const message = await session.getChatMessage(chatId, messageId, query);
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }
}

export { ChatsController };

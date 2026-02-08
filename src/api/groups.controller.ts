import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GroupIdApiParam } from '@waha/nestjs/params/ChatIdApiParam';
import {
  SessionApiParam,
  WorkingSessionParam,
} from '@waha/nestjs/params/SessionApiParam';
import { CountResponse } from '@waha/structures/base.dto';
import {
  ChatPictureQuery,
  ChatPictureResponse,
} from '@waha/structures/chats.dto';

import { SessionManager } from '../core/abc/manager.abc';
import { parseGroupInviteLink, WhatsappSession } from '../core/abc/session.abc';
import {
  GroupParticipant,
  GroupsListFields,
  GroupsPaginationParams,
  JoinGroupRequest,
  SettingsSecurityChangeInfo,
} from '../structures/groups.dto';
import { PoliciesGuard } from '@waha/core/auth/policies.guard';
import { CheckPolicies } from '@waha/core/auth/policies.decorator';
import { CanSession, FromParam } from '@waha/core/auth/policies';

import { Action } from '@waha/core/auth/casl.types';

@ApiSecurity('api_key')
@Controller('api/:session/groups')
@ApiTags('👥 Groups')
@UseGuards(PoliciesGuard)
@CheckPolicies(CanSession(Action.Use, FromParam('session')))
export class GroupsController {
  constructor(private manager: SessionManager) {}

  @Get('join-info')
  @SessionApiParam
  @ApiOperation({ summary: 'Get info about the group before joining.' })
  async joinInfoGroup(
    @WorkingSessionParam session: WhatsappSession,
    @Query() query: JoinGroupRequest,
  ): Promise<any> {
    const code = parseGroupInviteLink(query.code);
    return session.joinInfoGroup(code);
  }

  @Get('')
  @SessionApiParam
  @ApiOperation({ summary: 'Get all groups.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getGroups(
    @WorkingSessionParam session: WhatsappSession,
    @Query() pagination: GroupsPaginationParams,
    @Query() fields: GroupsListFields,
  ) {
    let groups: any = await session.getGroups(pagination);
    groups = session.filterGroupsFields(groups, fields);
    return groups;
  }

  @Get('/count')
  @SessionApiParam
  @ApiOperation({ summary: 'Get the number of groups.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getGroupsCount(
    @WorkingSessionParam session: WhatsappSession,
  ): Promise<CountResponse> {
    const data: any = await session.getGroups({});
    const groups: any[] = Array.isArray(data) ? data : Object.values(data);
    return {
      count: groups.length,
    };
  }

  @Get(':id')
  @GroupIdApiParam
  @SessionApiParam
  @ApiOperation({ summary: 'Get the group.' })
  getGroup(
    @WorkingSessionParam session: WhatsappSession,
    @Param('id') id: string,
  ) {
    return session.getGroup(id);
  }

  @Get(':id/picture')
  @SessionApiParam
  @GroupIdApiParam
  @ApiOperation({ summary: 'Get group picture' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getChatPicture(
    @WorkingSessionParam session: WhatsappSession,
    @Param('id') id: string,
    @Query() query: ChatPictureQuery,
  ): Promise<ChatPictureResponse> {
    const url = await session.getContactProfilePicture(id, query.refresh);
    return { url: url };
  }

  @Get(':id/settings/security/info-admin-only')
  @SessionApiParam
  @GroupIdApiParam
  @ApiOperation({
    summary: "Get the group's 'info admin only' settings.",
    description:
      'You can allow only admins to edit group info (title, description, photo).',
  })
  getInfoAdminOnly(
    @WorkingSessionParam session: WhatsappSession,
    @Param('id') id: string,
  ): Promise<SettingsSecurityChangeInfo> {
    return session.getInfoAdminsOnly(id);
  }

  @Get(':id/settings/security/messages-admin-only')
  @SessionApiParam
  @GroupIdApiParam
  @ApiOperation({
    summary: 'Get settings - who can send messages',
    description: 'The group settings to only allow admins to send messages.',
  })
  getMessagesAdminOnly(
    @WorkingSessionParam session: WhatsappSession,
    @Param('id') id: string,
  ): Promise<SettingsSecurityChangeInfo> {
    return session.getMessagesAdminsOnly(id);
  }

  @Get(':id/invite-code')
  @SessionApiParam
  @GroupIdApiParam
  @ApiOperation({ summary: 'Gets the invite code for the group.' })
  getInviteCode(
    @WorkingSessionParam session: WhatsappSession,
    @Param('id') id: string,
  ): Promise<string> {
    return session.getInviteCode(id);
  }

  @Get(':id/participants/')
  @SessionApiParam
  @GroupIdApiParam
  @ApiOperation({ summary: 'Get participants' })
  getParticipants(
    @WorkingSessionParam session: WhatsappSession,
    @Param('id') id: string,
  ) {
    return session.getParticipants(id);
  }

  @Get(':id/participants/v2')
  @GroupIdApiParam
  @SessionApiParam
  @ApiOperation({ summary: 'Get group participants.' })
  getGroupParticipants(
    @WorkingSessionParam session: WhatsappSession,
    @Param('id') id: string,
  ): Promise<GroupParticipant[]> {
    return session.getGroupParticipants(id);
  }
}

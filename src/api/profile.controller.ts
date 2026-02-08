import {
  Controller,
  Get,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SessionManager } from '@waha/core/abc/manager.abc';
import { WhatsappSession } from '@waha/core/abc/session.abc';
import {
  SessionApiParam,
  WorkingSessionParam,
} from '@waha/nestjs/params/SessionApiParam';
import { MyProfile } from '@waha/structures/profile.dto';
import { PoliciesGuard } from '@waha/core/auth/policies.guard';
import { CheckPolicies } from '@waha/core/auth/policies.decorator';
import { CanSession, FromParam } from '@waha/core/auth/policies';

import { Action } from '@waha/core/auth/casl.types';

@ApiSecurity('api_key')
@Controller('api/:session/profile')
@ApiTags('🆔 Profile')
@UseGuards(PoliciesGuard)
@CheckPolicies(CanSession(Action.Use, FromParam('session')))
export class ProfileController {
  constructor(private manager: SessionManager) {}

  @Get('')
  @SessionApiParam
  @ApiOperation({ summary: 'Get my profile' })
  async getMyProfile(
    @WorkingSessionParam session: WhatsappSession,
  ): Promise<MyProfile> {
    const me = session.getSessionMeInfo();
    if (!me) {
      throw new UnprocessableEntityException('No profile found');
    }
    const picture = await session.getContactProfilePicture(me.id, false);
    return {
      id: me.id,
      name: me.pushName,
      picture: picture || null,
    };
  }
}

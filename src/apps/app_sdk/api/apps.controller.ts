import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  AppsService,
  IAppsService,
} from '@waha/apps/app_sdk/services/IAppsService';
import { SessionManager } from '@waha/core/abc/manager.abc';
import { CheckPolicies } from '@waha/core/auth/policies.decorator';
import { PoliciesGuard } from '@waha/core/auth/policies.guard';
import { CanSession, FromQuery } from '@waha/core/auth/policies';
import { Action, session as SessionName } from '@waha/core/auth/casl.types';
import { WAHAValidationPipe } from '@waha/nestjs/pipes/WAHAValidationPipe';

import { App } from '../dto/app.dto';
import { ListAppsQuery } from '../dto/query.dto';

@ApiSecurity('api_key')
@Controller('api/apps')
@ApiTags('🧩 Apps')
@UseGuards(PoliciesGuard)
export class AppsController {
  constructor(
    @Inject(AppsService)
    private appsService: IAppsService,
    private manager: SessionManager,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'List all apps for a session' })
  @CheckPolicies(CanSession(Action.Use, FromQuery('session')))
  @UsePipes(new WAHAValidationPipe())
  async list(
    @Query(new WAHAValidationPipe()) query: ListAppsQuery,
  ): Promise<App[]> {
    return this.appsService.list(this.manager, query.session);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get app by ID' })
  @UsePipes(new WAHAValidationPipe())
  async get(@Param('id') id: string, @Req() req: any): Promise<App> {
    const app = await this.appsService.get(this.manager, id);
    if (!app) {
      throw new NotFoundException(`App '${id}' not found`);
    }
    if (!req.ability?.can(Action.Use, new SessionName(app.session))) {
      throw new ForbiddenException();
    }
    return app;
  }
}

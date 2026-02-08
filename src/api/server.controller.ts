import * as process from 'node:process';

import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { WhatsappConfigService } from '@waha/config.service';
import { WAHAValidationPipe } from '@waha/nestjs/pipes/WAHAValidationPipe';
import { WAHAEnvironment } from '@waha/structures/environment.dto';
import {
  EnvironmentQuery,
  ServerStatusResponse,
} from '@waha/structures/server.dto';
import { VERSION } from '@waha/version';
import * as lodash from 'lodash';
import { PoliciesGuard } from '@waha/core/auth/policies.guard';
import { CheckPolicies } from '@waha/core/auth/policies.decorator';
import { CanServer } from '@waha/core/auth/policies';

import { Action } from '@waha/core/auth/casl.types';

@ApiSecurity('api_key')
@Controller('api/server')
@ApiTags('🔍 Observability')
@UseGuards(PoliciesGuard)
export class ServerController {
  constructor(private config: WhatsappConfigService) {}

  @Get('version')
  @ApiOperation({ summary: 'Get the version of the server' })
  @CheckPolicies(CanServer(Action.Read))
  get(): WAHAEnvironment {
    return VERSION;
  }

  @Get('environment')
  @ApiOperation({ summary: 'Get the server environment' })
  @CheckPolicies(CanServer(Action.Manage))
  environment(
    @Query(new WAHAValidationPipe()) query: EnvironmentQuery,
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): object {
    let result = process.env;
    if (!query.all) {
      result = lodash.pickBy(result, (value, key) => {
        return (
          key.startsWith('WAHA_') ||
          key.startsWith('WHATSAPP_') ||
          key === 'DEBUG'
        );
      });
    }
    const map = new Map<string, string>();
    // sort and set
    Object.keys(result)
      .sort()
      .forEach((key) => {
        map.set(key, result[key]);
      });
    return Object.fromEntries(map);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get the server status' })
  @CheckPolicies(CanServer(Action.Read))
  async status(): Promise<ServerStatusResponse> {
    const now = Date.now();
    const uptime = Math.floor(process.uptime() * 1000);
    const startTimestamp = now - uptime;
    return {
      startTimestamp: startTimestamp,
      uptime: uptime,
      worker: {
        id: this.config.workerId,
      },
    };
  }
}

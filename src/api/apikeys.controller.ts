import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SessionManager } from '@waha/core/abc/manager.abc';
import { Action } from '@waha/core/auth/casl.types';
import { CanServer } from '@waha/core/auth/policies';
import { CheckPolicies } from '@waha/core/auth/policies.decorator';
import { PoliciesGuard } from '@waha/core/auth/policies.guard';
import { ApiKey } from '@waha/core/storage/IApiKeyRepository';
import { ApiKeyDTO } from '@waha/structures/apikeys.dto';

@ApiSecurity('api_key')
@Controller('api/keys')
@ApiTags('🔑 Api Keys')
@UseGuards(PoliciesGuard)
@CheckPolicies(CanServer(Action.Manage))
export class ApiKeysController {
  constructor(private manager: SessionManager) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all API keys' })
  async list(): Promise<ApiKeyDTO[]> {
    const keys = await this.manager.apiKeyRepository.list();
    return keys.map((key) => ApiKeyToDTO(key));
  }
}

function ApiKeyToDTO(apikey: ApiKey): ApiKeyDTO {
  return {
    id: apikey.id,
    key: apikey.key,
    isActive: apikey.isActive,
    isAdmin: apikey.isAdmin,
    session: apikey.session,
  };
}

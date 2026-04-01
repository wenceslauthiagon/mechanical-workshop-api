import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Auth Check')
@Controller('auth-check')
export class AuthCheckController {
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Verificar módulo de autenticação',
    description: 'Endpoint público para validar se o módulo de autenticação está ativo',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulo de autenticação ativo',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        auth: { type: 'string', example: 'up' },
      },
    },
  })
  check() {
    return {
      status: 'ok',
      auth: 'up',
    };
  }
}

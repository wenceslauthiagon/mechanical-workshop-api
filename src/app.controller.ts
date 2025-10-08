import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health')
export class AppController {
  @Get()
  @ApiOperation({
    summary: 'Health Check',
    description: 'Verificar se a API está funcionando',
  })
  @ApiResponse({ status: 200, description: 'API funcionando corretamente' })
  getHealth(): { status: string; timestamp: string; service: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Mechanical Workshop API',
    };
  }
}

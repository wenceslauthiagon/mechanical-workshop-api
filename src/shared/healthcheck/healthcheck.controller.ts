import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  API_SUMMARY,
  API_DESCRIPTIONS,
  HEALTH_CHECK_RESPONSES,
} from '../constants/messages.constants';
import { APP_CONSTANTS } from '../constants/app.constants';

@ApiTags('Health Check')
@Controller('health')
export class HealthCheckController {
  @Get()
  @ApiOperation({
    summary: API_SUMMARY.HEALTH_CHECK_API,
    description: API_DESCRIPTIONS.HEALTH_CHECK_API,
  })
  @ApiResponse({
    status: 200,
    description: HEALTH_CHECK_RESPONSES.API_WORKING,
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: HEALTH_CHECK_RESPONSES.STATUS_OK,
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2023-10-08T12:00:00.000Z',
        },
        uptime: {
          type: 'number',
          example: 3600,
          description: HEALTH_CHECK_RESPONSES.UPTIME_DESCRIPTION,
        },
        service: {
          type: 'string',
          example: APP_CONSTANTS.APP_NAME,
        },
        version: {
          type: 'string',
          example: HEALTH_CHECK_RESPONSES.DEFAULT_VERSION,
        },
        environment: {
          type: 'string',
          example: 'production',
        },
      },
    },
  })
  checkHealth() {
    return {
      status: HEALTH_CHECK_RESPONSES.STATUS_OK,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: APP_CONSTANTS.APP_NAME,
      version: HEALTH_CHECK_RESPONSES.DEFAULT_VERSION,
      environment:
        process.env.NODE_ENV || HEALTH_CHECK_RESPONSES.DEFAULT_ENVIRONMENT,
    };
  }
}

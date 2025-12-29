import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceStatsService } from '../../2-application/services/service-stats.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('Service Stats')
@ApiBearerAuth()
@Controller('service-stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceStatsController {
  constructor(private readonly serviceStatsService: ServiceStatsService) {}

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get service execution statistics' })
  async getServiceStats(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.serviceStatsService.getServiceStats(startDate, endDate);
  }

  @Get('top-services')
  @Roles('ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get top performing services' })
  async getTopServices(@Query('limit') limit?: number) {
    return this.serviceStatsService.getTopServices(limit || 10);
  }
}

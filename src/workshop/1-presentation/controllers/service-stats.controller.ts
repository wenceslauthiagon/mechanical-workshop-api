import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ServiceStatsService } from '../../2-application/services/service-stats.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Service Statistics')
@Controller('api/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
@ApiBearerAuth('JWT-auth')
export class ServiceStatsController {
  constructor(private readonly serviceStatsService: ServiceStatsService) {}

  @Get('services')
  @ApiOperation({
    summary: 'Estatísticas de execução por serviço',
    description:
      'Retorna estatísticas de tempo de execução para cada serviço, incluindo tempo médio, precisão das estimativas e total de ordens concluídas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de execução dos serviços',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          serviceId: { type: 'string', example: 'uuid' },
          serviceName: { type: 'string', example: 'Troca de óleo' },
          averageExecutionHours: { type: 'number', example: 1.5 },
          totalCompletedOrders: { type: 'number', example: 25 },
          estimatedTimeHours: { type: 'number', example: 1.0 },
          accuracyPercentage: { type: 'number', example: 85.5 },
        },
      },
    },
  })
  async getServiceStats() {
    return this.serviceStatsService.getServiceExecutionStats();
  }

  @Get('overall')
  @ApiOperation({
    summary: 'Estatísticas gerais do sistema',
    description:
      'Retorna estatísticas gerais incluindo total de ordens concluídas, tempo médio de execução e precisão geral das estimativas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas gerais do sistema',
    schema: {
      type: 'object',
      properties: {
        totalCompletedOrders: { type: 'number', example: 150 },
        averageExecutionTime: { type: 'number', example: 2.3 },
        averageEstimatedTime: { type: 'number', example: 2.0 },
        overallAccuracy: { type: 'number', example: 87.2 },
      },
    },
  })
  async getOverallStats() {
    return this.serviceStatsService.getOverallStats();
  }

  @Get('services/:serviceId')
  @ApiOperation({
    summary: 'Estatísticas de um serviço específico',
    description:
      'Retorna estatísticas detalhadas de execução para um serviço específico.',
  })
  @ApiParam({
    name: 'serviceId',
    description: 'ID do serviço',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas do serviço específico',
  })
  @ApiResponse({
    status: 404,
    description: 'Serviço não encontrado ou sem dados de execução',
  })
  async getServiceStatsById(@Param('serviceId') serviceId: string) {
    const stats = await this.serviceStatsService.getServiceById(serviceId);

    if (!stats) {
      return {
        message: 'Serviço não encontrado ou sem dados de execução suficientes',
        serviceId,
      };
    }

    return stats;
  }
}

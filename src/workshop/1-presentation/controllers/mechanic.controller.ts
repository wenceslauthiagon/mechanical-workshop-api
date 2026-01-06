import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MechanicService } from '../../2-application/services/mechanic.service';
import { CreateMechanicDto } from '../dtos/mechanic/create-mechanic.dto';
import { UpdateMechanicDto } from '../dtos/mechanic/update-mechanic.dto';
import { MechanicResponseDto } from '../dtos/mechanic/mechanic-response.dto';
import { SERVICE_ORDER_CONSTANTS } from '../../../shared/constants/mechanic.constants';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';

@ApiTags('Mechanics')
@Controller('mechanics')
export class MechanicController {
  constructor(private readonly mechanicService: MechanicService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createMechanicDto: CreateMechanicDto,
  ): Promise<MechanicResponseDto> {
    const mechanic = await this.mechanicService.create(createMechanicDto);
    return new MechanicResponseDto(mechanic);
  }

  @Get()
  async findAllPaginated(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<MechanicResponseDto>> {
    const result = await this.mechanicService.findAllPaginated(paginationDto);
    return {
      data: result.data.map((mechanic) => new MechanicResponseDto(mechanic)),
      pagination: result.pagination,
    };
  }

  @Get('all')
  async findAll(): Promise<MechanicResponseDto[]> {
    const mechanics = await this.mechanicService.findAll();
    return mechanics.map((mechanic) => new MechanicResponseDto(mechanic));
  }

  @Get('available')
  async findAvailable(): Promise<MechanicResponseDto[]> {
    const mechanics = await this.mechanicService.findAvailable();
    return mechanics.map((mechanic) => new MechanicResponseDto(mechanic));
  }

  @Get('by-specialty')
  async findBySpecialty(
    @Query('specialty') specialty: string,
  ): Promise<MechanicResponseDto[]> {
    const mechanics = await this.mechanicService.findBySpecialty(specialty);
    return mechanics.map((mechanic) => new MechanicResponseDto(mechanic));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MechanicResponseDto> {
    const mechanic = await this.mechanicService.findById(id);
    return new MechanicResponseDto(mechanic);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string): Promise<MechanicResponseDto> {
    const mechanic = await this.mechanicService.findById(id);
    return new MechanicResponseDto(mechanic);
  }

  @Get(':id/workload')
  async getWorkload(@Param('id') id: string) {
    return await this.mechanicService.getWorkload(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMechanicDto: UpdateMechanicDto,
  ): Promise<MechanicResponseDto> {
    const mechanic = await this.mechanicService.update(id, updateMechanicDto);
    return new MechanicResponseDto(mechanic);
  }

  @Put(':id/toggle-availability')
  @HttpCode(HttpStatus.OK)
  async toggleAvailability(
    @Param('id') id: string,
  ): Promise<MechanicResponseDto> {
    const mechanic = await this.mechanicService.toggleAvailability(id);
    return new MechanicResponseDto(mechanic);
  }

  @Post(':mechanicId/assign/:serviceOrderId')
  @HttpCode(HttpStatus.OK)
  async assignToServiceOrder(
    @Param('mechanicId') mechanicId: string,
    @Param('serviceOrderId') serviceOrderId: string,
  ): Promise<{ message: string }> {
    await this.mechanicService.assignToServiceOrder(mechanicId, serviceOrderId);
    return { message: SERVICE_ORDER_CONSTANTS.MESSAGES.MECHANIC_ASSIGNED };
  }

  @Get('best-for-service')
  async findBestMechanicForService(
    @Query('specialties') specialties: string,
  ): Promise<MechanicResponseDto | null> {
    const specialtyArray = specialties.split(',').map((s) => s.trim());
    const mechanic =
      await this.mechanicService.findBestMechanicForService(specialtyArray);
    return mechanic ? new MechanicResponseDto(mechanic) : null;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.mechanicService.delete(id);
  }
}

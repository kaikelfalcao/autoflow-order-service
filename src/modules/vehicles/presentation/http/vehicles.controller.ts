import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VehicleService } from '../../application/vehicle.service';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { ListVehiclesQuery } from './dtos/list-vehicles.query';

@ApiTags('Vehicles')
@Controller()
export class VehiclesController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post('vehicles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created' })
  @ApiResponse({ status: 409, description: 'Plate already registered' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async create(@Body() dto: CreateVehicleDto) {
    const vehicle = await this.vehicleService.create(dto);
    return this.toResponse(vehicle);
  }

  @Get('vehicles')
  @ApiOperation({ summary: 'List all vehicles with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of vehicles' })
  async findAll(@Query() query: ListVehiclesQuery) {
    const result = await this.vehicleService.findAll(query);
    return { data: result.data.map(v => this.toResponse(v)), total: result.total, page: result.page, limit: result.limit };
  }

  @Get('vehicles/:id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Vehicle found' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async findOne(@Param('id') id: string) {
    const vehicle = await this.vehicleService.findById(id);
    return this.toResponse(vehicle);
  }

  @Get('customers/:customerId/vehicles')
  @ApiOperation({ summary: 'List vehicles by customer' })
  @ApiParam({ name: 'customerId', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Paginated list of vehicles' })
  async findByCustomer(@Param('customerId') customerId: string, @Query() query: ListVehiclesQuery) {
    const result = await this.vehicleService.findByCustomerId(customerId, query);
    return { data: result.data.map(v => this.toResponse(v)), total: result.total, page: result.page, limit: result.limit };
  }

  @Put('vehicles/:id')
  @ApiOperation({ summary: 'Update vehicle attributes' })
  @ApiResponse({ status: 200, description: 'Vehicle updated' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 422, description: 'Invalid mileage' })
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    const vehicle = await this.vehicleService.update(id, dto);
    return this.toResponse(vehicle);
  }

  @Delete('vehicles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete vehicle' })
  @ApiResponse({ status: 204, description: 'Vehicle deactivated' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 409, description: 'Vehicle has active orders' })
  async deactivate(@Param('id') id: string): Promise<void> {
    await this.vehicleService.deactivate(id);
  }

  private toResponse(vehicle: { id: string; customerId: string; plate: string; brand: string; model: string; year: number; color: string; mileageKm: number; active: boolean; createdAt: Date; updatedAt: Date }) {
    return {
      id: vehicle.id,
      customerId: vehicle.customerId,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      mileageKm: vehicle.mileageKm,
      active: vehicle.active,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }
}

import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerService } from '../../application/customer.service';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { ListCustomersQuery } from './dtos/list-customers.query';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created' })
  @ApiResponse({ status: 409, description: 'Document already registered' })
  @ApiResponse({ status: 400, description: 'Invalid document' })
  async create(@Body() dto: CreateCustomerDto) {
    const customer = await this.customerService.create(dto);
    return {
      id: customer.id,
      documentType: customer.documentType,
      documentNumber: customer.documentNumber,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      active: customer.active,
      createdAt: customer.createdAt,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List customers with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of customers' })
  async findAll(@Query() query: ListCustomersQuery) {
    const result = await this.customerService.findAll(query);
    return {
      data: result.data.map(c => ({
        id: c.id,
        documentType: c.documentType,
        documentNumber: c.documentNumber,
        name: c.name,
        email: c.email,
        phone: c.phone,
        active: c.active,
        createdAt: c.createdAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get('by-document/:documentNumber')
  @ApiOperation({ summary: 'Get customer by document number' })
  @ApiParam({ name: 'documentNumber', description: 'CPF or CNPJ (with or without formatting)' })
  @ApiResponse({ status: 200, description: 'Customer found' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findByDocument(@Param('documentNumber') documentNumber: string) {
    const customer = await this.customerService.findByDocument(documentNumber);
    return {
      id: customer.id,
      documentType: customer.documentType,
      documentNumber: customer.documentNumber,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      active: customer.active,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer found' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id') id: string) {
    const customer = await this.customerService.findById(id);
    return {
      id: customer.id,
      documentType: customer.documentType,
      documentNumber: customer.documentNumber,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      active: customer.active,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer contact info' })
  @ApiResponse({ status: 200, description: 'Customer updated' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const customer = await this.customerService.update(id, dto);
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      updatedAt: customer.updatedAt,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete customer' })
  @ApiResponse({ status: 204, description: 'Customer deactivated' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Customer has active vehicles' })
  async deactivate(@Param('id') id: string): Promise<void> {
    await this.customerService.deactivate(id);
  }
}

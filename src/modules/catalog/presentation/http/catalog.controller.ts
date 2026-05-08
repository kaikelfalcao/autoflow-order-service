import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdjustStockUseCase } from '../../application/use-cases/parts/adjust-stock.use-case';
import { CreatePartUseCase } from '../../application/use-cases/parts/create-part.use-case';
import { DeactivatePartUseCase } from '../../application/use-cases/parts/deactivate-part.use-case';
import { ListPartsUseCase } from '../../application/use-cases/parts/list-parts.use-case';
import { UpdatePartUseCase } from '../../application/use-cases/parts/update-part.use-case';
import { CreateServiceUseCase } from '../../application/use-cases/service/create-service.use-case';
import { DeactivateServiceUseCase } from '../../application/use-cases/service/deactivate-service.use-case';
import { ListServicesUseCase } from '../../application/use-cases/service/list-services.use-case';
import { UpdateServiceUseCase } from '../../application/use-cases/service/update-service.use-case';
import { AdjustStockDto } from './dtos/adjust-stock.dto';
import { CreatePartDto } from './dtos/create-part.dto';
import { CreateServiceDto } from './dtos/create-service.dto';

@Controller('catalog')
@ApiTags('catalog')
export class CatalogController {
  constructor(
    private readonly listServicesUseCase: ListServicesUseCase,
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deactivateServiceUseCase: DeactivateServiceUseCase,
    private readonly listPartsUseCase: ListPartsUseCase,
    private readonly createPartUseCase: CreatePartUseCase,
    private readonly updatePartUseCase: UpdatePartUseCase,
    private readonly deactivatePartUseCase: DeactivatePartUseCase,
    private readonly adjustStockUseCase: AdjustStockUseCase,
  ) {}

  @Get('services')
  @ApiOperation({ summary: 'Lista servicos do catalogo' })
  listServices(@Query('includeInactive') includeInactive?: string) {
    return this.listServicesUseCase.execute(includeInactive === 'true');
  }

  @Post('services')
  @ApiOperation({ summary: 'Cria servico no catalogo' })
  createService(@Body() body: CreateServiceDto) {
    return this.createServiceUseCase.execute(body);
  }

  @Put('services/:id')
  @ApiOperation({ summary: 'Atualiza servico do catalogo' })
  updateService(@Param('id') id: string, @Body() body: Partial<CreateServiceDto>) {
    return this.updateServiceUseCase.execute({ id, ...body });
  }

  @Delete('services/:id')
  @ApiOperation({ summary: 'Desativa servico do catalogo' })
  deactivateService(@Param('id') id: string) {
    return this.deactivateServiceUseCase.execute(id);
  }

  @Get('parts')
  @ApiOperation({ summary: 'Lista pecas do catalogo' })
  listParts(
    @Query('includeInactive') includeInactive?: string,
    @Query('lowStockOnly') lowStockOnly?: string,
  ) {
    return this.listPartsUseCase.execute({
      includeInactive: includeInactive === 'true',
      lowStockOnly: lowStockOnly === 'true',
    });
  }

  @Post('parts')
  @ApiOperation({ summary: 'Cria peca no catalogo' })
  createPart(@Body() body: CreatePartDto) {
    return this.createPartUseCase.execute(body);
  }

  @Put('parts/:id')
  @ApiOperation({ summary: 'Atualiza peca do catalogo' })
  updatePart(@Param('id') id: string, @Body() body: Partial<CreatePartDto>) {
    return this.updatePartUseCase.execute({ id, ...body });
  }

  @Delete('parts/:id')
  @ApiOperation({ summary: 'Desativa peca do catalogo' })
  deactivatePart(@Param('id') id: string) {
    return this.deactivatePartUseCase.execute(id);
  }

  @Patch('parts/:id/stock')
  @ApiOperation({ summary: 'Ajusta estoque de peca' })
  adjustStock(@Param('id') id: string, @Body() body: AdjustStockDto) {
    return this.adjustStockUseCase.execute(id, body.delta);
  }
}


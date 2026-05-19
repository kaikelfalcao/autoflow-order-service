import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AddOrderItemUseCase } from "../../application/use-cases/add-item/add-order-item.use-case";
import { CancelOrderUseCase } from "../../application/use-cases/cancel-order/cancel-order.use-case";
import { GetOrderHistoryUseCase } from "../../application/use-cases/get-order-history/get-order-history.use-case";
import { GetOrderUseCase } from "../../application/use-cases/get-order/get-order.use-case";
import { ListOrdersUseCase } from "../../application/use-cases/list-orders/list-orders.use-case";
import { OpenOrderUseCase } from "../../application/use-cases/open-order/open-order.use-case";
import { RemoveOrderItemUseCase } from "../../application/use-cases/remove-item/remove-order-item.use-case";
import { UpdateOrderStatusUseCase } from "../../application/use-cases/update-status/update-order-status.use-case";
import { AddItemDto } from "./dtos/add-item.dto";
import { OpenOrderDto } from "./dtos/open-order.dto";
import { UpdateOrderStatusDto } from "./dtos/update-order-status.dto";

@Controller("orders")
@ApiTags("orders")
export class OrderController {
  constructor(
    private readonly openOrderUseCase: OpenOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly getOrderHistoryUseCase: GetOrderHistoryUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly addOrderItemUseCase: AddOrderItemUseCase,
    private readonly removeOrderItemUseCase: RemoveOrderItemUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Abre uma nova ordem de servico" })
  @ApiResponse({ status: 201, description: "Ordem criada com sucesso" })
  open(@Body() body: OpenOrderDto) {
    return this.openOrderUseCase.execute(body);
  }

  @Get()
  @ApiOperation({ summary: "Lista ordens com filtros opcionais" })
  @ApiResponse({ status: 200, description: "Lista retornada com sucesso" })
  list(
    @Query("includeClosed") includeClosed?: string,
    @Query("status") status?: string,
  ) {
    return this.listOrdersUseCase.execute({
      includeClosed: includeClosed === "true",
      status,
    });
  }

  @Get("queue")
  @ApiOperation({ summary: "Lista fila operacional de ordens" })
  queue() {
    return this.listOrdersUseCase.execute({
      includeClosed: false,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Consulta detalhes de uma ordem" })
  getById(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.getOrderUseCase.execute(id);
  }

  @Get(":id/history")
  @ApiOperation({ summary: "Consulta historico de status da ordem" })
  getHistory(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.getOrderHistoryUseCase.execute(id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Atualiza status da ordem" })
  updateStatus(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.updateOrderStatusUseCase.execute({
      orderId: id,
      status: body.status,
      changedBy: body.changedBy,
      reason: body.reason,
    });
  }

  @Post(":id/items")
  @ApiOperation({ summary: "Adiciona item em uma ordem" })
  addItem(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() body: AddItemDto,
  ) {
    return this.addOrderItemUseCase.execute({
      orderId: id,
      itemType: body.itemType,
      catalogItemId: body.catalogItemId,
      name: body.name,
      unitPrice: body.unitPrice,
      quantity: body.quantity,
    });
  }

  @Delete(":id/items/:itemId")
  @ApiOperation({ summary: "Remove item da ordem" })
  removeItem(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Param("itemId", new ParseUUIDPipe()) itemId: string,
  ) {
    return this.removeOrderItemUseCase.execute(id, itemId);
  }

  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancela uma ordem" })
  cancel(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() body: { changedBy?: string; reason?: string },
  ) {
    return this.cancelOrderUseCase.execute({
      orderId: id,
      changedBy: body?.changedBy,
      reason: body?.reason,
    });
  }
}

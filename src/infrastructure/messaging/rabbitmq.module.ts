import { Global, Module } from '@nestjs/common';

import { OrderEventPublisher } from '../../modules/order/infrastructure/messaging/order-event-publisher';
import { EventPublisherService } from './event-publisher.service';

@Global()
@Module({
  providers: [EventPublisherService, OrderEventPublisher],
  exports: [EventPublisherService, OrderEventPublisher],
})
export class RabbitMqModule {}


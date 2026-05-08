import { Injectable, Logger } from '@nestjs/common';
import { connect, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';

export interface BaseEvent<TPayload> {
  eventId: string;
  eventType: string;
  timestamp: string;
  source: 'order-service';
  correlationId: string;
  payload: TPayload;
}

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);
  private readonly url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  private readonly connection = connect([this.url]);

  async publish<TPayload>(params: {
    exchange: string;
    routingKey: string;
    event: BaseEvent<TPayload>;
  }): Promise<void> {
    try {
      const channel: ChannelWrapper = this.connection.createChannel({
        setup: async (currentChannel: ConfirmChannel) => {
          await currentChannel.assertExchange(params.exchange, 'topic', {
            durable: true,
          });
        },
      });

      await channel.publish(
        params.exchange,
        params.routingKey,
        Buffer.from(JSON.stringify(params.event)),
        {
          contentType: 'application/json',
          persistent: true,
        },
      );
    } catch (error) {
      // Nao quebra o fluxo principal de negocio se o broker estiver indisponivel.
      const reason = error instanceof Error ? error.message : 'unknown-error';
      this.logger.warn(`Event publish skipped: ${reason}`);
    }
  }
}


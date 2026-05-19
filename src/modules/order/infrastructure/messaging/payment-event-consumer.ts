import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { connect } from "amqp-connection-manager";
import { ConfirmChannel, ConsumeMessage } from "amqplib";

import { recordSagaCompensation } from "../../../../shared/observability/business-events";
import { OrderStatusHistoryService } from "../../application/use-cases/_shared/order-status-history.service";

interface PaymentEventPayload {
  orderId: string;
  reason?: string;
}

@Injectable()
export class PaymentEventConsumer implements OnModuleInit {
  private readonly logger = new Logger(PaymentEventConsumer.name);

  constructor(
    private readonly orderStatusHistoryService: OrderStatusHistoryService,
  ) {}

  async onModuleInit(): Promise<void> {
    const enabled = process.env.ENABLE_PAYMENT_CONSUMER === "true";
    if (!enabled) {
      return;
    }

    const rabbitUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
    const connection = connect([rabbitUrl]);

    const channel = connection.createChannel({
      setup: async (currentChannel: ConfirmChannel) => {
        await currentChannel.assertExchange("payment.events", "topic", {
          durable: true,
        });

        await currentChannel.assertQueue("order.payment.confirmed", {
          durable: true,
        });
        await currentChannel.bindQueue(
          "order.payment.confirmed",
          "payment.events",
          "payment.confirmed",
        );

        await currentChannel.assertQueue("order.payment.failed", {
          durable: true,
        });
        await currentChannel.bindQueue(
          "order.payment.failed",
          "payment.events",
          "payment.failed",
        );

        await currentChannel.assertQueue("order.payment.refunded", {
          durable: true,
        });
        await currentChannel.bindQueue(
          "order.payment.refunded",
          "payment.events",
          "payment.refunded",
        );

        await currentChannel.consume(
          "order.payment.confirmed",
          async (message: ConsumeMessage | null) => {
            if (!message) return;
            const payload = JSON.parse(
              message.content.toString(),
            ) as PaymentEventPayload;

            await this.orderStatusHistoryService.transitionStatus({
              orderId: payload.orderId,
              nextStatus: "PAID",
              changedBy: "payment:event",
              reason: "Payment confirmed",
            });

            currentChannel.ack(message);
          },
        );

        await currentChannel.consume(
          "order.payment.failed",
          async (message: ConsumeMessage | null) => {
            if (!message) return;
            const payload = JSON.parse(
              message.content.toString(),
            ) as PaymentEventPayload;

            await this.orderStatusHistoryService.transitionStatus({
              orderId: payload.orderId,
              nextStatus: "PAYMENT_FAILED",
              changedBy: "payment:event",
              reason: payload.reason ?? "Payment failed",
            });

            await this.orderStatusHistoryService.transitionStatus({
              orderId: payload.orderId,
              nextStatus: "AWAITING_PAYMENT",
              changedBy: "payment:event",
              reason: "Payment retry flow",
            });

            recordSagaCompensation({
              orderId: payload.orderId,
              reason: payload.reason ?? "Payment failed",
              step: "PAYMENT_FAILED",
            });

            currentChannel.ack(message);
          },
        );

        await currentChannel.consume(
          "order.payment.refunded",
          async (message: ConsumeMessage | null) => {
            if (!message) return;
            const payload = JSON.parse(
              message.content.toString(),
            ) as PaymentEventPayload;

            this.logger.log(`Payment refunded for order ${payload.orderId}`);
            recordSagaCompensation({
              orderId: payload.orderId,
              reason: payload.reason ?? "Payment refunded",
              step: "PAYMENT_REFUNDED",
            });
            currentChannel.ack(message);
          },
        );
      },
    });

    channel.on("error", (error) => {
      const reason = error instanceof Error ? error.message : "unknown-error";
      this.logger.warn(`Payment consumer channel error: ${reason}`);
    });
  }
}

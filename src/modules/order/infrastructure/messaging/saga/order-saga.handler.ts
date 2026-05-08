import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderSagaHandler {
  // Handler minimo para manter ponto unico de evolucao da saga coreografada.
  onExternalEvent(eventType: string, payload: unknown): { handled: boolean } {
    return {
      handled: Boolean(eventType && payload),
    };
  }
}


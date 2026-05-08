import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';

interface TraceContext {
  traceId: string;
  spanId: string;
}

@Injectable()
export class TracingService {
  private readonly storage = new AsyncLocalStorage<TraceContext>();

  middleware() {
    return (req: { headers: Record<string, string | string[] | undefined> }, _res: unknown, next: () => void) => {
      const incomingTrace = req.headers['x-trace-id'];
      const traceId =
        typeof incomingTrace === 'string' && incomingTrace.trim().length > 0
          ? incomingTrace
          : randomUUID();

      const context: TraceContext = {
        traceId,
        spanId: randomUUID(),
      };

      this.storage.run(context, () => next());
    };
  }

  getContext(): TraceContext {
    return (
      this.storage.getStore() ?? {
        traceId: randomUUID(),
        spanId: randomUUID(),
      }
    );
  }
}


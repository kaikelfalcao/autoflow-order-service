import { Injectable, LoggerService } from "@nestjs/common";

import { TracingService } from "./tracing.service";

@Injectable()
export class AppLogger implements LoggerService {
  constructor(private readonly tracingService: TracingService) {}

  log(message: unknown, context?: string): void {
    this.print("INFO", message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.print("ERROR", message, context, trace);
  }

  warn(message: unknown, context?: string): void {
    this.print("WARN", message, context);
  }

  debug(message: unknown, context?: string): void {
    this.print("DEBUG", message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.print("VERBOSE", message, context);
  }

  private print(
    level: string,
    message: unknown,
    context?: string,
    trace?: string,
  ): void {
    const { traceId, spanId } = this.tracingService.getContext();
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      context: context ?? "Application",
      message,
      trace,
      traceId,
      spanId,
    };

    // JSON puro para facilitar ingestao por stack de observabilidade.
    process.stdout.write(`${JSON.stringify(payload)}\n`);
  }
}

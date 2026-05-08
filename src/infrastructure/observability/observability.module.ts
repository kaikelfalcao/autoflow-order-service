import { Global, Module } from '@nestjs/common';

import { AppLogger } from './logger';
import { TracingService } from './tracing.service';

@Global()
@Module({
  providers: [TracingService, AppLogger],
  exports: [TracingService, AppLogger],
})
export class ObservabilityModule {}


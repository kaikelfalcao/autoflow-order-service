import 'reflect-metadata';
import { writeFileSync } from 'fs';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AppLogger } from './infrastructure/observability/logger';
import { TracingService } from './infrastructure/observability/tracing.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const tracingService = app.get(TracingService);
  const appLogger = app.get(AppLogger);

  app.use(tracingService.middleware());
  app.useLogger(appLogger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Order Service API')
    .setDescription('API de ciclo de vida de ordem de servico, catalogo, budget e execucao')
    .setVersion('1.0.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  // Mantem um snapshot simples da especificacao para referencia no README.
  writeFileSync('swagger.json', JSON.stringify(swaggerDocument, null, 2));

  await app.listen(process.env.APP_PORT ? Number(process.env.APP_PORT) : 3001);
}

bootstrap();


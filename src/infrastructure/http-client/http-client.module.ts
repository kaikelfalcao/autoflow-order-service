import { HttpModule } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { CustomerServiceClient } from "./customer-service.client";

@Global()
@Module({
  imports: [ConfigModule, HttpModule],
  providers: [CustomerServiceClient],
  exports: [CustomerServiceClient],
})
export class HttpClientModule {}

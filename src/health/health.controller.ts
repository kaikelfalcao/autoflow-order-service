import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: "Liveness e DB check" })
  async check(): Promise<{
    status: "ok" | "degraded";
    service: string;
    postgres: "connected" | "error";
    timestamp: string;
  }> {
    let postgres: "connected" | "error" = "error";
    try {
      await this.dataSource.query("SELECT 1");
      postgres = "connected";
    } catch {
      postgres = "error";
    }
    return {
      status: postgres === "connected" ? "ok" : "degraded",
      service: "autoflow-order-service",
      postgres,
      timestamp: new Date().toISOString(),
    };
  }
}

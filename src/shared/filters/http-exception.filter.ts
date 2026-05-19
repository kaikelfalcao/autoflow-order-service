import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { CustomerNotFoundError } from "../../modules/customers/domain/errors/customer-not-found.error";
import { CustomerAlreadyExistsError } from "../../modules/customers/domain/errors/customer-already-exists.error";
import { CustomerHasActiveVehiclesError } from "../../modules/customers/domain/errors/customer-has-active-vehicles.error";
import { VehicleNotFoundError } from "../../modules/vehicles/domain/errors/vehicle-not-found.error";
import { VehicleAlreadyExistsError } from "../../modules/vehicles/domain/errors/vehicle-already-exists.error";
import { VehicleHasActiveOrdersError } from "../../modules/vehicles/domain/errors/vehicle-has-active-orders.error";
import { InvalidDocumentError } from "../../modules/customers/domain/errors/invalid-document.error";
import { InvalidPlateError } from "../../modules/vehicles/domain/errors/invalid-plate.error";
import { InvalidMileageError } from "../../modules/vehicles/domain/errors/invalid-mileage.error";

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

interface MappedError {
  status: number;
  error: string;
  message: string | string[];
}

const STATUS_TEXT: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const mapped = this.mapException(exception);

    const body: ErrorBody = {
      ...mapped,
      statusCode: mapped.status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(mapped.status).json(body);
  }

  private mapException(exception: unknown): MappedError {
    if (exception instanceof HttpException) {
      return this.mapHttpException(exception);
    }

    if (
      exception instanceof CustomerNotFoundError ||
      exception instanceof VehicleNotFoundError
    ) {
      return {
        status: HttpStatus.NOT_FOUND,
        error: "Not Found",
        message: exception.message,
      };
    }

    if (
      exception instanceof CustomerAlreadyExistsError ||
      exception instanceof VehicleAlreadyExistsError ||
      exception instanceof CustomerHasActiveVehiclesError ||
      exception instanceof VehicleHasActiveOrdersError
    ) {
      return {
        status: HttpStatus.CONFLICT,
        error: "Conflict",
        message: exception.message,
      };
    }

    if (
      exception instanceof InvalidDocumentError ||
      exception instanceof InvalidPlateError
    ) {
      return {
        status: HttpStatus.BAD_REQUEST,
        error: "Bad Request",
        message: exception.message,
      };
    }

    if (exception instanceof InvalidMileageError) {
      return {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        error: "Unprocessable Entity",
        message: exception.message,
      };
    }

    // Fallback: erro inesperado — loga + 500
    const err =
      exception instanceof Error ? exception : new Error(String(exception));
    this.logger.error(`Unhandled exception: ${err.message}`, err.stack);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
      message: "Internal server error",
    };
  }

  private mapHttpException(exception: HttpException): MappedError {
    const status = exception.getStatus();
    const res = exception.getResponse();
    const message = this.extractHttpMessage(res);
    return {
      status,
      error: STATUS_TEXT[status] ?? "Error",
      message,
    };
  }

  private extractHttpMessage(res: string | object): string | string[] {
    if (typeof res === "string") return res;
    if (typeof res !== "object" || res === null) return "Error";
    const raw = (res as Record<string, unknown>)["message"];
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === "string") return raw;
    return "Error";
  }
}

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomerNotFoundError } from '../../modules/customers/domain/errors/customer-not-found.error';
import { CustomerAlreadyExistsError } from '../../modules/customers/domain/errors/customer-already-exists.error';
import { CustomerHasActiveVehiclesError } from '../../modules/customers/domain/errors/customer-has-active-vehicles.error';
import { VehicleNotFoundError } from '../../modules/vehicles/domain/errors/vehicle-not-found.error';
import { VehicleAlreadyExistsError } from '../../modules/vehicles/domain/errors/vehicle-already-exists.error';
import { VehicleHasActiveOrdersError } from '../../modules/vehicles/domain/errors/vehicle-has-active-orders.error';
import { InvalidDocumentError } from '../../modules/customers/domain/errors/invalid-document.error';
import { InvalidPlateError } from '../../modules/vehicles/domain/errors/invalid-plate.error';
import { InvalidMileageError } from '../../modules/vehicles/domain/errors/invalid-mileage.error';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        const raw = body['message'];
        message = Array.isArray(raw) ? raw.map(String) : typeof raw === 'string' ? raw : message;
      }
      error = this.statusToText(status);
    } else if (exception instanceof CustomerNotFoundError || exception instanceof VehicleNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      error = 'Not Found';
      message = (exception as Error).message;
    } else if (exception instanceof CustomerAlreadyExistsError || exception instanceof VehicleAlreadyExistsError) {
      status = HttpStatus.CONFLICT;
      error = 'Conflict';
      message = (exception as Error).message;
    } else if (exception instanceof CustomerHasActiveVehiclesError || exception instanceof VehicleHasActiveOrdersError) {
      status = HttpStatus.CONFLICT;
      error = 'Conflict';
      message = (exception as Error).message;
    } else if (exception instanceof InvalidDocumentError || exception instanceof InvalidPlateError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Bad Request';
      message = (exception as Error).message;
    } else if (exception instanceof InvalidMileageError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      error = 'Unprocessable Entity';
      message = (exception as Error).message;
    } else {
      const err = exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(`Unhandled exception: ${err.message}`, err.stack);
    }

    const body: ErrorBody = {
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path,
    };

    response.status(status).json(body);
  }

  private statusToText(status: number): string {
    const map: Record<number, string> = {
      400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
      404: 'Not Found', 409: 'Conflict', 422: 'Unprocessable Entity',
      500: 'Internal Server Error',
    };
    return map[status] ?? 'Error';
  }
}

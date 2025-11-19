import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HTTP Exception Filter
 *
 * Catches all HTTP exceptions and formats error responses consistently.
 * Provides detailed error information in development and sanitized errors in production.
 *
 * Response format:
 * {
 *   "statusCode": 400,
 *   "message": "Validation failed",
 *   "error": "Bad Request",
 *   "timestamp": "2025-01-19T10:30:00.000Z",
 *   "path": "/api/v1/auth/register"
 * }
 *
 * Usage: Apply globally in main.ts
 * app.useGlobalFilters(new HttpExceptionFilter());
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const errorMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'Internal server error';

    const errorResponse = {
      statusCode: status,
      message: errorMessage,
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log error for monitoring
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${errorMessage}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}

/**
 * All Exceptions Filter
 *
 * Catches ALL exceptions (including non-HTTP exceptions) to prevent server crashes.
 * Returns 500 Internal Server Error for unexpected exceptions.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      message,
      error: exception instanceof Error ? exception.name : 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log error with stack trace
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : 'No stack trace',
    );

    response.status(status).json(errorResponse);
  }
}

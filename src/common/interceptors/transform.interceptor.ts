import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

/**
 * Transform Interceptor
 *
 * Standardizes API responses by wrapping data in a consistent format.
 * This ensures all responses from the API follow the same structure.
 *
 * @example
 * // Without interceptor:
 * { "id": 1, "title": "Chapter 1" }
 *
 * // With interceptor:
 * { "data": { "id": 1, "title": "Chapter 1" } }
 *
 * Usage: Apply globally in main.ts
 * app.useGlobalInterceptors(new TransformInterceptor());
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}

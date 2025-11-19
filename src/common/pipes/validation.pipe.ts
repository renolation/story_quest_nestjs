import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Custom Validation Pipe
 *
 * Validates incoming request data against DTO class-validator decorators.
 * Throws BadRequestException with detailed error messages if validation fails.
 *
 * Features:
 * - Automatic DTO validation
 * - Detailed error messages for debugging
 * - Whitelist: strips properties not defined in DTO
 * - Transform: converts plain objects to class instances
 *
 * Usage: Apply globally in main.ts
 * app.useGlobalPipes(new ValidationPipe());
 *
 * Or use NestJS built-in ValidationPipe with options:
 * app.useGlobalPipes(new ValidationPipe({
 *   whitelist: true,
 *   transform: true,
 *   forbidNonWhitelisted: true,
 * }));
 */
@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));

      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

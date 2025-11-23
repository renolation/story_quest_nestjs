import { PartialType } from '@nestjs/swagger';
import { CreateClassDto } from './create-class.dto';

/**
 * Update Class DTO
 *
 * All fields are optional for updates.
 */
export class UpdateClassDto extends PartialType(CreateClassDto) {}

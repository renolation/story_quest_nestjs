import { PartialType } from '@nestjs/swagger';
import { CreateServicePackageDto } from './create-service-package.dto';

/**
 * DTO for updating an existing service package
 * All fields are optional (inherited from CreateServicePackageDto via PartialType)
 * Only AGENCY role can update packages
 */
export class UpdateServicePackageDto extends PartialType(CreateServicePackageDto) {}

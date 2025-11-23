import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicePackage } from './entities/service-package.entity';
import { CreateServicePackageDto } from './dto/create-service-package.dto';
import { UpdateServicePackageDto } from './dto/update-service-package.dto';
import {
  ServicePackageResponseDto,
  PaginatedServicePackagesResponseDto,
} from './dto/service-package-response.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums';

/**
 * Service Packages Service
 *
 * Phase: 2 (Content & Packages)
 * Status: ✅ IMPLEMENTED
 * Priority: HIGH
 *
 * Business logic:
 * - AGENCY creates subscription packages/plans for CENTERS
 * - Packages define limits: max students, branches, teachers
 * - Pricing: monthly and yearly options
 * - Features stored as JSONB for flexibility
 * - CENTERS can view and purchase active packages
 *
 * Access Control:
 * - AGENCY role: Full CRUD access to all packages
 * - CENTER role: Read access to active packages only
 * - TEACHER/REVIEWER: Read access to active packages
 * - STUDENT: No access
 */
@Injectable()
export class ServicePackagesService {
  constructor(
    @InjectRepository(ServicePackage)
    private servicePackageRepository: Repository<ServicePackage>,
  ) {}

  /**
   * Create a new service package
   * Only AGENCY can create packages
   *
   * @param createServicePackageDto - Package creation data
   * @param currentUser - Current authenticated user (must be AGENCY)
   * @returns Created package
   * @throws ForbiddenException if not AGENCY role
   * @throws ConflictException if package name already exists
   */
  async create(
    createServicePackageDto: CreateServicePackageDto,
    currentUser?: User,
  ): Promise<ServicePackage> {
    // Only AGENCY role can create packages
    if (currentUser && currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY role can create service packages');
    }

    const { name } = createServicePackageDto;

    // Check if package name already exists
    const existingPackage = await this.servicePackageRepository.findOne({
      where: { name },
    });
    if (existingPackage) {
      throw new ConflictException(`Package with name "${name}" already exists`);
    }

    // Create package
    const servicePackage = this.servicePackageRepository.create(createServicePackageDto);
    return await this.servicePackageRepository.save(servicePackage);
  }

  /**
   * Find all service packages with pagination and filtering
   *
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @param isActive - Filter by active status
   * @param search - Search by name or description
   * @param currentUser - Current authenticated user
   * @returns Paginated list of packages
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    isActive?: boolean,
    search?: string,
    currentUser?: User,
  ): Promise<PaginatedServicePackagesResponseDto> {
    // Build query
    const queryBuilder = this.servicePackageRepository
      .createQueryBuilder('package')
      .orderBy('package.createdAt', 'DESC');

    // Non-AGENCY users can only see active packages
    if (currentUser && currentUser.role !== UserRole.AGENCY) {
      queryBuilder.andWhere('package.isActive = :isActive', { isActive: true });
    } else if (isActive !== undefined) {
      // AGENCY can filter by isActive
      queryBuilder.andWhere('package.isActive = :isActive', { isActive });
    }

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(package.name ILIKE :search OR package.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [packages, total] = await queryBuilder.getManyAndCount();

    // Map to response DTOs
    const data: ServicePackageResponseDto[] = packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      features: pkg.features,
      maxStudents: pkg.maxStudents,
      maxBranches: pkg.maxBranches,
      maxTeachers: pkg.maxTeachers,
      priceMonthly: pkg.priceMonthly,
      priceYearly: pkg.priceYearly,
      trialDays: pkg.trialDays,
      isActive: pkg.isActive,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
    }));

    // Return paginated response
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single service package by ID
   *
   * @param id - Package ID
   * @param currentUser - Current authenticated user
   * @returns Package details
   * @throws NotFoundException if package not found
   * @throws ForbiddenException if non-AGENCY user tries to view inactive package
   */
  async findOne(id: number, currentUser?: User): Promise<ServicePackageResponseDto> {
    // Find package
    const servicePackage = await this.servicePackageRepository.findOne({
      where: { id },
    });

    if (!servicePackage) {
      throw new NotFoundException(`Service package with ID ${id} not found`);
    }

    // Non-AGENCY users can only view active packages
    if (currentUser && currentUser.role !== UserRole.AGENCY && !servicePackage.isActive) {
      throw new ForbiddenException('You do not have permission to view inactive packages');
    }

    // Map to response DTO
    return {
      id: servicePackage.id,
      name: servicePackage.name,
      description: servicePackage.description,
      features: servicePackage.features,
      maxStudents: servicePackage.maxStudents,
      maxBranches: servicePackage.maxBranches,
      maxTeachers: servicePackage.maxTeachers,
      priceMonthly: servicePackage.priceMonthly,
      priceYearly: servicePackage.priceYearly,
      trialDays: servicePackage.trialDays,
      isActive: servicePackage.isActive,
      createdAt: servicePackage.createdAt.toISOString(),
      updatedAt: servicePackage.updatedAt.toISOString(),
    };
  }

  /**
   * Update a service package
   * Only AGENCY can update packages
   *
   * @param id - Package ID
   * @param updateServicePackageDto - Update data
   * @param currentUser - Current authenticated user (must be AGENCY)
   * @returns Updated package
   * @throws NotFoundException if package not found
   * @throws ConflictException if new name already exists
   * @throws ForbiddenException if not AGENCY role
   */
  async update(
    id: number,
    updateServicePackageDto: UpdateServicePackageDto,
    currentUser?: User,
  ): Promise<ServicePackage> {
    // Only AGENCY role can update packages
    if (currentUser && currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY role can update service packages');
    }

    // Find package
    const servicePackage = await this.servicePackageRepository.findOne({
      where: { id },
    });

    if (!servicePackage) {
      throw new NotFoundException(`Service package with ID ${id} not found`);
    }

    // Check if new name already exists (if name is being updated)
    if (updateServicePackageDto.name && updateServicePackageDto.name !== servicePackage.name) {
      const existingPackage = await this.servicePackageRepository.findOne({
        where: { name: updateServicePackageDto.name },
      });

      if (existingPackage) {
        throw new ConflictException(
          `Package with name "${updateServicePackageDto.name}" already exists`,
        );
      }
    }

    // Update package
    Object.assign(servicePackage, updateServicePackageDto);
    return await this.servicePackageRepository.save(servicePackage);
  }

  /**
   * Delete (soft delete) a service package
   * Only AGENCY can delete packages
   *
   * @param id - Package ID
   * @param currentUser - Current authenticated user (must be AGENCY)
   * @throws NotFoundException if package not found
   * @throws ForbiddenException if not AGENCY role
   */
  async remove(id: number, currentUser?: User): Promise<void> {
    // Only AGENCY role can delete packages
    if (currentUser && currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY role can delete service packages');
    }

    // Find package
    const servicePackage = await this.servicePackageRepository.findOne({
      where: { id },
    });

    if (!servicePackage) {
      throw new NotFoundException(`Service package with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    servicePackage.isActive = false;
    await this.servicePackageRepository.save(servicePackage);
  }

  /**
   * Activate a service package
   * Only AGENCY can activate packages
   *
   * @param id - Package ID
   * @param currentUser - Current authenticated user (must be AGENCY)
   * @returns Activated package
   * @throws NotFoundException if package not found
   * @throws ForbiddenException if not AGENCY role
   */
  async activate(id: number, currentUser?: User): Promise<ServicePackage> {
    // Only AGENCY role can activate packages
    if (currentUser && currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY role can activate service packages');
    }

    const servicePackage = await this.servicePackageRepository.findOne({
      where: { id },
    });

    if (!servicePackage) {
      throw new NotFoundException(`Service package with ID ${id} not found`);
    }

    servicePackage.isActive = true;
    return await this.servicePackageRepository.save(servicePackage);
  }

  /**
   * Deactivate a service package
   * Only AGENCY can deactivate packages
   *
   * @param id - Package ID
   * @param currentUser - Current authenticated user (must be AGENCY)
   * @returns Deactivated package
   * @throws NotFoundException if package not found
   * @throws ForbiddenException if not AGENCY role
   */
  async deactivate(id: number, currentUser?: User): Promise<ServicePackage> {
    // Only AGENCY role can deactivate packages
    if (currentUser && currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY role can deactivate service packages');
    }

    const servicePackage = await this.servicePackageRepository.findOne({
      where: { id },
    });

    if (!servicePackage) {
      throw new NotFoundException(`Service package with ID ${id} not found`);
    }

    servicePackage.isActive = false;
    return await this.servicePackageRepository.save(servicePackage);
  }

  /**
   * Helper method to find package by ID without access control
   * Used internally by other services (e.g., subscriptions)
   *
   * @param id - Package ID
   * @returns Package entity
   * @throws NotFoundException if package not found
   */
  async findOneById(id: number): Promise<ServicePackage> {
    const servicePackage = await this.servicePackageRepository.findOne({
      where: { id },
    });
    if (!servicePackage) {
      throw new NotFoundException(`Service package with ID ${id} not found`);
    }
    return servicePackage;
  }
}

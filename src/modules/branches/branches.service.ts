import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchQueryDto } from './dto/branch-query.dto';
import {
  BranchResponseDto,
  PaginatedBranchesResponseDto,
} from './dto/branch-response.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums';
import { CentersService } from '../centers/centers.service';

/**
 * Branches Service
 *
 * Phase: 7
 * Status: ✅ IMPLEMENTED
 * Priority: HIGH
 *
 * Business logic:
 * - CRUD operations for branches
 * - List branches by center
 * - Branch activation/deactivation
 * - Role-based access control
 *
 * Access Control:
 * - AGENCY role: Full access to all branches
 * - CENTER role: CRUD access to own center's branches only
 * - Other roles: No access
 */
@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    private centersService: CentersService,
  ) {}

  /**
   * Create a new branch
   *
   * @param createBranchDto - Branch creation data
   * @param currentUser - Current authenticated user
   * @returns Created branch with center relation
   * @throws NotFoundException if center not found
   * @throws ForbiddenException if unauthorized
   */
  async create(
    createBranchDto: CreateBranchDto,
    currentUser: User,
  ): Promise<Branch> {
    // Validate that center exists
    const center = await this.centersService.findOneById(
      createBranchDto.centerId,
    );

    // Role-based access control
    if (currentUser.role === UserRole.CENTER) {
      // CENTER role: Can only create branches for their own center
      // Check if the center belongs to the current user
      if (center.agencyId !== currentUser.id) {
        throw new ForbiddenException(
          'You can only create branches for your own center',
        );
      }
    } else if (currentUser.role === UserRole.AGENCY) {
      // AGENCY role: Can create branches for any center
    } else {
      // Other roles have no access
      throw new ForbiddenException(
        'You do not have permission to create branches',
      );
    }

    // Validate email uniqueness if provided
    if (createBranchDto.email) {
      const existingBranch = await this.branchRepository.findOne({
        where: { email: createBranchDto.email },
      });

      if (existingBranch) {
        throw new ConflictException(
          `Branch with email ${createBranchDto.email} already exists`,
        );
      }
    }

    // Create and save branch
    const branch = this.branchRepository.create(createBranchDto);
    const savedBranch = await this.branchRepository.save(branch);

    // Return with center relation
    const branchWithRelations = await this.branchRepository.findOne({
      where: { id: savedBranch.id },
      relations: ['center'],
    });

    if (!branchWithRelations) {
      throw new NotFoundException(
        `Branch with ID ${savedBranch.id} not found after creation`,
      );
    }

    return branchWithRelations;
  }

  /**
   * Find all branches with pagination, filtering, and sorting
   *
   * @param query - Query parameters (pagination, filters, sorting)
   * @param currentUser - Current authenticated user
   * @returns Paginated list of branches
   * @throws ForbiddenException if unauthorized
   */
  async findAll(
    query: BranchQueryDto,
    currentUser: User,
  ): Promise<PaginatedBranchesResponseDto> {
    const {
      page = 1,
      limit = 20,
      orderBy = 'createdAt',
      order = 'DESC',
      centerId,
      isActive,
      search,
    } = query;

    // Build query
    const queryBuilder = this.branchRepository
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.center', 'center');

    // Role-based access control
    if (currentUser.role === UserRole.CENTER) {
      // CENTER can only see branches of their own center
      // Find all centers owned by this user
      queryBuilder.andWhere('center.agencyId = :currentUserId', {
        currentUserId: currentUser.id,
      });
    } else if (currentUser.role === UserRole.AGENCY) {
      // AGENCY can see all branches (no additional filter needed)
    } else {
      // Other roles have no access
      throw new ForbiddenException(
        'You do not have permission to view branches',
      );
    }

    // Apply filters
    if (centerId) {
      queryBuilder.andWhere('branch.centerId = :centerId', { centerId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('branch.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(branch.name ILIKE :search OR branch.address ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    const orderByField = `branch.${orderBy}`;
    queryBuilder.orderBy(orderByField, order);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [branches, total] = await queryBuilder.getManyAndCount();

    // Map to response DTOs
    const data: BranchResponseDto[] = branches.map((branch) => ({
      id: branch.id,
      centerId: branch.centerId,
      center: branch.center
        ? {
            id: branch.center.id,
            name: branch.center.name,
          }
        : null,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      isActive: branch.isActive,
      createdAt: branch.createdAt.toISOString(),
      updatedAt: branch.updatedAt.toISOString(),
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
   * Find a single branch by ID
   *
   * @param id - Branch ID
   * @param currentUser - Current authenticated user
   * @returns Branch with center relation
   * @throws NotFoundException if branch not found
   * @throws ForbiddenException if unauthorized
   */
  async findOne(id: number, currentUser: User): Promise<BranchResponseDto> {
    // Find branch with relations
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: ['center'],
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    // Role-based access control
    if (currentUser.role === UserRole.CENTER) {
      // CENTER can only view branches of their own center
      if (!branch.center || branch.center.agencyId !== currentUser.id) {
        throw new ForbiddenException(
          'You do not have permission to view this branch',
        );
      }
    } else if (currentUser.role === UserRole.AGENCY) {
      // AGENCY can view any branch
    } else {
      // Other roles have no access
      throw new ForbiddenException(
        'You do not have permission to view this branch',
      );
    }

    // Map to response DTO
    return {
      id: branch.id,
      centerId: branch.centerId,
      center: branch.center
        ? {
            id: branch.center.id,
            name: branch.center.name,
          }
        : null,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      isActive: branch.isActive,
      createdAt: branch.createdAt.toISOString(),
      updatedAt: branch.updatedAt.toISOString(),
    };
  }

  /**
   * Update a branch
   *
   * @param id - Branch ID
   * @param updateBranchDto - Update data
   * @param currentUser - Current authenticated user
   * @returns Updated branch
   * @throws NotFoundException if branch not found
   * @throws ConflictException if email already exists
   * @throws ForbiddenException if unauthorized
   */
  async update(
    id: number,
    updateBranchDto: UpdateBranchDto,
    currentUser: User,
  ): Promise<Branch> {
    // Find branch with center relation
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: ['center'],
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    // Role-based access control
    if (currentUser.role === UserRole.CENTER) {
      // CENTER can only update branches of their own center
      if (!branch.center || branch.center.agencyId !== currentUser.id) {
        throw new ForbiddenException(
          'You do not have permission to update this branch',
        );
      }

      // CENTER role cannot change centerId to another center
      if (
        updateBranchDto.centerId &&
        updateBranchDto.centerId !== branch.centerId
      ) {
        throw new ForbiddenException(
          'You cannot transfer branches to another center',
        );
      }
    } else if (currentUser.role === UserRole.AGENCY) {
      // AGENCY can update any branch
      // If changing centerId, validate that the new center exists
      if (
        updateBranchDto.centerId &&
        updateBranchDto.centerId !== branch.centerId
      ) {
        await this.centersService.findOneById(updateBranchDto.centerId);
      }
    } else {
      // Other roles have no access
      throw new ForbiddenException(
        'You do not have permission to update this branch',
      );
    }

    // Validate email uniqueness if updating email
    if (updateBranchDto.email && updateBranchDto.email !== branch.email) {
      const existingBranch = await this.branchRepository.findOne({
        where: { email: updateBranchDto.email },
      });

      if (existingBranch) {
        throw new ConflictException(
          `Branch with email ${updateBranchDto.email} already exists`,
        );
      }
    }

    // Update branch
    Object.assign(branch, updateBranchDto);
    return await this.branchRepository.save(branch);
  }

  /**
   * Delete a branch (hard delete)
   *
   * @param id - Branch ID
   * @param currentUser - Current authenticated user
   * @throws NotFoundException if branch not found
   * @throws ForbiddenException if unauthorized
   */
  async remove(id: number, currentUser: User): Promise<void> {
    // Find branch with center relation
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: ['center'],
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    // Role-based access control
    if (currentUser.role === UserRole.CENTER) {
      // CENTER can delete branches of their own center
      if (!branch.center || branch.center.agencyId !== currentUser.id) {
        throw new ForbiddenException(
          'You do not have permission to delete this branch',
        );
      }
    } else if (currentUser.role === UserRole.AGENCY) {
      // AGENCY can delete any branch
    } else {
      // Other roles have no access
      throw new ForbiddenException(
        'You do not have permission to delete this branch',
      );
    }

    // Hard delete
    await this.branchRepository.remove(branch);
  }

  /**
   * Helper method to find branch by ID without access control
   * Used internally by other services
   *
   * @param id - Branch ID
   * @returns Branch entity
   * @throws NotFoundException if branch not found
   */
  async findOneById(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: ['center'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }
}

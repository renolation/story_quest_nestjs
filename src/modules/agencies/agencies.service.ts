import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency, AgencyStatus } from './entities/agency.entity';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import {
  AgencyResponseDto,
  PaginatedAgenciesResponseDto,
} from './dto/agency-response.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums';

/**
 * Agencies Service
 *
 * Phase: 1 (Foundation)
 * Status: ✅ IMPLEMENTED
 * Priority: CRITICAL
 *
 * Business logic:
 * - CRUD operations for agencies (super admin organizations)
 * - Agency status management (active/inactive/suspended)
 * - List centers for an agency
 * - Agency analytics and reporting
 *
 * Access Control:
 * - AGENCY role: Full CRUD access to all agencies
 * - Other roles: No access (highly restricted)
 */
@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new agency
   *
   * @param createAgencyDto - Agency creation data
   * @param currentUser - Current authenticated user (must be SUPER ADMIN)
   * @returns Created agency with relations
   * @throws ConflictException if email already exists
   * @throws ForbiddenException if not SUPER ADMIN
   */
  async create(
    createAgencyDto: CreateAgencyDto,
    currentUser?: User,
  ): Promise<Agency> {
    // Only SUPER ADMIN can create agencies (or if no user provided for system init)
    if (currentUser) {
      if (currentUser.role !== UserRole.AGENCY) {
        throw new ForbiddenException('Only AGENCY role can create new agencies');
      }

      if (!currentUser.isSuperAdmin) {
        throw new ForbiddenException(
          'Only the SUPER ADMIN can create new agencies. Regular agency users cannot create agencies.',
        );
      }
    }

    const { email } = createAgencyDto;

    // Validate email uniqueness
    const existingAgency = await this.agencyRepository.findOne({
      where: { email },
    });
    if (existingAgency) {
      throw new ConflictException(
        `Agency with email ${email} already exists`,
      );
    }

    // Create agency
    const agency = this.agencyRepository.create({
      ...createAgencyDto,
      status: AgencyStatus.ACTIVE,
    });

    const savedAgency = await this.agencyRepository.save(agency);

    // Return with relations
    const agencyWithRelations = await this.agencyRepository.findOne({
      where: { id: savedAgency.id },
      relations: ['centers'],
    });

    if (!agencyWithRelations) {
      throw new NotFoundException(
        `Agency with ID ${savedAgency.id} not found after creation`,
      );
    }

    return agencyWithRelations;
  }

  /**
   * Find all agencies with pagination and filtering
   *
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @param status - Filter by status
   * @param search - Search by name or email
   * @param currentUser - Current authenticated user
   * @returns Paginated list of agencies
   * @throws ForbiddenException if unauthorized
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    status?: AgencyStatus,
    search?: string,
    currentUser?: User,
  ): Promise<PaginatedAgenciesResponseDto> {
    // Only AGENCY role can view agencies
    if (currentUser && currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException(
        'You do not have permission to view agencies',
      );
    }

    // Build query
    const queryBuilder = this.agencyRepository
      .createQueryBuilder('agency')
      .leftJoin('agency.centers', 'centers')
      .addSelect('COUNT(DISTINCT centers.id)', 'centersCount')
      .groupBy('agency.id');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('agency.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(agency.name ILIKE :search OR agency.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    queryBuilder.orderBy('agency.createdAt', 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [agencies, total] = await queryBuilder.getManyAndCount();

    // Get counts for each agency
    const agenciesWithCounts = await Promise.all(
      agencies.map(async (agency) => {
        const centersCount = await this.agencyRepository
          .createQueryBuilder('agency')
          .leftJoin('agency.centers', 'centers')
          .where('agency.id = :id', { id: agency.id })
          .select('COUNT(DISTINCT centers.id)', 'count')
          .getRawOne();

        return {
          ...agency,
          centersCount: parseInt(centersCount?.count || '0', 10),
        };
      }),
    );

    // Map to response DTOs
    const data: AgencyResponseDto[] = agenciesWithCounts.map((agency) => ({
      id: agency.id,
      name: agency.name,
      email: agency.email,
      phone: agency.phone,
      address: agency.address,
      logoUrl: agency.logoUrl,
      description: agency.description,
      status: agency.status,
      centersCount: agency.centersCount,
      createdAt: agency.createdAt.toISOString(),
      updatedAt: agency.updatedAt.toISOString(),
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
   * Find a single agency by ID
   *
   * @param id - Agency ID
   * @param currentUser - Current authenticated user
   * @returns Agency with relations
   * @throws NotFoundException if agency not found
   * @throws ForbiddenException if unauthorized
   */
  async findOne(id: number, currentUser?: User): Promise<AgencyResponseDto> {
    // Only AGENCY role can view agencies
    if (currentUser && currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException(
        'You do not have permission to view this agency',
      );
    }

    // Find agency with relations
    const agency = await this.agencyRepository.findOne({
      where: { id },
      relations: ['centers'],
    });

    if (!agency) {
      throw new NotFoundException(`Agency with ID ${id} not found`);
    }

    // Count centers
    const centersCount = agency.centers ? agency.centers.length : 0;

    // Map to response DTO
    return {
      id: agency.id,
      name: agency.name,
      email: agency.email,
      phone: agency.phone,
      address: agency.address,
      logoUrl: agency.logoUrl,
      description: agency.description,
      status: agency.status,
      centersCount,
      createdAt: agency.createdAt.toISOString(),
      updatedAt: agency.updatedAt.toISOString(),
    };
  }

  /**
   * Update an agency
   *
   * @param id - Agency ID
   * @param updateAgencyDto - Update data
   * @param currentUser - Current authenticated user
   * @returns Updated agency
   * @throws NotFoundException if agency not found
   * @throws ConflictException if email already exists
   * @throws ForbiddenException if unauthorized
   */
  async update(
    id: number,
    updateAgencyDto: UpdateAgencyDto,
    currentUser?: User,
  ): Promise<Agency> {
    // Only AGENCY role can update agencies
    if (currentUser && currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException(
        'You do not have permission to update this agency',
      );
    }

    // Find agency
    const agency = await this.agencyRepository.findOne({
      where: { id },
      relations: ['centers'],
    });

    if (!agency) {
      throw new NotFoundException(`Agency with ID ${id} not found`);
    }

    // Validate email uniqueness if updating email
    if (updateAgencyDto.email && updateAgencyDto.email !== agency.email) {
      const existingAgency = await this.agencyRepository.findOne({
        where: { email: updateAgencyDto.email },
      });

      if (existingAgency) {
        throw new ConflictException(
          `Agency with email ${updateAgencyDto.email} already exists`,
        );
      }
    }

    // Validate status enum if provided
    if (updateAgencyDto.status) {
      if (!Object.values(AgencyStatus).includes(updateAgencyDto.status)) {
        throw new BadRequestException(
          `Invalid status. Must be one of: ${Object.values(AgencyStatus).join(', ')}`,
        );
      }
    }

    // Update agency
    Object.assign(agency, updateAgencyDto);
    return await this.agencyRepository.save(agency);
  }

  /**
   * Delete (soft delete) an agency
   *
   * @param id - Agency ID
   * @param currentUser - Current authenticated user
   * @throws NotFoundException if agency not found
   * @throws ForbiddenException if not AGENCY role
   */
  async remove(id: number, currentUser?: User): Promise<void> {
    // Only AGENCY role can delete agencies
    if (currentUser && currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY role can delete agencies');
    }

    // Find agency
    const agency = await this.agencyRepository.findOne({
      where: { id },
    });

    if (!agency) {
      throw new NotFoundException(`Agency with ID ${id} not found`);
    }

    // Soft delete by setting status to 'suspended'
    agency.status = AgencyStatus.SUSPENDED;
    await this.agencyRepository.save(agency);
  }

  /**
   * Suspend an agency
   *
   * @param id - Agency ID
   * @param currentUser - Current authenticated user
   * @returns Updated agency
   * @throws NotFoundException if agency not found
   * @throws ForbiddenException if unauthorized
   */
  async suspend(id: number, currentUser?: User): Promise<Agency> {
    // Only AGENCY role can suspend agencies
    if (currentUser && currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY role can suspend agencies');
    }

    const agency = await this.agencyRepository.findOne({ where: { id } });

    if (!agency) {
      throw new NotFoundException(`Agency with ID ${id} not found`);
    }

    agency.status = AgencyStatus.SUSPENDED;
    return await this.agencyRepository.save(agency);
  }

  /**
   * Activate an agency
   *
   * @param id - Agency ID
   * @param currentUser - Current authenticated user
   * @returns Updated agency
   * @throws NotFoundException if agency not found
   * @throws ForbiddenException if unauthorized
   */
  async activate(id: number, currentUser?: User): Promise<Agency> {
    // Only AGENCY role can activate agencies
    if (currentUser && currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY role can activate agencies');
    }

    const agency = await this.agencyRepository.findOne({ where: { id } });

    if (!agency) {
      throw new NotFoundException(`Agency with ID ${id} not found`);
    }

    agency.status = AgencyStatus.ACTIVE;
    return await this.agencyRepository.save(agency);
  }

  /**
   * Helper method to find agency by ID without access control
   * Used internally by other services
   *
   * @param id - Agency ID
   * @returns Agency entity
   * @throws NotFoundException if agency not found
   */
  async findOneById(id: number): Promise<Agency> {
    const agency = await this.agencyRepository.findOne({ where: { id } });
    if (!agency) {
      throw new NotFoundException(`Agency with ID ${id} not found`);
    }
    return agency;
  }
}

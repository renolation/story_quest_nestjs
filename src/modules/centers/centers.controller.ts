import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CentersService } from './centers.service';
import {
  CreateCenterDto,
  UpdateCenterDto,
  CenterResponseDto,
  CenterQueryDto,
  PaginatedCentersResponseDto,
  CenterAnalyticsDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';

/**
 * Centers Controller
 *
 * Phase: 7
 * Status: ✅ IMPLEMENTED
 * Priority: HIGH
 *
 * Manages center CRUD operations and analytics
 *
 * Access Control:
 * - AGENCY: Full access to all centers
 * - CENTER: Can view and update own center only
 * - Other roles: No access
 */
@ApiTags('centers')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('centers')
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  /**
   * Create a new center
   * AGENCY role only
   */
  @Post()
  @Roles(UserRole.AGENCY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new center',
    description:
      'Create a new learning center. Only AGENCY role can create centers. CENTER role cannot create new centers.',
    externalDocs: {
      description: 'Web Dashboard Implementation Guide',
      url: '/docs/WEB_DASHBOARD_IMPLEMENTATION_GUIDE.md',
    },
  })
  @ApiBody({ type: CreateCenterDto })
  @ApiResponse({
    status: 201,
    description: 'Center created successfully',
    type: CenterResponseDto,
    example: {
      id: 1,
      name: 'ABC English Center',
      email: 'contact@abcenglish.com',
      phone: '+84901234567',
      address: '123 Main Street, Hanoi',
      logoUrl: 'https://example.com/logo.png',
      businessLicense: 'BL-2025-ABC-001',
      status: 'active',
      agencyId: 1,
      agency: {
        id: 1,
        username: 'agency_admin',
        email: 'admin@agency.com',
      },
      branchesCount: 0,
      chaptersCount: 0,
      createdAt: '2025-01-22T00:00:00Z',
      updatedAt: '2025-01-22T00:00:00Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'name should not be empty',
          'email must be a valid email',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY role can create centers',
    schema: {
      example: {
        statusCode: 403,
        message: 'CENTER role is not allowed to create new centers',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Center with email contact@abcenglish.com already exists',
        error: 'Conflict',
      },
    },
  })
  async create(
    @Body() createCenterDto: CreateCenterDto,
    @CurrentUser() user: User,
  ): Promise<CenterResponseDto> {
    const center = await this.centersService.create(createCenterDto, user);

    // Map entity to response DTO
    return {
      id: center.id,
      name: center.name,
      email: center.email,
      phone: center.phone,
      address: center.address,
      logoUrl: center.logoUrl,
      businessLicense: center.businessLicense,
      status: center.status,
      userId: center.userId,
      agencyId: center.agencyId,
      agency: center.agency
        ? {
            id: center.agency.id,
            name: center.agency.name,
            email: center.agency.email,
          }
        : null,
      branchesCount: center.branches ? center.branches.length : 0,
      chaptersCount: center.chapters ? center.chapters.length : 0,
      createdAt: center.createdAt.toISOString(),
      updatedAt: center.updatedAt.toISOString(),
    };
  }

  /**
   * List all centers (AGENCY) or own center (CENTER)
   * Supports pagination, filtering, and sorting
   */
  @Get()
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'List centers with pagination and filters',
    description: `Retrieve a paginated list of centers with filtering and sorting options.

Access Control:
- AGENCY: Can see all centers
- CENTER: Can see only their own center

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20, max: 100)
- orderBy: Sort field (default: createdAt)
- order: Sort order ASC/DESC (default: DESC)
- status: Filter by center status (active, inactive, suspended)
- agencyId: Filter by agency ID
- search: Search by center name or email`,
  })
  @ApiResponse({
    status: 200,
    description: 'Centers retrieved successfully',
    type: PaginatedCentersResponseDto,
    example: {
      data: [
        {
          id: 1,
          name: 'ABC English Center',
          email: 'contact@abcenglish.com',
          phone: '+84901234567',
          address: '123 Main Street, Hanoi',
          logoUrl: 'https://example.com/logo.png',
          businessLicense: 'BL-2025-ABC-001',
          status: 'active',
          agencyId: 1,
          agency: {
            id: 1,
            username: 'agency_admin',
            email: 'admin@agency.com',
          },
          branchesCount: 3,
          chaptersCount: 12,
          createdAt: '2025-01-22T00:00:00Z',
          updatedAt: '2025-01-22T00:00:00Z',
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have permission to view centers',
        error: 'Forbidden',
      },
    },
  })
  findAll(
    @Query() query: CenterQueryDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedCentersResponseDto> {
    return this.centersService.findAll(query, user);
  }

  /**
   * Get a single center by ID
   * AGENCY can view any center, CENTER can view own center only
   */
  @Get(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Get center details by ID',
    description: `Retrieve detailed information about a specific center including branches and chapters count.

Access Control:
- AGENCY: Can view any center
- CENTER: Can view only their own center`,
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Center ID (integer)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Center retrieved successfully',
    type: CenterResponseDto,
    example: {
      id: 1,
      name: 'ABC English Center',
      email: 'contact@abcenglish.com',
      phone: '+84901234567',
      address: '123 Main Street, Hanoi',
      logoUrl: 'https://example.com/logo.png',
      businessLicense: 'BL-2025-ABC-001',
      status: 'active',
      agencyId: 1,
      agency: {
        id: 1,
        username: 'agency_admin',
        email: 'admin@agency.com',
      },
      branchesCount: 3,
      chaptersCount: 12,
      createdAt: '2025-01-22T00:00:00Z',
      updatedAt: '2025-01-22T00:00:00Z',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot view this center',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have permission to view this center',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Center not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Center with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<CenterResponseDto> {
    return this.centersService.findOne(id, user);
  }

  /**
   * Update a center
   * AGENCY can update any center, CENTER can update own center only
   */
  @Patch(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Update center details',
    description: `Update center information such as name, contact details, logo, status, etc.

Access Control:
- AGENCY: Can update any center
- CENTER: Can update only their own center

Note: All fields are optional. Only provided fields will be updated.`,
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Center ID (integer)',
    example: 1,
  })
  @ApiBody({ type: UpdateCenterDto })
  @ApiResponse({
    status: 200,
    description: 'Center updated successfully',
    type: CenterResponseDto,
    example: {
      id: 1,
      name: 'ABC English Center - Updated',
      email: 'contact@abcenglish.com',
      phone: '+84901234567',
      address: '456 New Street, Hanoi',
      logoUrl: 'https://example.com/new-logo.png',
      businessLicense: 'BL-2025-ABC-001',
      status: 'active',
      agencyId: 1,
      agency: {
        id: 1,
        username: 'agency_admin',
        email: 'admin@agency.com',
      },
      branchesCount: 3,
      chaptersCount: 12,
      createdAt: '2025-01-22T00:00:00Z',
      updatedAt: '2025-01-22T10:30:00Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be a valid email'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot update this center',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have permission to update this center',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Center not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Center with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Center with email contact@abcenglish.com already exists',
        error: 'Conflict',
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCenterDto: UpdateCenterDto,
    @CurrentUser() user: User,
  ): Promise<CenterResponseDto> {
    const center = await this.centersService.update(id, updateCenterDto, user);

    // Map entity to response DTO
    return {
      id: center.id,
      name: center.name,
      email: center.email,
      phone: center.phone,
      address: center.address,
      logoUrl: center.logoUrl,
      businessLicense: center.businessLicense,
      status: center.status,
      userId: center.userId,
      agencyId: center.agencyId,
      agency: center.agency
        ? {
            id: center.agency.id,
            name: center.agency.name,
            email: center.agency.email,
          }
        : null,
      branchesCount: center.branches ? center.branches.length : 0,
      chaptersCount: center.chapters ? center.chapters.length : 0,
      createdAt: center.createdAt.toISOString(),
      updatedAt: center.updatedAt.toISOString(),
    };
  }

  /**
   * Delete/suspend a center
   * AGENCY role only
   */
  @Delete(':id')
  @Roles(UserRole.AGENCY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete/suspend a center',
    description: `Soft delete a center by setting status to 'suspended'. Only AGENCY role can delete centers.

This operation:
- Sets center status to 'suspended'
- Does not permanently delete data
- CENTER role cannot delete centers
- May affect related branches, teachers, and students`,
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Center ID (integer)',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Center deleted/suspended successfully (no content returned)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY can delete centers',
    schema: {
      example: {
        statusCode: 403,
        message:
          'Only AGENCY role can delete centers. CENTER role cannot delete.',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Center not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Center with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.centersService.remove(id, user);
  }

  /**
   * Get center analytics
   * AGENCY can view any center, CENTER can view own center only
   */
  @Get(':id/analytics')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Get center analytics',
    description: `Retrieve comprehensive analytics for a center including:
- Total branches count
- Total teachers count
- Total students count
- Total chapters/curriculum count

Access Control:
- AGENCY: Can view analytics for any center
- CENTER: Can view analytics for their own center only`,
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Center ID (integer)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Center analytics retrieved successfully',
    type: CenterAnalyticsDto,
    example: {
      centerId: 1,
      centerName: 'ABC English Center',
      totalBranches: 3,
      totalTeachers: 15,
      totalStudents: 250,
      totalChapters: 12,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot view analytics for this center',
    schema: {
      example: {
        statusCode: 403,
        message:
          'You do not have permission to view analytics for this center',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Center not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Center with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  getAnalytics(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<CenterAnalyticsDto> {
    return this.centersService.getAnalytics(id, user);
  }
}

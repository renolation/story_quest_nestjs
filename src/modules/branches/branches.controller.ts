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
import { BranchesService } from './branches.service';
import {
  CreateBranchDto,
  UpdateBranchDto,
  BranchResponseDto,
  BranchQueryDto,
  PaginatedBranchesResponseDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';

/**
 * Branches Controller
 *
 * Phase: 7
 * Status: ✅ IMPLEMENTED
 * Priority: HIGH
 *
 * Manages branch CRUD operations
 *
 * Access Control:
 * - AGENCY: Full access to all branches
 * - CENTER: Can manage branches for their own center only
 * - Other roles: No access
 */
@ApiTags('branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  /**
   * Create a new branch
   * AGENCY and CENTER roles
   */
  @Post()
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new branch',
    description: `Create a new branch for a learning center.

Access Control:
- AGENCY: Can create branches for any center
- CENTER: Can create branches for their own center only
- Other roles: No access

Business Rules:
- Center must exist
- Email must be unique if provided
- CENTER role cannot create branches for other centers`,
    externalDocs: {
      description: 'Web Dashboard Implementation Guide',
      url: '/docs/WEB_DASHBOARD_IMPLEMENTATION_GUIDE.md',
    },
  })
  @ApiBody({ type: CreateBranchDto })
  @ApiResponse({
    status: 201,
    description: 'Branch created successfully',
    type: BranchResponseDto,
    example: {
      id: 1,
      centerId: 1,
      center: {
        id: 1,
        name: 'ABC English Center',
      },
      name: 'District 1 Branch',
      address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
      phone: '0901234567',
      email: 'district1@abcenglish.com',
      isActive: true,
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
          'Branch name is required',
          'Center ID must be an integer',
          'Invalid Vietnamese phone number format',
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
    description: 'Forbidden - Cannot create branch for this center',
    schema: {
      example: {
        statusCode: 403,
        message: 'You can only create branches for your own center',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Center not found',
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
        message: 'Branch with email district1@abcenglish.com already exists',
        error: 'Conflict',
      },
    },
  })
  async create(
    @Body() createBranchDto: CreateBranchDto,
    @CurrentUser() user: User,
  ): Promise<BranchResponseDto> {
    const branch = await this.branchesService.create(createBranchDto, user);

    // Map entity to response DTO
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
   * List all branches (AGENCY) or own center's branches (CENTER)
   * Supports pagination, filtering, and sorting
   */
  @Get()
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'List branches with pagination and filters',
    description: `Retrieve a paginated list of branches with filtering and sorting options.

Access Control:
- AGENCY: Can see all branches
- CENTER: Can see only their own center's branches
- Other roles: No access

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- orderBy: Sort field (default: createdAt)
- order: Sort order ASC/DESC (default: DESC)
- centerId: Filter by center ID
- isActive: Filter by active status (true/false)
- search: Search by branch name or address`,
  })
  @ApiResponse({
    status: 200,
    description: 'Branches retrieved successfully',
    type: PaginatedBranchesResponseDto,
    example: {
      data: [
        {
          id: 1,
          centerId: 1,
          center: {
            id: 1,
            name: 'ABC English Center',
          },
          name: 'District 1 Branch',
          address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
          phone: '0901234567',
          email: 'district1@abcenglish.com',
          isActive: true,
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
        message: 'You do not have permission to view branches',
        error: 'Forbidden',
      },
    },
  })
  findAll(
    @Query() query: BranchQueryDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedBranchesResponseDto> {
    return this.branchesService.findAll(query, user);
  }

  /**
   * Get a single branch by ID
   * AGENCY can view any branch, CENTER can view own center's branches only
   */
  @Get(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Get branch details by ID',
    description: `Retrieve detailed information about a specific branch including center information.

Access Control:
- AGENCY: Can view any branch
- CENTER: Can view only their own center's branches
- Other roles: No access`,
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Branch ID (integer)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Branch retrieved successfully',
    type: BranchResponseDto,
    example: {
      id: 1,
      centerId: 1,
      center: {
        id: 1,
        name: 'ABC English Center',
      },
      name: 'District 1 Branch',
      address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
      phone: '0901234567',
      email: 'district1@abcenglish.com',
      isActive: true,
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
    description: 'Forbidden - Cannot view this branch',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have permission to view this branch',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Branch with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<BranchResponseDto> {
    return this.branchesService.findOne(id, user);
  }

  /**
   * Update a branch
   * AGENCY can update any branch, CENTER can update own center's branches only
   */
  @Patch(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Update branch details',
    description: `Update branch information such as name, address, contact details, active status, etc.

Access Control:
- AGENCY: Can update any branch and change centerId
- CENTER: Can update only their own center's branches (cannot change centerId)
- Other roles: No access

Business Rules:
- All fields are optional
- Email must be unique if provided
- CENTER role cannot transfer branches to another center
- If changing centerId (AGENCY only), the new center must exist`,
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Branch ID (integer)',
    example: 1,
  })
  @ApiBody({ type: UpdateBranchDto })
  @ApiResponse({
    status: 200,
    description: 'Branch updated successfully',
    type: BranchResponseDto,
    example: {
      id: 1,
      centerId: 1,
      center: {
        id: 1,
        name: 'ABC English Center',
      },
      name: 'District 1 Branch - Updated',
      address: '456 New Street, District 1, Ho Chi Minh City',
      phone: '0901234567',
      email: 'district1@abcenglish.com',
      isActive: true,
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
        message: ['Invalid Vietnamese phone number format'],
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
    description: 'Forbidden - Cannot update this branch',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have permission to update this branch',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Branch with ID 1 not found',
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
        message: 'Branch with email district1@abcenglish.com already exists',
        error: 'Conflict',
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBranchDto: UpdateBranchDto,
    @CurrentUser() user: User,
  ): Promise<BranchResponseDto> {
    const branch = await this.branchesService.update(id, updateBranchDto, user);

    // Map entity to response DTO
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
   * Delete a branch
   * AGENCY and CENTER roles (hard delete)
   */
  @Delete(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a branch',
    description: `Hard delete a branch. Both AGENCY and CENTER roles can delete branches.

Access Control:
- AGENCY: Can delete any branch
- CENTER: Can delete only their own center's branches
- Other roles: No access

Warning:
- This is a hard delete operation (permanent)
- Associated data may be affected (classes, teachers, students)
- Consider deactivating instead by setting isActive to false`,
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Branch ID (integer)',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Branch deleted successfully (no content returned)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot delete this branch',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have permission to delete this branch',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Branch with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.branchesService.remove(id, user);
  }
}

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
  ApiQuery,
} from '@nestjs/swagger';
import { AgenciesService } from './agencies.service';
import {
  CreateAgencyDto,
  UpdateAgencyDto,
  AgencyResponseDto,
  PaginatedAgenciesResponseDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';
import { AgencyStatus } from './entities/agency.entity';

/**
 * Agencies Controller
 *
 * Phase: 1 (Foundation)
 * Status: ✅ IMPLEMENTED
 * Priority: CRITICAL
 *
 * Manages agency CRUD operations
 *
 * Access Control:
 * - AGENCY: Full access to all agencies
 * - Other roles: No access (highly restricted)
 */
@ApiTags('agencies')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('agencies')
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  /**
   * Create a new agency
   * AGENCY role only
   */
  @Post()
  @Roles(UserRole.AGENCY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new agency (SUPER ADMIN ONLY)',
    description:
      'Create a new agency (super admin organization). CRITICAL SECURITY: Only the SUPER ADMIN (isSuperAdmin = true) can create agencies. Regular AGENCY users cannot create new agencies. This ensures only one super admin controls agency creation.',
    externalDocs: {
      description: 'Web Dashboard Implementation Guide',
      url: '/docs/WEB_DASHBOARD_IMPLEMENTATION_GUIDE.md',
    },
  })
  @ApiBody({ type: CreateAgencyDto })
  @ApiResponse({
    status: 201,
    description: 'Agency created successfully',
    type: AgencyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: ['name should not be empty', 'email must be a valid email'],
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
    description: 'Forbidden - Only SUPER ADMIN can create agencies. Regular AGENCY users will get: "Only the SUPER ADMIN can create new agencies. Regular agency users cannot create agencies."',
    schema: {
      example: {
        statusCode: 403,
        message: 'Only the SUPER ADMIN can create new agencies. Regular agency users cannot create agencies.',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
  })
  async create(
    @Body() createAgencyDto: CreateAgencyDto,
    @CurrentUser() user: User,
  ): Promise<AgencyResponseDto> {
    const agency = await this.agenciesService.create(createAgencyDto, user);
    return {
      id: agency.id,
      name: agency.name,
      email: agency.email,
      phone: agency.phone,
      address: agency.address,
      logoUrl: agency.logoUrl,
      description: agency.description,
      status: agency.status,
      centersCount: agency.centers ? agency.centers.length : 0,
      createdAt: agency.createdAt.toISOString(),
      updatedAt: agency.updatedAt.toISOString(),
    };
  }

  /**
   * Get all agencies with pagination
   * AGENCY role only
   */
  @Get()
  @Roles(UserRole.AGENCY)
  @ApiOperation({
    summary: 'Get all agencies',
    description:
      'Retrieve a paginated list of agencies with optional filtering. Only AGENCY role can view agencies.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
    example: 20,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AgencyStatus,
    description: 'Filter by agency status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or email',
  })
  @ApiResponse({
    status: 200,
    description: 'Agencies retrieved successfully',
    type: PaginatedAgenciesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY role can view agencies',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: AgencyStatus,
    @Query('search') search?: string,
    @CurrentUser() user?: User,
  ): Promise<PaginatedAgenciesResponseDto> {
    return this.agenciesService.findAll(page, limit, status, search, user);
  }

  /**
   * Get a single agency by ID
   * AGENCY role only
   */
  @Get(':id')
  @Roles(UserRole.AGENCY)
  @ApiOperation({
    summary: 'Get agency by ID',
    description:
      'Retrieve a single agency by ID with centers count. Only AGENCY role can view agencies.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Agency ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Agency retrieved successfully',
    type: AgencyResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY role can view agencies',
  })
  @ApiResponse({
    status: 404,
    description: 'Agency not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ): Promise<AgencyResponseDto> {
    return this.agenciesService.findOne(id, user);
  }

  /**
   * Update an agency
   * AGENCY role only
   */
  @Patch(':id')
  @Roles(UserRole.AGENCY)
  @ApiOperation({
    summary: 'Update agency',
    description:
      'Update an agency by ID. Only AGENCY role can update agencies.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Agency ID',
    example: 1,
  })
  @ApiBody({ type: UpdateAgencyDto })
  @ApiResponse({
    status: 200,
    description: 'Agency updated successfully',
    type: AgencyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY role can update agencies',
  })
  @ApiResponse({
    status: 404,
    description: 'Agency not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAgencyDto: UpdateAgencyDto,
    @CurrentUser() user?: User,
  ): Promise<AgencyResponseDto> {
    const agency = await this.agenciesService.update(
      id,
      updateAgencyDto,
      user,
    );
    return {
      id: agency.id,
      name: agency.name,
      email: agency.email,
      phone: agency.phone,
      address: agency.address,
      logoUrl: agency.logoUrl,
      description: agency.description,
      status: agency.status,
      centersCount: agency.centers ? agency.centers.length : 0,
      createdAt: agency.createdAt.toISOString(),
      updatedAt: agency.updatedAt.toISOString(),
    };
  }

  /**
   * Delete (soft delete) an agency
   * AGENCY role only
   */
  @Delete(':id')
  @Roles(UserRole.AGENCY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete agency',
    description:
      'Soft delete an agency by setting status to suspended. Only AGENCY role can delete agencies.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Agency ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Agency deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY role can delete agencies',
  })
  @ApiResponse({
    status: 404,
    description: 'Agency not found',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ): Promise<void> {
    await this.agenciesService.remove(id, user);
  }

  /**
   * Suspend an agency
   * AGENCY role only
   */
  @Patch(':id/suspend')
  @Roles(UserRole.AGENCY)
  @ApiOperation({
    summary: 'Suspend agency',
    description: 'Suspend an agency. Only AGENCY role can suspend agencies.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Agency ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Agency suspended successfully',
    type: AgencyResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY role can suspend agencies',
  })
  @ApiResponse({
    status: 404,
    description: 'Agency not found',
  })
  async suspend(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ): Promise<AgencyResponseDto> {
    const agency = await this.agenciesService.suspend(id, user);
    return {
      id: agency.id,
      name: agency.name,
      email: agency.email,
      phone: agency.phone,
      address: agency.address,
      logoUrl: agency.logoUrl,
      description: agency.description,
      status: agency.status,
      centersCount: agency.centers ? agency.centers.length : 0,
      createdAt: agency.createdAt.toISOString(),
      updatedAt: agency.updatedAt.toISOString(),
    };
  }

  /**
   * Activate an agency
   * AGENCY role only
   */
  @Patch(':id/activate')
  @Roles(UserRole.AGENCY)
  @ApiOperation({
    summary: 'Activate agency',
    description: 'Activate an agency. Only AGENCY role can activate agencies.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Agency ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Agency activated successfully',
    type: AgencyResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY role can activate agencies',
  })
  @ApiResponse({
    status: 404,
    description: 'Agency not found',
  })
  async activate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ): Promise<AgencyResponseDto> {
    const agency = await this.agenciesService.activate(id, user);
    return {
      id: agency.id,
      name: agency.name,
      email: agency.email,
      phone: agency.phone,
      address: agency.address,
      logoUrl: agency.logoUrl,
      description: agency.description,
      status: agency.status,
      centersCount: agency.centers ? agency.centers.length : 0,
      createdAt: agency.createdAt.toISOString(),
      updatedAt: agency.updatedAt.toISOString(),
    };
  }
}

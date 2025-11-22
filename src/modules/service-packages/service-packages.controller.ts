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
  ParseBoolPipe,
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
import { ServicePackagesService } from './service-packages.service';
import {
  CreateServicePackageDto,
  UpdateServicePackageDto,
  ServicePackageResponseDto,
  PaginatedServicePackagesResponseDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';

/**
 * Service Packages Controller
 *
 * Phase: 2 (Content & Packages)
 * Status: ✅ IMPLEMENTED
 * Priority: HIGH
 *
 * Manages service package/plan CRUD operations
 *
 * Business Flow:
 * - AGENCY creates packages (Basic, Pro, Enterprise, etc.)
 * - CENTERS browse and purchase packages
 * - Packages define limits and pricing
 *
 * Access Control:
 * - AGENCY: Full CRUD access
 * - CENTER/TEACHER/REVIEWER: Read access to active packages only
 * - STUDENT: No access
 */
@ApiTags('service-packages')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('service-packages')
export class ServicePackagesController {
  constructor(private readonly servicePackagesService: ServicePackagesService) {}

  /**
   * Create a new service package
   * AGENCY role only
   */
  @Post()
  @Roles(UserRole.AGENCY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new service package',
    description:
      'Create a subscription package/plan for centers to purchase. Only AGENCY role can create packages.',
  })
  @ApiBody({ type: CreateServicePackageDto })
  @ApiResponse({
    status: 201,
    description: 'Service package created successfully',
    type: ServicePackageResponseDto,
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
    description: 'Forbidden - Only AGENCY role can create packages',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Package name already exists',
  })
  async create(
    @Body() createServicePackageDto: CreateServicePackageDto,
    @CurrentUser() user: User,
  ): Promise<ServicePackageResponseDto> {
    const pkg = await this.servicePackagesService.create(
      createServicePackageDto,
      user,
    );
    return {
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
    };
  }

  /**
   * Get all service packages with pagination
   * All authenticated users can view (but non-AGENCY sees only active)
   */
  @Get()
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER, UserRole.REVIEWER)
  @ApiOperation({
    summary: 'Get all service packages',
    description:
      'Retrieve a paginated list of service packages. AGENCY sees all, others see only active packages.',
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
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status (AGENCY only)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or description',
  })
  @ApiResponse({
    status: 200,
    description: 'Service packages retrieved successfully',
    type: PaginatedServicePackagesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
    @Query('search') search?: string,
    @CurrentUser() user?: User,
  ): Promise<PaginatedServicePackagesResponseDto> {
    return this.servicePackagesService.findAll(page, limit, isActive, search, user);
  }

  /**
   * Get a single service package by ID
   * All authenticated users can view (but non-AGENCY cannot view inactive)
   */
  @Get(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER, UserRole.REVIEWER)
  @ApiOperation({
    summary: 'Get service package by ID',
    description:
      'Retrieve a single service package by ID. Non-AGENCY users cannot view inactive packages.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Service package ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Service package retrieved successfully',
    type: ServicePackageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot view inactive package',
  })
  @ApiResponse({
    status: 404,
    description: 'Service package not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ): Promise<ServicePackageResponseDto> {
    return this.servicePackagesService.findOne(id, user);
  }

  /**
   * Update a service package
   * AGENCY role only
   */
  @Patch(':id')
  @Roles(UserRole.AGENCY)
  @ApiOperation({
    summary: 'Update service package',
    description:
      'Update a service package by ID. Only AGENCY role can update packages.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Service package ID',
    example: 1,
  })
  @ApiBody({ type: UpdateServicePackageDto })
  @ApiResponse({
    status: 200,
    description: 'Service package updated successfully',
    type: ServicePackageResponseDto,
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
    description: 'Forbidden - Only AGENCY role can update packages',
  })
  @ApiResponse({
    status: 404,
    description: 'Service package not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Package name already exists',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServicePackageDto: UpdateServicePackageDto,
    @CurrentUser() user?: User,
  ): Promise<ServicePackageResponseDto> {
    const pkg = await this.servicePackagesService.update(
      id,
      updateServicePackageDto,
      user,
    );
    return {
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
    };
  }

  /**
   * Delete (soft delete) a service package
   * AGENCY role only
   */
  @Delete(':id')
  @Roles(UserRole.AGENCY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete service package',
    description:
      'Soft delete a service package by setting isActive to false. Only AGENCY role can delete packages.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Service package ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Service package deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY role can delete packages',
  })
  @ApiResponse({
    status: 404,
    description: 'Service package not found',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ): Promise<void> {
    await this.servicePackagesService.remove(id, user);
  }

  /**
   * Activate a service package
   * AGENCY role only
   */
  @Patch(':id/activate')
  @Roles(UserRole.AGENCY)
  @ApiOperation({
    summary: 'Activate service package',
    description:
      'Activate a service package. Only AGENCY role can activate packages.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Service package ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Service package activated successfully',
    type: ServicePackageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY role can activate packages',
  })
  @ApiResponse({
    status: 404,
    description: 'Service package not found',
  })
  async activate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ): Promise<ServicePackageResponseDto> {
    const pkg = await this.servicePackagesService.activate(id, user);
    return {
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
    };
  }

  /**
   * Deactivate a service package
   * AGENCY role only
   */
  @Patch(':id/deactivate')
  @Roles(UserRole.AGENCY)
  @ApiOperation({
    summary: 'Deactivate service package',
    description:
      'Deactivate a service package. Only AGENCY role can deactivate packages.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Service package ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Service package deactivated successfully',
    type: ServicePackageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY role can deactivate packages',
  })
  @ApiResponse({
    status: 404,
    description: 'Service package not found',
  })
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ): Promise<ServicePackageResponseDto> {
    const pkg = await this.servicePackagesService.deactivate(id, user);
    return {
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
    };
  }
}

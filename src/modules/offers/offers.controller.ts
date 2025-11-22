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
  ParseEnumPipe,
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
import { OffersService } from './offers.service';
import {
  CreateOfferDto,
  UpdateOfferDto,
  OfferResponseDto,
  PaginatedOffersResponseDto,
  ValidateOfferDto,
  ValidateOfferResponseDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';
import { OfferStatus } from './entities/offer.entity';

/**
 * Offers Controller
 *
 * Phase: 2 (Content & Packages)
 * Status: ✅ IMPLEMENTED
 * Priority: HIGH
 *
 * Manages promotional offers and discount codes
 *
 * Business Flow:
 * - AGENCY creates offer codes
 * - CENTERS validate and redeem offers when purchasing packages
 * - System tracks usage limits and validity
 *
 * Access Control:
 * - AGENCY: Full CRUD on all offers
 * - CENTER: View active offers, validate offers
 * - Others: No access
 */
@ApiTags('offers')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  /**
   * Create a new offer
   * AGENCY only
   */
  @Post()
  @Roles(UserRole.AGENCY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new offer',
    description: 'AGENCY creates a promotional offer/discount code.',
  })
  @ApiBody({ type: CreateOfferDto })
  @ApiResponse({
    status: 201,
    description: 'Offer created successfully',
    type: OfferResponseDto,
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
    description: 'Forbidden - Only AGENCY can create offers',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Offer code already exists',
  })
  async create(
    @Body() createOfferDto: CreateOfferDto,
    @CurrentUser() user: User,
  ): Promise<OfferResponseDto> {
    const offer = await this.offersService.create(createOfferDto, user);
    return await this.offersService.findOne(offer.id);
  }

  /**
   * Get all offers with pagination
   * AGENCY sees all, others see only active
   */
  @Get()
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Get all offers',
    description:
      'Retrieve paginated list of offers. AGENCY sees all, others see only active offers.',
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
    enum: OfferStatus,
    description: 'Filter by offer status (AGENCY only)',
  })
  @ApiQuery({
    name: 'packageId',
    required: false,
    type: Number,
    description: 'Filter by package ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Offers retrieved successfully',
    type: PaginatedOffersResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No permission to view offers',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status', new ParseEnumPipe(OfferStatus, { optional: true }))
    status?: OfferStatus,
    @Query('packageId') packageId?: number,
    @CurrentUser() user?: User,
  ): Promise<PaginatedOffersResponseDto> {
    return this.offersService.findAll(page, limit, status, packageId, user);
  }

  /**
   * Validate an offer code
   * AGENCY and CENTER can validate
   */
  @Post('validate')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate an offer code',
    description:
      'Check if an offer code is valid for a specific package and calculate discount.',
  })
  @ApiBody({ type: ValidateOfferDto })
  @ApiResponse({
    status: 200,
    description: 'Offer validation result',
    type: ValidateOfferResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No permission to validate offers',
  })
  async validateOffer(
    @Body() validateDto: ValidateOfferDto,
    @CurrentUser() user: User,
  ): Promise<ValidateOfferResponseDto> {
    return this.offersService.validateOffer(validateDto, user);
  }

  /**
   * Get a single offer by ID
   * AGENCY can view all, others can view only active
   */
  @Get(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Get offer by ID',
    description: 'Retrieve a single offer. Non-AGENCY users can only view active offers.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Offer ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Offer retrieved successfully',
    type: OfferResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot view this offer',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ): Promise<OfferResponseDto> {
    return this.offersService.findOne(id, user);
  }

  /**
   * Update an offer
   * AGENCY only
   */
  @Patch(':id')
  @Roles(UserRole.AGENCY)
  @ApiOperation({
    summary: 'Update offer',
    description: 'Update an offer. Only AGENCY can update offers.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Offer ID',
    example: 1,
  })
  @ApiBody({ type: UpdateOfferDto })
  @ApiResponse({
    status: 200,
    description: 'Offer updated successfully',
    type: OfferResponseDto,
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
    description: 'Forbidden - Only AGENCY can update offers',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Offer code already exists',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOfferDto: UpdateOfferDto,
    @CurrentUser() user: User,
  ): Promise<OfferResponseDto> {
    const offer = await this.offersService.update(id, updateOfferDto, user);
    return await this.offersService.findOne(offer.id);
  }

  /**
   * Delete an offer
   * AGENCY only
   */
  @Delete(':id')
  @Roles(UserRole.AGENCY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete offer',
    description: 'Delete an offer permanently. Only AGENCY can delete offers.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Offer ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Offer deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY can delete offers',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.offersService.remove(id, user);
  }

  /**
   * Deactivate an offer
   * AGENCY only
   */
  @Patch(':id/deactivate')
  @Roles(UserRole.AGENCY)
  @ApiOperation({
    summary: 'Deactivate offer',
    description: 'Set offer status to inactive. Only AGENCY can deactivate offers.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Offer ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Offer deactivated successfully',
    type: OfferResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY can deactivate offers',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<OfferResponseDto> {
    const offer = await this.offersService.deactivate(id, user);
    return await this.offersService.findOne(offer.id);
  }

  /**
   * Activate an offer
   * AGENCY only
   */
  @Patch(':id/activate')
  @Roles(UserRole.AGENCY)
  @ApiOperation({
    summary: 'Activate offer',
    description: 'Set offer status to active. Only AGENCY can activate offers.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Offer ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Offer activated successfully',
    type: OfferResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only AGENCY can activate offers',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  async activate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<OfferResponseDto> {
    const offer = await this.offersService.activate(id, user);
    return await this.offersService.findOne(offer.id);
  }
}

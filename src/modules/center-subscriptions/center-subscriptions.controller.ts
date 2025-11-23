import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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
import { CenterSubscriptionsService } from './center-subscriptions.service';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionResponseDto,
  PaginatedSubscriptionsResponseDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';
import { SubscriptionStatus } from './entities/center-subscription.entity';

/**
 * Center Subscriptions Controller
 *
 * Phase: 2 (Content & Packages)
 * Status: ✅ IMPLEMENTED
 * Priority: HIGH
 *
 * Manages center subscriptions to service packages
 *
 * Business Flow:
 * - CENTER purchases a service package → creates subscription
 * - AGENCY can create subscriptions for any center
 * - Subscriptions have start/expiry dates
 * - Support for trials, renewals, cancellations
 *
 * Access Control:
 * - AGENCY: Full CRUD on all subscriptions
 * - CENTER: Create own, view/update/cancel own subscriptions only
 * - Others: No access
 */
@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('subscriptions')
export class CenterSubscriptionsController {
  constructor(
    private readonly centerSubscriptionsService: CenterSubscriptionsService,
  ) {}

  /**
   * Create a new subscription
   * AGENCY can create for any center, CENTER can create for themselves
   */
  @Post()
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new subscription',
    description:
      'CENTER purchases a service package. AGENCY can create subscriptions for any center.',
  })
  @ApiBody({ type: CreateSubscriptionDto })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or package not available',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - CENTER can only create for own center',
  })
  @ApiResponse({
    status: 404,
    description: 'Package or center not found',
  })
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @CurrentUser() user: User,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.centerSubscriptionsService.create(
      createSubscriptionDto,
      user,
    );

    // Fetch full subscription with relations
    return await this.centerSubscriptionsService.findOne(subscription.id, user);
  }

  /**
   * Get all subscriptions with pagination
   * AGENCY sees all, CENTER sees only own
   */
  @Get()
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Get all subscriptions',
    description:
      'Retrieve paginated list of subscriptions. AGENCY sees all, CENTER sees only own.',
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
    name: 'centerId',
    required: false,
    type: Number,
    description: 'Filter by center ID (AGENCY only)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SubscriptionStatus,
    description: 'Filter by subscription status',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
    type: PaginatedSubscriptionsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No permission to view subscriptions',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('centerId') centerId?: number,
    @Query('status', new ParseEnumPipe(SubscriptionStatus, { optional: true }))
    status?: SubscriptionStatus,
    @CurrentUser() user?: User,
  ): Promise<PaginatedSubscriptionsResponseDto> {
    return this.centerSubscriptionsService.findAll(
      page,
      limit,
      centerId,
      status,
      user,
    );
  }

  /**
   * Get a single subscription by ID
   * AGENCY can view all, CENTER can view own only
   */
  @Get(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Get subscription by ID',
    description:
      'Retrieve a single subscription. CENTER can only view own subscriptions.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Subscription ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot view this subscription',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<SubscriptionResponseDto> {
    return this.centerSubscriptionsService.findOne(id, user);
  }

  /**
   * Update a subscription
   * AGENCY can update all fields, CENTER can only update autoRenew
   */
  @Patch(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Update subscription',
    description:
      'Update a subscription. CENTER can only update auto-renewal, AGENCY can update all fields.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Subscription ID',
    example: 1,
  })
  @ApiBody({ type: UpdateSubscriptionDto })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
    type: SubscriptionResponseDto,
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
    description: 'Forbidden - Cannot update this subscription',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @CurrentUser() user: User,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.centerSubscriptionsService.update(
      id,
      updateSubscriptionDto,
      user,
    );
    return await this.centerSubscriptionsService.findOne(subscription.id, user);
  }

  /**
   * Cancel a subscription
   * Both AGENCY and CENTER can cancel
   */
  @Patch(':id/cancel')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Cancel subscription',
    description:
      'Cancel an active subscription. Sets status to cancelled and disables auto-renewal.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Subscription ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot cancel this subscription',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.centerSubscriptionsService.cancel(id, user);
    return await this.centerSubscriptionsService.findOne(subscription.id, user);
  }

  /**
   * Renew a subscription
   * Both AGENCY and CENTER can renew
   */
  @Patch(':id/renew')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Renew subscription',
    description: 'Renew a subscription by extending expiry date by 1 year.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Subscription ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription renewed successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot renew this subscription',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  async renew(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.centerSubscriptionsService.renew(id, user);
    return await this.centerSubscriptionsService.findOne(subscription.id, user);
  }
}

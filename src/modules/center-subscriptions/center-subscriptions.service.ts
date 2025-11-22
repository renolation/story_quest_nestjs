import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CenterSubscription, SubscriptionStatus } from './entities/center-subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import {
  SubscriptionResponseDto,
  PaginatedSubscriptionsResponseDto,
} from './dto/subscription-response.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums';
import { ServicePackagesService } from '../service-packages/service-packages.service';
import { CentersService } from '../centers/centers.service';
import { OffersService } from '../offers/offers.service';
import { DiscountType } from '../offers/entities/offer.entity';

/**
 * Center Subscriptions Service
 *
 * Phase: 2 (Content & Packages)
 * Status: ✅ IMPLEMENTED
 * Priority: HIGH
 *
 * Business logic:
 * - CENTERS purchase service packages
 * - AGENCY can create subscriptions for any center
 * - Automatic expiry date calculation based on package pricing
 * - Trial period support
 * - Auto-renewal management
 * - Status updates (active, trial, expired, cancelled)
 *
 * Access Control:
 * - AGENCY role: Full CRUD access to all subscriptions
 * - CENTER role: Can create own subscription, view/update own subscriptions only
 * - Other roles: No access
 */
@Injectable()
export class CenterSubscriptionsService {
  constructor(
    @InjectRepository(CenterSubscription)
    private subscriptionRepository: Repository<CenterSubscription>,
    private servicePackagesService: ServicePackagesService,
    private centersService: CentersService,
    private offersService: OffersService,
  ) {}

  /**
   * Create a new subscription
   *
   * @param createSubscriptionDto - Subscription creation data
   * @param currentUser - Current authenticated user
   * @returns Created subscription
   * @throws NotFoundException if package or center not found
   * @throws ForbiddenException if CENTER tries to create for another center
   */
  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    currentUser: User,
  ): Promise<CenterSubscription> {
    const { centerId, packageId, startDate, expiryDate, autoRenew, status, offerCode } =
      createSubscriptionDto;

    // Verify package exists and is active
    const servicePackage = await this.servicePackagesService.findOneById(packageId);
    if (!servicePackage.isActive) {
      throw new BadRequestException('Package is not currently available for purchase');
    }

    // Verify center exists
    await this.centersService.findOneById(centerId);

    // Access control: CENTER can only create for themselves
    if (currentUser.role === UserRole.CENTER) {
      // Find the center that belongs to this user
      // Assuming center.agencyId === user.id (from centers creation logic)
      const userCenter = await this.centersService.findOneById(centerId);
      if (userCenter.agencyId !== currentUser.id) {
        throw new ForbiddenException(
          'You can only create subscriptions for your own center',
        );
      }
    }

    // Calculate dates
    const start = startDate ? new Date(startDate) : new Date();
    let expiry: Date;

    if (expiryDate) {
      expiry = new Date(expiryDate);
    } else {
      // Default: 1 year subscription
      expiry = new Date(start);
      expiry.setFullYear(expiry.getFullYear() + 1);
    }

    // Determine initial status
    let initialStatus = status || SubscriptionStatus.ACTIVE;
    if (servicePackage.trialDays > 0 && !status) {
      initialStatus = SubscriptionStatus.TRIAL;
      // Adjust expiry for trial
      expiry = new Date(start);
      expiry.setDate(expiry.getDate() + servicePackage.trialDays);
    }

    // Handle offer code redemption
    let appliedOfferId: number | null = null;
    let originalPrice: number | null = null;
    let discountAmount: number | null = null;
    let finalPrice: number | null = null;

    if (offerCode) {
      // Validate and apply offer
      const validationResult = await this.offersService.validateOffer(
        { code: offerCode, packageId, centerId },
        currentUser,
      );

      if (!validationResult.valid) {
        throw new BadRequestException(
          `Offer code invalid: ${validationResult.message}`,
        );
      }

      // Find the offer to get its ID
      const offer = await this.offersService.findByCode(offerCode);
      if (offer) {
        appliedOfferId = offer.id;
        originalPrice = validationResult.originalPrice || 0;
        discountAmount = validationResult.calculatedDiscount || 0;
        finalPrice = validationResult.finalPrice || 0;
      }
    } else if (servicePackage.priceMonthly) {
      // No offer, use regular pricing
      originalPrice = Number(servicePackage.priceMonthly);
      finalPrice = originalPrice;
      discountAmount = 0;
    }

    // Create subscription
    const subscription = this.subscriptionRepository.create({
      centerId,
      packageId,
      startDate: start,
      expiryDate: expiry,
      autoRenew: autoRenew || false,
      status: initialStatus,
      appliedOfferId,
      originalPrice,
      discountAmount,
      finalPrice,
    });

    const savedSubscription = await this.subscriptionRepository.save(subscription);

    // Increment offer usage count if offer was applied
    if (appliedOfferId) {
      await this.offersService.incrementUsage(appliedOfferId);
    }

    return savedSubscription;
  }

  /**
   * Find all subscriptions with pagination and filtering
   *
   * @param page - Page number
   * @param limit - Items per page
   * @param centerId - Filter by center ID
   * @param status - Filter by status
   * @param currentUser - Current authenticated user
   * @returns Paginated list of subscriptions
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    centerId?: number,
    status?: SubscriptionStatus,
    currentUser?: User,
  ): Promise<PaginatedSubscriptionsResponseDto> {
    // Build query
    const queryBuilder = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.center', 'center')
      .leftJoinAndSelect('subscription.package', 'package')
      .orderBy('subscription.createdAt', 'DESC');

    // Role-based access control
    if (currentUser && currentUser.role === UserRole.CENTER) {
      // CENTER can only see their own subscriptions
      // Find center owned by this user
      const userCenterId = currentUser.id; // Simplified: assuming user.id matches center.agencyId
      queryBuilder.andWhere('subscription.centerId = :userCenterId', { userCenterId });
    } else if (currentUser && currentUser.role === UserRole.AGENCY) {
      // AGENCY can see all subscriptions (no filter)
    } else {
      throw new ForbiddenException('You do not have permission to view subscriptions');
    }

    // Apply filters
    if (centerId) {
      queryBuilder.andWhere('subscription.centerId = :centerId', { centerId });
    }

    if (status) {
      queryBuilder.andWhere('subscription.status = :status', { status });
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [subscriptions, total] = await queryBuilder.getManyAndCount();

    // Map to response DTOs
    const data: SubscriptionResponseDto[] = subscriptions.map((sub) =>
      this.mapToResponseDto(sub),
    );

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
   * Find a single subscription by ID
   *
   * @param id - Subscription ID
   * @param currentUser - Current authenticated user
   * @returns Subscription details
   * @throws NotFoundException if subscription not found
   * @throws ForbiddenException if unauthorized
   */
  async findOne(id: number, currentUser: User): Promise<SubscriptionResponseDto> {
    // Find subscription with relations
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['center', 'package'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    // Role-based access control
    if (currentUser.role === UserRole.CENTER) {
      // CENTER can only view their own subscription
      const userCenterId = currentUser.id;
      if (subscription.centerId !== userCenterId) {
        throw new ForbiddenException(
          'You do not have permission to view this subscription',
        );
      }
    } else if (currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException(
        'You do not have permission to view this subscription',
      );
    }

    return this.mapToResponseDto(subscription);
  }

  /**
   * Update a subscription
   *
   * @param id - Subscription ID
   * @param updateSubscriptionDto - Update data
   * @param currentUser - Current authenticated user
   * @returns Updated subscription
   * @throws NotFoundException if subscription not found
   * @throws ForbiddenException if unauthorized
   */
  async update(
    id: number,
    updateSubscriptionDto: UpdateSubscriptionDto,
    currentUser: User,
  ): Promise<CenterSubscription> {
    // Find subscription
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['center', 'package'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    // Role-based access control
    if (currentUser.role === UserRole.CENTER) {
      // CENTER can only update their own subscription (limited fields)
      const userCenterId = currentUser.id;
      if (subscription.centerId !== userCenterId) {
        throw new ForbiddenException(
          'You do not have permission to update this subscription',
        );
      }
      // CENTER can only update autoRenew
      if (Object.keys(updateSubscriptionDto).some(key => key !== 'autoRenew')) {
        throw new ForbiddenException('You can only update auto-renewal setting');
      }
    } else if (currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException(
        'You do not have permission to update this subscription',
      );
    }

    // Update subscription
    Object.assign(subscription, updateSubscriptionDto);
    return await this.subscriptionRepository.save(subscription);
  }

  /**
   * Cancel a subscription
   *
   * @param id - Subscription ID
   * @param currentUser - Current authenticated user
   * @throws NotFoundException if subscription not found
   * @throws ForbiddenException if unauthorized
   */
  async cancel(id: number, currentUser: User): Promise<CenterSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    // Role-based access control
    if (currentUser.role === UserRole.CENTER) {
      const userCenterId = currentUser.id;
      if (subscription.centerId !== userCenterId) {
        throw new ForbiddenException(
          'You do not have permission to cancel this subscription',
        );
      }
    } else if (currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException(
        'You do not have permission to cancel this subscription',
      );
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.autoRenew = false;
    return await this.subscriptionRepository.save(subscription);
  }

  /**
   * Renew a subscription
   *
   * @param id - Subscription ID
   * @param currentUser - Current authenticated user
   * @returns Renewed subscription
   */
  async renew(id: number, currentUser: User): Promise<CenterSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['package'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    // Role-based access control
    if (currentUser.role === UserRole.CENTER) {
      const userCenterId = currentUser.id;
      if (subscription.centerId !== userCenterId) {
        throw new ForbiddenException(
          'You do not have permission to renew this subscription',
        );
      }
    } else if (currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException(
        'You do not have permission to renew this subscription',
      );
    }

    // Extend expiry by 1 year
    const newExpiry = new Date(subscription.expiryDate);
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);

    subscription.expiryDate = newExpiry;
    subscription.status = SubscriptionStatus.ACTIVE;

    return await this.subscriptionRepository.save(subscription);
  }

  /**
   * Helper: Map entity to response DTO
   */
  private mapToResponseDto(subscription: CenterSubscription): SubscriptionResponseDto {
    const now = new Date();
    const expiry = new Date(subscription.expiryDate);
    const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = expiry < now;

    return {
      id: subscription.id,
      centerId: subscription.centerId,
      center: subscription.center ? {
        id: subscription.center.id,
        name: subscription.center.name,
        email: subscription.center.email,
      } : undefined,
      packageId: subscription.packageId,
      package: subscription.package ? {
        id: subscription.package.id,
        name: subscription.package.name,
        maxStudents: subscription.package.maxStudents,
        maxBranches: subscription.package.maxBranches,
        maxTeachers: subscription.package.maxTeachers,
      } : undefined,
      startDate: subscription.startDate.toISOString(),
      expiryDate: subscription.expiryDate.toISOString(),
      autoRenew: subscription.autoRenew,
      status: subscription.status,
      daysRemaining,
      isExpired,
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  }
}

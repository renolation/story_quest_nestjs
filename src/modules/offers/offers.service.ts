import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Offer, OfferStatus, DiscountType } from './entities/offer.entity';
import { CreateOfferDto, UpdateOfferDto, ValidateOfferDto, ValidateOfferResponseDto } from './dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums';
import { ServicePackage } from '../service-packages/entities/service-package.entity';
import { CenterSubscription } from '../center-subscriptions/entities/center-subscription.entity';
import { plainToInstance } from 'class-transformer';
import { OfferResponseDto, PaginatedOffersResponseDto } from './dto/offer-response.dto';

/**
 * Offers Service
 *
 * Handles business logic for promotional offers and discount codes
 */
@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    @InjectRepository(ServicePackage)
    private readonly packagesRepository: Repository<ServicePackage>,
    @InjectRepository(CenterSubscription)
    private readonly subscriptionsRepository: Repository<CenterSubscription>,
  ) {}

  /**
   * Create a new offer
   * Only AGENCY can create
   */
  async create(createOfferDto: CreateOfferDto, user: User): Promise<Offer> {
    // Only AGENCY can create offers
    if (user.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY can create offers');
    }

    // Validate discount value based on type
    if (
      createOfferDto.discountType === DiscountType.PERCENTAGE &&
      (createOfferDto.discountValue < 0 || createOfferDto.discountValue > 100)
    ) {
      throw new BadRequestException(
        'Percentage discount must be between 0 and 100',
      );
    }

    if (
      createOfferDto.discountType === DiscountType.FIXED_AMOUNT &&
      createOfferDto.discountValue < 0
    ) {
      throw new BadRequestException('Fixed discount amount cannot be negative');
    }

    // Validate dates
    const validFrom = new Date(createOfferDto.validFrom);
    const validUntil = new Date(createOfferDto.validUntil);

    if (validFrom >= validUntil) {
      throw new BadRequestException('validFrom must be before validUntil');
    }

    // Check if code already exists (case-insensitive)
    const existingOffer = await this.offersRepository.findOne({
      where: { code: createOfferDto.code.toUpperCase() },
    });

    if (existingOffer) {
      throw new ConflictException(
        `Offer with code "${createOfferDto.code}" already exists`,
      );
    }

    // Validate package exists if specified
    if (createOfferDto.packageId) {
      const packageExists = await this.packagesRepository.findOne({
        where: { id: createOfferDto.packageId },
      });

      if (!packageExists) {
        throw new NotFoundException(
          `Package with ID ${createOfferDto.packageId} not found`,
        );
      }
    }

    // Create offer
    const offer = this.offersRepository.create({
      ...createOfferDto,
      code: createOfferDto.code.toUpperCase(), // Store in uppercase
      validFrom,
      validUntil,
      currentUses: 0,
      status: OfferStatus.ACTIVE,
    });

    return await this.offersRepository.save(offer);
  }

  /**
   * Get all offers with pagination and filtering
   * AGENCY sees all, CENTER/TEACHER see only active & valid offers
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    status?: OfferStatus,
    packageId?: number,
    user?: User,
  ): Promise<PaginatedOffersResponseDto> {
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Offer> = {};

    // Non-AGENCY users can only see ACTIVE offers
    if (user && user.role !== UserRole.AGENCY) {
      where.status = OfferStatus.ACTIVE;
    } else if (status) {
      where.status = status;
    }

    if (packageId) {
      where.packageId = packageId;
    }

    const [offers, total] = await this.offersRepository.findAndCount({
      where,
      relations: ['package'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Add computed fields
    const now = new Date();
    const offersWithComputed = offers.map((offer) => ({
      ...offer,
      isValid:
        offer.status === OfferStatus.ACTIVE &&
        offer.validFrom <= now &&
        offer.validUntil >= now,
      remainingUses:
        offer.maxUses !== null ? offer.maxUses - offer.currentUses : null,
    }));

    const data = plainToInstance(OfferResponseDto, offersWithComputed, {
      excludeExtraneousValues: true,
    });

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
   * Get a single offer by ID
   */
  async findOne(id: number, user?: User): Promise<OfferResponseDto> {
    const offer = await this.offersRepository.findOne({
      where: { id },
      relations: ['package'],
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // Non-AGENCY users can only view ACTIVE offers
    if (user && user.role !== UserRole.AGENCY && offer.status !== OfferStatus.ACTIVE) {
      throw new ForbiddenException('Cannot view inactive offers');
    }

    const now = new Date();
    const offerWithComputed = {
      ...offer,
      isValid:
        offer.status === OfferStatus.ACTIVE &&
        offer.validFrom <= now &&
        offer.validUntil >= now,
      remainingUses:
        offer.maxUses !== null ? offer.maxUses - offer.currentUses : null,
    };

    return plainToInstance(OfferResponseDto, offerWithComputed, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get offer by code (for validation/redemption)
   */
  async findByCode(code: string): Promise<Offer | null> {
    return await this.offersRepository.findOne({
      where: { code: code.toUpperCase() },
      relations: ['package'],
    });
  }

  /**
   * Update an offer
   * Only AGENCY can update
   */
  async update(
    id: number,
    updateOfferDto: UpdateOfferDto,
    user: User,
  ): Promise<Offer> {
    // Only AGENCY can update offers
    if (user.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY can update offers');
    }

    const offer = await this.offersRepository.findOne({ where: { id } });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // Validate discount value if provided
    if (updateOfferDto.discountValue !== undefined) {
      const discountType =
        updateOfferDto.discountType || offer.discountType;

      if (
        discountType === DiscountType.PERCENTAGE &&
        (updateOfferDto.discountValue < 0 ||
          updateOfferDto.discountValue > 100)
      ) {
        throw new BadRequestException(
          'Percentage discount must be between 0 and 100',
        );
      }

      if (
        discountType === DiscountType.FIXED_AMOUNT &&
        updateOfferDto.discountValue < 0
      ) {
        throw new BadRequestException(
          'Fixed discount amount cannot be negative',
        );
      }
    }

    // Validate dates if provided
    if (updateOfferDto.validFrom || updateOfferDto.validUntil) {
      const validFrom = updateOfferDto.validFrom
        ? new Date(updateOfferDto.validFrom)
        : offer.validFrom;
      const validUntil = updateOfferDto.validUntil
        ? new Date(updateOfferDto.validUntil)
        : offer.validUntil;

      if (validFrom >= validUntil) {
        throw new BadRequestException('validFrom must be before validUntil');
      }

      if (updateOfferDto.validFrom) {
        updateOfferDto.validFrom = validFrom.toISOString();
      }
      if (updateOfferDto.validUntil) {
        updateOfferDto.validUntil = validUntil.toISOString();
      }
    }

    // Check code uniqueness if updating code
    if (updateOfferDto.code && updateOfferDto.code !== offer.code) {
      const existingOffer = await this.offersRepository.findOne({
        where: { code: updateOfferDto.code.toUpperCase() },
      });

      if (existingOffer) {
        throw new ConflictException(
          `Offer with code "${updateOfferDto.code}" already exists`,
        );
      }

      updateOfferDto.code = updateOfferDto.code.toUpperCase();
    }

    // Validate package if updating
    if (updateOfferDto.packageId) {
      const packageExists = await this.packagesRepository.findOne({
        where: { id: updateOfferDto.packageId },
      });

      if (!packageExists) {
        throw new NotFoundException(
          `Package with ID ${updateOfferDto.packageId} not found`,
        );
      }
    }

    Object.assign(offer, updateOfferDto);
    return await this.offersRepository.save(offer);
  }

  /**
   * Delete an offer
   * Only AGENCY can delete
   */
  async remove(id: number, user: User): Promise<void> {
    // Only AGENCY can delete offers
    if (user.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY can delete offers');
    }

    const offer = await this.offersRepository.findOne({ where: { id } });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    await this.offersRepository.remove(offer);
  }

  /**
   * Deactivate an offer
   * Only AGENCY can deactivate
   */
  async deactivate(id: number, user: User): Promise<Offer> {
    if (user.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY can deactivate offers');
    }

    const offer = await this.offersRepository.findOne({ where: { id } });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    offer.status = OfferStatus.INACTIVE;
    return await this.offersRepository.save(offer);
  }

  /**
   * Activate an offer
   * Only AGENCY can activate
   */
  async activate(id: number, user: User): Promise<Offer> {
    if (user.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY can activate offers');
    }

    const offer = await this.offersRepository.findOne({ where: { id } });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    offer.status = OfferStatus.ACTIVE;
    return await this.offersRepository.save(offer);
  }

  /**
   * Validate an offer code for a specific package and center
   * Used by CENTERS before purchasing
   */
  async validateOffer(
    validateDto: ValidateOfferDto,
    user: User,
  ): Promise<ValidateOfferResponseDto> {
    const { code, packageId, centerId } = validateDto;

    // Find offer by code
    const offer = await this.findByCode(code);

    if (!offer) {
      return {
        valid: false,
        code,
        message: 'Offer code not found',
      };
    }

    // Check if offer is active
    if (offer.status !== OfferStatus.ACTIVE) {
      return {
        valid: false,
        code,
        message: 'Offer is not active',
      };
    }

    // Check validity dates
    const now = new Date();
    if (offer.validFrom > now) {
      return {
        valid: false,
        code,
        message: 'Offer is not yet valid',
      };
    }

    if (offer.validUntil < now) {
      return {
        valid: false,
        code,
        message: 'Offer has expired',
      };
    }

    // Check if offer applies to this package
    if (offer.packageId !== null && offer.packageId !== packageId) {
      return {
        valid: false,
        code,
        message: 'Offer does not apply to this package',
      };
    }

    // Check total usage limit
    if (offer.maxUses !== null && offer.currentUses >= offer.maxUses) {
      return {
        valid: false,
        code,
        message: 'Offer usage limit reached',
      };
    }

    // Check per-center usage limit
    const effectiveCenterId = centerId;

    if (offer.maxUsesPerCenter !== null && effectiveCenterId) {
      const centerUsageCount = await this.subscriptionsRepository.count({
        where: {
          centerId: effectiveCenterId,
          appliedOfferId: offer.id,
        },
      });

      if (centerUsageCount >= offer.maxUsesPerCenter) {
        return {
          valid: false,
          code,
          message: 'You have already used this offer the maximum number of times',
        };
      }
    }

    // Get package to calculate discount
    const pkg = await this.packagesRepository.findOne({
      where: { id: packageId },
    });

    if (!pkg) {
      return {
        valid: false,
        code,
        message: 'Package not found',
      };
    }

    // Calculate discount
    const originalPrice = pkg.priceMonthly || 0;
    let calculatedDiscount = 0;

    if (offer.discountType === DiscountType.PERCENTAGE) {
      calculatedDiscount = (originalPrice * Number(offer.discountValue)) / 100;
    } else {
      calculatedDiscount = Number(offer.discountValue);
    }

    const finalPrice = Math.max(0, originalPrice - calculatedDiscount);

    return {
      valid: true,
      code: offer.code,
      discountValue: Number(offer.discountValue),
      discountType: offer.discountType,
      calculatedDiscount: Number(calculatedDiscount.toFixed(2)),
      originalPrice: Number(originalPrice),
      finalPrice: Number(finalPrice.toFixed(2)),
    };
  }

  /**
   * Increment offer usage count
   * Called after successful subscription creation
   */
  async incrementUsage(offerId: number): Promise<void> {
    await this.offersRepository.increment({ id: offerId }, 'currentUses', 1);
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ServicePackage } from '../../service-packages/entities/service-package.entity';
import { CenterSubscription } from '../../center-subscriptions/entities/center-subscription.entity';

/**
 * Discount type for offers
 */
export enum DiscountType {
  PERCENTAGE = 'percentage', // e.g., 20% off
  FIXED_AMOUNT = 'fixed_amount', // e.g., $50 off
}

/**
 * Offer status
 */
export enum OfferStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

/**
 * PHASE 2 - OFFERS ENTITY
 *
 * Represents promotional offers/discount codes that AGENCY creates
 * and CENTERS can redeem when purchasing service packages.
 *
 * Business Logic:
 * - AGENCY creates offer codes (percentage or fixed amount discounts)
 * - Can be applied to specific packages or all packages
 * - Has validity period (start/end dates)
 * - Usage limits: total uses and per-center uses
 * - Tracks redemptions
 *
 * Example Use Cases:
 * - "LAUNCH2025" - 30% off for first 100 centers
 * - "TRIAL50" - $50 off first purchase
 * - "BLACKFRIDAY" - 50% off all packages, limited time
 */
@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Unique offer code (e.g., "LAUNCH2025", "TRIAL50")
   * Case-insensitive for redemption
   */
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  /**
   * Offer name/title
   */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * Offer description
   */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  /**
   * Discount type: percentage or fixed amount
   */
  @Column({
    type: 'enum',
    enum: DiscountType,
  })
  discountType: DiscountType;

  /**
   * Discount value
   * - If PERCENTAGE: value is 0-100 (e.g., 20 = 20% off)
   * - If FIXED_AMOUNT: value is dollar amount (e.g., 50 = $50 off)
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  /**
   * Specific package this offer applies to (nullable = applies to all)
   */
  @Column({ name: 'package_id', nullable: true })
  packageId: number | null;

  @ManyToOne(() => ServicePackage, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: ServicePackage | null;

  /**
   * Offer validity start date
   */
  @Column({ name: 'valid_from', type: 'timestamp' })
  validFrom: Date;

  /**
   * Offer validity end date
   */
  @Column({ name: 'valid_until', type: 'timestamp' })
  validUntil: Date;

  /**
   * Maximum total uses (null = unlimited)
   */
  @Column({ name: 'max_uses', type: 'int', nullable: true })
  maxUses: number | null;

  /**
   * Maximum uses per center (null = unlimited per center)
   */
  @Column({ name: 'max_uses_per_center', type: 'int', nullable: true })
  maxUsesPerCenter: number | null;

  /**
   * Current number of times this offer has been used
   */
  @Column({ name: 'current_uses', type: 'int', default: 0 })
  currentUses: number;

  /**
   * Offer status
   */
  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.ACTIVE,
  })
  status: OfferStatus;

  /**
   * Subscriptions that used this offer
   */
  @OneToMany(
    () => CenterSubscription,
    (subscription) => subscription.appliedOffer,
  )
  subscriptions: CenterSubscription[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

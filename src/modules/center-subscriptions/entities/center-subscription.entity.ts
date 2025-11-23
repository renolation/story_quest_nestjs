import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Center } from '../../centers/entities/center.entity';
import { ServicePackage } from '../../service-packages/entities/service-package.entity';
import { Offer } from '../../offers/entities/offer.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  TRIAL = 'trial',
}

/**
 * PHASE 2 - CENTER SUBSCRIPTIONS
 *
 * Represents a CENTER's subscription to a SERVICE PACKAGE.
 *
 * Business Logic:
 * - CENTERS purchase service packages created by AGENCY
 * - Each subscription has start/expiry dates
 * - Supports trial periods (from package.trialDays)
 * - Auto-renewal option available
 * - Statuses: active, trial, expired, cancelled
 */
@Entity('center_subscriptions')
export class CenterSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'center_id' })
  centerId: number;

  @ManyToOne(() => Center, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @Column({ name: 'package_id' })
  packageId: number;

  @ManyToOne(() => ServicePackage, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'package_id' })
  package: ServicePackage;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'expiry_date', type: 'timestamp' })
  expiryDate: Date;

  @Column({ name: 'auto_renew', type: 'boolean', default: false })
  autoRenew: boolean;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  /**
   * Applied offer/discount code (if any)
   */
  @Column({ name: 'applied_offer_id', nullable: true })
  appliedOfferId: number | null;

  @ManyToOne(() => Offer, (offer) => offer.subscriptions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'applied_offer_id' })
  appliedOffer: Offer | null;

  /**
   * Original price before discount
   */
  @Column({
    name: 'original_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  originalPrice: number | null;

  /**
   * Discount amount applied
   */
  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  discountAmount: number | null;

  /**
   * Final price after discount
   */
  @Column({
    name: 'final_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  finalPrice: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

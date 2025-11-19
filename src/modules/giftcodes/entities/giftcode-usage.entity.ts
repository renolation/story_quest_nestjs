import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Giftcode } from './giftcode.entity';
import { User } from '../../users/entities/user.entity';

/**
 * PHASE 7 - GIFTCODE USAGE
 *
 * Tracks which students have used which giftcodes.
 */
@Entity('giftcode_usage')
@Index(['giftcodeId', 'studentId'], { unique: true })
export class GiftcodeUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'giftcode_id' })
  giftcodeId: number;

  @ManyToOne(() => Giftcode, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'giftcode_id' })
  giftcode: Giftcode;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @CreateDateColumn({ name: 'used_at' })
  usedAt: Date;
}

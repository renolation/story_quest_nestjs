import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Story } from './story.entity';

/**
 * PHASE 5 - STORY SCENES
 *
 * Individual scenes/pages within a story.
 */
@Entity('story_scenes')
export class StoryScene {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'story_id' })
  storyId: number;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ name: 'scene_number', type: 'int' })
  sceneNumber: number;

  @Column({ name: 'scene_text', type: 'text' })
  sceneText: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ name: 'audio_url', type: 'varchar', length: 500, nullable: true })
  audioUrl: string; // TTS narration

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

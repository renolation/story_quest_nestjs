import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Story } from './story.entity';
import { StoryScene } from './story-scene.entity';

/**
 * PHASE 5 - STORY VOCABULARY
 *
 * Vocabulary words used in stories for learning.
 */
@Entity('story_vocabulary')
export class StoryVocabulary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'story_id' })
  storyId: number;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ name: 'scene_id', nullable: true })
  sceneId: number;

  @ManyToOne(() => StoryScene, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scene_id' })
  scene: StoryScene;

  @Column({ type: 'varchar', length: 255 })
  word: string;

  @Column({ type: 'text', nullable: true })
  definition: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

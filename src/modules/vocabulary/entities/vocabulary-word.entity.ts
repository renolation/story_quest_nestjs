import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * PHASE 3 - VOCABULARY WORDS
 *
 * Stores vocabulary words with definitions, example sentences,
 * and TTS-generated audio for pronunciation practice.
 */
@Entity('vocabulary_words')
export class VocabularyWord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  word: string;

  @Column({ type: 'text', nullable: true })
  definition: string;

  @Column({ name: 'example_sentence', type: 'text', nullable: true })
  exampleSentence: string;

  @Column({ name: 'audio_url', type: 'varchar', length: 500, nullable: true })
  audioUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phonetic: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

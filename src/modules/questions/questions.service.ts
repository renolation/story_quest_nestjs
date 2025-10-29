import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { AnswerOption } from './entities/answer-option.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(AnswerOption)
    private readonly answerOptionRepository: Repository<AnswerOption>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const { answerOptions, ...questionData } = createQuestionDto;

    const question = this.questionRepository.create(questionData);
    const savedQuestion = await this.questionRepository.save(question);

    if (answerOptions && answerOptions.length > 0) {
      const options = answerOptions.map((option) =>
        this.answerOptionRepository.create({
          ...option,
          questionId: savedQuestion.id,
        }),
      );
      await this.answerOptionRepository.save(options);
    }

    return this.findOne(savedQuestion.id);
  }

  async findAll(levelId?: string): Promise<Question[]> {
    const query: any = {
      where: levelId ? { levelId, isActive: true } : { isActive: true },
      order: { orderIndex: 'ASC' },
      relations: ['answerOptions'],
    };

    return await this.questionRepository.find(query);
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['answerOptions'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const { answerOptions, ...questionData } = updateQuestionDto;
    const question = await this.findOne(id);

    Object.assign(question, questionData);
    await this.questionRepository.save(question);

    if (answerOptions) {
      // Remove existing answer options
      await this.answerOptionRepository.delete({ questionId: id });

      // Create new answer options
      if (answerOptions.length > 0) {
        const options = answerOptions.map((option) =>
          this.answerOptionRepository.create({
            ...option,
            questionId: id,
          }),
        );
        await this.answerOptionRepository.save(options);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const question = await this.findOne(id);
    await this.questionRepository.remove(question);
  }
}

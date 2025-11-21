import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Question } from './entities/question.entity';
import { AnswerOption } from './entities/answer-option.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionType } from '../../common/enums/question-type.enum';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let questionRepository: Repository<Question>;
  let answerOptionRepository: Repository<AnswerOption>;

  const mockQuestion: Question = {
    id: 1,
    questionText: 'What is your name?',
    questionType: QuestionType.SELECT_RIGHT_ANSWER,
    levelId: 1,
    orderIndex: 0,
    points: 10,
    audioUrl: 'https://example.com/audio.mp3',
    imageUrl: 'https://example.com/image.jpg',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    level: null,
    answerOptions: [],
    studentQuestionAnswers: [],
  };

  const mockAnswerOption = {
    id: 1,
    questionId: 1,
    optionText: 'John',
    isCorrect: true,
    orderIndex: 0,
    audioUrl: null,
    imageUrl: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockQuestionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockAnswerOptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: getRepositoryToken(Question),
          useValue: mockQuestionRepository,
        },
        {
          provide: getRepositoryToken(AnswerOption),
          useValue: mockAnswerOptionRepository,
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
    questionRepository = module.get<Repository<Question>>(
      getRepositoryToken(Question),
    );
    answerOptionRepository = module.get<Repository<AnswerOption>>(
      getRepositoryToken(AnswerOption),
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new question without answer options', async () => {
      const createDto: CreateQuestionDto = {
        questionText: 'What is your name?',
        questionType: QuestionType.SELECT_RIGHT_ANSWER,
        levelId: 1,
        orderIndex: 0,
        points: 10,
      };

      const savedQuestion = { ...mockQuestion, id: 1 };
      const questionWithOptions = { ...savedQuestion, answerOptions: [] };

      mockQuestionRepository.create.mockReturnValue(savedQuestion);
      mockQuestionRepository.save.mockResolvedValue(savedQuestion);
      mockQuestionRepository.findOne.mockResolvedValue(questionWithOptions);

      const result = await service.create(createDto);

      expect(questionRepository.create).toHaveBeenCalledWith(createDto);
      expect(questionRepository.save).toHaveBeenCalledWith(savedQuestion);
      expect(result).toEqual(questionWithOptions);
      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
    });

    it('should create question with answer options', async () => {
      const createDto: CreateQuestionDto = {
        questionText: 'What is your name?',
        questionType: QuestionType.SELECT_RIGHT_ANSWER,
        levelId: 1,
        orderIndex: 0,
        points: 10,
        answerOptions: [
          { optionText: 'John', isCorrect: true, orderIndex: 0 },
          { optionText: 'Jane', isCorrect: false, orderIndex: 1 },
        ],
      };

      const savedQuestion = { ...mockQuestion, id: 1 };
      const questionWithOptions = {
        ...savedQuestion,
        answerOptions: [
          { ...mockAnswerOption, id: 1, optionText: 'John' },
          { ...mockAnswerOption, id: 2, optionText: 'Jane', isCorrect: false },
        ],
      };

      mockQuestionRepository.create.mockReturnValue(savedQuestion);
      mockQuestionRepository.save.mockResolvedValue(savedQuestion);
      mockAnswerOptionRepository.create.mockImplementation((dto) => dto);
      mockAnswerOptionRepository.save.mockResolvedValue([]);
      mockQuestionRepository.findOne.mockResolvedValue(questionWithOptions);

      const result = await service.create(createDto);

      expect(answerOptionRepository.create).toHaveBeenCalledTimes(2);
      expect(answerOptionRepository.save).toHaveBeenCalled();
      expect(result.answerOptions).toHaveLength(2);
    });

    it('should create question with integer ID', async () => {
      const createDto: CreateQuestionDto = {
        questionText: 'Test question',
        questionType: QuestionType.FILL_IN_BLANK,
        levelId: 2,
        orderIndex: 5,
        points: 15,
      };

      const savedQuestion = { ...mockQuestion, id: 42 };
      mockQuestionRepository.create.mockReturnValue(savedQuestion);
      mockQuestionRepository.save.mockResolvedValue(savedQuestion);
      mockQuestionRepository.findOne.mockResolvedValue(savedQuestion);

      const result = await service.create(createDto);

      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
      expect(typeof result.levelId).toBe('number');
    });

    it('should create question with all optional fields', async () => {
      const createDto: CreateQuestionDto = {
        questionText: 'Complete question',
        questionType: QuestionType.TALK_TO_SPEECH_COMPARE,
        levelId: 1,
        orderIndex: 0,
        points: 20,
        audioUrl: 'https://example.com/audio.mp3',
        imageUrl: 'https://example.com/image.jpg',
      };

      const completeQuestion = { ...mockQuestion, ...createDto };
      mockQuestionRepository.create.mockReturnValue(completeQuestion);
      mockQuestionRepository.save.mockResolvedValue(completeQuestion);
      mockQuestionRepository.findOne.mockResolvedValue(completeQuestion);

      const result = await service.create(createDto);

      expect(result.audioUrl).toBe('https://example.com/audio.mp3');
      expect(result.imageUrl).toBe('https://example.com/image.jpg');
      expect(result.points).toBe(20);
    });
  });

  describe('findAll', () => {
    it('should return all active questions with answer options', async () => {
      const questions = [{ ...mockQuestion, answerOptions: [mockAnswerOption] }];

      mockQuestionRepository.find.mockResolvedValue(questions);

      const result = await service.findAll();

      expect(questionRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { orderIndex: 'ASC' },
        relations: ['answerOptions'],
      });
      expect(result).toHaveLength(1);
      expect(result[0].answerOptions).toBeDefined();
    });

    it('should filter questions by levelId', async () => {
      const levelId = 2;
      const questions = [mockQuestion];

      mockQuestionRepository.find.mockResolvedValue(questions);

      const result = await service.findAll(levelId);

      expect(questionRepository.find).toHaveBeenCalledWith({
        where: { levelId, isActive: true },
        order: { orderIndex: 'ASC' },
        relations: ['answerOptions'],
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no questions exist', async () => {
      mockQuestionRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle integer levelId filter', async () => {
      const levelId = 999;
      mockQuestionRepository.find.mockResolvedValue([]);

      await service.findAll(levelId);

      expect(questionRepository.find).toHaveBeenCalledWith({
        where: { levelId: 999, isActive: true },
        order: { orderIndex: 'ASC' },
        relations: ['answerOptions'],
      });
    });

    it('should return questions with multiple answer options', async () => {
      const questions = [
        {
          ...mockQuestion,
          answerOptions: [
            { ...mockAnswerOption, id: 1, optionText: 'Option 1' },
            { ...mockAnswerOption, id: 2, optionText: 'Option 2' },
            { ...mockAnswerOption, id: 3, optionText: 'Option 3' },
          ],
        },
      ];

      mockQuestionRepository.find.mockResolvedValue(questions);

      const result = await service.findAll();

      expect(result[0].answerOptions).toHaveLength(3);
    });
  });

  describe('findOne', () => {
    it('should return a question by ID with answer options', async () => {
      const questionId = 1;
      const questionWithOptions = {
        ...mockQuestion,
        answerOptions: [mockAnswerOption],
      };

      mockQuestionRepository.findOne.mockResolvedValue(questionWithOptions);

      const result = await service.findOne(questionId);

      expect(questionRepository.findOne).toHaveBeenCalledWith({
        where: { id: questionId },
        relations: ['answerOptions'],
      });
      expect(result.id).toBe(1);
      expect(result.answerOptions).toBeDefined();
    });

    it('should throw NotFoundException when question not found', async () => {
      const questionId = 999;

      mockQuestionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(questionId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(questionId)).rejects.toThrow(
        `Question with ID ${questionId} not found`,
      );
    });

    it('should handle integer ID parameter', async () => {
      const questionId = 42;
      const question = { ...mockQuestion, id: questionId, answerOptions: [] };

      mockQuestionRepository.findOne.mockResolvedValue(question);

      const result = await service.findOne(questionId);

      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
    });

    it('should return question with empty answer options array', async () => {
      const questionId = 1;
      const questionWithoutOptions = {
        ...mockQuestion,
        answerOptions: [],
      };

      mockQuestionRepository.findOne.mockResolvedValue(questionWithoutOptions);

      const result = await service.findOne(questionId);

      expect(result.answerOptions).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a question without changing answer options', async () => {
      const questionId = 1;
      const updateDto: UpdateQuestionDto = {
        questionText: 'Updated question',
        points: 15,
      };

      const updatedQuestion = { ...mockQuestion, ...updateDto, answerOptions: [] };

      mockQuestionRepository.findOne.mockResolvedValue(mockQuestion);
      mockQuestionRepository.save.mockResolvedValue(updatedQuestion);

      const result = await service.update(questionId, updateDto);

      expect(questionRepository.findOne).toHaveBeenCalledTimes(2); // Once in update, once in findOne
      expect(questionRepository.save).toHaveBeenCalled();
      expect(result.questionText).toBe('Updated question');
      expect(result.points).toBe(15);
    });

    it('should update question and replace answer options', async () => {
      const questionId = 1;
      const updateDto: UpdateQuestionDto = {
        questionText: 'Updated question',
        answerOptions: [
          { optionText: 'New Option 1', isCorrect: true, orderIndex: 0 },
          { optionText: 'New Option 2', isCorrect: false, orderIndex: 1 },
        ],
      };

      const updatedQuestion = {
        ...mockQuestion,
        questionText: 'Updated question',
        answerOptions: [
          { ...mockAnswerOption, optionText: 'New Option 1' },
          { ...mockAnswerOption, id: 2, optionText: 'New Option 2', isCorrect: false },
        ],
      };

      mockQuestionRepository.findOne
        .mockResolvedValueOnce(mockQuestion)
        .mockResolvedValueOnce(updatedQuestion);
      mockQuestionRepository.save.mockResolvedValue(updatedQuestion);
      mockAnswerOptionRepository.delete.mockResolvedValue({ affected: 2 });
      mockAnswerOptionRepository.create.mockImplementation((dto) => dto);
      mockAnswerOptionRepository.save.mockResolvedValue([]);

      const result = await service.update(questionId, updateDto);

      expect(answerOptionRepository.delete).toHaveBeenCalledWith({ questionId });
      expect(answerOptionRepository.create).toHaveBeenCalledTimes(2);
      expect(answerOptionRepository.save).toHaveBeenCalled();
      expect(result.answerOptions).toHaveLength(2);
    });

    it('should throw NotFoundException when question not found', async () => {
      const questionId = 999;
      const updateDto: UpdateQuestionDto = { questionText: 'Updated' };

      mockQuestionRepository.findOne.mockResolvedValue(null);

      await expect(service.update(questionId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update only provided fields', async () => {
      const questionId = 1;
      const updateDto: UpdateQuestionDto = {
        questionText: 'Only text updated',
      };

      const updatedQuestion = {
        ...mockQuestion,
        questionText: 'Only text updated',
        answerOptions: [],
      };

      mockQuestionRepository.findOne.mockResolvedValue(mockQuestion);
      mockQuestionRepository.save.mockResolvedValue(updatedQuestion);

      const result = await service.update(questionId, updateDto);

      expect(result.questionText).toBe('Only text updated');
      expect(result.points).toBe(mockQuestion.points);
    });

    it('should update questionType', async () => {
      const questionId = 1;
      const updateDto: UpdateQuestionDto = {
        questionType: QuestionType.SORT_WORDS,
      };

      const updatedQuestion = {
        ...mockQuestion,
        questionType: QuestionType.SORT_WORDS,
        answerOptions: [],
      };

      mockQuestionRepository.findOne.mockResolvedValue(mockQuestion);
      mockQuestionRepository.save.mockResolvedValue(updatedQuestion);

      const result = await service.update(questionId, updateDto);

      expect(result.questionType).toBe(QuestionType.SORT_WORDS);
    });

    it('should clear answer options when empty array provided', async () => {
      const questionId = 1;
      const updateDto: UpdateQuestionDto = {
        questionText: 'Question without options',
        answerOptions: [],
      };

      const updatedQuestion = {
        ...mockQuestion,
        questionText: 'Question without options',
        answerOptions: [],
      };

      mockQuestionRepository.findOne.mockResolvedValue(mockQuestion);
      mockQuestionRepository.save.mockResolvedValue(updatedQuestion);
      mockAnswerOptionRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.update(questionId, updateDto);

      expect(answerOptionRepository.delete).toHaveBeenCalledWith({ questionId });
      expect(result.answerOptions).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should remove a question', async () => {
      const questionId = 1;
      const questionWithOptions = {
        ...mockQuestion,
        answerOptions: [mockAnswerOption],
      };

      mockQuestionRepository.findOne.mockResolvedValue(questionWithOptions);
      mockQuestionRepository.remove.mockResolvedValue(questionWithOptions);

      await service.remove(questionId);

      expect(questionRepository.findOne).toHaveBeenCalledWith({
        where: { id: questionId },
        relations: ['answerOptions'],
      });
      expect(questionRepository.remove).toHaveBeenCalledWith(questionWithOptions);
    });

    it('should throw NotFoundException when question not found', async () => {
      const questionId = 999;

      mockQuestionRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(questionId)).rejects.toThrow(NotFoundException);
      expect(questionRepository.remove).not.toHaveBeenCalled();
    });

    it('should handle integer ID parameter', async () => {
      const questionId = 456;
      const question = { ...mockQuestion, id: questionId, answerOptions: [] };

      mockQuestionRepository.findOne.mockResolvedValue(question);
      mockQuestionRepository.remove.mockResolvedValue(question);

      await service.remove(questionId);

      expect(questionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 456 },
        relations: ['answerOptions'],
      });
      expect(typeof questionId).toBe('number');
    });

    it('should remove question with answer options', async () => {
      const questionId = 1;
      const questionWithOptions = {
        ...mockQuestion,
        answerOptions: [
          { ...mockAnswerOption, id: 1 },
          { ...mockAnswerOption, id: 2 },
          { ...mockAnswerOption, id: 3 },
        ],
      };

      mockQuestionRepository.findOne.mockResolvedValue(questionWithOptions);
      mockQuestionRepository.remove.mockResolvedValue(questionWithOptions);

      await service.remove(questionId);

      expect(questionRepository.remove).toHaveBeenCalledWith(questionWithOptions);
    });
  });
});

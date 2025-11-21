import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionType } from '../../common/enums/question-type.enum';

describe('QuestionsController', () => {
  let controller: QuestionsController;
  let service: QuestionsService;

  const mockQuestion = {
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
    answerOptions: [
      {
        id: 1,
        optionText: 'John',
        isCorrect: true,
        orderIndex: 0,
      },
      {
        id: 2,
        optionText: 'Jane',
        isCorrect: false,
        orderIndex: 1,
      },
    ],
  };

  const mockQuestionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: QuestionsService,
          useValue: mockQuestionsService,
        },
      ],
    }).compile();

    controller = module.get<QuestionsController>(QuestionsController);
    service = module.get<QuestionsService>(QuestionsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new question', async () => {
      const createDto: CreateQuestionDto = {
        questionText: 'What is your name?',
        questionType: QuestionType.SELECT_RIGHT_ANSWER,
        levelId: 1,
        orderIndex: 0,
        points: 10,
      };

      const expectedQuestion = { id: 1, ...createDto, answerOptions: [] };
      mockQuestionsService.create.mockResolvedValue(expectedQuestion);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedQuestion);
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

      mockQuestionsService.create.mockResolvedValue(mockQuestion);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
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

      const expectedQuestion = { id: 42, ...createDto };
      mockQuestionsService.create.mockResolvedValue(expectedQuestion);

      const result = await controller.create(createDto);

      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
      expect(typeof result.levelId).toBe('number');
    });

    it('should create question with integer levelId', async () => {
      const createDto: CreateQuestionDto = {
        questionText: 'New question',
        questionType: QuestionType.SORT_WORDS,
        levelId: 99,
        orderIndex: 10,
        points: 20,
      };

      const expectedQuestion = { id: 5, ...createDto };
      mockQuestionsService.create.mockResolvedValue(expectedQuestion);

      const result = await controller.create(createDto);

      expect(result.levelId).toBe(99);
      expect(typeof result.levelId).toBe('number');
    });

    it('should create question with all fields', async () => {
      const createDto: CreateQuestionDto = {
        questionText: 'Complete question',
        questionType: QuestionType.TALK_TO_SPEECH_COMPARE,
        levelId: 1,
        orderIndex: 0,
        points: 25,
        audioUrl: 'https://example.com/audio.mp3',
        imageUrl: 'https://example.com/image.jpg',
        answerOptions: [{ optionText: 'Answer', isCorrect: true, orderIndex: 0 }],
      };

      const expectedQuestion = { id: 1, ...createDto };
      mockQuestionsService.create.mockResolvedValue(expectedQuestion);

      const result = await controller.create(createDto);

      expect(result.audioUrl).toBe('https://example.com/audio.mp3');
      expect(result.imageUrl).toBe('https://example.com/image.jpg');
      expect(result.points).toBe(25);
    });
  });

  describe('findAll', () => {
    it('should return all questions with answer options', async () => {
      const questions = [mockQuestion];
      mockQuestionsService.findAll.mockResolvedValue(questions);

      const result = await controller.findAll(undefined);

      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(questions);
      expect(result).toHaveLength(1);
      expect(result[0].answerOptions).toHaveLength(2);
    });

    it('should filter questions by levelId', async () => {
      const levelId = 2;
      const questions = [mockQuestion];
      mockQuestionsService.findAll.mockResolvedValue(questions);

      const result = await controller.findAll(levelId);

      expect(service.findAll).toHaveBeenCalledWith(levelId);
      expect(result).toEqual(questions);
    });

    it('should return empty array when no questions exist', async () => {
      mockQuestionsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(undefined);

      expect(result).toEqual([]);
    });

    it('should handle integer levelId parameter', async () => {
      const levelId = 999;
      mockQuestionsService.findAll.mockResolvedValue([]);

      await controller.findAll(levelId);

      expect(service.findAll).toHaveBeenCalledWith(999);
      expect(typeof levelId).toBe('number');
    });

    it('should return multiple questions', async () => {
      const questions = [
        mockQuestion,
        { ...mockQuestion, id: 2, questionText: 'Second question' },
        { ...mockQuestion, id: 3, questionText: 'Third question' },
      ];
      mockQuestionsService.findAll.mockResolvedValue(questions);

      const result = await controller.findAll(undefined);

      expect(result).toHaveLength(3);
    });

    it('should return questions with different types', async () => {
      const questions = [
        { ...mockQuestion, questionType: QuestionType.SELECT_RIGHT_ANSWER },
        { ...mockQuestion, id: 2, questionType: QuestionType.FILL_IN_BLANK },
        { ...mockQuestion, id: 3, questionType: QuestionType.SORT_WORDS },
      ];
      mockQuestionsService.findAll.mockResolvedValue(questions);

      const result = await controller.findAll(undefined);

      expect(result[0].questionType).toBe(QuestionType.SELECT_RIGHT_ANSWER);
      expect(result[1].questionType).toBe(QuestionType.FILL_IN_BLANK);
      expect(result[2].questionType).toBe(QuestionType.SORT_WORDS);
    });
  });

  describe('findOne', () => {
    it('should return a question by ID with answer options', async () => {
      const questionId = 1;
      mockQuestionsService.findOne.mockResolvedValue(mockQuestion);

      const result = await controller.findOne(questionId);

      expect(service.findOne).toHaveBeenCalledWith(questionId);
      expect(result).toEqual(mockQuestion);
      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
      expect(result.answerOptions).toHaveLength(2);
    });

    it('should handle integer ID parameter', async () => {
      const questionId = 999;
      const question = { ...mockQuestion, id: questionId };

      mockQuestionsService.findOne.mockResolvedValue(question);

      const result = await controller.findOne(questionId);

      expect(service.findOne).toHaveBeenCalledWith(questionId);
      expect(result.id).toBe(999);
      expect(typeof result.id).toBe('number');
    });

    it('should return question with all fields', async () => {
      const questionId = 1;
      mockQuestionsService.findOne.mockResolvedValue(mockQuestion);

      const result = await controller.findOne(questionId);

      expect(result.questionText).toBe('What is your name?');
      expect(result.questionType).toBe(QuestionType.SELECT_RIGHT_ANSWER);
      expect(result.points).toBe(10);
      expect(result.audioUrl).toBe('https://example.com/audio.mp3');
      expect(result.imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should return question without answer options', async () => {
      const questionId = 1;
      const questionWithoutOptions = {
        ...mockQuestion,
        answerOptions: [],
      };

      mockQuestionsService.findOne.mockResolvedValue(questionWithoutOptions);

      const result = await controller.findOne(questionId);

      expect(result.answerOptions).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a question', async () => {
      const questionId = 1;
      const updateDto: UpdateQuestionDto = {
        questionText: 'Updated question',
        points: 15,
      };

      const updatedQuestion = {
        id: 1,
        ...updateDto,
        questionType: QuestionType.SELECT_RIGHT_ANSWER,
        levelId: 1,
        orderIndex: 0,
        isActive: true,
        answerOptions: [],
      };

      mockQuestionsService.update.mockResolvedValue(updatedQuestion);

      const result = await controller.update(questionId, updateDto);

      expect(service.update).toHaveBeenCalledWith(questionId, updateDto);
      expect(result.questionText).toBe('Updated question');
      expect(result.points).toBe(15);
    });

    it('should update with integer ID', async () => {
      const questionId = 42;
      const updateDto: UpdateQuestionDto = { questionText: 'New question' };
      const updatedQuestion = { id: 42, questionText: 'New question' };

      mockQuestionsService.update.mockResolvedValue(updatedQuestion);

      const result = await controller.update(questionId, updateDto);

      expect(service.update).toHaveBeenCalledWith(42, updateDto);
      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
    });

    it('should update only provided fields', async () => {
      const questionId = 1;
      const updateDto: UpdateQuestionDto = { questionText: 'Only text' };
      const updatedQuestion = {
        id: 1,
        questionText: 'Only text',
        questionType: QuestionType.SELECT_RIGHT_ANSWER,
        points: 10,
        answerOptions: [],
      };

      mockQuestionsService.update.mockResolvedValue(updatedQuestion);

      const result = await controller.update(questionId, updateDto);

      expect(result.questionText).toBe('Only text');
      expect(result.points).toBe(10);
    });

    it('should update question type', async () => {
      const questionId = 1;
      const updateDto: UpdateQuestionDto = {
        questionType: QuestionType.SORT_WORDS,
      };
      const updatedQuestion = {
        id: 1,
        questionText: 'Question',
        questionType: QuestionType.SORT_WORDS,
        answerOptions: [],
      };

      mockQuestionsService.update.mockResolvedValue(updatedQuestion);

      const result = await controller.update(questionId, updateDto);

      expect(result.questionType).toBe(QuestionType.SORT_WORDS);
    });

    it('should update answer options', async () => {
      const questionId = 1;
      const updateDto: UpdateQuestionDto = {
        questionText: 'Updated question',
        answerOptions: [
          { optionText: 'New Option 1', isCorrect: true, orderIndex: 0 },
          { optionText: 'New Option 2', isCorrect: false, orderIndex: 1 },
        ],
      };

      const updatedQuestion = {
        id: 1,
        questionText: 'Updated question',
        answerOptions: [
          { id: 3, optionText: 'New Option 1', isCorrect: true, orderIndex: 0 },
          { id: 4, optionText: 'New Option 2', isCorrect: false, orderIndex: 1 },
        ],
      };

      mockQuestionsService.update.mockResolvedValue(updatedQuestion);

      const result = await controller.update(questionId, updateDto);

      expect(result.answerOptions).toHaveLength(2);
      expect(result.answerOptions[0].optionText).toBe('New Option 1');
      expect(result.answerOptions[1].optionText).toBe('New Option 2');
    });

    it('should update multiple fields', async () => {
      const questionId = 1;
      const updateDto: UpdateQuestionDto = {
        questionText: 'New question',
        questionType: QuestionType.FILL_IN_BLANK,
        points: 20,
        audioUrl: 'https://example.com/new-audio.mp3',
      };

      const updatedQuestion = {
        id: 1,
        ...updateDto,
        answerOptions: [],
      };

      mockQuestionsService.update.mockResolvedValue(updatedQuestion);

      const result = await controller.update(questionId, updateDto);

      expect(result.questionText).toBe('New question');
      expect(result.questionType).toBe(QuestionType.FILL_IN_BLANK);
      expect(result.points).toBe(20);
      expect(result.audioUrl).toBe('https://example.com/new-audio.mp3');
    });
  });

  describe('remove', () => {
    it('should remove a question', async () => {
      const questionId = 1;
      mockQuestionsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(questionId);

      expect(service.remove).toHaveBeenCalledWith(questionId);
      expect(result).toBeUndefined();
    });

    it('should remove question with integer ID', async () => {
      const questionId = 999;
      mockQuestionsService.remove.mockResolvedValue(undefined);

      await controller.remove(questionId);

      expect(service.remove).toHaveBeenCalledWith(999);
    });

    it('should handle multiple remove calls', async () => {
      mockQuestionsService.remove.mockResolvedValue(undefined);

      await controller.remove(1);
      await controller.remove(2);
      await controller.remove(3);

      expect(service.remove).toHaveBeenCalledTimes(3);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledWith(2);
      expect(service.remove).toHaveBeenCalledWith(3);
    });
  });
});

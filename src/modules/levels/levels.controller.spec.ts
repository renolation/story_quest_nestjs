import { Test, TestingModule } from '@nestjs/testing';
import { LevelsController } from './levels.controller';
import { LevelsService } from './levels.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { LevelResponseDto } from './dto/level-response.dto';

describe('LevelsController', () => {
  let controller: LevelsController;
  let service: LevelsService;

  const mockLevelResponse: LevelResponseDto = {
    id: 1,
    title: 'Introduction Level',
    description: 'Basic introduction level',
    unitId: 1,
    orderIndex: 0,
    timeLimitSeconds: 300,
    passingScore: 70,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    progress: {
      attemptCount: 3,
      bestScore: 85,
      bestPointsEarned: 850,
      isPassed: true,
      isCompleted: true,
      lastAttemptAt: new Date('2025-01-15'),
    },
  };

  const mockUser = {
    id: 1,
    email: 'student@example.com',
    role: 'student',
  };

  const mockLevelsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LevelsController],
      providers: [
        {
          provide: LevelsService,
          useValue: mockLevelsService,
        },
      ],
    }).compile();

    controller = module.get<LevelsController>(LevelsController);
    service = module.get<LevelsService>(LevelsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new level', async () => {
      const createDto: CreateLevelDto = {
        title: 'Introduction Level',
        description: 'Basic introduction level',
        unitId: 1,
        orderIndex: 0,
        timeLimitSeconds: 300,
        passingScore: 70,
      };

      const expectedLevel = { id: 1, ...createDto };
      mockLevelsService.create.mockResolvedValue(expectedLevel);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedLevel);
      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
    });

    it('should create level with integer ID', async () => {
      const createDto: CreateLevelDto = {
        title: 'Test Level',
        description: 'Test Description',
        unitId: 2,
        orderIndex: 5,
        timeLimitSeconds: 600,
        passingScore: 80,
      };

      const expectedLevel = { id: 42, ...createDto };
      mockLevelsService.create.mockResolvedValue(expectedLevel);

      const result = await controller.create(createDto);

      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
      expect(typeof result.unitId).toBe('number');
    });

    it('should create level with integer unitId', async () => {
      const createDto: CreateLevelDto = {
        title: 'New Level',
        description: 'New Description',
        unitId: 99,
        orderIndex: 10,
        timeLimitSeconds: 900,
        passingScore: 90,
      };

      const expectedLevel = { id: 5, ...createDto };
      mockLevelsService.create.mockResolvedValue(expectedLevel);

      const result = await controller.create(createDto);

      expect(result.unitId).toBe(99);
      expect(typeof result.unitId).toBe('number');
    });

    it('should create level with time limit and passing score', async () => {
      const createDto: CreateLevelDto = {
        title: 'Timed Level',
        description: 'Level with time constraint',
        unitId: 1,
        orderIndex: 0,
        timeLimitSeconds: 450,
        passingScore: 75,
      };

      const expectedLevel = { id: 1, ...createDto };
      mockLevelsService.create.mockResolvedValue(expectedLevel);

      const result = await controller.create(createDto);

      expect(result.timeLimitSeconds).toBe(450);
      expect(result.passingScore).toBe(75);
    });
  });

  describe('findAll', () => {
    it('should return all levels without questions', async () => {
      const levels = [mockLevelResponse];
      mockLevelsService.findAll.mockResolvedValue(levels);

      const result = await controller.findAll(mockUser, undefined, undefined);

      expect(service.findAll).toHaveBeenCalledWith(
        mockUser.id,
        undefined,
        false,
      );
      expect(result).toEqual(levels);
      expect(result).toHaveLength(1);
    });

    it('should return all levels with questions when includeQuestions is "true"', async () => {
      const levelsWithQuestions = [
        {
          ...mockLevelResponse,
          questions: [{ id: 1, questionText: 'What is your name?' }],
        },
      ];

      mockLevelsService.findAll.mockResolvedValue(levelsWithQuestions);

      const result = await controller.findAll(mockUser, undefined, 'true');

      expect(service.findAll).toHaveBeenCalledWith(
        mockUser.id,
        undefined,
        true,
      );
      expect(result[0].questions).toBeDefined();
      expect(result[0].questions).toHaveLength(1);
    });

    it('should return levels without questions when includeQuestions is "false"', async () => {
      const levels = [mockLevelResponse];
      mockLevelsService.findAll.mockResolvedValue(levels);

      const result = await controller.findAll(mockUser, undefined, 'false');

      expect(service.findAll).toHaveBeenCalledWith(
        mockUser.id,
        undefined,
        false,
      );
      expect(result[0].questions).toBeUndefined();
    });

    it('should filter levels by unitId', async () => {
      const unitId = 2;
      const levels = [mockLevelResponse];
      mockLevelsService.findAll.mockResolvedValue(levels);

      const result = await controller.findAll(mockUser, unitId, undefined);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, unitId, false);
      expect(result).toEqual(levels);
    });

    it('should return empty array when no levels exist', async () => {
      mockLevelsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser, undefined, undefined);

      expect(result).toEqual([]);
    });

    it('should use current user ID from decorator', async () => {
      const customUser = {
        id: 123,
        email: 'test@example.com',
        role: 'student',
      };
      mockLevelsService.findAll.mockResolvedValue([]);

      await controller.findAll(customUser, undefined, undefined);

      expect(service.findAll).toHaveBeenCalledWith(123, undefined, false);
    });

    it('should handle integer unitId parameter', async () => {
      const unitId = 999;
      mockLevelsService.findAll.mockResolvedValue([]);

      await controller.findAll(mockUser, unitId, undefined);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, 999, false);
      expect(typeof unitId).toBe('number');
    });

    it('should combine unitId filter with includeQuestions', async () => {
      const unitId = 5;
      const levelsWithQuestions = [
        {
          ...mockLevelResponse,
          questions: [{ id: 1, questionText: 'Test question' }],
        },
      ];

      mockLevelsService.findAll.mockResolvedValue(levelsWithQuestions);

      const result = await controller.findAll(mockUser, unitId, 'true');

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, 5, true);
      expect(result[0].questions).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a level by ID', async () => {
      const levelId = 1;
      mockLevelsService.findOne.mockResolvedValue(mockLevelResponse);

      const result = await controller.findOne(mockUser, levelId, undefined);

      expect(service.findOne).toHaveBeenCalledWith(levelId, mockUser.id, false);
      expect(result).toEqual(mockLevelResponse);
      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
    });

    it('should return level with questions when includeQuestions is "true"', async () => {
      const levelId = 1;
      const levelWithQuestions = {
        ...mockLevelResponse,
        questions: [{ id: 1, questionText: 'What is your name?' }],
      };

      mockLevelsService.findOne.mockResolvedValue(levelWithQuestions);

      const result = await controller.findOne(mockUser, levelId, 'true');

      expect(service.findOne).toHaveBeenCalledWith(levelId, mockUser.id, true);
      expect(result.questions).toBeDefined();
    });

    it('should handle integer ID parameter', async () => {
      const levelId = 999;
      const level = { ...mockLevelResponse, id: levelId };

      mockLevelsService.findOne.mockResolvedValue(level);

      const result = await controller.findOne(mockUser, levelId, undefined);

      expect(service.findOne).toHaveBeenCalledWith(levelId, mockUser.id, false);
      expect(result.id).toBe(999);
      expect(typeof result.id).toBe('number');
    });

    it('should include progress data', async () => {
      const levelId = 1;
      mockLevelsService.findOne.mockResolvedValue(mockLevelResponse);

      const result = await controller.findOne(mockUser, levelId, undefined);

      expect(result.progress).toBeDefined();
      expect(result.progress?.attemptCount).toBe(3);
      expect(result.progress?.bestScore).toBe(85);
      expect(result.progress?.isPassed).toBe(true);
    });

    it('should use current user ID from decorator', async () => {
      const customUser = {
        id: 456,
        email: 'test@example.com',
        role: 'student',
      };
      const levelId = 1;
      mockLevelsService.findOne.mockResolvedValue(mockLevelResponse);

      await controller.findOne(customUser, levelId, undefined);

      expect(service.findOne).toHaveBeenCalledWith(levelId, 456, false);
    });

    it('should include time limit and passing score', async () => {
      const levelId = 1;
      mockLevelsService.findOne.mockResolvedValue(mockLevelResponse);

      const result = await controller.findOne(mockUser, levelId, undefined);

      expect(result.timeLimitSeconds).toBe(300);
      expect(result.passingScore).toBe(70);
    });
  });

  describe('update', () => {
    it('should update a level', async () => {
      const levelId = 1;
      const updateDto: UpdateLevelDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const updatedLevel = {
        id: 1,
        ...updateDto,
        unitId: 1,
        orderIndex: 0,
        timeLimitSeconds: 300,
        passingScore: 70,
        isActive: true,
      };

      mockLevelsService.update.mockResolvedValue(updatedLevel);

      const result = await controller.update(levelId, updateDto);

      expect(service.update).toHaveBeenCalledWith(levelId, updateDto);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated description');
    });

    it('should update with integer ID', async () => {
      const levelId = 42;
      const updateDto: UpdateLevelDto = { title: 'New Title' };
      const updatedLevel = { id: 42, title: 'New Title' };

      mockLevelsService.update.mockResolvedValue(updatedLevel);

      const result = await controller.update(levelId, updateDto);

      expect(service.update).toHaveBeenCalledWith(42, updateDto);
      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
    });

    it('should update only provided fields', async () => {
      const levelId = 1;
      const updateDto: UpdateLevelDto = { title: 'Only Title' };
      const updatedLevel = {
        id: 1,
        title: 'Only Title',
        description: 'Original description',
        unitId: 1,
      };

      mockLevelsService.update.mockResolvedValue(updatedLevel);

      const result = await controller.update(levelId, updateDto);

      expect(result.title).toBe('Only Title');
      expect(result.description).toBe('Original description');
    });

    it('should update timeLimitSeconds with integer', async () => {
      const levelId = 1;
      const updateDto: UpdateLevelDto = { timeLimitSeconds: 450 };
      const updatedLevel = {
        id: 1,
        title: 'Level Title',
        timeLimitSeconds: 450,
      };

      mockLevelsService.update.mockResolvedValue(updatedLevel);

      const result = await controller.update(levelId, updateDto);

      expect(result.timeLimitSeconds).toBe(450);
      expect(typeof result.timeLimitSeconds).toBe('number');
    });

    it('should update passingScore', async () => {
      const levelId = 1;
      const updateDto: UpdateLevelDto = { passingScore: 85 };
      const updatedLevel = {
        id: 1,
        title: 'Level Title',
        passingScore: 85,
      };

      mockLevelsService.update.mockResolvedValue(updatedLevel);

      const result = await controller.update(levelId, updateDto);

      expect(result.passingScore).toBe(85);
    });

    it('should update multiple fields', async () => {
      const levelId = 1;
      const updateDto: UpdateLevelDto = {
        title: 'New Title',
        timeLimitSeconds: 500,
        passingScore: 75,
      };
      const updatedLevel = {
        id: 1,
        title: 'New Title',
        timeLimitSeconds: 500,
        passingScore: 75,
      };

      mockLevelsService.update.mockResolvedValue(updatedLevel);

      const result = await controller.update(levelId, updateDto);

      expect(result.title).toBe('New Title');
      expect(result.timeLimitSeconds).toBe(500);
      expect(result.passingScore).toBe(75);
    });
  });

  describe('remove', () => {
    it('should remove a level', async () => {
      const levelId = 1;
      mockLevelsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(levelId);

      expect(service.remove).toHaveBeenCalledWith(levelId);
      expect(result).toBeUndefined();
    });

    it('should remove level with integer ID', async () => {
      const levelId = 999;
      mockLevelsService.remove.mockResolvedValue(undefined);

      await controller.remove(levelId);

      expect(service.remove).toHaveBeenCalledWith(999);
    });

    it('should handle multiple remove calls', async () => {
      mockLevelsService.remove.mockResolvedValue(undefined);

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

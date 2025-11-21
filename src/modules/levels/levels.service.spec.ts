import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { LevelsService } from './levels.service';
import { Level } from './entities/level.entity';
import { ProgressService } from '../progress/progress.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

describe('LevelsService', () => {
  let service: LevelsService;
  let repository: Repository<Level>;
  let progressService: ProgressService;

  const mockLevel: Level = {
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
    unit: null,
    questions: [],
  };

  const mockLevelProgress = {
    attemptCount: 3,
    bestScore: 85,
    isPassed: true,
    isCompleted: true,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockProgressService = {
    mapLevelsProgressToDto: jest.fn(),
    mapLevelProgressToDto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LevelsService,
        {
          provide: getRepositoryToken(Level),
          useValue: mockRepository,
        },
        {
          provide: ProgressService,
          useValue: mockProgressService,
        },
      ],
    }).compile();

    service = module.get<LevelsService>(LevelsService);
    repository = module.get<Repository<Level>>(getRepositoryToken(Level));
    progressService = module.get<ProgressService>(ProgressService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      mockRepository.create.mockReturnValue(mockLevel);
      mockRepository.save.mockResolvedValue(mockLevel);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockLevel);
      expect(result).toEqual(mockLevel);
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

      mockRepository.create.mockReturnValue(mockLevel);
      mockRepository.save.mockResolvedValue(mockLevel);

      const result = await service.create(createDto);

      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
      expect(typeof result.unitId).toBe('number');
    });

    it('should create level with all fields', async () => {
      const createDto: CreateLevelDto = {
        title: 'Complete Level',
        description: 'Full description',
        unitId: 3,
        orderIndex: 10,
        timeLimitSeconds: 900,
        passingScore: 90,
      };

      const completeLevel = { ...mockLevel, ...createDto };
      mockRepository.create.mockReturnValue(completeLevel);
      mockRepository.save.mockResolvedValue(completeLevel);

      const result = await service.create(createDto);

      expect(result.title).toBe('Complete Level');
      expect(result.description).toBe('Full description');
      expect(result.unitId).toBe(3);
      expect(result.timeLimitSeconds).toBe(900);
      expect(result.passingScore).toBe(90);
    });
  });

  describe('findAll', () => {
    it('should return all active levels with progress', async () => {
      const userId = 1;
      const levels = [mockLevel];
      const progressMap = new Map([[1, mockLevelProgress]]);

      mockRepository.find.mockResolvedValue(levels);
      mockProgressService.mapLevelsProgressToDto.mockResolvedValue(progressMap);

      const result = await service.findAll(userId, undefined, false);

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { orderIndex: 'ASC' },
      });
      expect(progressService.mapLevelsProgressToDto).toHaveBeenCalledWith(
        userId,
        [{ id: 1, passingScore: 70 }],
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].progress).toEqual(mockLevelProgress);
    });

    it('should filter levels by unitId', async () => {
      const userId = 1;
      const unitId = 2;
      const levels = [mockLevel];
      const progressMap = new Map([[1, mockLevelProgress]]);

      mockRepository.find.mockResolvedValue(levels);
      mockProgressService.mapLevelsProgressToDto.mockResolvedValue(progressMap);

      const result = await service.findAll(userId, unitId, false);

      expect(repository.find).toHaveBeenCalledWith({
        where: { unitId, isActive: true },
        order: { orderIndex: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });

    it('should return levels with questions when includeQuestions is true', async () => {
      const userId = 1;
      const levelsWithQuestions = [
        {
          ...mockLevel,
          questions: [{ id: 1, questionText: 'What is your name?' }],
        },
      ];
      const progressMap = new Map([[1, mockLevelProgress]]);

      mockRepository.find.mockResolvedValue(levelsWithQuestions);
      mockProgressService.mapLevelsProgressToDto.mockResolvedValue(progressMap);

      const result = await service.findAll(userId, undefined, true);

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { orderIndex: 'ASC' },
        relations: ['questions', 'questions.answerOptions'],
      });
      expect(result[0].questions).toBeDefined();
      expect(result[0].questions).toHaveLength(1);
    });

    it('should return empty array when no levels exist', async () => {
      const userId = 1;
      const progressMap = new Map();

      mockRepository.find.mockResolvedValue([]);
      mockProgressService.mapLevelsProgressToDto.mockResolvedValue(progressMap);

      const result = await service.findAll(userId, undefined, false);

      expect(result).toEqual([]);
    });

    it('should handle levels with no progress', async () => {
      const userId = 1;
      const levels = [mockLevel];
      const progressMap = new Map();

      mockRepository.find.mockResolvedValue(levels);
      mockProgressService.mapLevelsProgressToDto.mockResolvedValue(progressMap);

      const result = await service.findAll(userId, undefined, false);

      expect(result).toHaveLength(1);
      expect(result[0].progress).toBeNull();
    });

    it('should handle multiple levels with mixed progress', async () => {
      const userId = 1;
      const levels = [
        mockLevel,
        { ...mockLevel, id: 2, title: 'Level 2' },
        { ...mockLevel, id: 3, title: 'Level 3' },
      ];
      const progressMap = new Map([
        [1, mockLevelProgress],
        [3, { ...mockLevelProgress, bestScore: 95 }],
      ]);

      mockRepository.find.mockResolvedValue(levels);
      mockProgressService.mapLevelsProgressToDto.mockResolvedValue(progressMap);

      const result = await service.findAll(userId, undefined, false);

      expect(result).toHaveLength(3);
      expect(result[0].progress).toEqual(mockLevelProgress);
      expect(result[1].progress).toBeNull();
      expect(result[2].progress?.bestScore).toBe(95);
    });

    it('should handle integer unitId filter', async () => {
      const userId = 1;
      const unitId = 999;
      const progressMap = new Map();

      mockRepository.find.mockResolvedValue([]);
      mockProgressService.mapLevelsProgressToDto.mockResolvedValue(progressMap);

      await service.findAll(userId, unitId, false);

      expect(repository.find).toHaveBeenCalledWith({
        where: { unitId: 999, isActive: true },
        order: { orderIndex: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a level by ID with progress', async () => {
      const userId = 1;
      const levelId = 1;

      mockRepository.findOne.mockResolvedValue(mockLevel);
      mockProgressService.mapLevelProgressToDto.mockResolvedValue(
        mockLevelProgress,
      );

      const result = await service.findOne(levelId, userId, false);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: levelId },
      });
      expect(progressService.mapLevelProgressToDto).toHaveBeenCalledWith(
        userId,
        levelId,
        70,
      );
      expect(result.id).toBe(1);
      expect(result.progress).toEqual(mockLevelProgress);
    });

    it('should return level with questions when includeQuestions is true', async () => {
      const userId = 1;
      const levelId = 1;
      const levelWithQuestions = {
        ...mockLevel,
        questions: [{ id: 1, questionText: 'What is your name?' }],
      };

      mockRepository.findOne.mockResolvedValue(levelWithQuestions);
      mockProgressService.mapLevelProgressToDto.mockResolvedValue(
        mockLevelProgress,
      );

      const result = await service.findOne(levelId, userId, true);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: levelId },
        relations: ['questions', 'questions.answerOptions'],
      });
      expect(result.questions).toBeDefined();
    });

    it('should throw NotFoundException when level not found', async () => {
      const userId = 1;
      const levelId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(levelId, userId, false)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(levelId, userId, false)).rejects.toThrow(
        `Level with ID ${levelId} not found`,
      );
    });

    it('should handle integer ID parameter', async () => {
      const userId = 1;
      const levelId = 42;

      mockRepository.findOne.mockResolvedValue({ ...mockLevel, id: levelId });
      mockProgressService.mapLevelProgressToDto.mockResolvedValue(
        mockLevelProgress,
      );

      const result = await service.findOne(levelId, userId, false);

      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
    });

    it('should handle level with no progress', async () => {
      const userId = 1;
      const levelId = 1;

      mockRepository.findOne.mockResolvedValue(mockLevel);
      mockProgressService.mapLevelProgressToDto.mockResolvedValue(null);

      const result = await service.findOne(levelId, userId, false);

      expect(result.id).toBe(1);
      expect(result.progress).toBeNull();
    });

    it('should pass passingScore to progress service', async () => {
      const userId = 1;
      const levelId = 1;
      const customLevel = { ...mockLevel, passingScore: 85 };

      mockRepository.findOne.mockResolvedValue(customLevel);
      mockProgressService.mapLevelProgressToDto.mockResolvedValue(
        mockLevelProgress,
      );

      await service.findOne(levelId, userId, false);

      expect(progressService.mapLevelProgressToDto).toHaveBeenCalledWith(
        userId,
        levelId,
        85,
      );
    });
  });

  describe('findOneById', () => {
    it('should return a level by ID without progress', async () => {
      const levelId = 1;

      mockRepository.findOne.mockResolvedValue(mockLevel);

      const result = await service.findOneById(levelId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: levelId },
      });
      expect(result).toEqual(mockLevel);
      expect(progressService.mapLevelProgressToDto).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when level not found', async () => {
      const levelId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(levelId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOneById(levelId)).rejects.toThrow(
        `Level with ID ${levelId} not found`,
      );
    });

    it('should handle integer ID parameter', async () => {
      const levelId = 123;

      mockRepository.findOne.mockResolvedValue({ ...mockLevel, id: levelId });

      const result = await service.findOneById(levelId);

      expect(result.id).toBe(123);
      expect(typeof result.id).toBe('number');
    });
  });

  describe('update', () => {
    it('should update a level', async () => {
      const levelId = 1;
      const updateDto: UpdateLevelDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const updatedLevel = { ...mockLevel, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockLevel);
      mockRepository.save.mockResolvedValue(updatedLevel);

      const result = await service.update(levelId, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: levelId },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated description');
    });

    it('should throw NotFoundException when level not found', async () => {
      const levelId = 999;
      const updateDto: UpdateLevelDto = { title: 'Updated' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(levelId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update only provided fields', async () => {
      const levelId = 1;
      const updateDto: UpdateLevelDto = {
        title: 'Only Title Updated',
      };

      const updatedLevel = { ...mockLevel, title: 'Only Title Updated' };

      mockRepository.findOne.mockResolvedValue(mockLevel);
      mockRepository.save.mockResolvedValue(updatedLevel);

      const result = await service.update(levelId, updateDto);

      expect(result.title).toBe('Only Title Updated');
      expect(result.description).toBe(mockLevel.description);
    });

    it('should update timeLimitSeconds with integer', async () => {
      const levelId = 1;
      const updateDto: UpdateLevelDto = {
        timeLimitSeconds: 450,
      };

      const updatedLevel = { ...mockLevel, timeLimitSeconds: 450 };

      mockRepository.findOne.mockResolvedValue(mockLevel);
      mockRepository.save.mockResolvedValue(updatedLevel);

      const result = await service.update(levelId, updateDto);

      expect(result.timeLimitSeconds).toBe(450);
      expect(typeof result.timeLimitSeconds).toBe('number');
    });

    it('should update passingScore', async () => {
      const levelId = 1;
      const updateDto: UpdateLevelDto = {
        passingScore: 85,
      };

      const updatedLevel = { ...mockLevel, passingScore: 85 };

      mockRepository.findOne.mockResolvedValue(mockLevel);
      mockRepository.save.mockResolvedValue(updatedLevel);

      const result = await service.update(levelId, updateDto);

      expect(result.passingScore).toBe(85);
    });

    it('should update multiple fields', async () => {
      const levelId = 1;
      const updateDto: UpdateLevelDto = {
        title: 'New Title',
        timeLimitSeconds: 500,
        passingScore: 75,
      };

      const updatedLevel = { ...mockLevel, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockLevel);
      mockRepository.save.mockResolvedValue(updatedLevel);

      const result = await service.update(levelId, updateDto);

      expect(result.title).toBe('New Title');
      expect(result.timeLimitSeconds).toBe(500);
      expect(result.passingScore).toBe(75);
    });
  });

  describe('remove', () => {
    it('should remove a level', async () => {
      const levelId = 1;

      mockRepository.findOne.mockResolvedValue(mockLevel);
      mockRepository.remove.mockResolvedValue(mockLevel);

      await service.remove(levelId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: levelId },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockLevel);
    });

    it('should throw NotFoundException when level not found', async () => {
      const levelId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(levelId)).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it('should handle integer ID parameter', async () => {
      const levelId = 456;

      mockRepository.findOne.mockResolvedValue({ ...mockLevel, id: levelId });
      mockRepository.remove.mockResolvedValue({ ...mockLevel, id: levelId });

      await service.remove(levelId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 456 } });
      expect(typeof levelId).toBe('number');
    });
  });
});

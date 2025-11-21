import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { Chapter } from './entities/chapter.entity';
import { ProgressService } from '../progress/progress.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

describe('ChaptersService', () => {
  let service: ChaptersService;
  let repository: Repository<Chapter>;
  let progressService: ProgressService;

  const mockChapter: Chapter = {
    id: 1,
    title: 'Basic Greetings',
    description: 'Learn basic greetings',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    orderIndex: 1,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    units: [],
  };

  const mockChapterProgress = {
    chapterId: 1,
    totalUnits: 5,
    completedUnits: 3,
    averageScore: 85.5,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findByIds: jest.fn(),
    remove: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  const mockProgressService = {
    getChaptersProgress: jest.fn(),
    getChapterProgress: jest.fn(),
    mapChapterProgressToDto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChaptersService,
        {
          provide: getRepositoryToken(Chapter),
          useValue: mockRepository,
        },
        {
          provide: ProgressService,
          useValue: mockProgressService,
        },
      ],
    }).compile();

    service = module.get<ChaptersService>(ChaptersService);
    repository = module.get<Repository<Chapter>>(getRepositoryToken(Chapter));
    progressService = module.get<ProgressService>(ProgressService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new chapter', async () => {
      const createDto: CreateChapterDto = {
        title: 'Basic Greetings',
        description: 'Learn basic greetings',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        orderIndex: 1,
      };

      mockRepository.create.mockReturnValue(mockChapter);
      mockRepository.save.mockResolvedValue(mockChapter);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockChapter);
      expect(result).toEqual(mockChapter);
      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
    });

    it('should create chapter with integer ID', async () => {
      const createDto: CreateChapterDto = {
        title: 'Test Chapter',
        description: 'Test Description',
        orderIndex: 0,
      };

      mockRepository.create.mockReturnValue(mockChapter);
      mockRepository.save.mockResolvedValue(mockChapter);

      const result = await service.create(createDto);

      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
    });
  });

  describe('findAll', () => {
    it('should return all active chapters with progress', async () => {
      const userId = 1;
      const chapters = [mockChapter];

      mockRepository.find.mockResolvedValue(chapters);
      mockProgressService.getChaptersProgress.mockResolvedValue([mockChapterProgress]);
      mockProgressService.mapChapterProgressToDto.mockReturnValue({
        totalUnits: 5,
        completedUnits: 3,
        averageScore: 85.5,
      });

      const result = await service.findAll(userId, false);

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { orderIndex: 'ASC' },
      });
      expect(progressService.getChaptersProgress).toHaveBeenCalledWith(userId, [1]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].progress).toBeDefined();
    });

    it('should return chapters with units when includeUnits is true', async () => {
      const userId = 1;
      const chaptersWithUnits = [{ ...mockChapter, units: [{ id: 1, title: 'Unit 1' }] }];

      mockRepository.find.mockResolvedValue(chaptersWithUnits);
      mockProgressService.getChaptersProgress.mockResolvedValue([mockChapterProgress]);
      mockProgressService.mapChapterProgressToDto.mockReturnValue({
        totalUnits: 5,
        completedUnits: 3,
        averageScore: 85.5,
      });

      const result = await service.findAll(userId, true);

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { orderIndex: 'ASC' },
        relations: ['units'],
      });
      expect(result[0].units).toBeDefined();
      expect(result[0].units).toHaveLength(1);
    });

    it('should return empty array when no chapters exist', async () => {
      const userId = 1;

      mockRepository.find.mockResolvedValue([]);
      mockProgressService.getChaptersProgress.mockResolvedValue([]);

      const result = await service.findAll(userId, false);

      expect(result).toEqual([]);
    });

    it('should handle chapters with no progress', async () => {
      const userId = 1;
      const chapters = [mockChapter];

      mockRepository.find.mockResolvedValue(chapters);
      mockProgressService.getChaptersProgress.mockResolvedValue([]);
      mockProgressService.mapChapterProgressToDto.mockReturnValue(null);

      const result = await service.findAll(userId, false);

      expect(result).toHaveLength(1);
      expect(result[0].progress).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a chapter by ID with progress', async () => {
      const userId = 1;
      const chapterId = 1;

      mockRepository.findOne.mockResolvedValue(mockChapter);
      mockProgressService.getChapterProgress.mockResolvedValue(mockChapterProgress);
      mockProgressService.mapChapterProgressToDto.mockReturnValue({
        totalUnits: 5,
        completedUnits: 3,
        averageScore: 85.5,
      });

      const result = await service.findOne(chapterId, userId, false);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: chapterId } });
      expect(progressService.getChapterProgress).toHaveBeenCalledWith(userId, chapterId);
      expect(result.id).toBe(1);
      expect(result.progress).toBeDefined();
    });

    it('should return chapter with units when includeUnits is true', async () => {
      const userId = 1;
      const chapterId = 1;
      const chapterWithUnits = { ...mockChapter, units: [{ id: 1, title: 'Unit 1' }] };

      mockRepository.findOne.mockResolvedValue(chapterWithUnits);
      mockProgressService.getChapterProgress.mockResolvedValue(mockChapterProgress);
      mockProgressService.mapChapterProgressToDto.mockReturnValue({
        totalUnits: 5,
        completedUnits: 3,
        averageScore: 85.5,
      });

      const result = await service.findOne(chapterId, userId, true);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: chapterId },
        relations: ['units'],
      });
      expect(result.units).toBeDefined();
    });

    it('should throw NotFoundException when chapter not found', async () => {
      const userId = 1;
      const chapterId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(chapterId, userId, false)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(chapterId, userId, false)).rejects.toThrow(
        `Chapter with ID ${chapterId} not found`,
      );
    });

    it('should handle integer ID parameter', async () => {
      const userId = 1;
      const chapterId = 42;

      mockRepository.findOne.mockResolvedValue({ ...mockChapter, id: chapterId });
      mockProgressService.getChapterProgress.mockResolvedValue(mockChapterProgress);
      mockProgressService.mapChapterProgressToDto.mockReturnValue({
        totalUnits: 5,
        completedUnits: 3,
        averageScore: 85.5,
      });

      const result = await service.findOne(chapterId, userId, false);

      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
    });
  });

  describe('findOneById', () => {
    it('should return a chapter by ID without progress', async () => {
      const chapterId = 1;

      mockRepository.findOne.mockResolvedValue(mockChapter);

      const result = await service.findOneById(chapterId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: chapterId } });
      expect(result).toEqual(mockChapter);
      expect(progressService.getChapterProgress).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when chapter not found', async () => {
      const chapterId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(chapterId)).rejects.toThrow(NotFoundException);
      await expect(service.findOneById(chapterId)).rejects.toThrow(
        `Chapter with ID ${chapterId} not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a chapter', async () => {
      const chapterId = 1;
      const updateDto: UpdateChapterDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const updatedChapter = { ...mockChapter, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockChapter);
      mockRepository.save.mockResolvedValue(updatedChapter);

      const result = await service.update(chapterId, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: chapterId } });
      expect(repository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated description');
    });

    it('should throw NotFoundException when chapter not found', async () => {
      const chapterId = 999;
      const updateDto: UpdateChapterDto = { title: 'Updated' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(chapterId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update only provided fields', async () => {
      const chapterId = 1;
      const updateDto: UpdateChapterDto = {
        title: 'Only Title Updated',
      };

      const updatedChapter = { ...mockChapter, title: 'Only Title Updated' };

      mockRepository.findOne.mockResolvedValue(mockChapter);
      mockRepository.save.mockResolvedValue(updatedChapter);

      const result = await service.update(chapterId, updateDto);

      expect(result.title).toBe('Only Title Updated');
      expect(result.description).toBe(mockChapter.description);
    });
  });

  describe('remove', () => {
    it('should remove a chapter', async () => {
      const chapterId = 1;

      mockRepository.findOne.mockResolvedValue(mockChapter);
      mockRepository.remove.mockResolvedValue(mockChapter);

      await service.remove(chapterId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: chapterId } });
      expect(repository.remove).toHaveBeenCalledWith(mockChapter);
    });

    it('should throw NotFoundException when chapter not found', async () => {
      const chapterId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(chapterId)).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });

  describe('reorder', () => {
    it('should reorder chapters successfully', async () => {
      const reorderData = [
        { id: 1, orderIndex: 2 },
        { id: 2, orderIndex: 1 },
        { id: 3, orderIndex: 0 },
      ];

      const chapters = [
        { ...mockChapter, id: 1 },
        { ...mockChapter, id: 2 },
        { ...mockChapter, id: 3 },
      ];

      mockRepository.findByIds.mockResolvedValue(chapters);

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockEntityManager = {
          update: jest.fn().mockResolvedValue({}),
        };
        await callback(mockEntityManager);
      });

      mockRepository.manager.transaction = mockTransaction;

      await service.reorder(reorderData);

      expect(repository.findByIds).toHaveBeenCalledWith([1, 2, 3]);
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when one or more chapters not found', async () => {
      const reorderData = [
        { id: 1, orderIndex: 0 },
        { id: 999, orderIndex: 1 },
      ];

      const chapters = [{ ...mockChapter, id: 1 }]; // Only 1 chapter found, not 2

      mockRepository.findByIds.mockResolvedValue(chapters);

      await expect(service.reorder(reorderData)).rejects.toThrow(NotFoundException);
      await expect(service.reorder(reorderData)).rejects.toThrow(
        'One or more chapters not found',
      );
    });

    it('should handle empty reorder array', async () => {
      const reorderData: { id: number; orderIndex: number }[] = [];

      mockRepository.findByIds.mockResolvedValue([]);

      await service.reorder(reorderData);

      expect(repository.findByIds).toHaveBeenCalledWith([]);
    });

    it('should update order indexes in transaction', async () => {
      const reorderData = [
        { id: 1, orderIndex: 5 },
        { id: 2, orderIndex: 10 },
      ];

      const chapters = [
        { ...mockChapter, id: 1 },
        { ...mockChapter, id: 2 },
      ];

      mockRepository.findByIds.mockResolvedValue(chapters);

      const mockEntityManager = {
        update: jest.fn().mockResolvedValue({}),
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        await callback(mockEntityManager);
      });

      mockRepository.manager.transaction = mockTransaction;

      await service.reorder(reorderData);

      expect(mockTransaction).toHaveBeenCalled();
      expect(mockEntityManager.update).toHaveBeenCalledTimes(2);
      expect(mockEntityManager.update).toHaveBeenCalledWith(Chapter, 1, {
        orderIndex: 5,
      });
      expect(mockEntityManager.update).toHaveBeenCalledWith(Chapter, 2, {
        orderIndex: 10,
      });
    });
  });
});

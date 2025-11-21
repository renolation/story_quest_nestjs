import { Test, TestingModule } from '@nestjs/testing';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ReorderChaptersDto } from './dto/reorder-chapters.dto';
import { ChapterResponseDto } from './dto/chapter-response.dto';

describe('ChaptersController', () => {
  let controller: ChaptersController;
  let service: ChaptersService;

  const mockChapterResponse: ChapterResponseDto = {
    id: 1,
    title: 'Basic Greetings',
    description: 'Learn basic greetings',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    orderIndex: 1,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    progress: {
      totalUnits: 5,
      completedUnits: 3,
      averageScore: 85.5,
    },
  };

  const mockUser = {
    id: 1,
    email: 'student@example.com',
    role: 'student',
  };

  const mockChaptersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reorder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChaptersController],
      providers: [
        {
          provide: ChaptersService,
          useValue: mockChaptersService,
        },
      ],
    }).compile();

    controller = module.get<ChaptersController>(ChaptersController);
    service = module.get<ChaptersService>(ChaptersService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new chapter', async () => {
      const createDto: CreateChapterDto = {
        title: 'Basic Greetings',
        description: 'Learn basic greetings',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        orderIndex: 1,
      };

      const expectedChapter = { id: 1, ...createDto };
      mockChaptersService.create.mockResolvedValue(expectedChapter);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedChapter);
      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
    });

    it('should create chapter with integer ID', async () => {
      const createDto: CreateChapterDto = {
        title: 'Test Chapter',
        description: 'Test Description',
        orderIndex: 0,
      };

      const expectedChapter = { id: 42, ...createDto };
      mockChaptersService.create.mockResolvedValue(expectedChapter);

      const result = await controller.create(createDto);

      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
    });
  });

  describe('findAll', () => {
    it('should return all chapters without units', async () => {
      const chapters = [mockChapterResponse];
      mockChaptersService.findAll.mockResolvedValue(chapters);

      const result = await controller.findAll(mockUser, undefined);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, false);
      expect(result).toEqual(chapters);
      expect(result).toHaveLength(1);
    });

    it('should return all chapters with units when includeUnits is "true"', async () => {
      const chaptersWithUnits = [
        {
          ...mockChapterResponse,
          units: [{ id: 1, title: 'Unit 1' }],
        },
      ];

      mockChaptersService.findAll.mockResolvedValue(chaptersWithUnits);

      const result = await controller.findAll(mockUser, 'true');

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, true);
      expect(result[0].units).toBeDefined();
      expect(result[0].units).toHaveLength(1);
    });

    it('should return chapters without units when includeUnits is "false"', async () => {
      const chapters = [mockChapterResponse];
      mockChaptersService.findAll.mockResolvedValue(chapters);

      const result = await controller.findAll(mockUser, 'false');

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, false);
      expect(result[0].units).toBeUndefined();
    });

    it('should return empty array when no chapters exist', async () => {
      mockChaptersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser, undefined);

      expect(result).toEqual([]);
    });

    it('should use current user ID from decorator', async () => {
      const customUser = {
        id: 123,
        email: 'test@example.com',
        role: 'student',
      };
      mockChaptersService.findAll.mockResolvedValue([]);

      await controller.findAll(customUser, undefined);

      expect(service.findAll).toHaveBeenCalledWith(123, false);
    });
  });

  describe('findOne', () => {
    it('should return a chapter by ID', async () => {
      const chapterId = 1;
      mockChaptersService.findOne.mockResolvedValue(mockChapterResponse);

      const result = await controller.findOne(mockUser, chapterId, undefined);

      expect(service.findOne).toHaveBeenCalledWith(
        chapterId,
        mockUser.id,
        false,
      );
      expect(result).toEqual(mockChapterResponse);
      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
    });

    it('should return chapter with units when includeUnits is "true"', async () => {
      const chapterId = 1;
      const chapterWithUnits = {
        ...mockChapterResponse,
        units: [{ id: 1, title: 'Unit 1' }],
      };

      mockChaptersService.findOne.mockResolvedValue(chapterWithUnits);

      const result = await controller.findOne(mockUser, chapterId, 'true');

      expect(service.findOne).toHaveBeenCalledWith(
        chapterId,
        mockUser.id,
        true,
      );
      expect(result.units).toBeDefined();
    });

    it('should handle integer ID parameter', async () => {
      const chapterId = 999;
      const chapter = { ...mockChapterResponse, id: chapterId };

      mockChaptersService.findOne.mockResolvedValue(chapter);

      const result = await controller.findOne(mockUser, chapterId, undefined);

      expect(service.findOne).toHaveBeenCalledWith(
        chapterId,
        mockUser.id,
        false,
      );
      expect(result.id).toBe(999);
      expect(typeof result.id).toBe('number');
    });

    it('should include progress data', async () => {
      const chapterId = 1;
      mockChaptersService.findOne.mockResolvedValue(mockChapterResponse);

      const result = await controller.findOne(mockUser, chapterId, undefined);

      expect(result.progress).toBeDefined();
      expect(result.progress?.totalUnits).toBe(5);
      expect(result.progress?.completedUnits).toBe(3);
      expect(result.progress?.averageScore).toBe(85.5);
    });
  });

  describe('update', () => {
    it('should update a chapter', async () => {
      const chapterId = 1;
      const updateDto: UpdateChapterDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const updatedChapter = {
        id: 1,
        ...updateDto,
        orderIndex: 1,
        isActive: true,
      };

      mockChaptersService.update.mockResolvedValue(updatedChapter);

      const result = await controller.update(chapterId, updateDto);

      expect(service.update).toHaveBeenCalledWith(chapterId, updateDto);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated description');
    });

    it('should update with integer ID', async () => {
      const chapterId = 42;
      const updateDto: UpdateChapterDto = { title: 'New Title' };
      const updatedChapter = { id: 42, title: 'New Title' };

      mockChaptersService.update.mockResolvedValue(updatedChapter);

      const result = await controller.update(chapterId, updateDto);

      expect(service.update).toHaveBeenCalledWith(42, updateDto);
      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
    });

    it('should update only provided fields', async () => {
      const chapterId = 1;
      const updateDto: UpdateChapterDto = { title: 'Only Title' };
      const updatedChapter = {
        id: 1,
        title: 'Only Title',
        description: 'Original description',
      };

      mockChaptersService.update.mockResolvedValue(updatedChapter);

      const result = await controller.update(chapterId, updateDto);

      expect(result.title).toBe('Only Title');
      expect(result.description).toBe('Original description');
    });
  });

  describe('remove', () => {
    it('should remove a chapter', async () => {
      const chapterId = 1;
      mockChaptersService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(chapterId);

      expect(service.remove).toHaveBeenCalledWith(chapterId);
      expect(result).toBeUndefined();
    });

    it('should remove chapter with integer ID', async () => {
      const chapterId = 999;
      mockChaptersService.remove.mockResolvedValue(undefined);

      await controller.remove(chapterId);

      expect(service.remove).toHaveBeenCalledWith(999);
    });
  });

  describe('reorder', () => {
    it('should reorder chapters successfully', async () => {
      const reorderDto: ReorderChaptersDto = {
        chapters: [
          { id: 1, orderIndex: 2 },
          { id: 2, orderIndex: 1 },
          { id: 3, orderIndex: 0 },
        ],
      };

      mockChaptersService.reorder.mockResolvedValue(undefined);

      const result = await controller.reorder(reorderDto);

      expect(service.reorder).toHaveBeenCalledWith(reorderDto.chapters);
      expect(result).toEqual({
        success: true,
        message: 'Chapters reordered successfully',
      });
    });

    it('should handle single chapter reorder', async () => {
      const reorderDto: ReorderChaptersDto = {
        chapters: [{ id: 1, orderIndex: 5 }],
      };

      mockChaptersService.reorder.mockResolvedValue(undefined);

      const result = await controller.reorder(reorderDto);

      expect(service.reorder).toHaveBeenCalledWith(reorderDto.chapters);
      expect(result.success).toBe(true);
    });

    it('should handle empty reorder array', async () => {
      const reorderDto: ReorderChaptersDto = {
        chapters: [],
      };

      mockChaptersService.reorder.mockResolvedValue(undefined);

      const result = await controller.reorder(reorderDto);

      expect(service.reorder).toHaveBeenCalledWith([]);
      expect(result.success).toBe(true);
    });

    it('should reorder with integer IDs', async () => {
      const reorderDto: ReorderChaptersDto = {
        chapters: [
          { id: 10, orderIndex: 0 },
          { id: 20, orderIndex: 1 },
          { id: 30, orderIndex: 2 },
        ],
      };

      mockChaptersService.reorder.mockResolvedValue(undefined);

      await controller.reorder(reorderDto);

      expect(service.reorder).toHaveBeenCalledWith([
        { id: 10, orderIndex: 0 },
        { id: 20, orderIndex: 1 },
        { id: 30, orderIndex: 2 },
      ]);

      // Verify all IDs are numbers
      reorderDto.chapters.forEach((chapter) => {
        expect(typeof chapter.id).toBe('number');
        expect(typeof chapter.orderIndex).toBe('number');
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UnitsService } from './units.service';
import { Unit } from './entities/unit.entity';
import { ProgressService } from '../progress/progress.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

describe('UnitsService', () => {
  let service: UnitsService;
  let repository: Repository<Unit>;
  let progressService: ProgressService;

  const mockUnit: Unit = {
    id: 1,
    title: 'Basic Conversations',
    description: 'Learn basic conversation skills',
    chapterId: 1,
    orderIndex: 0,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    chapter: null,
    levels: [],
  };

  const mockUnitProgress = {
    unitId: 1,
    totalLevels: 10,
    completedLevels: 5,
    averageScore: 78.5,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockProgressService = {
    getUnitsProgress: jest.fn(),
    getUnitProgress: jest.fn(),
    mapUnitProgressToDto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitsService,
        {
          provide: getRepositoryToken(Unit),
          useValue: mockRepository,
        },
        {
          provide: ProgressService,
          useValue: mockProgressService,
        },
      ],
    }).compile();

    service = module.get<UnitsService>(UnitsService);
    repository = module.get<Repository<Unit>>(getRepositoryToken(Unit));
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
    it('should create a new unit', async () => {
      const createDto: CreateUnitDto = {
        title: 'Basic Conversations',
        description: 'Learn basic conversation skills',
        chapterId: 1,
        orderIndex: 0,
      };

      mockRepository.create.mockReturnValue(mockUnit);
      mockRepository.save.mockResolvedValue(mockUnit);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockUnit);
      expect(result).toEqual(mockUnit);
      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
    });

    it('should create unit with integer ID', async () => {
      const createDto: CreateUnitDto = {
        title: 'Test Unit',
        description: 'Test Description',
        chapterId: 2,
        orderIndex: 5,
      };

      mockRepository.create.mockReturnValue(mockUnit);
      mockRepository.save.mockResolvedValue(mockUnit);

      const result = await service.create(createDto);

      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
      expect(typeof result.chapterId).toBe('number');
    });

    it('should create unit with all optional fields', async () => {
      const createDto: CreateUnitDto = {
        title: 'Complete Unit',
        description: 'Full description',
        chapterId: 3,
        orderIndex: 10,
      };

      const completeUnit = { ...mockUnit, ...createDto };
      mockRepository.create.mockReturnValue(completeUnit);
      mockRepository.save.mockResolvedValue(completeUnit);

      const result = await service.create(createDto);

      expect(result.title).toBe('Complete Unit');
      expect(result.description).toBe('Full description');
      expect(result.chapterId).toBe(3);
      expect(result.orderIndex).toBe(10);
    });
  });

  describe('findAll', () => {
    it('should return all active units with progress', async () => {
      const userId = 1;
      const units = [mockUnit];

      mockRepository.find.mockResolvedValue(units);
      mockProgressService.getUnitsProgress.mockResolvedValue([mockUnitProgress]);
      mockProgressService.mapUnitProgressToDto.mockReturnValue({
        totalLevels: 10,
        completedLevels: 5,
        averageScore: 78.5,
      });

      const result = await service.findAll(userId, undefined, false);

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { orderIndex: 'ASC' },
      });
      expect(progressService.getUnitsProgress).toHaveBeenCalledWith(userId, [1]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].progress).toBeDefined();
    });

    it('should filter units by chapterId', async () => {
      const userId = 1;
      const chapterId = 2;
      const units = [mockUnit];

      mockRepository.find.mockResolvedValue(units);
      mockProgressService.getUnitsProgress.mockResolvedValue([mockUnitProgress]);
      mockProgressService.mapUnitProgressToDto.mockReturnValue({
        totalLevels: 10,
        completedLevels: 5,
        averageScore: 78.5,
      });

      const result = await service.findAll(userId, chapterId, false);

      expect(repository.find).toHaveBeenCalledWith({
        where: { chapterId, isActive: true },
        order: { orderIndex: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });

    it('should return units with levels when includeLevels is true', async () => {
      const userId = 1;
      const unitsWithLevels = [{ ...mockUnit, levels: [{ id: 1, title: 'Level 1' }] }];

      mockRepository.find.mockResolvedValue(unitsWithLevels);
      mockProgressService.getUnitsProgress.mockResolvedValue([mockUnitProgress]);
      mockProgressService.mapUnitProgressToDto.mockReturnValue({
        totalLevels: 10,
        completedLevels: 5,
        averageScore: 78.5,
      });

      const result = await service.findAll(userId, undefined, true);

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { orderIndex: 'ASC' },
        relations: ['levels'],
      });
      expect(result[0].levels).toBeDefined();
      expect(result[0].levels).toHaveLength(1);
    });

    it('should return empty array when no units exist', async () => {
      const userId = 1;

      mockRepository.find.mockResolvedValue([]);
      mockProgressService.getUnitsProgress.mockResolvedValue([]);

      const result = await service.findAll(userId, undefined, false);

      expect(result).toEqual([]);
    });

    it('should handle units with no progress', async () => {
      const userId = 1;
      const units = [mockUnit];

      mockRepository.find.mockResolvedValue(units);
      mockProgressService.getUnitsProgress.mockResolvedValue([]);
      mockProgressService.mapUnitProgressToDto.mockReturnValue(null);

      const result = await service.findAll(userId, undefined, false);

      expect(result).toHaveLength(1);
      expect(result[0].progress).toBeNull();
    });

    it('should handle multiple units with mixed progress', async () => {
      const userId = 1;
      const units = [
        mockUnit,
        { ...mockUnit, id: 2, title: 'Unit 2' },
        { ...mockUnit, id: 3, title: 'Unit 3' },
      ];

      mockRepository.find.mockResolvedValue(units);
      mockProgressService.getUnitsProgress.mockResolvedValue([
        { ...mockUnitProgress, unitId: 1 },
        { ...mockUnitProgress, unitId: 3 },
      ]);
      mockProgressService.mapUnitProgressToDto.mockImplementation((progress) =>
        progress ? { totalLevels: 10, completedLevels: 5, averageScore: 78.5 } : null,
      );

      const result = await service.findAll(userId, undefined, false);

      expect(result).toHaveLength(3);
      expect(result[0].progress).toBeDefined();
      expect(result[1].progress).toBeNull();
      expect(result[2].progress).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a unit by ID with progress', async () => {
      const userId = 1;
      const unitId = 1;

      mockRepository.findOne.mockResolvedValue(mockUnit);
      mockProgressService.getUnitProgress.mockResolvedValue(mockUnitProgress);
      mockProgressService.mapUnitProgressToDto.mockReturnValue({
        totalLevels: 10,
        completedLevels: 5,
        averageScore: 78.5,
      });

      const result = await service.findOne(unitId, userId, false);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: unitId } });
      expect(progressService.getUnitProgress).toHaveBeenCalledWith(userId, unitId);
      expect(result.id).toBe(1);
      expect(result.progress).toBeDefined();
    });

    it('should return unit with levels when includeLevels is true', async () => {
      const userId = 1;
      const unitId = 1;
      const unitWithLevels = { ...mockUnit, levels: [{ id: 1, title: 'Level 1' }] };

      mockRepository.findOne.mockResolvedValue(unitWithLevels);
      mockProgressService.getUnitProgress.mockResolvedValue(mockUnitProgress);
      mockProgressService.mapUnitProgressToDto.mockReturnValue({
        totalLevels: 10,
        completedLevels: 5,
        averageScore: 78.5,
      });

      const result = await service.findOne(unitId, userId, true);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: unitId },
        relations: ['levels'],
      });
      expect(result.levels).toBeDefined();
    });

    it('should throw NotFoundException when unit not found', async () => {
      const userId = 1;
      const unitId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(unitId, userId, false)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(unitId, userId, false)).rejects.toThrow(
        `Unit with ID ${unitId} not found`,
      );
    });

    it('should handle integer ID parameter', async () => {
      const userId = 1;
      const unitId = 42;

      mockRepository.findOne.mockResolvedValue({ ...mockUnit, id: unitId });
      mockProgressService.getUnitProgress.mockResolvedValue(mockUnitProgress);
      mockProgressService.mapUnitProgressToDto.mockReturnValue({
        totalLevels: 10,
        completedLevels: 5,
        averageScore: 78.5,
      });

      const result = await service.findOne(unitId, userId, false);

      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
    });

    it('should handle unit with no progress', async () => {
      const userId = 1;
      const unitId = 1;

      mockRepository.findOne.mockResolvedValue(mockUnit);
      mockProgressService.getUnitProgress.mockResolvedValue(null);
      mockProgressService.mapUnitProgressToDto.mockReturnValue(null);

      const result = await service.findOne(unitId, userId, false);

      expect(result.id).toBe(1);
      expect(result.progress).toBeNull();
    });
  });

  describe('findOneById', () => {
    it('should return a unit by ID without progress', async () => {
      const unitId = 1;

      mockRepository.findOne.mockResolvedValue(mockUnit);

      const result = await service.findOneById(unitId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: unitId } });
      expect(result).toEqual(mockUnit);
      expect(progressService.getUnitProgress).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when unit not found', async () => {
      const unitId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(unitId)).rejects.toThrow(NotFoundException);
      await expect(service.findOneById(unitId)).rejects.toThrow(
        `Unit with ID ${unitId} not found`,
      );
    });

    it('should handle integer ID parameter', async () => {
      const unitId = 123;

      mockRepository.findOne.mockResolvedValue({ ...mockUnit, id: unitId });

      const result = await service.findOneById(unitId);

      expect(result.id).toBe(123);
      expect(typeof result.id).toBe('number');
    });
  });

  describe('update', () => {
    it('should update a unit', async () => {
      const unitId = 1;
      const updateDto: UpdateUnitDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const updatedUnit = { ...mockUnit, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockUnit);
      mockRepository.save.mockResolvedValue(updatedUnit);

      const result = await service.update(unitId, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: unitId } });
      expect(repository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated description');
    });

    it('should throw NotFoundException when unit not found', async () => {
      const unitId = 999;
      const updateDto: UpdateUnitDto = { title: 'Updated' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(unitId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update only provided fields', async () => {
      const unitId = 1;
      const updateDto: UpdateUnitDto = {
        title: 'Only Title Updated',
      };

      const updatedUnit = { ...mockUnit, title: 'Only Title Updated' };

      mockRepository.findOne.mockResolvedValue(mockUnit);
      mockRepository.save.mockResolvedValue(updatedUnit);

      const result = await service.update(unitId, updateDto);

      expect(result.title).toBe('Only Title Updated');
      expect(result.description).toBe(mockUnit.description);
    });

    it('should update chapterId with integer', async () => {
      const unitId = 1;
      const updateDto: UpdateUnitDto = {
        chapterId: 5,
      };

      const updatedUnit = { ...mockUnit, chapterId: 5 };

      mockRepository.findOne.mockResolvedValue(mockUnit);
      mockRepository.save.mockResolvedValue(updatedUnit);

      const result = await service.update(unitId, updateDto);

      expect(result.chapterId).toBe(5);
      expect(typeof result.chapterId).toBe('number');
    });

    it('should update orderIndex', async () => {
      const unitId = 1;
      const updateDto: UpdateUnitDto = {
        orderIndex: 15,
      };

      const updatedUnit = { ...mockUnit, orderIndex: 15 };

      mockRepository.findOne.mockResolvedValue(mockUnit);
      mockRepository.save.mockResolvedValue(updatedUnit);

      const result = await service.update(unitId, updateDto);

      expect(result.orderIndex).toBe(15);
    });
  });

  describe('remove', () => {
    it('should remove a unit', async () => {
      const unitId = 1;

      mockRepository.findOne.mockResolvedValue(mockUnit);
      mockRepository.remove.mockResolvedValue(mockUnit);

      await service.remove(unitId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: unitId } });
      expect(repository.remove).toHaveBeenCalledWith(mockUnit);
    });

    it('should throw NotFoundException when unit not found', async () => {
      const unitId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(unitId)).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it('should handle integer ID parameter', async () => {
      const unitId = 456;

      mockRepository.findOne.mockResolvedValue({ ...mockUnit, id: unitId });
      mockRepository.remove.mockResolvedValue({ ...mockUnit, id: unitId });

      await service.remove(unitId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 456 } });
      expect(typeof unitId).toBe('number');
    });
  });
});

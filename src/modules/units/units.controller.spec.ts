import { Test, TestingModule } from '@nestjs/testing';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitResponseDto } from './dto/unit-response.dto';

describe('UnitsController', () => {
  let controller: UnitsController;
  let service: UnitsService;

  const mockUnitResponse: UnitResponseDto = {
    id: 1,
    title: 'Basic Conversations',
    description: 'Learn basic conversation skills',
    chapterId: 1,
    orderIndex: 0,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    progress: {
      totalLevels: 10,
      completedLevels: 5,
      totalPointsAvailable: 1000,
      totalPointsEarned: 650,
      averageScore: 78.5,
      lastAccessedAt: new Date('2025-01-15'),
    },
  };

  const mockUser = {
    id: 1,
    email: 'student@example.com',
    role: 'student',
  };

  const mockUnitsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsController],
      providers: [
        {
          provide: UnitsService,
          useValue: mockUnitsService,
        },
      ],
    }).compile();

    controller = module.get<UnitsController>(UnitsController);
    service = module.get<UnitsService>(UnitsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new unit', async () => {
      const createDto: CreateUnitDto = {
        title: 'Basic Conversations',
        description: 'Learn basic conversation skills',
        chapterId: 1,
        orderIndex: 0,
      };

      const expectedUnit = { id: 1, ...createDto };
      mockUnitsService.create.mockResolvedValue(expectedUnit);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedUnit);
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

      const expectedUnit = { id: 42, ...createDto };
      mockUnitsService.create.mockResolvedValue(expectedUnit);

      const result = await controller.create(createDto);

      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
      expect(typeof result.chapterId).toBe('number');
    });

    it('should create unit with integer chapterId', async () => {
      const createDto: CreateUnitDto = {
        title: 'New Unit',
        description: 'New Description',
        chapterId: 99,
        orderIndex: 10,
      };

      const expectedUnit = { id: 5, ...createDto };
      mockUnitsService.create.mockResolvedValue(expectedUnit);

      const result = await controller.create(createDto);

      expect(result.chapterId).toBe(99);
      expect(typeof result.chapterId).toBe('number');
    });
  });

  describe('findAll', () => {
    it('should return all units without levels', async () => {
      const units = [mockUnitResponse];
      mockUnitsService.findAll.mockResolvedValue(units);

      const result = await controller.findAll(mockUser, undefined, undefined);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, undefined, false);
      expect(result).toEqual(units);
      expect(result).toHaveLength(1);
    });

    it('should return all units with levels when includeLevels is "true"', async () => {
      const unitsWithLevels = [
        {
          ...mockUnitResponse,
          levels: [{ id: 1, title: 'Level 1' }],
        },
      ];

      mockUnitsService.findAll.mockResolvedValue(unitsWithLevels);

      const result = await controller.findAll(mockUser, undefined, 'true');

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, undefined, true);
      expect(result[0].levels).toBeDefined();
      expect(result[0].levels).toHaveLength(1);
    });

    it('should return units without levels when includeLevels is "false"', async () => {
      const units = [mockUnitResponse];
      mockUnitsService.findAll.mockResolvedValue(units);

      const result = await controller.findAll(mockUser, undefined, 'false');

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, undefined, false);
      expect(result[0].levels).toBeUndefined();
    });

    it('should filter units by chapterId', async () => {
      const chapterId = 2;
      const units = [mockUnitResponse];
      mockUnitsService.findAll.mockResolvedValue(units);

      const result = await controller.findAll(mockUser, chapterId, undefined);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, chapterId, false);
      expect(result).toEqual(units);
    });

    it('should return empty array when no units exist', async () => {
      mockUnitsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser, undefined, undefined);

      expect(result).toEqual([]);
    });

    it('should use current user ID from decorator', async () => {
      const customUser = { id: 123, email: 'test@example.com', role: 'student' };
      mockUnitsService.findAll.mockResolvedValue([]);

      await controller.findAll(customUser, undefined, undefined);

      expect(service.findAll).toHaveBeenCalledWith(123, undefined, false);
    });

    it('should handle integer chapterId parameter', async () => {
      const chapterId = 999;
      mockUnitsService.findAll.mockResolvedValue([]);

      await controller.findAll(mockUser, chapterId, undefined);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, 999, false);
      expect(typeof chapterId).toBe('number');
    });

    it('should combine chapterId filter with includeLevels', async () => {
      const chapterId = 5;
      const unitsWithLevels = [
        {
          ...mockUnitResponse,
          levels: [{ id: 1, title: 'Level 1' }],
        },
      ];

      mockUnitsService.findAll.mockResolvedValue(unitsWithLevels);

      const result = await controller.findAll(mockUser, chapterId, 'true');

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, 5, true);
      expect(result[0].levels).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a unit by ID', async () => {
      const unitId = 1;
      mockUnitsService.findOne.mockResolvedValue(mockUnitResponse);

      const result = await controller.findOne(mockUser, unitId, undefined);

      expect(service.findOne).toHaveBeenCalledWith(unitId, mockUser.id, false);
      expect(result).toEqual(mockUnitResponse);
      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
    });

    it('should return unit with levels when includeLevels is "true"', async () => {
      const unitId = 1;
      const unitWithLevels = {
        ...mockUnitResponse,
        levels: [{ id: 1, title: 'Level 1' }],
      };

      mockUnitsService.findOne.mockResolvedValue(unitWithLevels);

      const result = await controller.findOne(mockUser, unitId, 'true');

      expect(service.findOne).toHaveBeenCalledWith(unitId, mockUser.id, true);
      expect(result.levels).toBeDefined();
    });

    it('should handle integer ID parameter', async () => {
      const unitId = 999;
      const unit = { ...mockUnitResponse, id: unitId };

      mockUnitsService.findOne.mockResolvedValue(unit);

      const result = await controller.findOne(mockUser, unitId, undefined);

      expect(service.findOne).toHaveBeenCalledWith(unitId, mockUser.id, false);
      expect(result.id).toBe(999);
      expect(typeof result.id).toBe('number');
    });

    it('should include progress data', async () => {
      const unitId = 1;
      mockUnitsService.findOne.mockResolvedValue(mockUnitResponse);

      const result = await controller.findOne(mockUser, unitId, undefined);

      expect(result.progress).toBeDefined();
      expect(result.progress?.totalLevels).toBe(10);
      expect(result.progress?.completedLevels).toBe(5);
      expect(result.progress?.averageScore).toBe(78.5);
    });

    it('should use current user ID from decorator', async () => {
      const customUser = { id: 456, email: 'test@example.com', role: 'student' };
      const unitId = 1;
      mockUnitsService.findOne.mockResolvedValue(mockUnitResponse);

      await controller.findOne(customUser, unitId, undefined);

      expect(service.findOne).toHaveBeenCalledWith(unitId, 456, false);
    });
  });

  describe('update', () => {
    it('should update a unit', async () => {
      const unitId = 1;
      const updateDto: UpdateUnitDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const updatedUnit = {
        id: 1,
        ...updateDto,
        chapterId: 1,
        orderIndex: 0,
        isActive: true,
      };

      mockUnitsService.update.mockResolvedValue(updatedUnit);

      const result = await controller.update(unitId, updateDto);

      expect(service.update).toHaveBeenCalledWith(unitId, updateDto);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated description');
    });

    it('should update with integer ID', async () => {
      const unitId = 42;
      const updateDto: UpdateUnitDto = { title: 'New Title' };
      const updatedUnit = { id: 42, title: 'New Title' };

      mockUnitsService.update.mockResolvedValue(updatedUnit);

      const result = await controller.update(unitId, updateDto);

      expect(service.update).toHaveBeenCalledWith(42, updateDto);
      expect(result.id).toBe(42);
      expect(typeof result.id).toBe('number');
    });

    it('should update only provided fields', async () => {
      const unitId = 1;
      const updateDto: UpdateUnitDto = { title: 'Only Title' };
      const updatedUnit = {
        id: 1,
        title: 'Only Title',
        description: 'Original description',
        chapterId: 1,
      };

      mockUnitsService.update.mockResolvedValue(updatedUnit);

      const result = await controller.update(unitId, updateDto);

      expect(result.title).toBe('Only Title');
      expect(result.description).toBe('Original description');
    });

    it('should update chapterId with integer', async () => {
      const unitId = 1;
      const updateDto: UpdateUnitDto = { chapterId: 5 };
      const updatedUnit = {
        id: 1,
        title: 'Unit Title',
        chapterId: 5,
      };

      mockUnitsService.update.mockResolvedValue(updatedUnit);

      const result = await controller.update(unitId, updateDto);

      expect(result.chapterId).toBe(5);
      expect(typeof result.chapterId).toBe('number');
    });

    it('should update orderIndex', async () => {
      const unitId = 1;
      const updateDto: UpdateUnitDto = { orderIndex: 15 };
      const updatedUnit = {
        id: 1,
        title: 'Unit Title',
        orderIndex: 15,
      };

      mockUnitsService.update.mockResolvedValue(updatedUnit);

      const result = await controller.update(unitId, updateDto);

      expect(result.orderIndex).toBe(15);
    });
  });

  describe('remove', () => {
    it('should remove a unit', async () => {
      const unitId = 1;
      mockUnitsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(unitId);

      expect(service.remove).toHaveBeenCalledWith(unitId);
      expect(result).toBeUndefined();
    });

    it('should remove unit with integer ID', async () => {
      const unitId = 999;
      mockUnitsService.remove.mockResolvedValue(undefined);

      await controller.remove(unitId);

      expect(service.remove).toHaveBeenCalledWith(999);
    });

    it('should handle multiple remove calls', async () => {
      mockUnitsService.remove.mockResolvedValue(undefined);

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

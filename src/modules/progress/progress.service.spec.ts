import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { StudentChapterProgress } from './entities/student-chapter-progress.entity';
import { StudentUnitProgress } from './entities/student-unit-progress.entity';
import { StudentLevelAttempt } from './entities/student-level-attempt.entity';
import { StudentQuestionAnswer } from './entities/student-question-answer.entity';
import { Level } from '../levels/entities/level.entity';
import { Question } from '../questions/entities/question.entity';
import { AnswerOption } from '../questions/entities/answer-option.entity';
import { User } from '../users/entities/user.entity';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { CompleteLevelDto } from './dto/complete-level.dto';

describe('ProgressService', () => {
  let service: ProgressService;
  let chapterProgressRepository: Repository<StudentChapterProgress>;
  let unitProgressRepository: Repository<StudentUnitProgress>;
  let levelAttemptRepository: Repository<StudentLevelAttempt>;
  let questionAnswerRepository: Repository<StudentQuestionAnswer>;
  let levelRepository: Repository<Level>;
  let questionRepository: Repository<Question>;
  let answerOptionRepository: Repository<AnswerOption>;
  let userRepository: Repository<User>;

  const mockStudent = {
    id: 1,
    email: 'student@example.com',
    username: 'student1',
    role: 'student',
  };

  const mockLevel = {
    id: 1,
    title: 'Test Level',
    unitId: 1,
    passingScore: 70,
  };

  const mockQuestion = {
    id: 1,
    questionText: 'Test question',
    levelId: 1,
    points: 10,
  };

  const mockAnswerOption = {
    id: 1,
    questionId: 1,
    optionText: 'Test option',
    isCorrect: true,
  };

  const mockLevelAttempt = {
    id: 1,
    student: mockStudent,
    level: mockLevel,
    score: 85,
    pointsEarned: 850,
    timeSpentSeconds: 120,
    isCompleted: true,
    isPassed: true,
    startedAt: new Date('2025-01-15T10:00:00Z'),
    completedAt: new Date('2025-01-15T10:02:00Z'),
  };

  const mockChapterProgress = {
    id: 1,
    student: mockStudent,
    chapter: { id: 1 },
    totalUnits: 5,
    completedUnits: 3,
    totalPointsAvailable: 500,
    totalPointsEarned: 350,
    averageScore: 85.5,
    lastAccessedAt: new Date('2025-01-15'),
  };

  const mockUnitProgress = {
    id: 1,
    student: mockStudent,
    unit: { id: 1 },
    totalLevels: 10,
    completedLevels: 5,
    totalPointsAvailable: 1000,
    totalPointsEarned: 650,
    averageScore: 78.5,
    lastAccessedAt: new Date('2025-01-15'),
  };

  const mockRepositories = {
    chapterProgress: {
      find: jest.fn(),
      findOne: jest.fn(),
    },
    unitProgress: {
      find: jest.fn(),
      findOne: jest.fn(),
    },
    levelAttempt: {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    },
    questionAnswer: {
      create: jest.fn(),
      save: jest.fn(),
    },
    level: {
      findOne: jest.fn(),
    },
    question: {
      findOne: jest.fn(),
    },
    answerOption: {
      findOne: jest.fn(),
    },
    user: {
      findOne: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: getRepositoryToken(StudentChapterProgress),
          useValue: mockRepositories.chapterProgress,
        },
        {
          provide: getRepositoryToken(StudentUnitProgress),
          useValue: mockRepositories.unitProgress,
        },
        {
          provide: getRepositoryToken(StudentLevelAttempt),
          useValue: mockRepositories.levelAttempt,
        },
        {
          provide: getRepositoryToken(StudentQuestionAnswer),
          useValue: mockRepositories.questionAnswer,
        },
        {
          provide: getRepositoryToken(Level),
          useValue: mockRepositories.level,
        },
        {
          provide: getRepositoryToken(Question),
          useValue: mockRepositories.question,
        },
        {
          provide: getRepositoryToken(AnswerOption),
          useValue: mockRepositories.answerOption,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepositories.user,
        },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    chapterProgressRepository = module.get(getRepositoryToken(StudentChapterProgress));
    unitProgressRepository = module.get(getRepositoryToken(StudentUnitProgress));
    levelAttemptRepository = module.get(getRepositoryToken(StudentLevelAttempt));
    questionAnswerRepository = module.get(getRepositoryToken(StudentQuestionAnswer));
    levelRepository = module.get(getRepositoryToken(Level));
    questionRepository = module.get(getRepositoryToken(Question));
    answerOptionRepository = module.get(getRepositoryToken(AnswerOption));
    userRepository = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getChapterProgress', () => {
    it('should get chapter progress for a student', async () => {
      const studentId = 1;
      const chapterId = 1;

      mockRepositories.chapterProgress.findOne.mockResolvedValue(mockChapterProgress);

      const result = await service.getChapterProgress(studentId, chapterId);

      expect(chapterProgressRepository.findOne).toHaveBeenCalledWith({
        where: {
          student: { id: studentId },
          chapter: { id: chapterId },
        },
      });
      expect(result).toEqual(mockChapterProgress);
    });

    it('should return null when no progress found', async () => {
      const studentId = 1;
      const chapterId = 999;

      mockRepositories.chapterProgress.findOne.mockResolvedValue(null);

      const result = await service.getChapterProgress(studentId, chapterId);

      expect(result).toBeNull();
    });

    it('should handle integer IDs', async () => {
      const studentId = 42;
      const chapterId = 99;

      mockRepositories.chapterProgress.findOne.mockResolvedValue(null);

      await service.getChapterProgress(studentId, chapterId);

      expect(chapterProgressRepository.findOne).toHaveBeenCalledWith({
        where: {
          student: { id: 42 },
          chapter: { id: 99 },
        },
      });
    });
  });

  describe('getChaptersProgress', () => {
    it('should get multiple chapter progresses', async () => {
      const studentId = 1;
      const chapterIds = [1, 2, 3];

      mockRepositories.chapterProgress.find.mockResolvedValue([mockChapterProgress]);

      const result = await service.getChaptersProgress(studentId, chapterIds);

      expect(chapterProgressRepository.find).toHaveBeenCalledWith({
        where: {
          student: { id: studentId },
          chapter: { id: In(chapterIds) },
        },
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array for empty chapterIds', async () => {
      const studentId = 1;
      const chapterIds: number[] = [];

      const result = await service.getChaptersProgress(studentId, chapterIds);

      expect(result).toEqual([]);
      expect(chapterProgressRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('getUnitProgress', () => {
    it('should get unit progress for a student', async () => {
      const studentId = 1;
      const unitId = 1;

      mockRepositories.unitProgress.findOne.mockResolvedValue(mockUnitProgress);

      const result = await service.getUnitProgress(studentId, unitId);

      expect(unitProgressRepository.findOne).toHaveBeenCalledWith({
        where: {
          student: { id: studentId },
          unit: { id: unitId },
        },
      });
      expect(result).toEqual(mockUnitProgress);
    });

    it('should return null when no progress found', async () => {
      const studentId = 1;
      const unitId = 999;

      mockRepositories.unitProgress.findOne.mockResolvedValue(null);

      const result = await service.getUnitProgress(studentId, unitId);

      expect(result).toBeNull();
    });
  });

  describe('getUnitsProgress', () => {
    it('should get multiple unit progresses', async () => {
      const studentId = 1;
      const unitIds = [1, 2, 3];

      mockRepositories.unitProgress.find.mockResolvedValue([mockUnitProgress]);

      const result = await service.getUnitsProgress(studentId, unitIds);

      expect(unitProgressRepository.find).toHaveBeenCalledWith({
        where: {
          student: { id: studentId },
          unit: { id: In(unitIds) },
        },
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array for empty unitIds', async () => {
      const studentId = 1;
      const unitIds: number[] = [];

      const result = await service.getUnitsProgress(studentId, unitIds);

      expect(result).toEqual([]);
    });
  });

  describe('startLevel', () => {
    it('should start a new level attempt', async () => {
      const studentId = 1;
      const levelId = 1;

      mockRepositories.level.findOne.mockResolvedValue(mockLevel);
      mockRepositories.user.findOne.mockResolvedValue(mockStudent);
      mockRepositories.levelAttempt.create.mockReturnValue(mockLevelAttempt);
      mockRepositories.levelAttempt.save.mockResolvedValue(mockLevelAttempt);

      const result = await service.startLevel(studentId, levelId);

      expect(levelRepository.findOne).toHaveBeenCalledWith({ where: { id: levelId } });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: studentId } });
      expect(levelAttemptRepository.create).toHaveBeenCalled();
      expect(levelAttemptRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockLevelAttempt);
    });

    it('should throw NotFoundException when level not found', async () => {
      const studentId = 1;
      const levelId = 999;

      mockRepositories.level.findOne.mockResolvedValue(null);

      await expect(service.startLevel(studentId, levelId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.startLevel(studentId, levelId)).rejects.toThrow(
        `Level with ID ${levelId} not found`,
      );
    });

    it('should throw NotFoundException when student not found', async () => {
      const studentId = 999;
      const levelId = 1;

      mockRepositories.level.findOne.mockResolvedValue(mockLevel);
      mockRepositories.user.findOne.mockResolvedValue(null);

      await expect(service.startLevel(studentId, levelId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.startLevel(studentId, levelId)).rejects.toThrow(
        `Student with ID ${studentId} not found`,
      );
    });

    it('should handle integer IDs', async () => {
      const studentId = 42;
      const levelId = 99;

      mockRepositories.level.findOne.mockResolvedValue(mockLevel);
      mockRepositories.user.findOne.mockResolvedValue(mockStudent);
      mockRepositories.levelAttempt.create.mockReturnValue(mockLevelAttempt);
      mockRepositories.levelAttempt.save.mockResolvedValue(mockLevelAttempt);

      await service.startLevel(studentId, levelId);

      expect(levelRepository.findOne).toHaveBeenCalledWith({ where: { id: 99 } });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 42 } });
    });
  });

  describe('submitAnswer', () => {
    it('should submit an answer successfully', async () => {
      const studentId = 1;
      const questionId = 1;
      const submitDto: SubmitAnswerDto = {
        attemptId: 1,
        selectedOptionId: 1,
        isCorrect: true,
        pointsEarned: 10,
        timeSpentSeconds: 5,
      };

      const mockAnswer = {
        id: 1,
        attempt: mockLevelAttempt,
        question: mockQuestion,
        student: mockStudent,
        isCorrect: true,
        pointsEarned: 10,
      };

      mockRepositories.question.findOne.mockResolvedValue(mockQuestion);
      mockRepositories.levelAttempt.findOne.mockResolvedValue(mockLevelAttempt);
      mockRepositories.user.findOne.mockResolvedValue(mockStudent);
      mockRepositories.answerOption.findOne.mockResolvedValue(mockAnswerOption);
      mockRepositories.questionAnswer.create.mockReturnValue(mockAnswer);
      mockRepositories.questionAnswer.save.mockResolvedValue(mockAnswer);

      const result = await service.submitAnswer(studentId, questionId, submitDto);

      expect(questionRepository.findOne).toHaveBeenCalledWith({ where: { id: questionId } });
      expect(levelAttemptRepository.findOne).toHaveBeenCalled();
      expect(questionAnswerRepository.create).toHaveBeenCalled();
      expect(questionAnswerRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockAnswer);
    });

    it('should throw NotFoundException when question not found', async () => {
      const studentId = 1;
      const questionId = 999;
      const submitDto: SubmitAnswerDto = {
        attemptId: 1,
        isCorrect: false,
        pointsEarned: 0,
      };

      mockRepositories.question.findOne.mockResolvedValue(null);

      await expect(service.submitAnswer(studentId, questionId, submitDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.submitAnswer(studentId, questionId, submitDto)).rejects.toThrow(
        `Question with ID ${questionId} not found`,
      );
    });

    it('should throw NotFoundException when attempt not found', async () => {
      const studentId = 1;
      const questionId = 1;
      const submitDto: SubmitAnswerDto = {
        attemptId: 999,
        isCorrect: false,
        pointsEarned: 0,
      };

      mockRepositories.question.findOne.mockResolvedValue(mockQuestion);
      mockRepositories.levelAttempt.findOne.mockResolvedValue(null);

      await expect(service.submitAnswer(studentId, questionId, submitDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when attempt does not belong to student', async () => {
      const studentId = 2;
      const questionId = 1;
      const submitDto: SubmitAnswerDto = {
        attemptId: 1,
        isCorrect: false,
        pointsEarned: 0,
      };

      mockRepositories.question.findOne.mockResolvedValue(mockQuestion);
      mockRepositories.levelAttempt.findOne.mockResolvedValue(mockLevelAttempt);

      await expect(service.submitAnswer(studentId, questionId, submitDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.submitAnswer(studentId, questionId, submitDto)).rejects.toThrow(
        'Level attempt does not belong to this student',
      );
    });

    it('should handle integer IDs', async () => {
      const studentId = 42;
      const questionId = 99;
      const submitDto: SubmitAnswerDto = {
        attemptId: 5,
        isCorrect: true,
        pointsEarned: 15,
      };

      mockRepositories.question.findOne.mockResolvedValue(mockQuestion);
      mockRepositories.levelAttempt.findOne.mockResolvedValue({
        ...mockLevelAttempt,
        student: { ...mockStudent, id: 42 },
      });
      mockRepositories.user.findOne.mockResolvedValue({ ...mockStudent, id: 42 });
      mockRepositories.questionAnswer.create.mockReturnValue({});
      mockRepositories.questionAnswer.save.mockResolvedValue({});

      await service.submitAnswer(studentId, questionId, submitDto);

      expect(questionRepository.findOne).toHaveBeenCalledWith({ where: { id: 99 } });
    });
  });

  describe('completeLevel', () => {
    it('should complete a level attempt', async () => {
      const studentId = 1;
      const levelId = 1;
      const completeDto: CompleteLevelDto = {
        attemptId: 1,
        score: 85,
        pointsEarned: 850,
        isPassed: true,
        timeSpentSeconds: 120,
      };

      const completedAttempt = {
        ...mockLevelAttempt,
        score: 85,
        pointsEarned: 850,
        isPassed: true,
        isCompleted: true,
      };

      mockRepositories.levelAttempt.findOne.mockResolvedValue(mockLevelAttempt);
      mockRepositories.levelAttempt.save.mockResolvedValue(completedAttempt);

      const result = await service.completeLevel(studentId, levelId, completeDto);

      expect(levelAttemptRepository.findOne).toHaveBeenCalled();
      expect(levelAttemptRepository.save).toHaveBeenCalled();
      expect(result.isCompleted).toBe(true);
      expect(result.score).toBe(85);
      expect(result.pointsEarned).toBe(850);
    });

    it('should throw NotFoundException when attempt not found', async () => {
      const studentId = 1;
      const levelId = 1;
      const completeDto: CompleteLevelDto = {
        attemptId: 999,
        score: 85,
        pointsEarned: 850,
        isPassed: true,
        timeSpentSeconds: 120,
      };

      mockRepositories.levelAttempt.findOne.mockResolvedValue(null);

      await expect(service.completeLevel(studentId, levelId, completeDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when attempt does not belong to student', async () => {
      const studentId = 2;
      const levelId = 1;
      const completeDto: CompleteLevelDto = {
        attemptId: 1,
        score: 85,
        pointsEarned: 850,
        isPassed: true,
        timeSpentSeconds: 120,
      };

      mockRepositories.levelAttempt.findOne.mockResolvedValue(mockLevelAttempt);

      await expect(service.completeLevel(studentId, levelId, completeDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.completeLevel(studentId, levelId, completeDto)).rejects.toThrow(
        'Level attempt does not belong to this student',
      );
    });

    it('should throw NotFoundException when attempt does not belong to level', async () => {
      const studentId = 1;
      const levelId = 2;
      const completeDto: CompleteLevelDto = {
        attemptId: 1,
        score: 85,
        pointsEarned: 850,
        isPassed: true,
        timeSpentSeconds: 120,
      };

      mockRepositories.levelAttempt.findOne.mockResolvedValue(mockLevelAttempt);

      await expect(service.completeLevel(studentId, levelId, completeDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.completeLevel(studentId, levelId, completeDto)).rejects.toThrow(
        'Level attempt does not belong to this level',
      );
    });

    it('should handle integer IDs', async () => {
      const studentId = 42;
      const levelId = 99;
      const completeDto: CompleteLevelDto = {
        attemptId: 5,
        score: 90,
        pointsEarned: 900,
        isPassed: true,
        timeSpentSeconds: 150,
      };

      const attempt = {
        ...mockLevelAttempt,
        student: { ...mockStudent, id: 42 },
        level: { ...mockLevel, id: 99 },
      };

      mockRepositories.levelAttempt.findOne.mockResolvedValue(attempt);
      mockRepositories.levelAttempt.save.mockResolvedValue(attempt);

      await service.completeLevel(studentId, levelId, completeDto);

      expect(levelAttemptRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('getStudentProgress', () => {
    it('should get overall student progress', async () => {
      const studentId = 1;

      mockRepositories.user.findOne.mockResolvedValue(mockStudent);
      mockRepositories.chapterProgress.find.mockResolvedValue([mockChapterProgress]);
      mockRepositories.unitProgress.find.mockResolvedValue([mockUnitProgress]);
      mockRepositories.levelAttempt.find.mockResolvedValue([mockLevelAttempt]);

      const result = await service.getStudentProgress(studentId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: studentId } });
      expect(chapterProgressRepository.find).toHaveBeenCalled();
      expect(unitProgressRepository.find).toHaveBeenCalled();
      expect(levelAttemptRepository.find).toHaveBeenCalled();
      expect(result.studentId).toBe(studentId);
      expect(result.totalChapters).toBeDefined();
      expect(result.totalUnits).toBeDefined();
    });

    it('should throw NotFoundException when student not found', async () => {
      const studentId = 999;

      mockRepositories.user.findOne.mockResolvedValue(null);

      await expect(service.getStudentProgress(studentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getStudentProgress(studentId)).rejects.toThrow(
        `Student with ID ${studentId} not found`,
      );
    });

    it('should handle student with no progress', async () => {
      const studentId = 1;

      mockRepositories.user.findOne.mockResolvedValue(mockStudent);
      mockRepositories.chapterProgress.find.mockResolvedValue([]);
      mockRepositories.unitProgress.find.mockResolvedValue([]);
      mockRepositories.levelAttempt.find.mockResolvedValue([]);

      const result = await service.getStudentProgress(studentId);

      expect(result.totalChapters).toBe(0);
      expect(result.totalUnits).toBe(0);
      expect(result.totalLevelAttempts).toBe(0);
    });

    it('should handle integer ID', async () => {
      const studentId = 42;

      mockRepositories.user.findOne.mockResolvedValue({ ...mockStudent, id: 42 });
      mockRepositories.chapterProgress.find.mockResolvedValue([]);
      mockRepositories.unitProgress.find.mockResolvedValue([]);
      mockRepositories.levelAttempt.find.mockResolvedValue([]);

      const result = await service.getStudentProgress(studentId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 42 } });
      expect(result.studentId).toBe(42);
    });
  });

  describe('mapChapterProgressToDto', () => {
    it('should map chapter progress to DTO', () => {
      const result = service.mapChapterProgressToDto(mockChapterProgress);

      expect(result).toEqual({
        totalUnits: 5,
        completedUnits: 3,
        totalPointsAvailable: 500,
        totalPointsEarned: 350,
        averageScore: 85.5,
        lastAccessedAt: mockChapterProgress.lastAccessedAt,
      });
    });

    it('should return null for null progress', () => {
      const result = service.mapChapterProgressToDto(null);

      expect(result).toBeNull();
    });
  });

  describe('mapUnitProgressToDto', () => {
    it('should map unit progress to DTO', () => {
      const result = service.mapUnitProgressToDto(mockUnitProgress);

      expect(result).toEqual({
        totalLevels: 10,
        completedLevels: 5,
        totalPointsAvailable: 1000,
        totalPointsEarned: 650,
        averageScore: 78.5,
        lastAccessedAt: mockUnitProgress.lastAccessedAt,
      });
    });

    it('should return null for null progress', () => {
      const result = service.mapUnitProgressToDto(null);

      expect(result).toBeNull();
    });
  });
});

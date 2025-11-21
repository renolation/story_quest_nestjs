import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { CompleteLevelDto } from './dto/complete-level.dto';

describe('ProgressController', () => {
  let controller: ProgressController;
  let service: ProgressService;

  const mockUser = {
    id: 1,
    email: 'student@example.com',
    role: 'student',
  };

  const mockLevelAttempt = {
    id: 1,
    studentId: 1,
    levelId: 1,
    score: 0,
    pointsEarned: 0,
    timeSpentSeconds: 0,
    isCompleted: false,
    isPassed: false,
    startedAt: new Date('2025-01-15T10:00:00Z'),
  };

  const mockCompletedAttempt = {
    id: 1,
    studentId: 1,
    levelId: 1,
    score: 85,
    pointsEarned: 850,
    timeSpentSeconds: 120,
    isCompleted: true,
    isPassed: true,
    startedAt: new Date('2025-01-15T10:00:00Z'),
    completedAt: new Date('2025-01-15T10:02:00Z'),
  };

  const mockQuestionAnswer = {
    id: 1,
    attemptId: 1,
    questionId: 1,
    studentId: 1,
    isCorrect: true,
    pointsEarned: 10,
    timeSpentSeconds: 5,
    answeredAt: new Date('2025-01-15T10:01:00Z'),
  };

  const mockChapterProgress = {
    chapterId: 1,
    totalUnits: 5,
    completedUnits: 3,
    totalPointsAvailable: 500,
    totalPointsEarned: 350,
    averageScore: 85.5,
    lastAccessedAt: new Date('2025-01-15'),
  };

  const mockUnitProgress = {
    unitId: 1,
    totalLevels: 10,
    completedLevels: 5,
    totalPointsAvailable: 1000,
    totalPointsEarned: 650,
    averageScore: 78.5,
    lastAccessedAt: new Date('2025-01-15'),
  };

  const mockStudentProgress = {
    studentId: 1,
    totalChapters: 3,
    completedChapters: 1,
    totalUnits: 15,
    completedUnits: 8,
    totalLevelAttempts: 25,
    completedLevelAttempts: 20,
    passedLevelAttempts: 18,
    averageScore: 82.5,
    totalPointsEarned: 5000,
    chapterProgress: [],
    unitProgress: [],
  };

  const mockProgressService = {
    startLevel: jest.fn(),
    submitAnswer: jest.fn(),
    completeLevel: jest.fn(),
    getStudentProgress: jest.fn(),
    getChapterProgress: jest.fn(),
    getUnitProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [
        {
          provide: ProgressService,
          useValue: mockProgressService,
        },
      ],
    }).compile();

    controller = module.get<ProgressController>(ProgressController);
    service = module.get<ProgressService>(ProgressService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('startLevel', () => {
    it('should start a new level attempt', async () => {
      const levelId = 1;
      mockProgressService.startLevel.mockResolvedValue(mockLevelAttempt);

      const result = await controller.startLevel(mockUser, levelId);

      expect(service.startLevel).toHaveBeenCalledWith(mockUser.id, levelId);
      expect(result).toEqual(mockLevelAttempt);
      expect(result.id).toBe(1);
      expect(typeof result.id).toBe('number');
    });

    it('should use current user ID from decorator', async () => {
      const customUser = { id: 123, email: 'test@example.com', role: 'student' };
      const levelId = 1;
      mockProgressService.startLevel.mockResolvedValue(mockLevelAttempt);

      await controller.startLevel(customUser, levelId);

      expect(service.startLevel).toHaveBeenCalledWith(123, levelId);
    });

    it('should handle integer levelId parameter', async () => {
      const levelId = 999;
      const attempt = { ...mockLevelAttempt, levelId: 999 };
      mockProgressService.startLevel.mockResolvedValue(attempt);

      const result = await controller.startLevel(mockUser, levelId);

      expect(service.startLevel).toHaveBeenCalledWith(mockUser.id, 999);
      expect(result.levelId).toBe(999);
      expect(typeof result.levelId).toBe('number');
    });

    it('should create attempt with initial values', async () => {
      const levelId = 1;
      mockProgressService.startLevel.mockResolvedValue(mockLevelAttempt);

      const result = await controller.startLevel(mockUser, levelId);

      expect(result.score).toBe(0);
      expect(result.pointsEarned).toBe(0);
      expect(result.isCompleted).toBe(false);
      expect(result.isPassed).toBe(false);
    });
  });

  describe('submitAnswer', () => {
    it('should submit an answer successfully', async () => {
      const questionId = 1;
      const submitDto: SubmitAnswerDto = {
        attemptId: 1,
        selectedOptionId: 1,
        isCorrect: true,
        pointsEarned: 10,
        timeSpentSeconds: 5,
      };

      mockProgressService.submitAnswer.mockResolvedValue(mockQuestionAnswer);

      const result = await controller.submitAnswer(mockUser, questionId, submitDto);

      expect(service.submitAnswer).toHaveBeenCalledWith(mockUser.id, questionId, submitDto);
      expect(result).toEqual(mockQuestionAnswer);
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });

    it('should use current user ID from decorator', async () => {
      const customUser = { id: 456, email: 'test@example.com', role: 'student' };
      const questionId = 1;
      const submitDto: SubmitAnswerDto = {
        attemptId: 1,
        isCorrect: false,
        pointsEarned: 0,
      };

      mockProgressService.submitAnswer.mockResolvedValue(mockQuestionAnswer);

      await controller.submitAnswer(customUser, questionId, submitDto);

      expect(service.submitAnswer).toHaveBeenCalledWith(456, questionId, submitDto);
    });

    it('should handle integer questionId parameter', async () => {
      const questionId = 999;
      const submitDto: SubmitAnswerDto = {
        attemptId: 1,
        isCorrect: true,
        pointsEarned: 15,
      };

      mockProgressService.submitAnswer.mockResolvedValue({
        ...mockQuestionAnswer,
        questionId: 999,
      });

      const result = await controller.submitAnswer(mockUser, questionId, submitDto);

      expect(service.submitAnswer).toHaveBeenCalledWith(mockUser.id, 999, submitDto);
      expect(result.questionId).toBe(999);
      expect(typeof result.questionId).toBe('number');
    });

    it('should submit answer with text response', async () => {
      const questionId = 1;
      const submitDto: SubmitAnswerDto = {
        attemptId: 1,
        answerText: 'My name is John',
        isCorrect: true,
        pointsEarned: 10,
        timeSpentSeconds: 8,
      };

      mockProgressService.submitAnswer.mockResolvedValue({
        ...mockQuestionAnswer,
        answerText: 'My name is John',
      });

      const result = await controller.submitAnswer(mockUser, questionId, submitDto);

      expect(result.answerText).toBe('My name is John');
    });

    it('should submit answer with audio URL', async () => {
      const questionId = 1;
      const submitDto: SubmitAnswerDto = {
        attemptId: 1,
        answerAudioUrl: 'https://example.com/answer.mp3',
        isCorrect: true,
        pointsEarned: 10,
        timeSpentSeconds: 10,
      };

      mockProgressService.submitAnswer.mockResolvedValue({
        ...mockQuestionAnswer,
        answerAudioUrl: 'https://example.com/answer.mp3',
      });

      const result = await controller.submitAnswer(mockUser, questionId, submitDto);

      expect(result.answerAudioUrl).toBe('https://example.com/answer.mp3');
    });
  });

  describe('completeLevel', () => {
    it('should complete a level attempt', async () => {
      const levelId = 1;
      const completeDto: CompleteLevelDto = {
        attemptId: 1,
        score: 85,
        pointsEarned: 850,
        isPassed: true,
        timeSpentSeconds: 120,
      };

      mockProgressService.completeLevel.mockResolvedValue(mockCompletedAttempt);

      const result = await controller.completeLevel(mockUser, levelId, completeDto);

      expect(service.completeLevel).toHaveBeenCalledWith(mockUser.id, levelId, completeDto);
      expect(result).toEqual(mockCompletedAttempt);
      expect(result.isCompleted).toBe(true);
      expect(result.score).toBe(85);
    });

    it('should use current user ID from decorator', async () => {
      const customUser = { id: 789, email: 'test@example.com', role: 'student' };
      const levelId = 1;
      const completeDto: CompleteLevelDto = {
        attemptId: 1,
        score: 90,
        pointsEarned: 900,
        isPassed: true,
        timeSpentSeconds: 100,
      };

      mockProgressService.completeLevel.mockResolvedValue(mockCompletedAttempt);

      await controller.completeLevel(customUser, levelId, completeDto);

      expect(service.completeLevel).toHaveBeenCalledWith(789, levelId, completeDto);
    });

    it('should handle integer levelId parameter', async () => {
      const levelId = 999;
      const completeDto: CompleteLevelDto = {
        attemptId: 1,
        score: 95,
        pointsEarned: 950,
        isPassed: true,
        timeSpentSeconds: 80,
      };

      mockProgressService.completeLevel.mockResolvedValue({
        ...mockCompletedAttempt,
        levelId: 999,
      });

      const result = await controller.completeLevel(mockUser, levelId, completeDto);

      expect(service.completeLevel).toHaveBeenCalledWith(mockUser.id, 999, completeDto);
      expect(result.levelId).toBe(999);
      expect(typeof result.levelId).toBe('number');
    });

    it('should complete level with passed status', async () => {
      const levelId = 1;
      const completeDto: CompleteLevelDto = {
        attemptId: 1,
        score: 85,
        pointsEarned: 850,
        isPassed: true,
        timeSpentSeconds: 120,
      };

      mockProgressService.completeLevel.mockResolvedValue(mockCompletedAttempt);

      const result = await controller.completeLevel(mockUser, levelId, completeDto);

      expect(result.isPassed).toBe(true);
      expect(result.score).toBe(85);
    });

    it('should complete level with failed status', async () => {
      const levelId = 1;
      const completeDto: CompleteLevelDto = {
        attemptId: 1,
        score: 50,
        pointsEarned: 500,
        isPassed: false,
        timeSpentSeconds: 150,
      };

      const failedAttempt = {
        ...mockCompletedAttempt,
        score: 50,
        isPassed: false,
      };

      mockProgressService.completeLevel.mockResolvedValue(failedAttempt);

      const result = await controller.completeLevel(mockUser, levelId, completeDto);

      expect(result.isPassed).toBe(false);
      expect(result.score).toBe(50);
    });
  });

  describe('getMyProgress', () => {
    it('should get student progress summary', async () => {
      mockProgressService.getStudentProgress.mockResolvedValue(mockStudentProgress);

      const result = await controller.getMyProgress(mockUser);

      expect(service.getStudentProgress).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockStudentProgress);
      expect(result.studentId).toBe(1);
      expect(result.totalChapters).toBe(3);
      expect(result.totalUnits).toBe(15);
    });

    it('should use current user ID from decorator', async () => {
      const customUser = { id: 555, email: 'test@example.com', role: 'student' };
      mockProgressService.getStudentProgress.mockResolvedValue({
        ...mockStudentProgress,
        studentId: 555,
      });

      await controller.getMyProgress(customUser);

      expect(service.getStudentProgress).toHaveBeenCalledWith(555);
    });

    it('should return progress with statistics', async () => {
      mockProgressService.getStudentProgress.mockResolvedValue(mockStudentProgress);

      const result = await controller.getMyProgress(mockUser);

      expect(result.totalLevelAttempts).toBe(25);
      expect(result.completedLevelAttempts).toBe(20);
      expect(result.passedLevelAttempts).toBe(18);
      expect(result.averageScore).toBe(82.5);
      expect(result.totalPointsEarned).toBe(5000);
    });
  });

  describe('getChapterProgress', () => {
    it('should get chapter progress', async () => {
      const chapterId = 1;
      mockProgressService.getChapterProgress.mockResolvedValue(mockChapterProgress);

      const result = await controller.getChapterProgress(mockUser, chapterId);

      expect(service.getChapterProgress).toHaveBeenCalledWith(mockUser.id, chapterId);
      expect(result).toEqual(mockChapterProgress);
      expect(result.chapterId).toBe(1);
    });

    it('should use current user ID from decorator', async () => {
      const customUser = { id: 321, email: 'test@example.com', role: 'student' };
      const chapterId = 1;
      mockProgressService.getChapterProgress.mockResolvedValue(mockChapterProgress);

      await controller.getChapterProgress(customUser, chapterId);

      expect(service.getChapterProgress).toHaveBeenCalledWith(321, chapterId);
    });

    it('should handle integer chapterId parameter', async () => {
      const chapterId = 999;
      mockProgressService.getChapterProgress.mockResolvedValue({
        ...mockChapterProgress,
        chapterId: 999,
      });

      const result = await controller.getChapterProgress(mockUser, chapterId);

      expect(service.getChapterProgress).toHaveBeenCalledWith(mockUser.id, 999);
      expect(result.chapterId).toBe(999);
      expect(typeof result.chapterId).toBe('number');
    });

    it('should return chapter progress with details', async () => {
      const chapterId = 1;
      mockProgressService.getChapterProgress.mockResolvedValue(mockChapterProgress);

      const result = await controller.getChapterProgress(mockUser, chapterId);

      expect(result.totalUnits).toBe(5);
      expect(result.completedUnits).toBe(3);
      expect(result.averageScore).toBe(85.5);
    });
  });

  describe('getUnitProgress', () => {
    it('should get unit progress', async () => {
      const unitId = 1;
      mockProgressService.getUnitProgress.mockResolvedValue(mockUnitProgress);

      const result = await controller.getUnitProgress(mockUser, unitId);

      expect(service.getUnitProgress).toHaveBeenCalledWith(mockUser.id, unitId);
      expect(result).toEqual(mockUnitProgress);
      expect(result.unitId).toBe(1);
    });

    it('should use current user ID from decorator', async () => {
      const customUser = { id: 654, email: 'test@example.com', role: 'student' };
      const unitId = 1;
      mockProgressService.getUnitProgress.mockResolvedValue(mockUnitProgress);

      await controller.getUnitProgress(customUser, unitId);

      expect(service.getUnitProgress).toHaveBeenCalledWith(654, unitId);
    });

    it('should handle integer unitId parameter', async () => {
      const unitId = 999;
      mockProgressService.getUnitProgress.mockResolvedValue({
        ...mockUnitProgress,
        unitId: 999,
      });

      const result = await controller.getUnitProgress(mockUser, unitId);

      expect(service.getUnitProgress).toHaveBeenCalledWith(mockUser.id, 999);
      expect(result.unitId).toBe(999);
      expect(typeof result.unitId).toBe('number');
    });

    it('should return unit progress with details', async () => {
      const unitId = 1;
      mockProgressService.getUnitProgress.mockResolvedValue(mockUnitProgress);

      const result = await controller.getUnitProgress(mockUser, unitId);

      expect(result.totalLevels).toBe(10);
      expect(result.completedLevels).toBe(5);
      expect(result.averageScore).toBe(78.5);
    });
  });
});

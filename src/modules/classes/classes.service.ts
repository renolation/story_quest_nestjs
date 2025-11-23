import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Class } from './entities/class.entity';
import { StudentClass } from './entities/student-class.entity';
import {
  CreateClassDto,
  UpdateClassDto,
  ClassResponseDto,
  PaginatedClassesResponseDto,
  EnrollStudentDto,
} from './dto';
import { User } from '../users/entities/user.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Center } from '../centers/entities/center.entity';
import { UserRole } from '../../common/enums';
import { plainToInstance } from 'class-transformer';

/**
 * Classes Service
 *
 * Handles business logic for class management with role-based access control.
 *
 * KEY FEATURES:
 * 1. Role-based class creation:
 *    - AGENCY creates class → MUST specify branchId (can create for any branch)
 *    - CENTER creates class → branchId must belong to their center
 * 2. Access control:
 *    - AGENCY: View/manage all classes
 *    - CENTER: View/manage own center's classes only
 *    - TEACHER: View assigned classes only (read-only)
 * 3. Student enrollment management with capacity checks
 */
@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classesRepository: Repository<Class>,
    @InjectRepository(StudentClass)
    private readonly studentClassRepository: Repository<StudentClass>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Branch)
    private readonly branchesRepository: Repository<Branch>,
    @InjectRepository(Grade)
    private readonly gradesRepository: Repository<Grade>,
    @InjectRepository(Center)
    private readonly centersRepository: Repository<Center>,
  ) {}

  /**
   * Create a new class
   *
   * Role-based logic:
   * - AGENCY: Must provide branchId (can create for any branch)
   * - CENTER: branchId must belong to their center
   *
   * Process:
   * 1. Validate role permissions
   * 2. Validate branchId access based on user role
   * 3. Validate grade exists
   * 4. Validate teacher exists and has TEACHER role (if provided)
   * 5. Create class
   */
  async create(
    createClassDto: CreateClassDto,
    currentUser: User,
  ): Promise<Class> {
    const { branchId, gradeId, teacherId, maxStudents, name } = createClassDto;

    // Validate branch exists
    const branch = await this.branchesRepository.findOne({
      where: { id: branchId },
      relations: ['center'],
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    // Role-based branch access validation
    if (currentUser.role === UserRole.AGENCY) {
      // AGENCY can create for any branch (no additional checks needed)
    } else if (currentUser.role === UserRole.CENTER) {
      // CENTER can only create for own center's branches
      // Find the center where this user is the admin
      const center = await this.centersRepository.findOne({
        where: { userId: currentUser.id },
      });

      if (!center) {
        throw new NotFoundException(
          'Your center not found. Cannot create class.',
        );
      }

      // Verify branch belongs to this center
      if (branch.centerId !== center.id) {
        throw new ForbiddenException(
          `Branch with ID ${branchId} does not belong to your center`,
        );
      }
    } else {
      throw new ForbiddenException(
        'Only AGENCY and CENTER roles can create classes',
      );
    }

    // Validate grade exists
    const grade = await this.gradesRepository.findOne({
      where: { id: gradeId },
    });

    if (!grade) {
      throw new NotFoundException(`Grade with ID ${gradeId} not found`);
    }

    // Validate teacher if provided
    if (teacherId) {
      const teacher = await this.usersRepository.findOne({
        where: { id: teacherId },
      });

      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
      }

      if (teacher.role !== UserRole.TEACHER) {
        throw new BadRequestException(
          `User with ID ${teacherId} is not a teacher`,
        );
      }
    }

    // Create class
    const newClass = this.classesRepository.create({
      branchId,
      gradeId,
      name,
      teacherId: teacherId || null,
      maxStudents: maxStudents || 30,
      isActive: true,
    });

    const savedClass = await this.classesRepository.save(newClass);

    // Return class with relations
    return await this.findOne(savedClass.id, currentUser);
  }

  /**
   * Find all classes with pagination and filtering
   *
   * Access control:
   * - AGENCY: View all classes
   * - CENTER: View own center's classes only
   * - TEACHER: View assigned classes only
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    centerId?: number,
    branchId?: number,
    teacherId?: number,
    gradeId?: number,
    search?: string,
    currentUser?: User,
  ): Promise<PaginatedClassesResponseDto> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.classesRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.branch', 'branch')
      .leftJoinAndSelect('class.grade', 'grade')
      .leftJoinAndSelect('class.teacher', 'teacher')
      .leftJoinAndSelect('branch.center', 'center');

    // Apply role-based filtering
    if (currentUser) {
      if (currentUser.role === UserRole.CENTER) {
        // CENTER sees only their own center's classes
        const center = await this.centersRepository.findOne({
          where: { userId: currentUser.id },
        });

        if (!center) {
          throw new NotFoundException('Your center not found');
        }

        queryBuilder.andWhere('center.id = :centerId', { centerId: center.id });
      } else if (currentUser.role === UserRole.TEACHER) {
        // TEACHER sees only assigned classes
        queryBuilder.andWhere('class.teacherId = :teacherId', {
          teacherId: currentUser.id,
        });
      } else if (currentUser.role === UserRole.AGENCY) {
        // AGENCY can filter by centerId if provided
        if (centerId) {
          queryBuilder.andWhere('center.id = :centerId', { centerId });
        }
      }
    }

    // Apply additional filters
    if (branchId) {
      queryBuilder.andWhere('class.branchId = :branchId', { branchId });
    }

    if (teacherId && currentUser?.role !== UserRole.TEACHER) {
      queryBuilder.andWhere('class.teacherId = :teacherId', { teacherId });
    }

    if (gradeId) {
      queryBuilder.andWhere('class.gradeId = :gradeId', { gradeId });
    }

    // Apply search filter
    if (search) {
      queryBuilder.andWhere('class.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Apply pagination and sorting
    queryBuilder
      .orderBy('class.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [classes, total] = await queryBuilder.getManyAndCount();

    // Get enrolled count for each class
    const classesWithCount = await Promise.all(
      classes.map(async (classItem) => {
        const enrolledCount = await this.studentClassRepository.count({
          where: { classId: classItem.id },
        });

        return {
          ...classItem,
          enrolledCount,
        };
      }),
    );

    // Transform to response DTOs
    const data = classesWithCount.map((classItem) =>
      plainToInstance(
        ClassResponseDto,
        {
          ...classItem,
          createdAt: classItem.createdAt.toISOString(),
          updatedAt: classItem.updatedAt.toISOString(),
        },
        { excludeExtraneousValues: true },
      ),
    );

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single class by ID
   *
   * Access control:
   * - AGENCY: View any class
   * - CENTER: View own center's classes only
   * - TEACHER: View assigned classes only
   */
  async findOne(id: number, currentUser?: User): Promise<Class> {
    const classItem = await this.classesRepository.findOne({
      where: { id },
      relations: ['branch', 'branch.center', 'grade', 'teacher'],
    });

    if (!classItem) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Apply access control
    if (currentUser) {
      if (currentUser.role === UserRole.CENTER) {
        const center = await this.centersRepository.findOne({
          where: { userId: currentUser.id },
        });

        if (!center || classItem.branch.centerId !== center.id) {
          throw new ForbiddenException(
            'You can only view classes from your own center',
          );
        }
      } else if (currentUser.role === UserRole.TEACHER) {
        if (classItem.teacherId !== currentUser.id) {
          throw new ForbiddenException(
            'You can only view classes assigned to you',
          );
        }
      }
    }

    return classItem;
  }

  /**
   * Update a class
   *
   * Access control:
   * - AGENCY: Update any class
   * - CENTER: Update own center's classes only
   */
  async update(
    id: number,
    updateClassDto: UpdateClassDto,
    currentUser?: User,
  ): Promise<Class> {
    const classItem = await this.findOne(id, currentUser);

    // Validate branch if updating
    if (updateClassDto.branchId) {
      const branch = await this.branchesRepository.findOne({
        where: { id: updateClassDto.branchId },
        relations: ['center'],
      });

      if (!branch) {
        throw new NotFoundException(
          `Branch with ID ${updateClassDto.branchId} not found`,
        );
      }

      // Role-based validation
      if (currentUser?.role === UserRole.CENTER) {
        const center = await this.centersRepository.findOne({
          where: { userId: currentUser.id },
        });

        if (!center || branch.centerId !== center.id) {
          throw new ForbiddenException(
            'You can only move classes to branches in your own center',
          );
        }
      }
    }

    // Validate grade if updating
    if (updateClassDto.gradeId) {
      const grade = await this.gradesRepository.findOne({
        where: { id: updateClassDto.gradeId },
      });

      if (!grade) {
        throw new NotFoundException(
          `Grade with ID ${updateClassDto.gradeId} not found`,
        );
      }
    }

    // Validate teacher if updating
    if (updateClassDto.teacherId) {
      const teacher = await this.usersRepository.findOne({
        where: { id: updateClassDto.teacherId },
      });

      if (!teacher) {
        throw new NotFoundException(
          `Teacher with ID ${updateClassDto.teacherId} not found`,
        );
      }

      if (teacher.role !== UserRole.TEACHER) {
        throw new BadRequestException(
          `User with ID ${updateClassDto.teacherId} is not a teacher`,
        );
      }
    }

    // Apply updates
    Object.assign(classItem, updateClassDto);

    const updatedClass = await this.classesRepository.save(classItem);

    // Return updated class with relations
    return await this.findOne(updatedClass.id, currentUser);
  }

  /**
   * Delete a class (soft delete by setting isActive to false)
   *
   * Access control:
   * - AGENCY: Delete any class
   * - CENTER: Delete own center's classes only
   */
  async remove(id: number, currentUser?: User): Promise<void> {
    const classItem = await this.findOne(id, currentUser);

    classItem.isActive = false;
    await this.classesRepository.save(classItem);
  }

  /**
   * Enroll a student in a class
   *
   * Validates:
   * - Student exists and has STUDENT role
   * - Class has capacity
   * - Student not already enrolled
   */
  async enrollStudent(
    classId: number,
    enrollStudentDto: EnrollStudentDto,
    currentUser?: User,
  ): Promise<void> {
    const classItem = await this.findOne(classId, currentUser);

    const { studentId } = enrollStudentDto;

    // Validate student exists and has STUDENT role
    const student = await this.usersRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    if (student.role !== UserRole.STUDENT) {
      throw new BadRequestException(
        `User with ID ${studentId} is not a student`,
      );
    }

    // Check if student already enrolled
    const existingEnrollment = await this.studentClassRepository.findOne({
      where: { studentId, classId },
    });

    if (existingEnrollment) {
      throw new ConflictException(
        `Student with ID ${studentId} is already enrolled in this class`,
      );
    }

    // Check class capacity
    const enrolledCount = await this.studentClassRepository.count({
      where: { classId },
    });

    if (enrolledCount >= classItem.maxStudents) {
      throw new BadRequestException(
        `Class is full. Maximum capacity: ${classItem.maxStudents}`,
      );
    }

    // Enroll student
    const enrollment = this.studentClassRepository.create({
      studentId,
      classId,
    });

    await this.studentClassRepository.save(enrollment);
  }

  /**
   * Unenroll a student from a class
   */
  async unenrollStudent(
    classId: number,
    studentId: number,
    currentUser?: User,
  ): Promise<void> {
    await this.findOne(classId, currentUser);

    const enrollment = await this.studentClassRepository.findOne({
      where: { studentId, classId },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Student with ID ${studentId} is not enrolled in class with ID ${classId}`,
      );
    }

    await this.studentClassRepository.remove(enrollment);
  }

  /**
   * Get all students in a class
   *
   * Access control:
   * - AGENCY: View students in any class
   * - CENTER: View students in own center's classes
   * - TEACHER: View students in assigned classes
   */
  async getClassStudents(classId: number, currentUser?: User): Promise<User[]> {
    await this.findOne(classId, currentUser);

    const enrollments = await this.studentClassRepository.find({
      where: { classId },
      relations: ['student'],
      order: { enrolledAt: 'ASC' },
    });

    return enrollments.map((enrollment) => enrollment.student);
  }
}

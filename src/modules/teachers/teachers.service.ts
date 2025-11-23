import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Teacher, TeacherStatus } from './entities/teacher.entity';
import { CreateTeacherDto, UpdateTeacherDto, TeacherResponseDto, PaginatedTeachersResponseDto } from './dto';
import { User } from '../users/entities/user.entity';
import { Center } from '../centers/entities/center.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Class } from '../classes/entities/class.entity';
import { StudentClass } from '../classes/entities/student-class.entity';
import { UserRole } from '../../common/enums';
import { plainToInstance } from 'class-transformer';

/**
 * Teachers Service
 *
 * Handles business logic for teacher management with role-based access control.
 *
 * KEY FEATURES:
 * 1. Role-based teacher creation:
 *    - AGENCY creates teacher → MUST specify centerId
 *    - CENTER creates teacher → centerId auto-filled from their center
 * 2. Access control:
 *    - AGENCY: View/manage all teachers
 *    - CENTER: View/manage own center's teachers only
 *    - TEACHER: View/update own profile only
 */
@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Center)
    private readonly centersRepository: Repository<Center>,
    @InjectRepository(Branch)
    private readonly branchesRepository: Repository<Branch>,
    @InjectRepository(Class)
    private readonly classesRepository: Repository<Class>,
    @InjectRepository(StudentClass)
    private readonly studentClassRepository: Repository<StudentClass>,
  ) {}

  /**
   * Create a new teacher
   *
   * Role-based logic:
   * - AGENCY: Must provide centerId (can create for any center)
   * - CENTER: centerId is auto-filled from authenticated user's center
   *
   * Process:
   * 1. Validate role permissions
   * 2. Determine centerId based on user role
   * 3. Create User account with TEACHER role
   * 4. Create Teacher profile linked to user
   */
  async create(
    createTeacherDto: CreateTeacherDto,
    currentUser: User,
  ): Promise<Teacher> {
    const { email, username, password, fullName, centerId, branchId, ...teacherData } =
      createTeacherDto;

    // Determine effective centerId based on user role
    let effectiveCenterId: number;

    if (currentUser.role === UserRole.AGENCY) {
      // AGENCY must specify centerId
      if (!centerId) {
        throw new BadRequestException(
          'AGENCY must specify centerId when creating a teacher',
        );
      }
      effectiveCenterId = centerId;
    } else if (currentUser.role === UserRole.CENTER) {
      // CENTER auto-fills centerId from their own center
      // Find the center where this user is the admin (via userId)
      const center = await this.centersRepository.findOne({
        where: { userId: currentUser.id },
      });

      if (!center) {
        throw new NotFoundException(
          'Your center not found. Cannot create teacher.',
        );
      }

      effectiveCenterId = center.id;

      // Ignore centerId from request if provided by CENTER
      if (centerId && centerId !== effectiveCenterId) {
        throw new ForbiddenException(
          'CENTER can only create teachers for their own center',
        );
      }
    } else {
      throw new ForbiddenException(
        'Only AGENCY and CENTER roles can create teachers',
      );
    }

    // Validate center exists
    const center = await this.centersRepository.findOne({
      where: { id: effectiveCenterId },
    });

    if (!center) {
      throw new NotFoundException(`Center with ID ${effectiveCenterId} not found`);
    }

    // Validate branch if provided
    if (branchId) {
      const branch = await this.branchesRepository.findOne({
        where: { id: branchId, centerId: effectiveCenterId },
      });

      if (!branch) {
        throw new NotFoundException(
          `Branch with ID ${branchId} not found or does not belong to center ${effectiveCenterId}`,
        );
      }
    }

    // Check if email already exists
    const existingUserByEmail = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    // Check if username already exists
    const existingUserByUsername = await this.usersRepository.findOne({
      where: { username },
    });

    if (existingUserByUsername) {
      throw new ConflictException(`User with username ${username} already exists`);
    }

    // Create User account
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      email,
      username,
      passwordHash: hashedPassword,
      fullName,
      role: UserRole.TEACHER,
      isActive: true,
    });

    const savedUser = await this.usersRepository.save(user);

    // Create Teacher profile
    const teacher = this.teachersRepository.create({
      userId: savedUser.id,
      centerId: effectiveCenterId,
      branchId: branchId || null,
      ...teacherData,
      status: TeacherStatus.ACTIVE,
    });

    const savedTeacher = await this.teachersRepository.save(teacher);

    // Return teacher with relations
    return await this.findOne(savedTeacher.id, currentUser);
  }

  /**
   * Find all teachers with pagination and filtering
   *
   * Access control:
   * - AGENCY: View all teachers
   * - CENTER: View own center's teachers only
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    centerId?: number,
    status?: TeacherStatus,
    search?: string,
    currentUser?: User,
  ): Promise<PaginatedTeachersResponseDto> {
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Teacher> = {};

    // Apply role-based filtering
    if (currentUser) {
      if (currentUser.role === UserRole.CENTER) {
        // CENTER sees only their own teachers
        const center = await this.centersRepository.findOne({
          where: { userId: currentUser.id },
        });

        if (!center) {
          throw new NotFoundException('Your center not found');
        }

        where.centerId = center.id;
      } else if (currentUser.role === UserRole.AGENCY) {
        // AGENCY can filter by centerId if provided
        if (centerId) {
          where.centerId = centerId;
        }
      }
    }

    // Apply status filter
    if (status) {
      where.status = status;
    }

    const queryBuilder = this.teachersRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .leftJoinAndSelect('teacher.center', 'center')
      .leftJoinAndSelect('teacher.branch', 'branch');

    // Apply where conditions
    if (where.centerId) {
      queryBuilder.andWhere('teacher.centerId = :centerId', {
        centerId: where.centerId,
      });
    }

    if (where.status) {
      queryBuilder.andWhere('teacher.status = :status', { status: where.status });
    }

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(user.fullName ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply pagination and sorting
    queryBuilder
      .orderBy('teacher.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [teachers, total] = await queryBuilder.getManyAndCount();

    // Transform to response DTOs
    const data = teachers.map((teacher) =>
      plainToInstance(TeacherResponseDto, {
        ...teacher,
        createdAt: teacher.createdAt.toISOString(),
        updatedAt: teacher.updatedAt.toISOString(),
      }, { excludeExtraneousValues: true }),
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
   * Find a single teacher by ID
   *
   * Access control:
   * - AGENCY: View any teacher
   * - CENTER: View own center's teachers only
   * - TEACHER: View own profile only
   */
  async findOne(id: number, currentUser?: User): Promise<Teacher> {
    const teacher = await this.teachersRepository.findOne({
      where: { id },
      relations: ['user', 'center', 'branch'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    // Apply access control
    if (currentUser) {
      if (currentUser.role === UserRole.CENTER) {
        const center = await this.centersRepository.findOne({
          where: { userId: currentUser.id },
        });

        if (!center || teacher.centerId !== center.id) {
          throw new ForbiddenException(
            'You can only view teachers from your own center',
          );
        }
      } else if (currentUser.role === UserRole.TEACHER) {
        if (teacher.userId !== currentUser.id) {
          throw new ForbiddenException('You can only view your own profile');
        }
      }
    }

    return teacher;
  }

  /**
   * Update a teacher
   *
   * Access control:
   * - AGENCY: Update any teacher
   * - CENTER: Update own center's teachers only
   * - TEACHER: Update own profile only (limited fields)
   */
  async update(
    id: number,
    updateTeacherDto: UpdateTeacherDto,
    currentUser?: User,
  ): Promise<Teacher> {
    const teacher = await this.findOne(id, currentUser);

    // Validate branch if updating
    if (updateTeacherDto.branchId) {
      const branch = await this.branchesRepository.findOne({
        where: {
          id: updateTeacherDto.branchId,
          centerId: teacher.centerId,
        },
      });

      if (!branch) {
        throw new NotFoundException(
          `Branch with ID ${updateTeacherDto.branchId} not found or does not belong to this teacher's center`,
        );
      }
    }

    // Apply updates
    Object.assign(teacher, updateTeacherDto);

    return await this.teachersRepository.save(teacher);
  }

  /**
   * Delete a teacher (soft delete by setting status to inactive)
   *
   * Access control:
   * - AGENCY: Delete any teacher
   * - CENTER: Delete own center's teachers only
   */
  async remove(id: number, currentUser?: User): Promise<void> {
    const teacher = await this.findOne(id, currentUser);

    teacher.status = TeacherStatus.INACTIVE;
    await this.teachersRepository.save(teacher);
  }

  /**
   * Get classes assigned to a teacher
   *
   * Access control:
   * - AGENCY: View classes for any teacher
   * - CENTER: View classes for teachers in own center
   * - TEACHER: View own assigned classes only
   */
  async getTeacherClasses(teacherId: number, currentUser?: User): Promise<Class[]> {
    // Verify access to this teacher
    await this.findOne(teacherId, currentUser);

    // Additional check for TEACHER role - can only view own classes
    if (currentUser && currentUser.role === UserRole.TEACHER && currentUser.id !== teacherId) {
      throw new ForbiddenException('You can only view your own classes');
    }

    return await this.classesRepository.find({
      where: { teacherId, isActive: true },
      relations: ['branch', 'grade', 'branch.center'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Get students for a teacher (across all their assigned classes)
   *
   * Access control:
   * - AGENCY: View students for any teacher
   * - CENTER: View students for teachers in own center
   * - TEACHER: View own students only
   */
  async getTeacherStudents(
    teacherId: number,
    currentUser?: User,
  ): Promise<{ classId: number; className: string; students: User[] }[]> {
    // Verify access to this teacher
    await this.findOne(teacherId, currentUser);

    // Additional check for TEACHER role - can only view own students
    if (currentUser && currentUser.role === UserRole.TEACHER && currentUser.id !== teacherId) {
      throw new ForbiddenException('You can only view your own students');
    }

    // Get all classes assigned to this teacher
    const classes = await this.classesRepository.find({
      where: { teacherId, isActive: true },
      relations: ['branch', 'grade'],
      order: { name: 'ASC' },
    });

    // For each class, get enrolled students
    const result: { classId: number; className: string; students: User[] }[] = [];
    for (const classItem of classes) {
      const enrollments = await this.studentClassRepository.find({
        where: { classId: classItem.id },
        relations: ['student'],
      });

      const students = enrollments.map((enrollment) => enrollment.student);

      result.push({
        classId: classItem.id,
        className: classItem.name,
        students,
      });
    }

    return result;
  }

  /**
   * Get all unique students for a teacher (flattened list without class grouping)
   *
   * Access control:
   * - AGENCY: View students for any teacher
   * - CENTER: View students for teachers in own center
   * - TEACHER: View own students only
   */
  async getTeacherStudentsList(
    teacherId: number,
    currentUser?: User,
  ): Promise<User[]> {
    // Verify access to this teacher
    await this.findOne(teacherId, currentUser);

    // Additional check for TEACHER role
    if (currentUser && currentUser.role === UserRole.TEACHER && currentUser.id !== teacherId) {
      throw new ForbiddenException('You can only view your own students');
    }

    // Get all classes assigned to this teacher
    const classes = await this.classesRepository.find({
      where: { teacherId, isActive: true },
      select: ['id'],
    });

    if (classes.length === 0) {
      return [];
    }

    const classIds = classes.map((c) => c.id);

    // Get all unique students enrolled in these classes
    const enrollments = await this.studentClassRepository
      .createQueryBuilder('sc')
      .leftJoinAndSelect('sc.student', 'student')
      .where('sc.classId IN (:...classIds)', { classIds })
      .getMany();

    // Extract unique students
    const studentMap = new Map<number, User>();
    enrollments.forEach((enrollment) => {
      if (!studentMap.has(enrollment.student.id)) {
        studentMap.set(enrollment.student.id, enrollment.student);
      }
    });

    return Array.from(studentMap.values());
  }
}

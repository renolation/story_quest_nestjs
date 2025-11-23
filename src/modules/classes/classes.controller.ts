import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import {
  CreateClassDto,
  UpdateClassDto,
  ClassResponseDto,
  PaginatedClassesResponseDto,
  EnrollStudentDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';

/**
 * Classes Controller
 *
 * Manages teaching classes and student enrollments.
 *
 * Role-based access:
 * - AGENCY: Full access to all classes
 * - CENTER: CRUD access to own center's classes
 * - TEACHER: Read-only access to assigned classes
 */
@ApiTags('classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  /**
   * Create a new class
   *
   * Roles: AGENCY, CENTER
   */
  @Post()
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({
    status: 201,
    description: 'Class created successfully',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Branch or Grade not found' })
  async create(
    @Body() createClassDto: CreateClassDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.classesService.create(createClassDto, currentUser);
  }

  /**
   * Get all classes with pagination and filtering
   *
   * Roles: AGENCY, CENTER, TEACHER
   */
  @Get()
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all classes with pagination and filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'centerId',
    required: false,
    type: Number,
    description: 'Filter by center ID (AGENCY only)',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: Number,
    description: 'Filter by branch ID',
  })
  @ApiQuery({
    name: 'teacherId',
    required: false,
    type: Number,
    description: 'Filter by teacher ID',
  })
  @ApiQuery({
    name: 'gradeId',
    required: false,
    type: Number,
    description: 'Filter by grade ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by class name',
  })
  @ApiResponse({
    status: 200,
    description: 'Classes retrieved successfully',
    type: PaginatedClassesResponseDto,
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('centerId', new ParseIntPipe({ optional: true })) centerId?: number,
    @Query('branchId', new ParseIntPipe({ optional: true })) branchId?: number,
    @Query('teacherId', new ParseIntPipe({ optional: true }))
    teacherId?: number,
    @Query('gradeId', new ParseIntPipe({ optional: true })) gradeId?: number,
    @Query('search') search?: string,
    @CurrentUser() currentUser?: User,
  ) {
    return await this.classesService.findAll(
      page || 1,
      limit || 20,
      centerId,
      branchId,
      teacherId,
      gradeId,
      search,
      currentUser,
    );
  }

  /**
   * Get a single class by ID
   *
   * Roles: AGENCY, CENTER, TEACHER
   */
  @Get(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiResponse({
    status: 200,
    description: 'Class retrieved successfully',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    return await this.classesService.findOne(id, currentUser);
  }

  /**
   * Update a class
   *
   * Roles: AGENCY, CENTER
   */
  @Patch(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({ summary: 'Update a class' })
  @ApiResponse({
    status: 200,
    description: 'Class updated successfully',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.classesService.update(id, updateClassDto, currentUser);
  }

  /**
   * Delete a class (soft delete)
   *
   * Roles: AGENCY, CENTER
   */
  @Delete(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a class (soft delete)' })
  @ApiResponse({ status: 204, description: 'Class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    await this.classesService.remove(id, currentUser);
  }

  /**
   * Enroll a student in a class
   *
   * Roles: AGENCY, CENTER
   */
  @Post(':id/students')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enroll a student in a class' })
  @ApiResponse({ status: 201, description: 'Student enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request (class full, duplicate enrollment, etc.)' })
  @ApiResponse({ status: 404, description: 'Class or Student not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async enrollStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() enrollStudentDto: EnrollStudentDto,
    @CurrentUser() currentUser: User,
  ) {
    await this.classesService.enrollStudent(id, enrollStudentDto, currentUser);
    return { message: 'Student enrolled successfully' };
  }

  /**
   * Unenroll a student from a class
   *
   * Roles: AGENCY, CENTER
   */
  @Delete(':id/students/:studentId')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unenroll a student from a class' })
  @ApiResponse({ status: 204, description: 'Student unenrolled successfully' })
  @ApiResponse({ status: 404, description: 'Class, Student, or enrollment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async unenrollStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @CurrentUser() currentUser: User,
  ) {
    await this.classesService.unenrollStudent(id, studentId, currentUser);
  }

  /**
   * Get all students in a class
   *
   * Roles: AGENCY, CENTER, TEACHER
   */
  @Get(':id/students')
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all students in a class' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getClassStudents(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    return await this.classesService.getClassStudents(id, currentUser);
  }
}

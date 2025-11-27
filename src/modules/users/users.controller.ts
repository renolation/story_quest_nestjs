import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, UserResponseDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getMyProfile(@CurrentUser() user: any): Promise<UserResponseDto> {
    const userData = await this.usersService.findById(user.id);
    const userWithoutPassword = this.usersService.excludePasswordHash(userData);

    return {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      username: userWithoutPassword.username,
      fullName: userWithoutPassword.fullName,
      role: userWithoutPassword.role,
      avatarUrl: userWithoutPassword.avatarUrl,
      isActive: userWithoutPassword.isActive,
      isSuperAdmin: userWithoutPassword.isSuperAdmin,
      createdAt: userWithoutPassword.createdAt,
      updatedAt: userWithoutPassword.updatedAt,
    };
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Update profile information for the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'Email or username already taken',
  })
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(
      user.id,
      updateProfileDto,
    );
    const userWithoutPassword =
      this.usersService.excludePasswordHash(updatedUser);

    return {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      username: userWithoutPassword.username,
      fullName: userWithoutPassword.fullName,
      role: userWithoutPassword.role,
      avatarUrl: userWithoutPassword.avatarUrl,
      isActive: userWithoutPassword.isActive,
      isSuperAdmin: userWithoutPassword.isSuperAdmin,
      createdAt: userWithoutPassword.createdAt,
      updatedAt: userWithoutPassword.updatedAt,
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'List all users (Admin only)',
    description: 'Get a list of all users with optional filtering',
  })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @Query('role') role?: UserRole,
    @Query('isActive') isActive?: boolean,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.usersService.findAll({
      role,
      isActive,
      page,
      limit,
    });

    return {
      data: result.data.map((user) => {
        const userWithoutPassword = this.usersService.excludePasswordHash(user);
        return {
          id: userWithoutPassword.id,
          email: userWithoutPassword.email,
          username: userWithoutPassword.username,
          fullName: userWithoutPassword.fullName,
          role: userWithoutPassword.role,
          avatarUrl: userWithoutPassword.avatarUrl,
          isActive: userWithoutPassword.isActive,
          isSuperAdmin: userWithoutPassword.isSuperAdmin,
          createdAt: userWithoutPassword.createdAt,
          updatedAt: userWithoutPassword.updatedAt,
        };
      }),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Retrieve a specific user by their ID (Admin and Teacher access)',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    const userWithoutPassword = this.usersService.excludePasswordHash(user);

    return {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      username: userWithoutPassword.username,
      fullName: userWithoutPassword.fullName,
      role: userWithoutPassword.role,
      avatarUrl: userWithoutPassword.avatarUrl,
      isActive: userWithoutPassword.isActive,
      isSuperAdmin: userWithoutPassword.isSuperAdmin,
      createdAt: userWithoutPassword.createdAt,
      updatedAt: userWithoutPassword.updatedAt,
    };
  }
}

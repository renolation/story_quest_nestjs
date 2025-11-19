import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  CreateUserDto,
  AuthResponseDto,
  UserResponseDto,
  ChangePasswordDto,
} from './dto';
import { LocalAuthGuard, RolesGuard } from '../../common/guards';
import { Public, CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email/username and password. Returns JWT access token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: ['password must be at least 6 characters long'],
        error: 'Bad Request',
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Request() req,
  ): Promise<AuthResponseDto> {
    // The user is already validated by LocalAuthGuard and attached to req.user
    return this.authService.login(req.user);
  }

  @Post('users')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER, UserRole.PARENT)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new user (Hierarchical permissions)',
    description: `Create a new user account with role-based hierarchy:
    - AGENCY can create: CENTER, TEACHER, REVIEWER, PARENT
    - CENTER can create: TEACHER, PARENT
    - TEACHER can create: PARENT
    - PARENT can create: STUDENT
    - REVIEWER and STUDENT cannot create users`,
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Email already registered or validation error',
    schema: {
      example: {
        statusCode: 400,
        message: 'Email already registered',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not authenticated',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions for this role',
    schema: {
      example: {
        statusCode: 403,
        message:
          'teacher role cannot create student users. Allowed roles: parent',
        error: 'Forbidden',
      },
    },
  })
  async createUser(
    @CurrentUser() currentUser: any,
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.authService.createUser(currentUser, createUserDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the profile of the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async getCurrentUser(@CurrentUser() user: any): Promise<UserResponseDto> {
    return this.authService.getCurrentUser(user.id);
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change user password',
    description:
      'Allows authenticated users to change their password by providing current password and new password',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      example: {
        success: true,
        message: 'Password changed successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Current password is incorrect or unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Current password is incorrect',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'New password must be at least 6 characters long',
          'Passwords do not match',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.authService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Auth service health check',
    description: 'Check if the authentication service is running',
  })
  @ApiResponse({
    status: 200,
    description: 'Auth service is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-01-15T10:30:00Z',
        service: 'authentication',
      },
    },
  })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'authentication',
    };
  }
}

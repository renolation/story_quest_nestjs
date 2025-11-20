import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '../../common/interfaces';
import {
  RegisterDto,
  CreateUserDto,
  AuthResponseDto,
  UserResponseDto,
} from './dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validate user credentials
   * @param identifier - Email or username
   * @param password - Plain text password
   * @returns User entity without password hash, or null if invalid
   */
  async validateUser(
    identifier: string,
    password: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    this.logger.log(`Validating user: ${identifier}`);

    const user = await this.usersService.findByEmailOrUsername(identifier);

    if (!user) {
      this.logger.warn(`User not found: ${identifier}`);
      return null;
    }

    if (!user.isActive) {
      this.logger.warn(`User is inactive: ${identifier}`);
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${identifier}`);
      return null;
    }

    this.logger.log(`User validated successfully: ${identifier}`);
    return this.usersService.excludePasswordHash(user);
  }

  /**
   * Login user and generate JWT token
   * @param user - User entity
   * @returns Auth response with access token and user info
   */
  async login(user: Omit<User, 'passwordHash'>): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.getTokenExpirySeconds();

    this.logger.log(`User logged in successfully: ${user.email}`);

    return {
      access_token: accessToken,
      user: this.mapUserToResponseDto(user),
      token_type: 'bearer',
      expires_in: expiresIn,
    };
  }

  /**
   * Register a new user
   * @param registerDto - Registration data
   * @returns Auth response with access token and user info
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Registering new user: ${registerDto.email}`);

    // Create user via UsersService
    const user = await this.usersService.create({
      email: registerDto.email,
      username: registerDto.username,
      password: registerDto.password,
      fullName: registerDto.fullName,
      role: registerDto.role || UserRole.STUDENT, // Default to student if not provided
      avatarUrl: registerDto.avatarUrl,
    });

    this.logger.log(`User registered successfully: ${user.email}`);

    // Generate JWT token and return auth response
    const userWithoutPassword = this.usersService.excludePasswordHash(user);
    return this.login(userWithoutPassword);
  }

  /**
   * Validate JWT token
   * @param token - JWT token string
   * @returns Decoded JWT payload
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return payload;
    } catch (error) {
      this.logger.error(`Invalid token: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Get current authenticated user
   * @param userId - User ID from JWT payload
   * @returns User response DTO
   */
  async getCurrentUser(userId: number): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    return this.mapUserToResponseDto(
      this.usersService.excludePasswordHash(user),
    );
  }

  /**
   * Map User entity to UserResponseDto
   * @param user - User entity without password hash
   * @returns UserResponseDto
   */
  private mapUserToResponseDto(
    user: Omit<User, 'passwordHash'>,
  ): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Change user password
   * @param userId - User ID
   * @param currentPassword - Current password for verification
   * @param newPassword - New password to set
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    this.logger.log(`Processing password change request for user: ${userId}`);

    await this.usersService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );

    this.logger.log(`Password changed successfully for user: ${userId}`);
  }

  /**
   * Create a new user (admin-only with role hierarchy)
   * Role hierarchy:
   * - AGENCY can create: CENTER, TEACHER, REVIEWER, PARENT
   * - CENTER can create: TEACHER, PARENT
   * - TEACHER can create: PARENT
   * - PARENT can create: STUDENT
   * - REVIEWER cannot create users
   * - STUDENT cannot create users
   *
   * @param currentUser - The authenticated user creating the new user
   * @param createUserDto - User creation data
   * @returns Created user response DTO
   */
  async createUser(
    currentUser: any,
    createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.log(
      `User ${currentUser.email} (${currentUser.role}) attempting to create user with role: ${createUserDto.role}`,
    );

    // Validate if current user can create the requested role
    this.validateUserCreationPermission(currentUser.role, createUserDto.role);

    // Prevent creating AGENCY role via this endpoint for security
    if (createUserDto.role === UserRole.AGENCY) {
      throw new ForbiddenException(
        'AGENCY role cannot be created via this endpoint for security reasons',
      );
    }

    // Create user via UsersService
    const user = await this.usersService.create({
      email: createUserDto.email,
      username: createUserDto.username,
      password: createUserDto.password,
      fullName: createUserDto.fullName,
      role: createUserDto.role,
      avatarUrl: createUserDto.avatarUrl,
    });

    this.logger.log(
      `User created successfully: ${user.email} with role: ${user.role}`,
    );

    // Return user response (no token for admin-created users)
    return this.mapUserToResponseDto(
      this.usersService.excludePasswordHash(user),
    );
  }

  /**
   * Validate if a user role can create another user role
   * @param creatorRole - Role of the user creating the account
   * @param targetRole - Role being assigned to the new user
   * @throws ForbiddenException if permission denied
   */
  private validateUserCreationPermission(
    creatorRole: UserRole,
    targetRole: UserRole,
  ): void {
    const permissions: Record<UserRole, UserRole[]> = {
      [UserRole.AGENCY]: [
        UserRole.CENTER,
        UserRole.TEACHER,
        UserRole.REVIEWER,
        UserRole.STUDENT,
      ],
      [UserRole.CENTER]: [UserRole.TEACHER, UserRole.STUDENT],
      [UserRole.TEACHER]: [UserRole.STUDENT],
      [UserRole.REVIEWER]: [], // Cannot create users
      [UserRole.STUDENT]: [], // Cannot create users (students self-register)
    };

    const allowedRoles = permissions[creatorRole] || [];

    if (!allowedRoles.includes(targetRole)) {
      throw new ForbiddenException(
        `${creatorRole} role cannot create ${targetRole} users. Allowed roles: ${allowedRoles.join(', ') || 'none'}`,
      );
    }
  }

  /**
   * Get token expiry time in seconds
   * @returns Expiry time in seconds
   */
  private getTokenExpirySeconds(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';

    // Parse time string (e.g., "15m", "1h", "7d")
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // Default 15 minutes
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 900;
    }
  }
}

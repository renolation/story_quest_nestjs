import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '../../common/interfaces';
import { RegisterDto, AuthResponseDto, UserResponseDto } from './dto';
import { User } from '../users/entities/user.entity';

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

    // Check if email already exists
    const existingEmail = await this.usersService.findByEmail(
      registerDto.email,
    );
    if (existingEmail) {
      throw new BadRequestException('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUsername) {
      throw new BadRequestException('Username already taken');
    }

    // Hash password
    const passwordHash = await this.usersService.hashPassword(
      registerDto.password,
    );

    // Create user (Note: In a real implementation, you would have a create method in UsersService)
    // For now, this is a placeholder that shows the intended flow
    // You'll need to implement the actual user creation in UsersService

    this.logger.log(`User registered successfully: ${registerDto.email}`);

    // Return login response
    // const user = ... (created user);
    // return this.login(user);

    throw new BadRequestException(
      'User registration not fully implemented. Please implement user creation in UsersService first.',
    );
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
  async getCurrentUser(userId: string): Promise<UserResponseDto> {
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

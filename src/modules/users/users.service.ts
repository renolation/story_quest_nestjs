import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   * @param createUserDto - User creation data
   * @returns Created user entity
   * @throws ConflictException if email or username already exists
   * @throws InternalServerErrorException if database operation fails
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating new user with email: ${createUserDto.email}`);

    try {
      // Check if email already exists
      const existingEmail = await this.findByEmail(createUserDto.email);
      if (existingEmail) {
        this.logger.warn(
          `Email already registered: ${createUserDto.email}`,
        );
        throw new ConflictException('Email already registered');
      }

      // Check if username already exists
      const existingUsername = await this.findByUsername(
        createUserDto.username,
      );
      if (existingUsername) {
        this.logger.warn(
          `Username already taken: ${createUserDto.username}`,
        );
        throw new ConflictException('Username already taken');
      }

      // Hash password
      const passwordHash = await this.hashPassword(createUserDto.password);

      // Create user entity
      const user = this.usersRepository.create({
        email: createUserDto.email,
        username: createUserDto.username,
        passwordHash,
        fullName: createUserDto.fullName,
        role: createUserDto.role,
        avatarUrl: createUserDto.avatarUrl,
        isActive: true,
      });

      // Save to database
      const savedUser = await this.usersRepository.save(user);

      this.logger.log(`User created successfully: ${savedUser.id}`);

      return savedUser;
    } catch (error) {
      // Handle PostgreSQL unique violation error
      if (error.code === '23505') {
        this.logger.error(
          `Database unique constraint violation: ${error.detail}`,
        );
        throw new ConflictException('Email or username already exists');
      }

      // If it's already a ConflictException, rethrow it
      if (error instanceof ConflictException) {
        throw error;
      }

      // Log and throw internal server error for other cases
      this.logger.error(
        `Failed to create user: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Find user by email
   * @param email - User email
   * @returns User entity or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  /**
   * Find user by username
   * @param username - Username
   * @returns User entity or null
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  /**
   * Find user by email or username
   * @param identifier - Email or username
   * @returns User entity or null
   */
  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: [{ email: identifier }, { username: identifier }],
    });
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User entity
   * @throws NotFoundException if user not found
   */
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Validate user password
   * @param password - Plain text password
   * @param passwordHash - Hashed password from database
   * @returns True if password is valid, false otherwise
   */
  async validatePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  /**
   * Hash password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Remove password hash from user object (for safe responses)
   * @param user - User entity
   * @returns User object without passwordHash
   */
  excludePasswordHash(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Change user password
   * @param userId - User ID
   * @param currentPassword - Current password for verification
   * @param newPassword - New password to set
   * @throws UnauthorizedException if current password is invalid
   * @throws NotFoundException if user not found
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    this.logger.log(`Changing password for user: ${userId}`);

    // Find user
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`User not found: ${userId}`);
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.validatePassword(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      this.logger.warn(
        `Invalid current password for user: ${userId}`,
      );
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);

    // Update password
    await this.usersRepository.update(userId, {
      passwordHash: newPasswordHash,
    });

    this.logger.log(`Password changed successfully for user: ${userId}`);
  }
}

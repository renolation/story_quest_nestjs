import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

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
  async findById(id: string): Promise<User> {
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
}

# Story Quest Implementation Roadmap

## 🎯 Project Overview

**Story Quest** is an English learning platform with a multi-client architecture:
- **NestJS Backend**: Core API (Single Source of Truth)
- **Flutter Mobile App**: Student learning interface (PRIMARY FOCUS)
- **React Web Dashboard**: Admin/teacher control panel (SECONDARY - Build Later)

**Build Strategy**: Step-by-step phased approach, prioritizing NestJS + Flutter first.

---

## 📋 Development Phases Overview

| Phase | Duration | Focus | Key Features | Status |
|-------|----------|-------|--------------|--------|
| **Phase 1** | 2 weeks | Foundation | Auth + Content Browsing | 🔲 Not Started |
| **Phase 2** | 3 weeks | Learning | Interactive Lessons | 🔲 Not Started |
| **Phase 3** | 2 weeks | Audio/Speech | Pronunciation Practice | 🔲 Not Started |
| **Phase 4** | 1 week | Gamification | Rewards & Badges | 🔲 Not Started |
| **Phase 5** | 3 weeks | AI Stories | Personalized Stories | 🔲 Not Started |
| **Phase 6** | 1 week | Polish | Performance & Offline | 🔲 Not Started |
| **TOTAL MVP** | **12 weeks** | **Full Student App** | **Complete Learning Platform** | 🔲 Not Started |
| **Phase 7** | 8 weeks | Web Dashboard | Admin Control Panel | 🔲 Not Started |

---

# PHASE 1: Core Foundation (Weeks 1-2)

## 🎯 Goal
Students can register, log in, and browse learning content (read-only).

---

## 📊 Backend (NestJS) - Phase 1

### 1.1 Database Schema Setup

**Priority: HIGH** | **Duration: 1 day**

#### Tables to Create

```sql
-- Users table (focus on STUDENT role first)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  date_of_birth DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_role CHECK (role IN ('agency', 'center', 'teacher', 'reviewer', 'student'))
);

-- Chapters table
CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  thumbnail_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Units table
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  thumbnail_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Levels table
CREATE TABLE levels (
  id SERIAL PRIMARY KEY,
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  time_limit INTEGER, -- seconds
  passing_score INTEGER DEFAULT 70,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
  question_type VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  audio_url VARCHAR(500),
  image_url VARCHAR(500),
  points INTEGER DEFAULT 10,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_question_type CHECK (
    question_type IN ('fill_in_blank', 'talk_to_speech_compare', 'sort_words', 'select_right_answer')
  )
);

-- Answer Options table
CREATE TABLE answer_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_chapters_order ON chapters(order_index);
CREATE INDEX idx_units_chapter ON units(chapter_id);
CREATE INDEX idx_levels_unit ON levels(unit_id);
CREATE INDEX idx_questions_level ON questions(level_id);
```

#### Migration Command

```bash
# Generate migration
npm run migration:generate -- -n InitialSchema

# Run migration
npm run migration:run
```

**Deliverable**: Database schema ready with all core tables.

---

### 1.2 Authentication Module

**Priority: HIGH** | **Duration: 2 days**

#### Files to Create

```
src/modules/auth/
├── dto/
│   ├── register.dto.ts
│   ├── login.dto.ts
│   └── refresh-token.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── strategies/
│   └── jwt.strategy.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
├── auth.controller.ts
├── auth.service.ts
└── auth.module.ts
```

#### Implementation Steps

**Step 1.2.1: Create DTOs**

```typescript
// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'student@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'student123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn An' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '2015-06-15', required: false })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;
}

// src/modules/auth/dto/login.dto.ts
export class LoginDto {
  @ApiProperty({ example: 'student@example.com' })
  @IsString()
  @IsNotEmpty()
  identifier: string; // email or username

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
```

**Step 1.2.2: Create JWT Strategy**

```typescript
// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;
  email: string;
  username: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
  }
}
```

**Step 1.2.3: Create Auth Service**

```typescript
// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@/modules/users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if email exists
    const existingEmail = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if username exists
    const existingUsername = await this.usersRepository.findOne({
      where: { username: registerDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.usersRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      passwordHash: hashedPassword,
      fullName: registerDto.fullName,
      phone: registerDto.phone,
      dateOfBirth: registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : null,
      role: 'student', // Force student role for mobile registration
    });

    const savedUser = await this.usersRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user by email or username
    const user = await this.usersRepository.findOne({
      where: [
        { email: loginDto.identifier },
        { username: loginDto.identifier },
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getCurrentUser(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitizeUser(user);
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '90d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
```

**Step 1.2.4: Create Auth Controller**

```typescript
// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new student (mobile only)' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login (all roles)' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  getCurrentUser(@CurrentUser() user: any) {
    return this.authService.getCurrentUser(user.id);
  }
}
```

**Deliverable**: Authentication endpoints working (register, login, refresh, me).

---

### 1.3 Content Delivery API (Read-Only)

**Priority: HIGH** | **Duration: 2 days**

#### Modules to Create

```
src/modules/chapters/
src/modules/units/
src/modules/levels/
src/modules/questions/
```

#### Implementation Steps

**Step 1.3.1: Create Chapter Entity**

```typescript
// src/modules/chapters/entities/chapter.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Unit } from '@/modules/units/entities/unit.entity';

@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'order_index', type: 'integer' })
  orderIndex: number;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Unit, (unit) => unit.chapter)
  units: Unit[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**Step 1.3.2: Create Chapters Service**

```typescript
// src/modules/chapters/chapters.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter)
    private chaptersRepository: Repository<Chapter>,
  ) {}

  async findAll() {
    return this.chaptersRepository.find({
      where: { isActive: true },
      order: { orderIndex: 'ASC' },
    });
  }

  async findOne(id: number) {
    const chapter = await this.chaptersRepository.findOne({
      where: { id, isActive: true },
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    return chapter;
  }

  async findUnitsInChapter(chapterId: number) {
    const chapter = await this.chaptersRepository.findOne({
      where: { id: chapterId, isActive: true },
      relations: ['units'],
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${chapterId} not found`);
    }

    return chapter.units.filter(unit => unit.isActive).sort((a, b) => a.orderIndex - b.orderIndex);
  }
}
```

**Step 1.3.3: Create Chapters Controller**

```typescript
// src/modules/chapters/chapters.controller.ts
import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Chapters')
@Controller('chapters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChaptersController {
  constructor(private chaptersService: ChaptersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all chapters' })
  findAll() {
    return this.chaptersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chapter by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.findOne(id);
  }

  @Get(':id/units')
  @ApiOperation({ summary: 'Get units in chapter' })
  findUnits(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.findUnitsInChapter(id);
  }
}
```

**Repeat similar pattern for Units, Levels, Questions modules.**

**Deliverable**: Content API endpoints working (GET chapters, units, levels, questions).

---

## 📱 Flutter (Mobile App) - Phase 1

### 1.4 Flutter Project Setup

**Priority: HIGH** | **Duration: 1 day**

#### Project Initialization

```bash
# Create Flutter project
flutter create story_quest_mobile --org com.storyquest
cd story_quest_mobile

# Add dependencies
flutter pub add flutter_riverpod
flutter pub add riverpod_annotation
flutter pub add hive_ce
flutter pub add hive_ce_flutter
flutter pub add dio
flutter pub add go_router
flutter pub add shared_preferences
flutter pub add freezed_annotation
flutter pub add json_annotation

# Dev dependencies
flutter pub add --dev build_runner
flutter pub add --dev riverpod_generator
flutter pub add --dev freezed
flutter pub add --dev json_serializable
flutter pub add --dev hive_ce_generator
flutter pub add --dev flutter_lints
```

#### Folder Structure

```
lib/
├── app/
│   ├── app.dart
│   ├── router.dart
│   └── providers.dart
├── core/
│   ├── constants/
│   │   ├── app_colors.dart
│   │   └── api_endpoints.dart
│   ├── theme/
│   │   └── app_theme.dart
│   └── utils/
│       └── validators.dart
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   └── datasources/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   └── repositories/
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── login_screen.dart
│   │       │   └── register_screen.dart
│   │       └── providers/
│   │           └── auth_provider.dart
│   └── content/
│       └── (similar structure)
├── shared/
│   └── widgets/
└── main.dart
```

**Deliverable**: Flutter project initialized with clean architecture structure.

---

### 1.5 Authentication UI (Flutter)

**Priority: HIGH** | **Duration: 2 days**

#### Step 1.5.1: Create Auth Models

```dart
// lib/features/auth/data/models/user_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required int id,
    required String email,
    required String username,
    required String fullName,
    required String role,
    String? phone,
    String? avatarUrl,
    DateTime? dateOfBirth,
    required bool isActive,
    required DateTime createdAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
}

@freezed
class LoginResponse with _$LoginResponse {
  const factory LoginResponse({
    required UserModel user,
    required String accessToken,
    required String refreshToken,
  }) = _LoginResponse;

  factory LoginResponse.fromJson(Map<String, dynamic> json) => _$LoginResponseFromJson(json);
}
```

#### Step 1.5.2: Create Auth API Client

```dart
// lib/features/auth/data/datasources/auth_remote_datasource.dart
import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../models/user_model.dart';

part 'auth_remote_datasource.g.dart';

@riverpod
AuthRemoteDataSource authRemoteDataSource(AuthRemoteDataSourceRef ref) {
  return AuthRemoteDataSource(ref.watch(dioProvider));
}

class AuthRemoteDataSource {
  final Dio _dio;

  AuthRemoteDataSource(this._dio);

  Future<LoginResponse> login({
    required String identifier,
    required String password,
  }) async {
    final response = await _dio.post(
      '/auth/login',
      data: {
        'identifier': identifier,
        'password': password,
      },
    );

    return LoginResponse.fromJson(response.data);
  }

  Future<LoginResponse> register({
    required String email,
    required String username,
    required String password,
    required String fullName,
    String? phone,
    String? dateOfBirth,
  }) async {
    final response = await _dio.post(
      '/auth/register',
      data: {
        'email': email,
        'username': username,
        'password': password,
        'fullName': fullName,
        if (phone != null) 'phone': phone,
        if (dateOfBirth != null) 'dateOfBirth': dateOfBirth,
      },
    );

    return LoginResponse.fromJson(response.data);
  }

  Future<UserModel> getCurrentUser() async {
    final response = await _dio.get('/auth/me');
    return UserModel.fromJson(response.data);
  }
}
```

#### Step 1.5.3: Create Auth Provider

```dart
// lib/features/auth/presentation/providers/auth_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/models/user_model.dart';
import '../../../../core/storage/secure_storage.dart';

part 'auth_provider.g.dart';

@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  FutureOr<UserModel?> build() async {
    // Try to load user from storage
    final token = await ref.watch(secureStorageProvider).getAccessToken();
    if (token != null) {
      try {
        return await ref.read(authRemoteDataSourceProvider).getCurrentUser();
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  Future<void> login(String identifier, String password) async {
    state = const AsyncValue.loading();

    state = await AsyncValue.guard(() async {
      final response = await ref.read(authRemoteDataSourceProvider).login(
        identifier: identifier,
        password: password,
      );

      // Save tokens
      await ref.read(secureStorageProvider).saveTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );

      return response.user;
    });
  }

  Future<void> register({
    required String email,
    required String username,
    required String password,
    required String fullName,
    String? phone,
    String? dateOfBirth,
  }) async {
    state = const AsyncValue.loading();

    state = await AsyncValue.guard(() async {
      final response = await ref.read(authRemoteDataSourceProvider).register(
        email: email,
        username: username,
        password: password,
        fullName: fullName,
        phone: phone,
        dateOfBirth: dateOfBirth,
      );

      // Save tokens
      await ref.read(secureStorageProvider).saveTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );

      return response.user;
    });
  }

  Future<void> logout() async {
    await ref.read(secureStorageProvider).clearTokens();
    state = const AsyncValue.data(null);
  }
}
```

#### Step 1.5.4: Create Login Screen

```dart
// lib/features/auth/presentation/screens/login_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      await ref.read(authNotifierProvider.notifier).login(
        _identifierController.text.trim(),
        _passwordController.text,
      );

      // Check for errors
      final authState = ref.read(authNotifierProvider);
      authState.when(
        data: (user) {
          if (user != null) {
            // Navigate to home
            // context.go('/home');
          }
        },
        loading: () {},
        error: (error, stack) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Login failed: $error')),
          );
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo
                  const Icon(
                    Icons.book,
                    size: 100,
                    color: Color(0xFF1EA896),
                  ),
                  const SizedBox(height: 24),

                  // Title
                  const Text(
                    'Story Quest',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1EA896),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Learn English with Stories',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 48),

                  // Email/Username field
                  TextFormField(
                    controller: _identifierController,
                    decoration: const InputDecoration(
                      labelText: 'Email or Username',
                      prefixIcon: Icon(Icons.person),
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email or username';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Password field
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      prefixIcon: const Icon(Icons.lock),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility : Icons.visibility_off,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                      border: const OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your password';
                      }
                      if (value.length < 6) {
                        return 'Password must be at least 6 characters';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),

                  // Login button
                  ElevatedButton(
                    onPressed: authState.isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1EA896),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: authState.isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            'Login',
                            style: TextStyle(fontSize: 16, color: Colors.white),
                          ),
                  ),
                  const SizedBox(height: 16),

                  // Register link
                  TextButton(
                    onPressed: () {
                      // Navigate to register screen
                      // context.go('/register');
                    },
                    child: const Text('Don\'t have an account? Register'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

**Deliverable**: Login and register screens working in Flutter app.

---

### 1.6 Content Browsing UI (Flutter)

**Priority: HIGH** | **Duration: 2 days**

#### Step 1.6.1: Create Content Models

```dart
// lib/features/content/data/models/chapter_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'chapter_model.freezed.dart';
part 'chapter_model.g.dart';

@freezed
class ChapterModel with _$ChapterModel {
  const factory ChapterModel({
    required int id,
    required String title,
    String? description,
    required int orderIndex,
    String? thumbnailUrl,
    required bool isActive,
  }) = _ChapterModel;

  factory ChapterModel.fromJson(Map<String, dynamic> json) => _$ChapterModelFromJson(json);
}

@freezed
class UnitModel with _$UnitModel {
  const factory UnitModel({
    required int id,
    required int chapterId,
    required String title,
    String? description,
    required int orderIndex,
    String? thumbnailUrl,
    required bool isActive,
  }) = _UnitModel;

  factory UnitModel.fromJson(Map<String, dynamic> json) => _$UnitModelFromJson(json);
}
```

#### Step 1.6.2: Create Chapters List Screen

```dart
// lib/features/content/presentation/screens/chapters_list_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/chapters_provider.dart';

class ChaptersListScreen extends ConsumerWidget {
  const ChaptersListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chaptersAsync = ref.watch(chaptersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chapters'),
        backgroundColor: const Color(0xFF1EA896),
      ),
      body: chaptersAsync.when(
        data: (chapters) {
          if (chapters.isEmpty) {
            return const Center(
              child: Text('No chapters available'),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: chapters.length,
            itemBuilder: (context, index) {
              final chapter = chapters[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFF1EA896),
                    child: Text(
                      '${chapter.orderIndex}',
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                  title: Text(
                    chapter.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  subtitle: chapter.description != null
                      ? Text(chapter.description!)
                      : null,
                  trailing: const Icon(Icons.arrow_forward_ios),
                  onTap: () {
                    // Navigate to units screen
                    // context.go('/chapters/${chapter.id}/units');
                  },
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Text('Error: $error'),
        ),
      ),
    );
  }
}
```

**Deliverable**: Students can browse chapters, units, and levels in the Flutter app.

---

## 🎯 Phase 1 Deliverables Checklist

### Backend (NestJS)
- [ ] Database schema created and migrated
- [ ] User entity with STUDENT role
- [ ] Chapter, Unit, Level, Question entities
- [ ] Auth module (register, login, refresh, me)
- [ ] JWT authentication working
- [ ] Chapters API (GET all, GET by ID)
- [ ] Units API (GET by chapter)
- [ ] Levels API (GET by unit)
- [ ] Questions API (GET by level)
- [ ] Swagger documentation

### Flutter
- [ ] Project initialized with clean architecture
- [ ] Riverpod state management setup
- [ ] Dio HTTP client configured
- [ ] Login screen
- [ ] Register screen
- [ ] Token storage (secure)
- [ ] Chapters list screen
- [ ] Units list screen
- [ ] Levels list screen
- [ ] Question viewer (basic)

### Testing
- [ ] Backend: Auth endpoints tested with Postman/Insomnia
- [ ] Flutter: Login flow tested on emulator
- [ ] Flutter: Content browsing tested on real device

---

# PHASE 2: Core Learning Experience (Weeks 3-5)

## 🎯 Goal
Students can complete levels, answer questions interactively, and track their progress.

---

## 📊 Backend (NestJS) - Phase 2

### 2.1 Progress Tracking Database Schema

**Priority: HIGH** | **Duration: 1 day**

#### Tables to Create

```sql
-- Student Level Attempts table
CREATE TABLE student_level_attempts (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  max_score INTEGER NOT NULL,
  time_spent INTEGER, -- seconds
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_score CHECK (score >= 0 AND score <= max_score)
);

-- Student Question Answers table
CREATE TABLE student_question_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER REFERENCES student_level_attempts(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  student_answer TEXT,
  is_correct BOOLEAN DEFAULT false,
  points_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Unit Progress table
CREATE TABLE student_unit_progress (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
  completed_levels INTEGER DEFAULT 0,
  total_levels INTEGER NOT NULL,
  average_score DECIMAL(5,2) DEFAULT 0,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, unit_id)
);

-- Student Chapter Progress table
CREATE TABLE student_chapter_progress (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  completed_units INTEGER DEFAULT 0,
  total_units INTEGER NOT NULL,
  average_score DECIMAL(5,2) DEFAULT 0,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, chapter_id)
);

-- Indexes
CREATE INDEX idx_attempts_student ON student_level_attempts(student_id);
CREATE INDEX idx_attempts_level ON student_level_attempts(level_id);
CREATE INDEX idx_answers_attempt ON student_question_answers(attempt_id);
CREATE INDEX idx_unit_progress_student ON student_unit_progress(student_id);
CREATE INDEX idx_chapter_progress_student ON student_chapter_progress(student_id);
```

**Deliverable**: Progress tracking tables created.

---

### 2.2 Progress Tracking API

**Priority: HIGH** | **Duration: 3 days**

#### Files to Create

```
src/modules/progress/
├── dto/
│   ├── start-level.dto.ts
│   ├── submit-answer.dto.ts
│   └── complete-level.dto.ts
├── entities/
│   ├── student-level-attempt.entity.ts
│   ├── student-question-answer.entity.ts
│   ├── student-unit-progress.entity.ts
│   └── student-chapter-progress.entity.ts
├── progress.controller.ts
├── progress.service.ts
└── progress.module.ts
```

#### Implementation Steps

**Step 2.2.1: Create Progress Entities**

```typescript
// src/modules/progress/entities/student-level-attempt.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Level } from '@/modules/levels/entities/level.entity';
import { StudentQuestionAnswer } from './student-question-answer.entity';

@Entity('student_level_attempts')
export class StudentLevelAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id', type: 'integer' })
  studentId: number;

  @ManyToOne(() => User)
  student: User;

  @Column({ name: 'level_id', type: 'integer' })
  levelId: number;

  @ManyToOne(() => Level)
  level: Level;

  @Column({ type: 'integer', default: 0 })
  score: number;

  @Column({ name: 'max_score', type: 'integer' })
  maxScore: number;

  @Column({ name: 'time_spent', type: 'integer', nullable: true })
  timeSpent: number; // seconds

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @OneToMany(() => StudentQuestionAnswer, (answer) => answer.attempt)
  answers: StudentQuestionAnswer[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

**Step 2.2.2: Create Progress Service**

```typescript
// src/modules/progress/progress.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentLevelAttempt } from './entities/student-level-attempt.entity';
import { StudentQuestionAnswer } from './entities/student-question-answer.entity';
import { StudentUnitProgress } from './entities/student-unit-progress.entity';
import { StudentChapterProgress } from './entities/student-chapter-progress.entity';
import { Level } from '@/modules/levels/entities/level.entity';
import { Question } from '@/modules/questions/entities/question.entity';
import { AnswerOption } from '@/modules/questions/entities/answer-option.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(StudentLevelAttempt)
    private attemptsRepository: Repository<StudentLevelAttempt>,
    @InjectRepository(StudentQuestionAnswer)
    private answersRepository: Repository<StudentQuestionAnswer>,
    @InjectRepository(StudentUnitProgress)
    private unitProgressRepository: Repository<StudentUnitProgress>,
    @InjectRepository(StudentChapterProgress)
    private chapterProgressRepository: Repository<StudentChapterProgress>,
    @InjectRepository(Level)
    private levelsRepository: Repository<Level>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(AnswerOption)
    private answerOptionsRepository: Repository<AnswerOption>,
  ) {}

  async startLevel(studentId: number, levelId: number) {
    // Verify level exists
    const level = await this.levelsRepository.findOne({
      where: { id: levelId },
      relations: ['questions'],
    });

    if (!level) {
      throw new NotFoundException(`Level with ID ${levelId} not found`);
    }

    // Calculate max score
    const maxScore = level.questions.reduce((sum, q) => sum + q.points, 0);

    // Create new attempt
    const attempt = this.attemptsRepository.create({
      studentId,
      levelId,
      score: 0,
      maxScore,
    });

    const savedAttempt = await this.attemptsRepository.save(attempt);

    return {
      attemptId: savedAttempt.id,
      levelId: level.id,
      maxScore,
      questions: level.questions.map(q => ({
        id: q.id,
        questionType: q.questionType,
        questionText: q.questionText,
        audioUrl: q.audioUrl,
        imageUrl: q.imageUrl,
        points: q.points,
      })),
    };
  }

  async submitAnswer(
    studentId: number,
    attemptId: number,
    questionId: number,
    answer: string,
  ) {
    // Verify attempt belongs to student
    const attempt = await this.attemptsRepository.findOne({
      where: { id: attemptId, studentId },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Level already completed');
    }

    // Get question with correct answers
    const question = await this.questionsRepository.findOne({
      where: { id: questionId },
      relations: ['answerOptions'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Check if answer is correct
    let isCorrect = false;
    let pointsEarned = 0;

    if (question.questionType === 'select_right_answer') {
      const correctOption = question.answerOptions.find(opt => opt.isCorrect);
      isCorrect = correctOption?.optionText.toLowerCase() === answer.toLowerCase();
    } else if (question.questionType === 'fill_in_blank') {
      const correctAnswers = question.answerOptions
        .filter(opt => opt.isCorrect)
        .map(opt => opt.optionText.toLowerCase());
      isCorrect = correctAnswers.includes(answer.toLowerCase());
    }
    // Add more question type validations as needed

    if (isCorrect) {
      pointsEarned = question.points;
    }

    // Save answer
    const studentAnswer = this.answersRepository.create({
      attemptId,
      questionId,
      studentAnswer: answer,
      isCorrect,
      pointsEarned,
    });

    await this.answersRepository.save(studentAnswer);

    return {
      questionId,
      isCorrect,
      pointsEarned,
      correctAnswer: isCorrect ? null : question.answerOptions.find(opt => opt.isCorrect)?.optionText,
    };
  }

  async completeLevel(studentId: number, attemptId: number, timeSpent: number) {
    // Get attempt with answers
    const attempt = await this.attemptsRepository.findOne({
      where: { id: attemptId, studentId },
      relations: ['answers', 'level', 'level.unit', 'level.unit.chapter'],
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Level already completed');
    }

    // Calculate final score
    const totalScore = attempt.answers.reduce((sum, ans) => sum + ans.pointsEarned, 0);
    const percentage = (totalScore / attempt.maxScore) * 100;

    // Update attempt
    attempt.score = totalScore;
    attempt.timeSpent = timeSpent;
    attempt.completedAt = new Date();

    await this.attemptsRepository.save(attempt);

    // Update unit progress
    await this.updateUnitProgress(studentId, attempt.level.unitId);

    // Update chapter progress
    await this.updateChapterProgress(studentId, attempt.level.unit.chapterId);

    return {
      attemptId: attempt.id,
      score: totalScore,
      maxScore: attempt.maxScore,
      percentage: Math.round(percentage),
      timeSpent,
      passed: percentage >= attempt.level.passingScore,
    };
  }

  async getStudentProgress(studentId: number) {
    const chapterProgress = await this.chapterProgressRepository.find({
      where: { studentId },
      relations: ['chapter'],
      order: { chapter: { orderIndex: 'ASC' } },
    });

    const totalLevelsCompleted = chapterProgress.reduce(
      (sum, cp) => sum + cp.completedUnits,
      0,
    );

    const overallAverage =
      chapterProgress.length > 0
        ? chapterProgress.reduce((sum, cp) => sum + cp.averageScore, 0) / chapterProgress.length
        : 0;

    return {
      totalLevelsCompleted,
      overallAverageScore: Math.round(overallAverage),
      chapters: chapterProgress.map(cp => ({
        chapterId: cp.chapterId,
        chapterTitle: cp.chapter.title,
        completedUnits: cp.completedUnits,
        totalUnits: cp.totalUnits,
        averageScore: Math.round(cp.averageScore),
        progress: Math.round((cp.completedUnits / cp.totalUnits) * 100),
      })),
    };
  }

  private async updateUnitProgress(studentId: number, unitId: number) {
    // Implementation for updating unit progress
    // Calculate completed levels, average score, etc.
  }

  private async updateChapterProgress(studentId: number, chapterId: number) {
    // Implementation for updating chapter progress
    // Calculate completed units, average score, etc.
  }
}
```

**Step 2.2.3: Create Progress Controller**

```typescript
// src/modules/progress/progress.controller.ts
import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post('levels/:id/start')
  @Roles('student')
  @ApiOperation({ summary: 'Start a level attempt' })
  startLevel(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) levelId: number,
  ) {
    return this.progressService.startLevel(user.id, levelId);
  }

  @Post('questions/:id/answer')
  @Roles('student')
  @ApiOperation({ summary: 'Submit answer for a question' })
  submitAnswer(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) questionId: number,
    @Body('attemptId') attemptId: number,
    @Body('answer') answer: string,
  ) {
    return this.progressService.submitAnswer(user.id, attemptId, questionId, answer);
  }

  @Post('levels/:id/complete')
  @Roles('student')
  @ApiOperation({ summary: 'Complete a level attempt' })
  completeLevel(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) levelId: number,
    @Body('attemptId') attemptId: number,
    @Body('timeSpent') timeSpent: number,
  ) {
    return this.progressService.completeLevel(user.id, attemptId, timeSpent);
  }

  @Get('me')
  @Roles('student')
  @ApiOperation({ summary: 'Get my progress' })
  getMyProgress(@CurrentUser() user: any) {
    return this.progressService.getStudentProgress(user.id);
  }
}
```

**Deliverable**: Progress tracking API endpoints working (start, answer, complete, get progress).

---

## 📱 Flutter (Mobile App) - Phase 2

### 2.3 Interactive Question Types

**Priority: HIGH** | **Duration: 4 days**

#### Step 2.3.1: Create Question Widgets

```dart
// lib/features/lessons/presentation/widgets/fill_in_blank_widget.dart
import 'package:flutter/material.dart';

class FillInBlankWidget extends StatefulWidget {
  final String questionText;
  final Function(String) onAnswerSubmitted;

  const FillInBlankWidget({
    super.key,
    required this.questionText,
    required this.onAnswerSubmitted,
  });

  @override
  State<FillInBlankWidget> createState() => _FillInBlankWidgetState();
}

class _FillInBlankWidgetState extends State<FillInBlankWidget> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Question text
        Text(
          widget.questionText,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),

        // Input field
        TextField(
          controller: _controller,
          decoration: const InputDecoration(
            hintText: 'Type your answer here...',
            border: OutlineInputBorder(),
          ),
          style: const TextStyle(fontSize: 18),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),

        // Submit button
        ElevatedButton(
          onPressed: () {
            if (_controller.text.isNotEmpty) {
              widget.onAnswerSubmitted(_controller.text);
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1EA896),
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
          child: const Text(
            'Submit',
            style: TextStyle(fontSize: 18, color: Colors.white),
          ),
        ),
      ],
    );
  }
}
```

```dart
// lib/features/lessons/presentation/widgets/select_answer_widget.dart
import 'package:flutter/material.dart';

class SelectAnswerWidget extends StatefulWidget {
  final String questionText;
  final List<String> options;
  final Function(String) onAnswerSelected;

  const SelectAnswerWidget({
    super.key,
    required this.questionText,
    required this.options,
    required this.onAnswerSelected,
  });

  @override
  State<SelectAnswerWidget> createState() => _SelectAnswerWidgetState();
}

class _SelectAnswerWidgetState extends State<SelectAnswerWidget> {
  String? _selectedAnswer;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Question text
        Text(
          widget.questionText,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),

        // Options
        ...widget.options.map((option) {
          final isSelected = _selectedAnswer == option;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              onTap: () {
                setState(() {
                  _selectedAnswer = option;
                });
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: isSelected ? const Color(0xFF1EA896) : Colors.grey,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(8),
                  color: isSelected ? const Color(0xFF1EA896).withOpacity(0.1) : null,
                ),
                child: Text(
                  option,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? const Color(0xFF1EA896) : Colors.black,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          );
        }).toList(),
        const SizedBox(height: 24),

        // Submit button
        ElevatedButton(
          onPressed: _selectedAnswer != null
              ? () => widget.onAnswerSelected(_selectedAnswer!)
              : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1EA896),
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
          child: const Text(
            'Submit',
            style: TextStyle(fontSize: 18, color: Colors.white),
          ),
        ),
      ],
    );
  }
}
```

**Deliverable**: Interactive question types (fill-in-blank, select answer, sort words).

---

### 2.4 Level Completion Flow

**Priority: HIGH** | **Duration: 3 days**

#### Step 2.4.1: Create Level Screen

```dart
// lib/features/lessons/presentation/screens/level_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/level_provider.dart';
import '../widgets/fill_in_blank_widget.dart';
import '../widgets/select_answer_widget.dart';

class LevelScreen extends ConsumerStatefulWidget {
  final int levelId;

  const LevelScreen({super.key, required this.levelId});

  @override
  ConsumerState<LevelScreen> createState() => _LevelScreenState();
}

class _LevelScreenState extends ConsumerState<LevelScreen> {
  int _currentQuestionIndex = 0;
  int _attemptId = 0;
  DateTime? _startTime;

  @override
  void initState() {
    super.initState();
    _startLevel();
  }

  Future<void> _startLevel() async {
    _startTime = DateTime.now();
    final result = await ref.read(levelNotifierProvider(widget.levelId).notifier).startLevel();
    if (result != null) {
      setState(() {
        _attemptId = result.attemptId;
      });
    }
  }

  Future<void> _submitAnswer(String answer) async {
    final levelState = ref.read(levelNotifierProvider(widget.levelId));

    levelState.when(
      data: (levelData) async {
        if (_currentQuestionIndex < levelData.questions.length) {
          final question = levelData.questions[_currentQuestionIndex];

          final result = await ref
              .read(levelNotifierProvider(widget.levelId).notifier)
              .submitAnswer(_attemptId, question.id, answer);

          // Show feedback
          _showAnswerFeedback(result.isCorrect, result.correctAnswer);

          // Move to next question after delay
          await Future.delayed(const Duration(seconds: 2));

          if (_currentQuestionIndex < levelData.questions.length - 1) {
            setState(() {
              _currentQuestionIndex++;
            });
          } else {
            // Complete level
            _completeLevel();
          }
        }
      },
      loading: () {},
      error: (_, __) {},
    );
  }

  Future<void> _completeLevel() async {
    final timeSpent = DateTime.now().difference(_startTime!).inSeconds;

    final result = await ref
        .read(levelNotifierProvider(widget.levelId).notifier)
        .completeLevel(_attemptId, timeSpent);

    if (result != null) {
      // Show results screen
      _showResultsDialog(result);
    }
  }

  void _showAnswerFeedback(bool isCorrect, String? correctAnswer) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text(
          isCorrect ? '✅ Correct!' : '❌ Incorrect',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: isCorrect ? Colors.green : Colors.red,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: !isCorrect && correctAnswer != null
            ? Text(
                'Correct answer: $correctAnswer',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16),
              )
            : null,
      ),
    );

    // Auto-dismiss after 2 seconds
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        Navigator.of(context).pop();
      }
    });
  }

  void _showResultsDialog(Map<String, dynamic> result) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text(
          result['passed'] ? '🎉 Level Completed!' : '😢 Try Again',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 24),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Score: ${result['score']} / ${result['maxScore']}',
              style: const TextStyle(fontSize: 20),
            ),
            const SizedBox(height: 8),
            Text(
              '${result['percentage']}%',
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1EA896),
              ),
            ),
            const SizedBox(height: 16),
            LinearProgressIndicator(
              value: result['percentage'] / 100,
              backgroundColor: Colors.grey[300],
              color: const Color(0xFF1EA896),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop(); // Return to levels list
            },
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final levelAsync = ref.watch(levelNotifierProvider(widget.levelId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Level'),
        backgroundColor: const Color(0xFF1EA896),
      ),
      body: levelAsync.when(
        data: (levelData) {
          if (levelData.questions.isEmpty) {
            return const Center(child: Text('No questions available'));
          }

          final question = levelData.questions[_currentQuestionIndex];

          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  // Progress indicator
                  LinearProgressIndicator(
                    value: (_currentQuestionIndex + 1) / levelData.questions.length,
                    backgroundColor: Colors.grey[300],
                    color: const Color(0xFF1EA896),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Question ${_currentQuestionIndex + 1} of ${levelData.questions.length}',
                    style: const TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                  const SizedBox(height: 32),

                  // Question widget based on type
                  Expanded(
                    child: _buildQuestionWidget(question),
                  ),
                ],
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
      ),
    );
  }

  Widget _buildQuestionWidget(dynamic question) {
    switch (question.questionType) {
      case 'fill_in_blank':
        return FillInBlankWidget(
          questionText: question.questionText,
          onAnswerSubmitted: _submitAnswer,
        );
      case 'select_right_answer':
        return SelectAnswerWidget(
          questionText: question.questionText,
          options: question.options ?? [],
          onAnswerSelected: _submitAnswer,
        );
      default:
        return Text('Question type ${question.questionType} not supported yet');
    }
  }
}
```

**Deliverable**: Students can complete full level flow with questions and see results.

---

### 2.5 Progress Dashboard

**Priority: MEDIUM** | **Duration: 2 days**

```dart
// lib/features/progress/presentation/screens/progress_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/progress_provider.dart';

class ProgressScreen extends ConsumerWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progressAsync = ref.watch(studentProgressProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Progress'),
        backgroundColor: const Color(0xFF1EA896),
      ),
      body: progressAsync.when(
        data: (progress) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Overall stats card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatItem(
                              icon: Icons.check_circle,
                              label: 'Completed',
                              value: '${progress.totalLevelsCompleted}',
                              color: Colors.green,
                            ),
                            _buildStatItem(
                              icon: Icons.star,
                              label: 'Average',
                              value: '${progress.overallAverageScore}%',
                              color: const Color(0xFFFFD700),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Chapter progress
                const Text(
                  'Chapter Progress',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),

                ...progress.chapters.map((chapter) {
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            chapter.chapterTitle,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: LinearProgressIndicator(
                                  value: chapter.progress / 100,
                                  backgroundColor: Colors.grey[300],
                                  color: const Color(0xFF1EA896),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text('${chapter.progress}%'),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${chapter.completedUnits} / ${chapter.totalUnits} units completed',
                            style: const TextStyle(color: Colors.grey),
                          ),
                          Text(
                            'Average score: ${chapter.averageScore}%',
                            style: const TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      children: [
        Icon(icon, size: 48, color: color),
        const SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.grey),
        ),
      ],
    );
  }
}
```

**Deliverable**: Progress dashboard showing completed levels and scores.

---

## 🎯 Phase 2 Deliverables Checklist

### Backend (NestJS)
- [ ] Progress tracking tables created
- [ ] POST /progress/levels/:id/start
- [ ] POST /progress/questions/:id/answer
- [ ] POST /progress/levels/:id/complete
- [ ] GET /progress/me
- [ ] Answer validation logic
- [ ] Score calculation
- [ ] Unit progress updates
- [ ] Chapter progress updates

### Flutter
- [ ] Fill-in-blank widget
- [ ] Select answer widget
- [ ] Sort words widget (optional)
- [ ] Level screen with question flow
- [ ] Answer feedback UI
- [ ] Level completion screen
- [ ] Progress dashboard
- [ ] Offline progress queue

### Testing
- [ ] Backend: Progress flow tested
- [ ] Flutter: Complete level on device
- [ ] Flutter: Progress syncs correctly

---

# PHASE 3: Audio & Pronunciation (Weeks 6-7)

> **⚠️ ARCHITECTURE UPDATE (2025-11-21):**
> Speech/pronunciation is now handled **client-side** in the mobile app.
> Backend provides reference text only. No server-side TTS/Speech Recognition needed.

## 🎯 Goal
Students can practice pronunciation using client-side speech-to-text comparison.

*(Continue with detailed Phase 3 implementation...)*

---

# PHASE 4-6: Detailed in Similar Format

*(Gamification, AI Stories, Polish - detailed implementation steps...)*

---

# PHASE 7: Web Dashboard (Weeks 13-20)

## 🎯 Goal
Build multi-role admin/teacher control panel (LATER PRIORITY).

*(Detailed React Web Dashboard implementation...)*

---

## 📞 Next Steps

1. **Review this roadmap** and adjust priorities
2. **Start Phase 1** when ready
3. **Track progress** using the checklists
4. **Iterate and refine** based on testing

Would you like me to:
- Expand any specific phase with more detail?
- Create separate implementation files for each phase?
- Add deployment instructions?
- Create testing guides?

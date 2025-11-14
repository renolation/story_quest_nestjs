# Web Dashboard Implementation Guide

This document shows how to implement the Web Dashboard features following the **EXACT patterns** used in the existing Story Quest NestJS codebase.

---

## 🎯 Current Codebase Patterns

### Pattern 1: Entity Structure
```typescript
// Example: src/modules/units/entities/unit.entity.ts
@Entity('table_name')
export class EntityName {
  @PrimaryGeneratedColumn()
  id: number;  // INTEGER auto-increment

  @Column({ name: 'foreign_key_id' })
  foreignKeyId: number;  // camelCase in code

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'snake_case_column', default: true })
  snakeCaseColumn: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ParentEntity, (parent) => parent.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'foreign_key_id' })
  parent: ParentEntity;

  @OneToMany(() => ChildEntity, (child) => child.parent)
  children: ChildEntity[];
}
```

### Pattern 2: DTO Structure
```typescript
// Create DTO
export class CreateEntityDto {
  @IsInt()
  @ApiProperty({ example: 1 })
  foreignKeyId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ example: 'Example Title' })
  title: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: true })
  isActive?: boolean;
}

// Update DTO
export class UpdateEntityDto extends PartialType(CreateEntityDto) {}

// Response DTO
export class EntityResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  foreignKeyId: number;

  @ApiProperty({ example: 'Title' })
  title: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

### Pattern 3: Service Structure
```typescript
@Injectable()
export class EntitiesService {
  constructor(
    @InjectRepository(Entity)
    private readonly entityRepository: Repository<Entity>,
  ) {}

  async findAll(userId: number): Promise<EntityResponseDto[]> {
    const entities = await this.entityRepository.find({
      where: { isActive: true },
      order: { orderIndex: 'ASC' },
    });
    return entities;
  }

  async findOne(id: number): Promise<EntityResponseDto> {
    const entity = await this.entityRepository.findOne({
      where: { id },
    });
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async create(createDto: CreateEntityDto): Promise<EntityResponseDto> {
    const entity = this.entityRepository.create(createDto);
    return await this.entityRepository.save(entity);
  }

  async update(id: number, updateDto: UpdateEntityDto): Promise<EntityResponseDto> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return await this.entityRepository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.entityRepository.remove(entity);
  }
}
```

### Pattern 4: Controller Structure
```typescript
@ApiTags('Entities')
@ApiBearerAuth()
@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  @ApiResponse({ status: 200, type: [EntityResponseDto] })
  findAll(@CurrentUser() user: any): Promise<EntityResponseDto[]> {
    return this.entitiesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiResponse({ status: 200, type: EntityResponseDto })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EntityResponseDto> {
    return this.entitiesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create entity' })
  @ApiResponse({ status: 201, type: EntityResponseDto })
  create(@Body() createDto: CreateEntityDto): Promise<EntityResponseDto> {
    return this.entitiesService.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update entity' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEntityDto,
  ): Promise<EntityResponseDto> {
    return this.entitiesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete entity' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.entitiesService.remove(id);
  }
}
```

### Pattern 5: Module Structure
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [EntitiesController],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
```

---

## 📁 Implementation: Centers Module

### Step 1: Create Entity

**File:** `src/modules/centers/entities/center.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Agency } from '../../agencies/entities/agency.entity';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('centers')
export class Center {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'agency_id', nullable: true })
  agencyId: number;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl: string;

  @Column({ name: 'business_license', length: 255, nullable: true })
  businessLicense: string;

  @Column({ length: 50, default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Agency, (agency) => agency.centers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'agency_id' })
  agency: Agency;

  @OneToMany(() => Branch, (branch) => branch.center)
  branches: Branch[];
}
```

### Step 2: Create DTOs

**File:** `src/modules/centers/dto/create-center.dto.ts`

```typescript
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCenterDto {
  @IsInt()
  @IsOptional()
  @ApiProperty({ required: false, example: 1 })
  agencyId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ example: 'ABC English Center' })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'center@example.com' })
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @ApiProperty({ required: false, example: '+84123456789' })
  phone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @ApiProperty({ required: false })
  logoUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @ApiProperty({ required: false })
  businessLicense?: string;
}
```

**File:** `src/modules/centers/dto/update-center.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateCenterDto } from './create-center.dto';

export class UpdateCenterDto extends PartialType(CreateCenterDto) {}
```

**File:** `src/modules/centers/dto/center-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CenterResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1, nullable: true })
  agencyId: number;

  @ApiProperty({ example: 'ABC English Center' })
  name: string;

  @ApiProperty({ example: 'center@example.com' })
  email: string;

  @ApiProperty({ example: '+84123456789', nullable: true })
  phone: string;

  @ApiProperty({ nullable: true })
  address: string;

  @ApiProperty({ nullable: true })
  logoUrl: string;

  @ApiProperty({ nullable: true })
  businessLicense: string;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

**File:** `src/modules/centers/dto/index.ts`

```typescript
export * from './create-center.dto';
export * from './update-center.dto';
export * from './center-response.dto';
```

### Step 3: Create Service

**File:** `src/modules/centers/centers.service.ts`

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Center } from './entities/center.entity';
import {
  CreateCenterDto,
  UpdateCenterDto,
  CenterResponseDto,
} from './dto';

@Injectable()
export class CentersService {
  constructor(
    @InjectRepository(Center)
    private readonly centersRepository: Repository<Center>,
  ) {}

  async findAll(): Promise<CenterResponseDto[]> {
    const centers = await this.centersRepository.find({
      order: { createdAt: 'DESC' },
    });
    return centers;
  }

  async findOne(id: number): Promise<CenterResponseDto> {
    const center = await this.centersRepository.findOne({
      where: { id },
    });

    if (!center) {
      throw new NotFoundException(`Center with ID ${id} not found`);
    }

    return center;
  }

  async findByEmail(email: string): Promise<Center | null> {
    return await this.centersRepository.findOne({
      where: { email },
    });
  }

  async create(createCenterDto: CreateCenterDto): Promise<CenterResponseDto> {
    // Check if email already exists
    const existingCenter = await this.findByEmail(createCenterDto.email);
    if (existingCenter) {
      throw new ConflictException('Email already registered');
    }

    const center = this.centersRepository.create(createCenterDto);
    return await this.centersRepository.save(center);
  }

  async update(
    id: number,
    updateCenterDto: UpdateCenterDto,
  ): Promise<CenterResponseDto> {
    const center = await this.findOne(id);

    // If email is being updated, check uniqueness
    if (updateCenterDto.email && updateCenterDto.email !== center.email) {
      const existingCenter = await this.findByEmail(updateCenterDto.email);
      if (existingCenter) {
        throw new ConflictException('Email already registered');
      }
    }

    Object.assign(center, updateCenterDto);
    return await this.centersRepository.save(center);
  }

  async remove(id: number): Promise<void> {
    const center = await this.findOne(id);
    await this.centersRepository.remove(center);
  }

  async suspend(id: number, reason: string): Promise<CenterResponseDto> {
    const center = await this.findOne(id);
    center.status = 'suspended';
    return await this.centersRepository.save(center);
  }

  async activate(id: number): Promise<CenterResponseDto> {
    const center = await this.findOne(id);
    center.status = 'active';
    return await this.centersRepository.save(center);
  }
}
```

### Step 4: Create Controller

**File:** `src/modules/centers/centers.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CentersService } from './centers.service';
import {
  CreateCenterDto,
  UpdateCenterDto,
  CenterResponseDto,
} from './dto';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Centers')
@ApiBearerAuth()
@Controller('centers')
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all centers' })
  @ApiResponse({
    status: 200,
    description: 'Centers retrieved successfully',
    type: [CenterResponseDto],
  })
  findAll(): Promise<CenterResponseDto[]> {
    return this.centersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get center by ID' })
  @ApiResponse({
    status: 200,
    description: 'Center retrieved successfully',
    type: CenterResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Center not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CenterResponseDto> {
    return this.centersService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new center (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Center created successfully',
    type: CenterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() createCenterDto: CreateCenterDto): Promise<CenterResponseDto> {
    return this.centersService.create(createCenterDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update center (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Center updated successfully',
    type: CenterResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Center not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCenterDto: UpdateCenterDto,
  ): Promise<CenterResponseDto> {
    return this.centersService.update(id, updateCenterDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete center (Admin only)' })
  @ApiResponse({ status: 204, description: 'Center deleted successfully' })
  @ApiResponse({ status: 404, description: 'Center not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.centersService.remove(id);
  }

  @Patch(':id/suspend')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Suspend center (Admin only)' })
  suspend(@Param('id', ParseIntPipe) id: number): Promise<CenterResponseDto> {
    return this.centersService.suspend(id, 'Suspended by admin');
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate center (Admin only)' })
  activate(@Param('id', ParseIntPipe) id: number): Promise<CenterResponseDto> {
    return this.centersService.activate(id);
  }
}
```

### Step 5: Create Module

**File:** `src/modules/centers/centers.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentersService } from './centers.service';
import { CentersController } from './centers.controller';
import { Center } from './entities/center.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Center])],
  controllers: [CentersController],
  providers: [CentersService],
  exports: [CentersService],
})
export class CentersModule {}
```

### Step 6: Add to App Module

**File:** `src/app.module.ts` (update)

```typescript
import { CentersModule } from './modules/centers/centers.module';

@Module({
  imports: [
    // ... existing imports
    CentersModule, // Add this
  ],
  // ...
})
export class AppModule {}
```

### Step 7: Create Migration

```bash
npm run migration:generate -- -n CreateCentersTable
```

**File:** `src/database/migrations/XXXXXX-CreateCentersTable.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCentersTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE centers (
        id SERIAL PRIMARY KEY,
        agency_id INT REFERENCES agencies(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        logo_url VARCHAR(500),
        business_license VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_centers_agency ON centers(agency_id);
      CREATE INDEX idx_centers_email ON centers(email);
      CREATE INDEX idx_centers_status ON centers(status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE centers`);
  }
}
```

---

## 📋 Implementation Checklist for New Modules

For each new entity (Branch, Class, Grade, etc.), follow these steps:

### ✅ Step-by-Step Checklist

- [ ] **1. Create Entity** (`entities/entity-name.entity.ts`)
  - [ ] Use `@PrimaryGeneratedColumn()` for `id: number`
  - [ ] Use `@Column({ name: 'snake_case' })` for columns
  - [ ] Use camelCase for properties
  - [ ] Add `@CreateDateColumn` and `@UpdateDateColumn`
  - [ ] Add `@ManyToOne` and `@OneToMany` relationships
  - [ ] Add `@JoinColumn({ name: 'foreign_key_id' })`

- [ ] **2. Create DTOs** (`dto/`)
  - [ ] `create-entity.dto.ts` with validation decorators
  - [ ] `update-entity.dto.ts` extending `PartialType`
  - [ ] `entity-response.dto.ts` with `@ApiProperty`
  - [ ] `index.ts` to export all DTOs

- [ ] **3. Create Service** (`entity.service.ts`)
  - [ ] Inject repository: `@InjectRepository(Entity)`
  - [ ] Implement: `findAll()`, `findOne()`, `create()`, `update()`, `remove()`
  - [ ] Add proper error handling (NotFoundException, ConflictException)
  - [ ] Add business logic methods as needed

- [ ] **4. Create Controller** (`entity.controller.ts`)
  - [ ] Add `@ApiTags`, `@ApiBearerAuth`
  - [ ] Use `ParseIntPipe` for ID parameters
  - [ ] Add `@ApiOperation` and `@ApiResponse` for all endpoints
  - [ ] Add `@Roles` decorator for protected routes
  - [ ] Use `@CurrentUser()` when needed

- [ ] **5. Create Module** (`entity.module.ts`)
  - [ ] Import `TypeOrmModule.forFeature([Entity])`
  - [ ] Register controller and service
  - [ ] Export service for use in other modules

- [ ] **6. Add to App Module**
  - [ ] Import module in `app.module.ts`

- [ ] **7. Create Migration**
  - [ ] Run: `npm run migration:generate -- -n CreateEntityTable`
  - [ ] Review and edit migration file
  - [ ] Run: `npm run migration:run`

- [ ] **8. Test**
  - [ ] Manual test with Swagger UI
  - [ ] Write unit tests
  - [ ] Write E2E tests

---

## 🎯 Module Implementation Order

Based on dependencies, implement in this order:

### Phase 1: Foundation (Week 1-2)
1. ✅ **Agencies Module** (independent)
2. ✅ **Centers Module** (depends on: Agencies)
3. ✅ **Branches Module** (depends on: Centers)
4. ✅ **Grades Module** (depends on: Branches)
5. ✅ **Classes Module** (depends on: Grades, Branches)

### Phase 2: Content & Packages (Week 3-4)
6. ✅ **Service Packages Module** (independent)
7. ✅ **Center Subscriptions Module** (depends on: Centers, Service Packages)
8. ✅ **Offers Module** (independent)
9. ✅ **Curriculum Module** (already exists, extend for web features)

### Phase 3: Events & Marketplace (Week 5-6)
10. ✅ **Events Module** (depends on: Centers, Classes)
11. ✅ **Event Participants Module** (depends on: Events, Students)
12. ✅ **Marketplace Module** (depends on: Curriculum)
13. ✅ **Marketplace Reviews Module** (depends on: Marketplace)

### Phase 4: Reviews & Notes (Week 7-8)
14. ✅ **Content Reviews Module** (independent)
15. ✅ **Student Notes Module** (depends on: Students, Teachers)
16. ✅ **Suspensions Module** (depends on: Students)
17. ✅ **Notifications Module** (independent)
18. ✅ **Chat Messages Module** (independent)

### Phase 5: Study Abroad (Week 9-10)
19. ✅ **Study Abroad Applications Module**
20. ✅ **Consultations Module**
21. ✅ **School Partnerships Module**
22. ✅ **Consents Module**

---

## 🔗 Update CLAUDE.md Reference

Add this section to CLAUDE.md:

```markdown
### 📊 [Web Dashboard Requirements](./docs/WEB_DASHBOARD_REQUIREMENTS.md)
Complete requirements for the web dashboard system.

**Topics covered:**
- Center, Teacher, Reviewer, Agency roles
- Dashboard analytics
- Content management & marketplace
- Study abroad portal
- Database schema extensions

### 🛠️ [Web Dashboard Implementation Guide](./docs/WEB_DASHBOARD_IMPLEMENTATION_GUIDE.md)
Step-by-step guide for implementing web dashboard features following existing code patterns.

**Topics covered:**
- Entity, DTO, Service, Controller patterns
- Module implementation checklist
- Migration creation
- Phase-by-phase implementation plan
```

---

## 📝 Example: Quick Implementation of Branches Module

Following the patterns above, here's the complete file structure:

```
src/modules/branches/
├── entities/
│   └── branch.entity.ts
├── dto/
│   ├── create-branch.dto.ts
│   ├── update-branch.dto.ts
│   ├── branch-response.dto.ts
│   └── index.ts
├── branches.controller.ts
├── branches.service.ts
└── branches.module.ts
```

All files follow the **exact same patterns** shown in the Centers Module example above, just replacing "Center" with "Branch" and adjusting the properties.

---

**Status:** ✅ Implementation Guide Complete
**Next Step:** Start implementing Phase 1 modules

---

**Last Updated:** 2025-01-13

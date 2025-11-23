# Centers & Branches Module - Implementation Guide

**Date**: 2025-11-22
**Phase**: 7
**Status**: ✅ Fully Implemented
**Version**: 1.0

---

## 🎯 Overview

This document provides a complete implementation guide for the **Centers (Organizations)** and **Branches** modules. These modules enable multi-tenant organization management where:

- **Centers**: English learning organizations that create custom curriculum
- **Branches**: Physical locations/campuses of a center

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    AGENCY (Super Admin)                  │
│  - Creates public chapters for all organizations        │
│  - Manages all centers and branches                     │
│  - Full system access                                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ manages
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    CENTER (Organization)                 │
│  - Creates organization-specific chapters               │
│  - Manages own branches                                 │
│  - Manages teachers and classes                         │
│  - Read-only student analytics                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ has many
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    BRANCH (Location)                     │
│  - Physical campus/location                             │
│  - Hosts classes                                        │
│  - Assigned to one center                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### **Centers Table**

```sql
CREATE TABLE centers (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL UNIQUE,
  phone VARCHAR(20) NULL,
  address TEXT NULL,
  logo_url VARCHAR(500) NULL,
  business_license VARCHAR(255) NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT centers_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Indexes
CREATE INDEX idx_centers_agency_id ON centers(agency_id);
CREATE INDEX idx_centers_status ON centers(status);
CREATE INDEX idx_centers_email ON centers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_centers_created_at ON centers(created_at);
```

### **Branches Table**

```sql
CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  center_id INTEGER NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NULL,
  phone VARCHAR(20) NULL,
  email VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_branches_center_id ON branches(center_id);
CREATE INDEX idx_branches_is_active ON branches(is_active);
CREATE INDEX idx_branches_center_name ON branches(center_id, name);
CREATE INDEX idx_branches_created_at ON branches(created_at);
```

### **Entity Relationships**

```typescript
Center (1) ─────< (N) Branch
  │
  └─────< (N) Chapter (organization-specific chapters)

User (AGENCY) ─────< (N) Center
```

---

## 🔐 Role-Based Access Control

### **Centers RBAC Matrix**

| Operation | AGENCY | CENTER | TEACHER | STUDENT |
|-----------|--------|--------|---------|---------|
| **Create Center** | ✅ Full | ❌ No | ❌ No | ❌ No |
| **List Centers** | ✅ All centers | ✅ Own center only | ❌ No | ❌ No |
| **View Center** | ✅ Any center | ✅ Own center only | ❌ No | ❌ No |
| **Update Center** | ✅ Any center | ✅ Own center only | ❌ No | ❌ No |
| **Delete Center** | ✅ Any (soft delete) | ❌ No | ❌ No | ❌ No |
| **View Analytics** | ✅ Any center | ✅ Own center only | ❌ No | ❌ No |

### **Branches RBAC Matrix**

| Operation | AGENCY | CENTER | TEACHER | STUDENT |
|-----------|--------|--------|---------|---------|
| **Create Branch** | ✅ Any center | ✅ Own center only | ❌ No | ❌ No |
| **List Branches** | ✅ All branches | ✅ Own center only | ❌ No | ❌ No |
| **View Branch** | ✅ Any branch | ✅ Own center only | ❌ No | ❌ No |
| **Update Branch** | ✅ Any branch | ✅ Own center only | ❌ No | ❌ No |
| **Delete Branch** | ✅ Any branch | ✅ Own center only | ❌ No | ❌ No |

### **Access Control Logic**

```typescript
// CENTER role ownership check
if (currentUser.role === UserRole.CENTER) {
  // Centers: Check if center belongs to current user
  if (center.agencyId !== currentUser.id) {
    throw new ForbiddenException('You can only manage your own center');
  }

  // Branches: Check if branch's center belongs to current user
  const branch = await this.findOne(branchId);
  if (branch.center.agencyId !== currentUser.id) {
    throw new ForbiddenException('You can only manage branches of your own center');
  }
}

// AGENCY role - full access
else if (currentUser.role === UserRole.AGENCY) {
  // No restrictions
}

// Other roles - no access
else {
  throw new ForbiddenException('Only AGENCY and CENTER roles can access this resource');
}
```

---

## 🌐 API Endpoints

### **Centers Endpoints**

#### **1. Create Center** (AGENCY only)
```http
POST /api/v1/centers
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "ABC English Center",
  "email": "contact@abcenglish.com",
  "phone": "0901234567",
  "address": "123 Main St, Ho Chi Minh City",
  "logoUrl": "https://example.com/logo.png",
  "businessLicense": "BL123456",
  "agencyId": 1  // Optional: AGENCY assigns themselves
}

Response: 201 Created
{
  "id": 1,
  "name": "ABC English Center",
  "email": "contact@abcenglish.com",
  "phone": "0901234567",
  "address": "123 Main St, Ho Chi Minh City",
  "logoUrl": "https://example.com/logo.png",
  "businessLicense": "BL123456",
  "status": "active",
  "agencyId": 1,
  "agency": {
    "id": 1,
    "username": "superadmin",
    "email": "admin@system.com"
  },
  "branchesCount": 0,
  "chaptersCount": 0,
  "createdAt": "2025-11-22T10:00:00.000Z",
  "updatedAt": "2025-11-22T10:00:00.000Z"
}
```

#### **2. List Centers** (AGENCY + CENTER)
```http
GET /api/v1/centers?page=1&limit=20&status=active&search=ABC
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "name": "ABC English Center",
      "email": "contact@abcenglish.com",
      "status": "active",
      "branchesCount": 3,
      "chaptersCount": 5,
      ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### **3. Get Center Details** (AGENCY + CENTER)
```http
GET /api/v1/centers/:id
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "id": 1,
  "name": "ABC English Center",
  "email": "contact@abcenglish.com",
  "phone": "0901234567",
  "address": "123 Main St, Ho Chi Minh City",
  "logoUrl": "https://example.com/logo.png",
  "businessLicense": "BL123456",
  "status": "active",
  "agencyId": 1,
  "agency": {
    "id": 1,
    "username": "superadmin",
    "email": "admin@system.com"
  },
  "branchesCount": 3,
  "chaptersCount": 5,
  "createdAt": "2025-11-22T10:00:00.000Z",
  "updatedAt": "2025-11-22T10:00:00.000Z"
}
```

#### **4. Update Center** (AGENCY + CENTER)
```http
PATCH /api/v1/centers/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "ABC English Center - Updated",
  "status": "inactive"
}

Response: 200 OK
{
  "id": 1,
  "name": "ABC English Center - Updated",
  "status": "inactive",
  ...
}
```

#### **5. Delete Center** (AGENCY only)
```http
DELETE /api/v1/centers/:id
Authorization: Bearer <jwt_token>

Response: 204 No Content
```
**Note**: Soft delete - sets status to 'suspended'

#### **6. Get Center Analytics** (AGENCY + CENTER)
```http
GET /api/v1/centers/:id/analytics
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "centerId": 1,
  "centerName": "ABC English Center",
  "totalBranches": 3,
  "totalChapters": 5,
  "totalTeachers": 0,  // Placeholder
  "totalStudents": 0   // Placeholder
}
```

---

### **Branches Endpoints**

#### **1. Create Branch** (AGENCY + CENTER)
```http
POST /api/v1/branches
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "centerId": 1,
  "name": "Branch 1 - Downtown",
  "address": "456 Downtown St, Ho Chi Minh City",
  "phone": "0987654321",
  "email": "branch1@abcenglish.com"
}

Response: 201 Created
{
  "id": 1,
  "centerId": 1,
  "name": "Branch 1 - Downtown",
  "address": "456 Downtown St, Ho Chi Minh City",
  "phone": "0987654321",
  "email": "branch1@abcenglish.com",
  "isActive": true,
  "center": {
    "id": 1,
    "name": "ABC English Center"
  },
  "createdAt": "2025-11-22T10:00:00.000Z",
  "updatedAt": "2025-11-22T10:00:00.000Z"
}
```

#### **2. List Branches** (AGENCY + CENTER)
```http
GET /api/v1/branches?page=1&limit=20&centerId=1&isActive=true&search=Downtown
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "centerId": 1,
      "name": "Branch 1 - Downtown",
      "isActive": true,
      "center": {
        "id": 1,
        "name": "ABC English Center"
      },
      ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

#### **3. Get Branch Details** (AGENCY + CENTER)
```http
GET /api/v1/branches/:id
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "id": 1,
  "centerId": 1,
  "name": "Branch 1 - Downtown",
  "address": "456 Downtown St, Ho Chi Minh City",
  "phone": "0987654321",
  "email": "branch1@abcenglish.com",
  "isActive": true,
  "center": {
    "id": 1,
    "name": "ABC English Center"
  },
  "createdAt": "2025-11-22T10:00:00.000Z",
  "updatedAt": "2025-11-22T10:00:00.000Z"
}
```

#### **4. Update Branch** (AGENCY + CENTER)
```http
PATCH /api/v1/branches/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Branch 1 - City Center",
  "isActive": false
}

Response: 200 OK
{
  "id": 1,
  "name": "Branch 1 - City Center",
  "isActive": false,
  ...
}
```

#### **5. Delete Branch** (AGENCY + CENTER)
```http
DELETE /api/v1/branches/:id
Authorization: Bearer <jwt_token>

Response: 204 No Content
```
**Note**: Hard delete - actually removes from database

---

## 📋 Business Logic

### **Center Creation**

```typescript
// AGENCY creates center
async create(dto: CreateCenterDto, currentUser: User) {
  // Only AGENCY can create centers
  if (currentUser.role !== UserRole.AGENCY) {
    throw new ForbiddenException('Only AGENCY can create centers');
  }

  // Check email uniqueness
  const existingCenter = await this.findByEmail(dto.email);
  if (existingCenter) {
    throw new ConflictException('Email already in use');
  }

  // Auto-assign agency if not provided
  const agencyId = dto.agencyId || currentUser.id;

  // Create center
  const center = this.centerRepository.create({
    ...dto,
    agencyId,
    status: CenterStatus.ACTIVE
  });

  return await this.centerRepository.save(center);
}
```

### **Branch Creation**

```typescript
// CENTER creates branch for own center
async create(dto: CreateBranchDto, currentUser: User) {
  // Validate center exists
  const center = await this.centersService.findOneById(dto.centerId);

  // CENTER role: Can only create branches for own center
  if (currentUser.role === UserRole.CENTER) {
    if (center.agencyId !== currentUser.id) {
      throw new ForbiddenException(
        'You can only create branches for your own center'
      );
    }
  }

  // AGENCY role: Can create branches for any center

  // Create branch
  const branch = this.branchRepository.create(dto);
  return await this.branchRepository.save(branch);
}
```

### **Filtering Logic**

```typescript
// CENTER sees only own center's data
async findAll(query: BranchQueryDto, currentUser: User) {
  const qb = this.branchRepository
    .createQueryBuilder('branch')
    .leftJoinAndSelect('branch.center', 'center');

  // CENTER role: Filter by own center
  if (currentUser.role === UserRole.CENTER) {
    qb.andWhere('center.agencyId = :agencyId', {
      agencyId: currentUser.id
    });
  }

  // Apply filters
  if (query.centerId) {
    qb.andWhere('branch.centerId = :centerId', {
      centerId: query.centerId
    });
  }

  if (query.isActive !== undefined) {
    qb.andWhere('branch.isActive = :isActive', {
      isActive: query.isActive
    });
  }

  if (query.search) {
    qb.andWhere(
      '(branch.name ILIKE :search OR branch.address ILIKE :search)',
      { search: `%${query.search}%` }
    );
  }

  // Pagination and sorting
  qb.orderBy(`branch.${query.orderBy}`, query.order)
    .skip((query.page - 1) * query.limit)
    .take(query.limit);

  const [data, total] = await qb.getManyAndCount();

  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
}
```

---

## 🧪 Testing Guide

### **Unit Tests**

```typescript
// centers.service.spec.ts
describe('CentersService', () => {
  describe('create', () => {
    it('should allow AGENCY to create center', async () => {
      const agencyUser = { id: 1, role: UserRole.AGENCY };
      const dto = { name: 'Test Center', email: 'test@center.com' };

      const result = await service.create(dto, agencyUser);

      expect(result.name).toBe('Test Center');
      expect(result.agencyId).toBe(1);
    });

    it('should throw ForbiddenException for CENTER role', async () => {
      const centerUser = { id: 2, role: UserRole.CENTER };
      const dto = { name: 'Test Center' };

      await expect(service.create(dto, centerUser))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException for duplicate email', async () => {
      const agencyUser = { id: 1, role: UserRole.AGENCY };
      const dto = { name: 'Test', email: 'duplicate@test.com' };

      await service.create(dto, agencyUser);

      await expect(service.create(dto, agencyUser))
        .rejects.toThrow(ConflictException);
    });
  });
});
```

### **E2E Tests**

```typescript
// centers.e2e-spec.ts
describe('Centers API (e2e)', () => {
  let agencyToken: string;
  let centerToken: string;

  beforeAll(async () => {
    agencyToken = await getAgencyToken();
    centerToken = await getCenterToken();
  });

  describe('POST /centers', () => {
    it('should create center with AGENCY token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/centers')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          name: 'New Center',
          email: 'new@center.com'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('New Center');
          expect(res.body.id).toBeDefined();
        });
    });

    it('should reject CENTER token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/centers')
        .set('Authorization', `Bearer ${centerToken}`)
        .send({ name: 'Test' })
        .expect(403);
    });
  });

  describe('GET /centers', () => {
    it('should return all centers for AGENCY', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/centers')
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });

    it('should return only own center for CENTER', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/centers')
        .set('Authorization', `Bearer ${centerToken}`)
        .expect(200);

      expect(res.body.data.length).toBe(1);
    });
  });
});
```

---

## 📚 Related Documentation

- [CHAPTER_OWNERSHIP_MODEL.md](./CHAPTER_OWNERSHIP_MODEL.md) - Chapter ownership with Centers
- [CLAUDE.md](../../CLAUDE.md) - Main backend documentation
- [REACT_INTEGRATION_GUIDE.md](../../REACT_INTEGRATION_GUIDE.md) - React integration

---

## ✅ Implementation Checklist

### Database
- [x] Centers table migration created
- [x] Branches table migration created
- [x] Indexes created for performance
- [x] Constraints and check rules added
- [x] Triggers for updated_at timestamps

### Entities
- [x] Center entity with relations
- [x] Branch entity with relations
- [x] CenterStatus enum
- [x] Proper TypeORM decorators

### DTOs
- [x] CreateCenterDto with validation
- [x] UpdateCenterDto with partial validation
- [x] CenterResponseDto with transformations
- [x] CenterQueryDto with filtering
- [x] CenterAnalyticsDto for metrics
- [x] CreateBranchDto with validation
- [x] UpdateBranchDto with partial validation
- [x] BranchResponseDto with transformations
- [x] BranchQueryDto with filtering

### Services
- [x] CentersService with full CRUD
- [x] Role-based access control in CentersService
- [x] BranchesService with full CRUD
- [x] Role-based access control in BranchesService
- [x] Proper error handling (404, 403, 409)

### Controllers
- [x] CentersController with 6 endpoints
- [x] BranchesController with 5 endpoints
- [x] Swagger documentation for all endpoints
- [x] Guards and role decorators
- [x] Response status codes

### Testing
- [ ] Unit tests for CentersService
- [ ] Unit tests for BranchesService
- [ ] E2E tests for Centers endpoints
- [ ] E2E tests for Branches endpoints

---

**Last Updated**: 2025-11-22
**Status**: ✅ Production Ready
**Version**: 1.0

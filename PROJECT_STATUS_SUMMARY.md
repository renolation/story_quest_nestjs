# 📊 Project Status Summary - NestJS Backend

**Date:** November 22, 2025
**Project:** English Learning Platform Backend
**Focus:** User/Agency/Center/Teacher/Student Management

---

## 🎯 Executive Summary

Multi-tenant SaaS platform for English learning with **5 user roles**:
- **AGENCY** (Super Admin) - System owner, manages everything
- **CENTER** (Organization Admin) - Manages own center, branches, teachers, students
- **TEACHER** (Instructor) - Creates content, manages assigned students
- **REVIEWER** (Content Moderator) - Reviews and approves content
- **STUDENT** (End User) - Mobile app only, learns English

---

## ✅ Completed Modules (Phase 1 & 2)

### **Phase 1: Foundation** ✅ COMPLETE (5/5 modules)

#### 1. **Agencies Module** ✅
- **Purpose:** Super admin organizations that manage the entire system
- **Features:**
  - Full CRUD operations
  - Status management (active/inactive/suspended)
  - Email uniqueness validation
  - Agency-Center relationship (1:many)
- **Endpoints:** 7 total
  - `POST /api/v1/agencies` - Create agency
  - `GET /api/v1/agencies` - List agencies (paginated)
  - `GET /api/v1/agencies/:id` - Get agency
  - `PATCH /api/v1/agencies/:id` - Update agency
  - `DELETE /api/v1/agencies/:id` - Delete agency
  - `PATCH /api/v1/agencies/:id/suspend` - Suspend agency
  - `PATCH /api/v1/agencies/:id/activate` - Activate agency
- **Access Control:** AGENCY role only
- **Database:** `agencies` table with indexes

#### 2. **Centers Module** ✅
- **Purpose:** Organizations (English centers) that purchase subscriptions
- **Features:**
  - CRUD operations with role-based access
  - Belongs to an Agency
  - Has many Branches
  - Analytics endpoint
- **Endpoints:** 6 total
  - `POST /api/v1/centers` - Create center
  - `GET /api/v1/centers` - List centers
  - `GET /api/v1/centers/:id` - Get center
  - `PATCH /api/v1/centers/:id` - Update center
  - `DELETE /api/v1/centers/:id` - Delete center
  - `GET /api/v1/centers/:id/analytics` - Get analytics
- **Access Control:**
  - AGENCY: Full access to all centers
  - CENTER: Access to own center only
- **Database:** `centers` table with `agency_id` foreign key

#### 3. **Branches Module** ✅
- **Purpose:** Physical locations of centers
- **Features:**
  - Multi-location support
  - Belongs to Center
  - Address and contact information
- **Endpoints:** 5 total
  - `POST /api/v1/branches` - Create branch
  - `GET /api/v1/branches` - List branches
  - `GET /api/v1/branches/:id` - Get branch
  - `PATCH /api/v1/branches/:id` - Update branch
  - `DELETE /api/v1/branches/:id` - Delete branch
- **Access Control:**
  - AGENCY: All branches
  - CENTER: Own center's branches only
- **Database:** `branches` table with `center_id` foreign key

#### 4. **Grades Module** ✅
- **Purpose:** Grade levels (Grade 3, 4, 5, etc.)
- **Features:** Basic CRUD, placeholder for future expansion
- **Database:** `grades` table

#### 5. **Classes Module** ✅
- **Purpose:** Student classes within centers
- **Features:** Basic CRUD, placeholder for future expansion
- **Database:** `classes` table

---

### **Phase 2: Content & Packages** ✅ COMPLETE (3/3 modules)

#### 1. **Service Packages Module** ✅
- **Purpose:** Subscription plans that AGENCY creates for CENTERS to purchase
- **Features:**
  - Package pricing (monthly/yearly)
  - Resource limits (max students, teachers, branches)
  - Trial period support
  - Features stored as JSONB (flexible)
  - Active/inactive status
- **Endpoints:** 7 total
  - `POST /api/v1/service-packages` - Create package
  - `GET /api/v1/service-packages` - List packages
  - `GET /api/v1/service-packages/:id` - Get package
  - `PATCH /api/v1/service-packages/:id` - Update package
  - `DELETE /api/v1/service-packages/:id` - Delete package
  - `PATCH /api/v1/service-packages/:id/activate` - Activate
  - `PATCH /api/v1/service-packages/:id/deactivate` - Deactivate
- **Access Control:**
  - AGENCY: Full CRUD
  - CENTER/TEACHER: Read active packages only
- **Database:** `service_packages` table

#### 2. **Center Subscriptions Module** ✅
- **Purpose:** CENTER purchases of service packages
- **Features:**
  - Subscription lifecycle (active, trial, expired, cancelled)
  - Trial period from package
  - Auto-renewal option
  - Expiry date calculation (default 1 year)
  - Offer code redemption (with pricing details)
  - Status tracking
- **Endpoints:** 6 total
  - `POST /api/v1/subscriptions` - Create subscription (purchase)
  - `GET /api/v1/subscriptions` - List subscriptions
  - `GET /api/v1/subscriptions/:id` - Get subscription
  - `PATCH /api/v1/subscriptions/:id` - Update subscription
  - `PATCH /api/v1/subscriptions/:id/cancel` - Cancel subscription
  - `PATCH /api/v1/subscriptions/:id/renew` - Renew subscription
- **Access Control:**
  - AGENCY: All subscriptions
  - CENTER: Own subscriptions only, can only update autoRenew field
- **Database:** `center_subscriptions` table with pricing fields

#### 3. **Offers Module** ✅
- **Purpose:** Promotional discount codes
- **Features:**
  - Discount types: percentage or fixed amount
  - Validity period (start/end dates)
  - Usage limits (total + per center)
  - Package-specific or all-packages
  - Offer validation before purchase
  - Automatic usage tracking
  - Status management (active/inactive/expired)
- **Endpoints:** 8 total
  - `POST /api/v1/offers` - Create offer
  - `GET /api/v1/offers` - List offers
  - `POST /api/v1/offers/validate` - Validate offer code
  - `GET /api/v1/offers/:id` - Get offer
  - `PATCH /api/v1/offers/:id` - Update offer
  - `DELETE /api/v1/offers/:id` - Delete offer
  - `PATCH /api/v1/offers/:id/activate` - Activate offer
  - `PATCH /api/v1/offers/:id/deactivate` - Deactivate offer
- **Access Control:**
  - AGENCY: Full CRUD
  - CENTER: View active offers, validate offers
- **Database:** `offers` table with usage tracking

---

## 🔴 Critical Issues Found

### **Issue #1: Agency Creation - NO SUPER ADMIN CHECK** ⚠️

**Problem:**
- Currently, **ANY user with AGENCY role** can create new agencies
- There's no super admin concept
- This is a **SECURITY RISK**

**Current Code:**
```typescript
// agencies.controller.ts line 71
@Post()
@Roles(UserRole.AGENCY)  // ❌ ANY agency user can create!
async create(...)
```

**What's Needed:**
Only **ONE super admin** should be able to create agencies.

**Solution Options:**

**Option A: Add `isSuperAdmin` flag to User table** (Recommended)
```typescript
// users/entities/user.entity.ts
@Column({ name: 'is_super_admin', type: 'boolean', default: false })
isSuperAdmin: boolean;

// agencies.service.ts
async create(createAgencyDto, user) {
  if (!user.isSuperAdmin) {
    throw new ForbiddenException('Only super admin can create agencies');
  }
  // ... create agency
}
```

**Option B: Check specific user ID**
```typescript
// agencies.service.ts
const SUPER_ADMIN_ID = 1; // First user created

async create(createAgencyDto, user) {
  if (user.id !== SUPER_ADMIN_ID) {
    throw new ForbiddenException('Only super admin can create agencies');
  }
  // ... create agency
}
```

**Recommended:** Option A with database migration to add `is_super_admin` column.

---

## ✅ Verified Correct Access Controls

### **Service Packages** ✅ CORRECT
```typescript
@Post()
@Roles(UserRole.AGENCY)  // ✅ Only AGENCY can create packages
```
- AGENCY: Create, update, delete packages ✅
- CENTER: View active packages only ✅

### **Offers** ✅ CORRECT
```typescript
@Post()
@Roles(UserRole.AGENCY)  // ✅ Only AGENCY can create offers

@Get()
@Roles(UserRole.AGENCY, UserRole.CENTER)  // ✅ Both can view
```
- AGENCY: Create, update, delete offers ✅
- CENTER: View active offers, validate offers ✅

---

## 🚧 Missing Modules (User Management Focus)

### **Priority 1: Super Admin System** 🔴 CRITICAL
**Status:** ❌ Not implemented

**Requirements:**
- [ ] Add `isSuperAdmin` boolean to User entity
- [ ] Create database migration to add column
- [ ] Update Agencies controller to check super admin
- [ ] Create seed script for first super admin user
- [ ] Update auth service to handle super admin flag

**Database Migration Needed:**
```sql
ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
UPDATE users SET is_super_admin = TRUE WHERE id = 1; -- First user
CREATE INDEX idx_users_is_super_admin ON users(is_super_admin);
```

---

### **Priority 2: Teachers Module** 🟠 HIGH PRIORITY
**Status:** ❌ Not implemented

**Purpose:** Manage teachers who create content and manage students

**Requirements:**
- [ ] Teachers CRUD endpoints
- [ ] Teacher-Center assignment (many-to-one)
- [ ] Teacher-Branch assignment (optional)
- [ ] Teacher profile (specialization, bio, etc.)
- [ ] Teacher status (active/inactive)

**Access Control:**
- AGENCY: Manage all teachers
- CENTER: Manage own center's teachers only
- TEACHER: View own profile only

**Database Schema:**
```sql
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  center_id INT REFERENCES centers(id) ON DELETE CASCADE,
  branch_id INT REFERENCES branches(id) ON DELETE SET NULL,
  specialization VARCHAR(255),
  bio TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Endpoints Needed:**
- `POST /api/v1/teachers` - Create teacher
- `GET /api/v1/teachers` - List teachers (filtered by center for CENTER role)
- `GET /api/v1/teachers/:id` - Get teacher
- `PATCH /api/v1/teachers/:id` - Update teacher
- `DELETE /api/v1/teachers/:id` - Delete teacher
- `PATCH /api/v1/teachers/:id/assign-branch` - Assign to branch

---

### **Priority 3: Students Module** 🟠 HIGH PRIORITY
**Status:** ❌ Not implemented (uses generic Users table)

**Purpose:** Manage students who use the mobile app

**Requirements:**
- [ ] Students CRUD endpoints
- [ ] Student-Center assignment
- [ ] Student-Class assignment (many-to-many)
- [ ] Student-Teacher assignment (many-to-many)
- [ ] Student profile (age, grade level, etc.)
- [ ] Student status (active/inactive/suspended)

**Access Control:**
- AGENCY: View all students (read-only analytics)
- CENTER: Manage own center's students
- TEACHER: View assigned students only (read-only + notes)

**Database Schema:**
```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  center_id INT REFERENCES centers(id) ON DELETE CASCADE,
  grade_level VARCHAR(50),
  age INT,
  parent_email VARCHAR(255),
  parent_phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_teachers (
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  teacher_id INT REFERENCES teachers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, teacher_id)
);

CREATE TABLE student_classes (
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  class_id INT REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, class_id)
);
```

**Endpoints Needed:**
- `POST /api/v1/students` - Create student
- `GET /api/v1/students` - List students (filtered by access)
- `GET /api/v1/students/:id` - Get student
- `PATCH /api/v1/students/:id` - Update student
- `DELETE /api/v1/students/:id` - Delete student
- `POST /api/v1/students/:id/assign-teacher` - Assign to teacher
- `POST /api/v1/students/:id/assign-class` - Assign to class
- `GET /api/v1/students/:id/progress` - Get student learning progress

---

### **Priority 4: User Management Dashboard** 🟡 MEDIUM PRIORITY
**Status:** ❌ Not implemented

**Purpose:** Admin panel features for managing all users

**Requirements:**
- [ ] List all users with role filter
- [ ] Search users by name/email
- [ ] Bulk operations (activate/deactivate)
- [ ] User activity logs
- [ ] User analytics by role

**Endpoints Needed:**
- `GET /api/v1/users` - List all users (already exists, enhance with filters)
- `GET /api/v1/users/search` - Search users
- `PATCH /api/v1/users/bulk-status` - Bulk status update
- `GET /api/v1/users/analytics` - User analytics

---

### **Priority 5: Subscription Limits Enforcement** 🟡 MEDIUM PRIORITY
**Status:** ❌ Not implemented

**Purpose:** Enforce subscription package limits

**Requirements:**
- [ ] Check max students when creating student
- [ ] Check max teachers when creating teacher
- [ ] Check max branches when creating branch
- [ ] Display usage vs limits in dashboard

**Implementation Locations:**
- `students.service.ts` - Check before creating student
- `teachers.service.ts` - Check before creating teacher
- `branches.service.ts` - Check before creating branch

**Example Logic:**
```typescript
// students.service.ts
async create(createStudentDto, user) {
  // Get center's active subscription
  const subscription = await this.subscriptionsService.findActiveByCenter(centerId);

  // Get current student count
  const currentCount = await this.studentsRepository.count({ where: { centerId } });

  // Check limit
  if (subscription.package.maxStudents && currentCount >= subscription.package.maxStudents) {
    throw new BadRequestException(
      `Student limit reached (${subscription.package.maxStudents}). Upgrade subscription.`
    );
  }

  // Create student...
}
```

---

## 📊 Database Schema Overview

### **Current Tables (Implemented)**
1. `users` - All user accounts (5 roles)
2. `agencies` - Super admin organizations
3. `centers` - English learning centers (organizations)
4. `branches` - Physical locations of centers
5. `grades` - Grade levels
6. `classes` - Student classes
7. `service_packages` - Subscription packages/plans
8. `center_subscriptions` - Center purchases of packages
9. `offers` - Promotional discount codes

### **Tables Needed (User Management)**
10. `teachers` - Teacher profiles and assignments
11. `students` - Student profiles and assignments
12. `student_teachers` - Many-to-many teacher-student relationship
13. `student_classes` - Many-to-many student-class relationship

### **Key Relationships**
```
Agency (1) ──> (many) Centers
Center (1) ──> (many) Branches
Center (1) ──> (many) Teachers
Center (1) ──> (many) Students
Center (1) ──> (many) Subscriptions

ServicePackage (1) ──> (many) Subscriptions
Offer (1) ──> (many) Subscriptions (applied)

Teacher (many) <──> (many) Students
Student (many) <──> (many) Classes
```

---

## 🚀 Recommended Implementation Order

### **Week 1: Critical Fixes**
1. **Day 1:** Fix Super Admin issue
   - Add `isSuperAdmin` column to users
   - Update agencies controller/service
   - Create seed script for super admin

2. **Day 2-3:** Teachers Module
   - Create teachers table
   - Implement Teachers CRUD
   - Teacher-Center assignment

### **Week 2: User Management Core**
3. **Day 1-2:** Students Module
   - Create students table
   - Implement Students CRUD
   - Student-Center assignment

4. **Day 3:** Teacher-Student Relationships
   - Create student_teachers join table
   - Assign students to teachers
   - Teacher can view assigned students

### **Week 3: Enhancement**
5. **Day 1-2:** Subscription Limits Enforcement
   - Add limit checks to students/teachers/branches creation
   - Display usage metrics

6. **Day 3:** User Management Dashboard
   - Enhanced user listing
   - Search and filters
   - Analytics

---

## 📝 Additional Notes

### **Business Flow (Complete Picture)**

1. **Super Admin** creates first Agency (system owner)
2. **Agency** creates Service Packages (Basic, Pro, Enterprise plans)
3. **Agency** creates promotional Offers (discount codes)
4. **Agency** creates Centers (English learning organizations)
5. **Center** purchases Service Package → creates Subscription
6. **Center** can apply Offer code when purchasing (gets discount)
7. **Center** creates Branches (physical locations)
8. **Center** creates Teachers (within subscription limits)
9. **Center** creates Students (within subscription limits)
10. **Teacher** creates content and manages assigned Students
11. **Students** use mobile app to learn

### **Current Limitations**

1. **No Super Admin Check** - Any AGENCY user can create agencies ⚠️
2. **No Teachers Management** - Can't manage teachers yet
3. **No Students Management** - Students use generic Users table
4. **No Limits Enforcement** - Subscription limits not checked
5. **No User Dashboard** - No admin panel for user management

---

## 🎯 Success Criteria

### **Phase 1 & 2: COMPLETE** ✅
- [x] Agencies CRUD
- [x] Centers CRUD
- [x] Branches CRUD
- [x] Service Packages CRUD
- [x] Subscriptions CRUD
- [x] Offers CRUD

### **Next Phase: User Management** 🚧
- [ ] Super Admin fix
- [ ] Teachers CRUD
- [ ] Students CRUD
- [ ] Teacher-Student relationships
- [ ] Subscription limits enforcement

---

## 📞 Next Steps

**Immediate Action Required:**
1. Fix Super Admin issue (most critical)
2. Build Teachers Module
3. Build Students Module
4. Implement relationship management
5. Add subscription limits checks

**Questions to Answer:**
1. Should we use `isSuperAdmin` flag or user ID check?
2. Can a teacher work at multiple centers, or only one?
3. Can a student study at multiple centers?
4. Should we soft-delete users or hard-delete?

---

**Generated:** November 22, 2025
**Status:** Phase 2 Complete, Ready for User Management Phase
**Priority:** Fix Super Admin → Teachers → Students

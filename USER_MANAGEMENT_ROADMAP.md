# 🗺️ User Management Implementation Roadmap

**Focus Area:** User/Agency/Center/Teacher/Student Management
**Date Created:** November 22, 2025
**Status:** Planning Phase

---

## 📊 Current Status

### ✅ Already Completed:
1. ✅ **Super Admin System** - JUST COMPLETED (Nov 22, 2025)
2. ✅ **Agencies Module** - Full CRUD with super admin restriction
3. ✅ **Centers Module** - Organization management
4. ✅ **Branches Module** - Multi-location support
5. ✅ **Service Packages Module** - Subscription plans
6. ✅ **Center Subscriptions Module** - Subscription purchases
7. ✅ **Offers Module** - Discount codes

---

## 🎯 What You Should Do Next

I've organized the remaining work into **3 priority tiers**. Focus on completing each tier before moving to the next.

---

## 🔴 TIER 1: CRITICAL - Core User Management (2-3 weeks)

These modules are **essential** for the user management system to function properly. Without these, you cannot manage teachers and students.

### **1. Teachers Module** 🔴 CRITICAL
**Why Critical:** Teachers are the bridge between centers and students. You need this to manage who creates content and monitors students.

**What to Build:**

#### **Database Schema:**
```sql
-- Teachers table (extends users with TEACHER role)
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  center_id INT REFERENCES centers(id) ON DELETE CASCADE NOT NULL,
  branch_id INT REFERENCES branches(id) ON DELETE SET NULL,
  employee_id VARCHAR(50),
  specialization VARCHAR(255),
  bio TEXT,
  hire_date DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_center_id ON teachers(center_id);
CREATE INDEX idx_teachers_branch_id ON teachers(branch_id);
CREATE INDEX idx_teachers_status ON teachers(status);
```

#### **Endpoints to Create:**
- `POST /api/v1/teachers` - Create teacher (CENTER creates for their center)
- `GET /api/v1/teachers` - List teachers (filtered by center for CENTER role)
- `GET /api/v1/teachers/:id` - Get teacher details
- `PATCH /api/v1/teachers/:id` - Update teacher
- `DELETE /api/v1/teachers/:id` - Soft delete (set status to inactive)
- `PATCH /api/v1/teachers/:id/assign-branch` - Assign teacher to branch
- `GET /api/v1/teachers/:id/students` - Get students assigned to teacher

#### **Access Control:**
- **AGENCY**: View all teachers, read-only
- **CENTER**: Full CRUD for own center's teachers
- **TEACHER**: View own profile, update own bio/specialization

#### **DTOs Needed:**
- `CreateTeacherDto` - user email, center_id, branch_id, employee_id, specialization, hire_date
- `UpdateTeacherDto` - Partial of CreateTeacherDto
- `TeacherResponseDto` - Teacher with user info (name, email) and center/branch names
- `AssignBranchDto` - branch_id

#### **Files to Create:**
- `src/modules/teachers/entities/teacher.entity.ts`
- `src/modules/teachers/dto/create-teacher.dto.ts`
- `src/modules/teachers/dto/update-teacher.dto.ts`
- `src/modules/teachers/dto/teacher-response.dto.ts`
- `src/modules/teachers/teachers.service.ts`
- `src/modules/teachers/teachers.controller.ts`
- `src/modules/teachers/teachers.module.ts`
- Migration script: `create-teachers-table.js`

#### **Estimated Time:** 4-5 days

---

### **2. Students Module** 🔴 CRITICAL
**Why Critical:** Students are your end users. You need this to track who is enrolled, their progress, and relationships with teachers/classes.

**What to Build:**

#### **Database Schema:**
```sql
-- Students table (extends users with STUDENT role)
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  center_id INT REFERENCES centers(id) ON DELETE CASCADE NOT NULL,
  student_code VARCHAR(50) UNIQUE,
  grade_level VARCHAR(50),
  age INT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_email VARCHAR(255),
  parent_phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'graduated')),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Student-Teacher assignments (many-to-many)
CREATE TABLE student_teachers (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  teacher_id INT REFERENCES teachers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  assigned_by INT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(student_id, teacher_id)
);

-- Student-Class enrollments (many-to-many)
CREATE TABLE student_classes (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  class_id INT REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  enrolled_by INT REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  UNIQUE(student_id, class_id)
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_center_id ON students(center_id);
CREATE INDEX idx_students_student_code ON students(student_code);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_student_teachers_student_id ON student_teachers(student_id);
CREATE INDEX idx_student_teachers_teacher_id ON student_teachers(teacher_id);
CREATE INDEX idx_student_classes_student_id ON student_classes(student_id);
CREATE INDEX idx_student_classes_class_id ON student_classes(class_id);
```

#### **Endpoints to Create:**
- `POST /api/v1/students` - Create student (CENTER creates for their center)
- `GET /api/v1/students` - List students (filtered by access)
- `GET /api/v1/students/:id` - Get student details
- `PATCH /api/v1/students/:id` - Update student
- `DELETE /api/v1/students/:id` - Soft delete (set status to inactive)
- `POST /api/v1/students/:id/assign-teacher` - Assign student to teacher
- `DELETE /api/v1/students/:id/teachers/:teacherId` - Unassign teacher
- `POST /api/v1/students/:id/enroll-class` - Enroll student in class
- `DELETE /api/v1/students/:id/classes/:classId` - Unenroll from class
- `GET /api/v1/students/:id/teachers` - Get assigned teachers
- `GET /api/v1/students/:id/classes` - Get enrolled classes
- `GET /api/v1/students/:id/progress` - Get learning progress (integrates with existing progress module)

#### **Access Control:**
- **AGENCY**: View all students (read-only, analytics)
- **CENTER**: Full CRUD for own center's students
- **TEACHER**: View assigned students only (read-only + add notes via teacher-notes module)
- **STUDENT**: View own profile via mobile app

#### **DTOs Needed:**
- `CreateStudentDto` - user email, center_id, grade_level, age, parent info
- `UpdateStudentDto` - Partial of CreateStudentDto
- `StudentResponseDto` - Student with user info, center name, assigned teachers/classes
- `AssignTeacherDto` - teacher_id
- `EnrollClassDto` - class_id

#### **Files to Create:**
- `src/modules/students/entities/student.entity.ts`
- `src/modules/students/entities/student-teacher.entity.ts`
- `src/modules/students/entities/student-class.entity.ts`
- `src/modules/students/dto/create-student.dto.ts`
- `src/modules/students/dto/update-student.dto.ts`
- `src/modules/students/dto/student-response.dto.ts`
- `src/modules/students/students.service.ts`
- `src/modules/students/students.controller.ts`
- `src/modules/students/students.module.ts`
- Migration script: `create-students-tables.js`

#### **Estimated Time:** 5-7 days

---

### **3. Subscription Limits Enforcement** 🔴 CRITICAL
**Why Critical:** Centers pay for packages with limits (max students, teachers, branches). You must enforce these limits or you'll have billing issues.

**What to Build:**

#### **Service Updates:**
Add limit checks to existing services:

**A. Students Service:**
```typescript
// students.service.ts
async create(createStudentDto, currentUser) {
  // Get center's active subscription
  const subscription = await this.subscriptionsService.getActiveSubscription(createStudentDto.centerId);

  if (!subscription) {
    throw new ForbiddenException('No active subscription found for this center');
  }

  // Count current students
  const currentStudentCount = await this.studentsRepository.count({
    where: { centerId: createStudentDto.centerId, status: 'active' }
  });

  // Check limit
  if (currentStudentCount >= subscription.package.maxStudents) {
    throw new ForbiddenException(
      `Student limit reached (${subscription.package.maxStudents}). Upgrade subscription to add more students.`
    );
  }

  // Continue with student creation...
}
```

**B. Teachers Service:**
```typescript
// teachers.service.ts - Same pattern as students
// Check maxTeachers limit from subscription
```

**C. Branches Service:**
```typescript
// branches.service.ts - Same pattern
// Check maxBranches limit from subscription
```

#### **New Endpoints:**
- `GET /api/v1/subscriptions/:id/usage` - Get usage stats (students, teachers, branches used vs limits)
- `GET /api/v1/centers/:id/subscription-status` - Get subscription status with usage

#### **Files to Update:**
- `src/modules/students/students.service.ts` - Add limit check
- `src/modules/teachers/teachers.service.ts` - Add limit check
- `src/modules/branches/branches.service.ts` - Add limit check
- `src/modules/center-subscriptions/center-subscriptions.service.ts` - Add `getActiveSubscription()` and `getUsageStats()` methods

#### **Estimated Time:** 2-3 days

---

## 🟡 TIER 2: IMPORTANT - Enhanced Features (1-2 weeks)

These features improve usability and provide better management capabilities.

### **4. Enhanced User Management Dashboard** 🟡
**Why Important:** Makes it easier to search, filter, and manage users across the system.

**What to Build:**

#### **Enhanced Endpoints:**
- `GET /api/v1/users?role=teacher&status=active&search=john` - Enhanced filtering
- `GET /api/v1/users/analytics` - User counts by role, status
- `PATCH /api/v1/users/bulk-status` - Bulk activate/deactivate users
- `GET /api/v1/users/:id/activity-log` - View user activity history

#### **Features:**
- Advanced search (by name, email, role, status)
- Bulk operations (activate/deactivate multiple users)
- User activity logs
- Export users to CSV

#### **Files to Update/Create:**
- `src/modules/users/users.service.ts` - Add advanced filtering, bulk operations
- `src/modules/users/users.controller.ts` - Add new endpoints
- `src/modules/users/dto/user-filter.dto.ts` - Filter DTO
- `src/modules/users/dto/bulk-update.dto.ts` - Bulk update DTO

#### **Estimated Time:** 3-4 days

---

### **5. Teacher-Student Notes Enhancement** 🟡
**Why Important:** Teachers need to track student progress and add observations.

**What to Build:**

You already have `teacher-notes` module (placeholder). Enhance it:

#### **Enhanced Endpoints:**
- `POST /api/v1/teacher-notes` - Create note for student
- `GET /api/v1/teacher-notes?studentId=123` - Get notes for student
- `GET /api/v1/teacher-notes?teacherId=456` - Get notes by teacher
- `PATCH /api/v1/teacher-notes/:id` - Update note
- `DELETE /api/v1/teacher-notes/:id` - Delete note

#### **Access Control:**
- **TEACHER**: CRUD on own notes only
- **CENTER**: View all notes for their students
- **AGENCY**: View all notes (analytics)

#### **Files to Update:**
- `src/modules/teacher-notes/entities/teacher-note.entity.ts`
- `src/modules/teacher-notes/teacher-notes.service.ts`
- `src/modules/teacher-notes/teacher-notes.controller.ts`

#### **Estimated Time:** 2-3 days

---

### **6. Analytics & Reporting** 🟡
**Why Important:** Centers and teachers need insights into student performance.

**What to Build:**

#### **New Endpoints:**
- `GET /api/v1/analytics/center/:id/overview` - Center overview (total students, teachers, active classes)
- `GET /api/v1/analytics/teacher/:id/performance` - Teacher's student performance
- `GET /api/v1/analytics/student/:id/detailed-progress` - Detailed student progress
- `GET /api/v1/analytics/system/dashboard` - System-wide stats (AGENCY only)

#### **Metrics to Track:**
- Active students/teachers/centers
- Subscription usage across centers
- Student learning progress trends
- Teacher workload distribution

#### **Files to Create:**
- `src/modules/analytics/analytics.service.ts`
- `src/modules/analytics/analytics.controller.ts`
- `src/modules/analytics/analytics.module.ts`

#### **Estimated Time:** 4-5 days

---

## 🟢 TIER 3: NICE-TO-HAVE - Advanced Features (1-2 weeks)

These features add polish and advanced capabilities but aren't critical for basic functionality.

### **7. Class Management Enhancement** 🟢
**Why Nice-to-Have:** Better class scheduling and management.

**What to Build:**

Enhance existing `classes` module:

#### **Enhanced Features:**
- Class schedules (days of week, time slots)
- Class capacity limits
- Teacher assignment to classes
- Student enrollment tracking
- Class status (upcoming, ongoing, completed)

#### **Estimated Time:** 3-4 days

---

### **8. Giftcode System Enhancement** 🟢
**Why Nice-to-Have:** Trial codes for students, promotional codes for centers.

**What to Build:**

Enhance existing `giftcodes` module:

#### **Enhanced Features:**
- Trial period codes (free access for N days)
- Discount codes for subscriptions (integrates with offers)
- Usage tracking
- Expiration dates
- Redemption endpoint

#### **Estimated Time:** 2-3 days

---

### **9. Communication System** 🟢
**Why Nice-to-Have:** In-app messaging between teachers and parents.

**What to Build:**

#### **New Module:**
- Teacher-to-parent messages
- Announcements from center to all parents
- Notification system

#### **Estimated Time:** 5-7 days

---

### **10. Attendance Tracking** 🟢
**Why Nice-to-Have:** Track student attendance in classes.

**What to Build:**

#### **New Module:**
- Check-in/check-out for classes
- Attendance reports
- Absence notifications

#### **Estimated Time:** 3-4 days

---

## 📅 Recommended Implementation Timeline

### **Week 1-2: Teachers Module**
- Days 1-2: Database schema, migrations, entities
- Days 3-4: Service layer (CRUD, access control)
- Days 5-6: Controller, DTOs, validation
- Days 7-8: Testing, documentation

### **Week 3-4: Students Module**
- Days 1-2: Database schema (3 tables), migrations, entities
- Days 3-5: Service layer (CRUD, assignments, enrollments)
- Days 6-7: Controller, DTOs, validation
- Days 8-9: Testing, integration with progress module
- Day 10: Documentation

### **Week 5: Subscription Limits**
- Days 1-2: Add limit checks to students.service.ts
- Day 3: Add limit checks to teachers.service.ts
- Day 4: Add usage tracking endpoints
- Day 5: Testing, edge cases

### **Week 6-7: Enhanced Features (Tier 2)**
- Week 6: User management dashboard, teacher notes
- Week 7: Analytics & reporting

### **Week 8+: Nice-to-Have (Tier 3)**
- Implement based on user feedback and priorities

---

## 🎯 My Recommendation: Start Here

**Step 1 (THIS WEEK):** Implement **Teachers Module**
- This is the foundation for student management
- Relatively straightforward (similar to Centers module pattern)
- Required before Students module

**Step 2 (NEXT WEEK):** Implement **Students Module**
- Most complex module (3 tables, many relationships)
- Core of your user management system
- Integrates with existing progress tracking

**Step 3 (FOLLOWING WEEK):** Implement **Subscription Limits Enforcement**
- Critical for business model
- Prevents billing issues
- Fairly quick to implement

**Then:** Move to Tier 2 based on user feedback.

---

## 📋 Implementation Checklist Template

For each module, follow this checklist:

- [ ] **Phase 1: Database**
  - [ ] Design schema
  - [ ] Write migration script
  - [ ] Test migration
  - [ ] Create indexes

- [ ] **Phase 2: Entities**
  - [ ] Create entity file
  - [ ] Define relationships
  - [ ] Add validation decorators

- [ ] **Phase 3: DTOs**
  - [ ] CreateDto
  - [ ] UpdateDto
  - [ ] ResponseDto
  - [ ] Add class-validator decorators
  - [ ] Add Swagger decorators

- [ ] **Phase 4: Service**
  - [ ] CRUD operations
  - [ ] Access control checks
  - [ ] Business logic
  - [ ] Error handling

- [ ] **Phase 5: Controller**
  - [ ] Define routes
  - [ ] Add guards (JWT, Roles)
  - [ ] Add Swagger documentation
  - [ ] Request validation

- [ ] **Phase 6: Module**
  - [ ] Wire up imports
  - [ ] Export services
  - [ ] Add to app.module.ts

- [ ] **Phase 7: Testing**
  - [ ] Manual API testing (Postman/cURL)
  - [ ] Test access control
  - [ ] Test edge cases
  - [ ] Update documentation

---

## 🚀 Quick Start Guide

When you're ready to implement **Teachers Module** (first priority), tell me and I'll:

1. Create the database migration script
2. Generate the Teacher entity
3. Create all DTOs
4. Implement the service with full business logic
5. Build the controller with all endpoints
6. Wire up the module
7. Provide testing examples

Just say: **"Let's start with Teachers Module"** and I'll begin! 🎯

---

**Last Updated:** November 22, 2025
**Status:** Ready for Implementation
**Next Action:** Choose to start with Teachers Module (recommended)

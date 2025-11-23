# Super Admin Security Implementation

## 📋 Overview

**Date Implemented**: 2025-11-22
**Status**: ✅ COMPLETED
**Priority**: CRITICAL SECURITY FIX

This document describes the implementation of the Super Admin security restriction that ensures only ONE designated super administrator can create agencies in the system.

---

## 🔐 Security Problem Identified

### **CRITICAL ISSUE**:
Prior to this implementation, **ANY user with AGENCY role** could create new agencies. This was a major security vulnerability as it allowed:
- Multiple "super admins" to exist without proper authorization
- Uncontrolled agency proliferation
- No centralized control over agency creation

### **User's Request**:
> "are agency now can create agency? if can i wanna check 1 real super admin, only this can create."

The user wanted to ensure that **only ONE real super admin** has the power to create agencies, not all AGENCY role users.

---

## ✅ Solution Implemented

### **Approach**:
Added an `isSuperAdmin` boolean flag to the `users` table to distinguish the ONE super admin from regular AGENCY role users.

### **Access Control Matrix**:

| User Role | isSuperAdmin | Can Create Agencies? | Purpose |
|-----------|--------------|---------------------|----------|
| `AGENCY` | `true` | ✅ YES | The ONE super admin who controls everything |
| `AGENCY` | `false` | ❌ NO | Regular agency users who manage centers |
| `CENTER` | `false` | ❌ NO | Organization admins |
| `TEACHER` | `false` | ❌ NO | Instructors |
| `REVIEWER` | `false` | ❌ NO | Content moderators |
| `STUDENT` | `false` | ❌ NO | Mobile app users |

---

## 🛠️ Implementation Details

### **1. Database Schema Change**

Added `is_super_admin` column to `users` table:

```sql
-- Migration: add-super-admin-column.js
ALTER TABLE users
ADD COLUMN is_super_admin BOOLEAN DEFAULT false NOT NULL;

CREATE INDEX idx_users_is_super_admin ON users(is_super_admin);
```

**File**: `add-super-admin-column.js` (Node.js migration script)

### **2. User Entity Update**

Updated the `User` entity to include the `isSuperAdmin` field:

```typescript
// src/modules/users/entities/user.entity.ts
@Entity('users')
export class User {
  // ... other fields ...

  @Column({ name: 'is_super_admin', default: false })
  isSuperAdmin: boolean;

  // ... other fields ...
}
```

**File**: `src/modules/users/entities/user.entity.ts:39-40`

### **3. Agencies Service Security Check**

Updated the `create` method to enforce super admin restriction:

```typescript
// src/modules/agencies/agencies.service.ts
async create(
  createAgencyDto: CreateAgencyDto,
  currentUser?: User,
): Promise<Agency> {
  // Only SUPER ADMIN can create agencies
  if (currentUser) {
    // First check: Must be AGENCY role
    if (currentUser.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Only AGENCY role can create new agencies');
    }

    // Second check: Must have isSuperAdmin flag
    if (!currentUser.isSuperAdmin) {
      throw new ForbiddenException(
        'Only the SUPER ADMIN can create new agencies. Regular agency users cannot create agencies.',
      );
    }
  }

  // ... rest of agency creation logic ...
}
```

**File**: `src/modules/agencies/agencies.service.ts:59-70`

### **4. Controller Documentation Update**

Updated Swagger API documentation to reflect the super admin requirement:

```typescript
// src/modules/agencies/agencies.controller.ts
@ApiOperation({
  summary: 'Create a new agency (SUPER ADMIN ONLY)',
  description:
    'Create a new agency (super admin organization). CRITICAL SECURITY: Only the SUPER ADMIN (isSuperAdmin = true) can create agencies. Regular AGENCY users cannot create new agencies. This ensures only one super admin controls agency creation.',
})
@ApiResponse({
  status: 403,
  description: 'Forbidden - Only SUPER ADMIN can create agencies. Regular AGENCY users will get: "Only the SUPER ADMIN can create new agencies. Regular agency users cannot create agencies."',
  schema: {
    example: {
      statusCode: 403,
      message: 'Only the SUPER ADMIN can create new agencies. Regular agency users cannot create agencies.',
      error: 'Forbidden',
    },
  },
})
```

**File**: `src/modules/agencies/agencies.controller.ts:64-104`

### **5. Seed Scripts Created**

Created two utility scripts for managing the super admin:

#### **A. seed-super-admin.js**
Creates a new super admin user from scratch.

```bash
# Create super admin with default credentials
node seed-super-admin.js

# Create with custom credentials
SUPER_ADMIN_EMAIL=admin@example.com \
SUPER_ADMIN_USERNAME=superadmin \
SUPER_ADMIN_PASSWORD=SecurePass123 \
SUPER_ADMIN_FULLNAME="System Administrator" \
node seed-super-admin.js
```

**Features**:
- Prevents creating multiple super admins (only ONE allowed)
- Checks for existing users with same email/username
- Hashes password with bcrypt
- Provides login credentials

#### **B. set-user-as-super-admin.js**
Promotes an existing user to super admin.

```bash
# Set user with ID 188 as super admin
node set-user-as-super-admin.js 188
```

**Features**:
- Validates user exists
- Checks user has AGENCY role
- Prevents multiple super admins
- Shows before/after user details

---

## 📊 Current Super Admin

The system now has ONE designated super admin:

| ID | Email | Username | Role | isSuperAdmin |
|----|-------|----------|------|--------------|
| 188 | admin@storyquest.com | superadmin | agency | `true` |

**Security Reminder**: Keep these credentials secure! This user has ultimate power over agency creation.

---

## 🧪 Testing the Implementation

### **Test Scenario 1: Super Admin CAN Create Agencies**

```bash
# 1. Login as super admin
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"superadmin","password":"Admin123!"}'

# Response: { "accessToken": "eyJhbGc..." }

# 2. Create agency (should succeed)
curl -X POST http://localhost:4000/api/v1/agencies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Test Agency","email":"test@agency.com"}'

# Expected: 201 Created ✅
```

### **Test Scenario 2: Regular AGENCY User CANNOT Create Agencies**

```bash
# 1. Create a regular AGENCY user (via super admin)
curl -X POST http://localhost:4000/api/v1/auth/users \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>" \
  -d '{"email":"regular@agency.com","username":"regularuser","password":"Pass123","fullName":"Regular User","role":"agency"}'

# Note: isSuperAdmin defaults to false

# 2. Login as regular agency user
curl -X POST http://localhost:4000/api/v1/auth/login \
  -d '{"identifier":"regularuser","password":"Pass123"}'

# 3. Try to create agency (should fail)
curl -X POST http://localhost:4000/api/v1/agencies \
  -H "Authorization: Bearer <REGULAR_USER_TOKEN>" \
  -d '{"name":"Unauthorized Agency","email":"bad@agency.com"}'

# Expected: 403 Forbidden ❌
# {
#   "statusCode": 403,
#   "message": "Only the SUPER ADMIN can create new agencies. Regular agency users cannot create agencies.",
#   "error": "Forbidden"
# }
```

---

## 🔒 Security Best Practices

### **1. Protect Super Admin Credentials**
- Never share super admin username/password
- Use strong password (minimum 12 characters)
- Change default password immediately after first login
- Enable 2FA when available (future enhancement)

### **2. Audit Agency Creation**
- Log all agency creation attempts
- Monitor failed attempts (potential security breach)
- Review agency list periodically

### **3. Super Admin Rotation**
If you need to change who is the super admin:

```bash
# 1. Remove super admin flag from current super admin
UPDATE users SET is_super_admin = false WHERE id = 188;

# 2. Set new user as super admin
node set-user-as-super-admin.js <NEW_USER_ID>
```

**IMPORTANT**: Only do this with extreme caution!

### **4. Database-Level Protection**
Consider adding a database trigger to prevent multiple super admins:

```sql
-- Future enhancement: Trigger to ensure only ONE super admin
CREATE OR REPLACE FUNCTION prevent_multiple_super_admins()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_super_admin = true THEN
    IF EXISTS (SELECT 1 FROM users WHERE is_super_admin = true AND id != NEW.id) THEN
      RAISE EXCEPTION 'Only ONE super admin is allowed in the system';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_super_admin
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION prevent_multiple_super_admins();
```

---

## 📁 Files Modified/Created

### **Modified Files**:
1. `src/modules/users/entities/user.entity.ts` - Added `isSuperAdmin` field
2. `src/modules/agencies/agencies.service.ts` - Added super admin check in `create()` method
3. `src/modules/agencies/agencies.controller.ts` - Updated Swagger documentation

### **New Files**:
1. `add-super-admin-column.js` - Database migration script
2. `seed-super-admin.js` - Create new super admin user
3. `set-user-as-super-admin.js` - Promote existing user to super admin
4. `check-super-admin.js` - Verify super admin status
5. `SUPER_ADMIN_IMPLEMENTATION.md` - This documentation

---

## ✅ Verification Checklist

- [x] Added `is_super_admin` column to `users` table
- [x] Created index on `is_super_admin` for query performance
- [x] Updated `User` entity with `isSuperAdmin` field
- [x] Implemented super admin check in `AgenciesService.create()`
- [x] Updated API documentation (Swagger) with security warning
- [x] Created seed script for super admin creation
- [x] Created utility script for promoting users
- [x] Set user ID 188 as the system's super admin
- [x] Verified server compiles without errors
- [x] Documented security implementation

---

## 🎯 Summary

This implementation successfully addresses the user's security concern by:

1. **Adding a distinction** between the ONE super admin and regular AGENCY users
2. **Enforcing strict access control** - only `isSuperAdmin = true` users can create agencies
3. **Providing clear error messages** when unauthorized users attempt agency creation
4. **Creating utility scripts** for managing super admin status
5. **Documenting the security model** for future reference

**Result**: The system now has centralized control over agency creation through a single super administrator.

---

**Implementation Date**: 2025-11-22
**Implemented By**: Claude Code Assistant
**Status**: ✅ Production Ready

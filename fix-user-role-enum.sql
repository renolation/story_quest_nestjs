-- Fix User Role Enum Migration
-- This script updates the users_role_enum to support the new 5-role system

-- Step 1: Update existing "admin" users to "agency"
UPDATE users
SET role = 'agency'
WHERE role = 'admin';

-- Step 2: Update existing "parent" users to "student" (if any exist)
UPDATE users
SET role = 'student'
WHERE role = 'parent';

-- Step 3: Create a new enum type with the correct values
CREATE TYPE users_role_enum_new AS ENUM (
  'agency',
  'center',
  'teacher',
  'reviewer',
  'student'
);

-- Step 4: Alter the column to use the new enum type
ALTER TABLE users
ALTER COLUMN role TYPE users_role_enum_new
USING role::text::users_role_enum_new;

-- Step 5: Drop the old enum type
DROP TYPE users_role_enum;

-- Step 6: Rename the new enum type to the original name
ALTER TYPE users_role_enum_new RENAME TO users_role_enum;

-- Verify the changes
SELECT enum_range(NULL::users_role_enum) AS available_roles;
SELECT role, COUNT(*) FROM users GROUP BY role;

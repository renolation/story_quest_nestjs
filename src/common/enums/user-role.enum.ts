/**
 * User Role Enum
 *
 * 5 Roles Total: 4 Web Dashboard + 1 Mobile App
 *
 * Web Dashboard Roles (React):
 * - AGENCY: Super admin - manages entire system
 * - CENTER: Organization admin - manages center/branches
 * - TEACHER: Instructor - manages students and content
 * - REVIEWER: Content moderator - reviews/approves content
 *
 * Mobile App Role (Flutter):
 * - STUDENT: End user - uses mobile app ONLY (not web dashboard)
 */
export enum UserRole {
  AGENCY = 'agency', // Super Admin (Web Only)
  CENTER = 'center', // Organization Admin (Web Only)
  TEACHER = 'teacher', // Instructor (Web Only)
  REVIEWER = 'reviewer', // Content Moderator (Web Only)
  STUDENT = 'student', // End User (Mobile Only)
}

# Chapter Ownership Model

**Date**: 2025-11-22
**Status**: ✅ Implemented
**Version**: 1.0

---

## 🎯 Overview

The Chapter Ownership Model enables two types of curriculum content:
1. **Public Chapters**: Created by AGENCY, available to all students
2. **Organization-Specific Chapters**: Created by CENTER, available only to their students

This allows organizations to create custom curriculum while still having access to standard public content.

---

## 📊 Database Schema

### **Chapter Entity Updates**

```typescript
@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'thumbnail_url', length: 500, nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // NEW: Chapter ownership fields
  @Column({ name: 'center_id', nullable: true })
  centerId: number | null;

  @ManyToOne(() => Center, { nullable: true })
  @JoinColumn({ name: 'center_id' })
  center: Center | null;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Unit, (unit) => unit.chapter)
  units: Unit[];
}
```

### **Database Constraints**

1. **Ownership Rules**:
   - Public chapters: `center_id = NULL` AND `is_public = true`
   - Org-specific chapters: `center_id = <center_id>` AND `is_public = false`
   - Enforced by check constraint: `CHK_chapters_public_ownership`

2. **Unique Constraints**:
   - Public chapters: Unique `order_index` (across all public chapters)
   - Org-specific chapters: Unique `(center_id, order_index)` per organization
   - Each organization can have its own ordering

3. **Indexes**:
   - `IDX_chapters_center_id`: Query chapters by organization
   - `IDX_chapters_is_public`: Query public vs private chapters
   - `IDX_chapters_center_order`: Composite unique index for org ordering
   - `IDX_chapters_public_order`: Unique index for public chapter ordering

---

## 🔐 Role-Based Access Control

### **AGENCY (Super Admin)**
```typescript
// Can create PUBLIC chapters
POST /api/v1/agency/chapters
{
  "title": "Basic Greetings",
  "description": "Standard curriculum",
  "orderIndex": 1,
  "isPublic": true,
  "centerId": null
}

// Can view ALL chapters (public + all org-specific)
GET /api/v1/agency/chapters

// Can edit/delete ANY chapter
PATCH /api/v1/agency/chapters/:id
DELETE /api/v1/agency/chapters/:id
```

### **CENTER (Organization Admin)**
```typescript
// Can create ORGANIZATION-SPECIFIC chapters
POST /api/v1/center/chapters
{
  "title": "Custom Chapter",
  "description": "Our organization content",
  "orderIndex": 1,
  "isPublic": false
  // centerId automatically set from current user's organization
}

// Can view own org chapters + public chapters
GET /api/v1/center/chapters

// Can only edit/delete OWN organization's chapters
PATCH /api/v1/center/chapters/:id  // Only if chapter.centerId === user.centerId
DELETE /api/v1/center/chapters/:id // Only if chapter.centerId === user.centerId
```

### **TEACHER**
- **Cannot create chapters**
- Can create units, levels, questions within existing chapters
- Can view chapters accessible to their organization

### **STUDENT (Mobile App)**
```typescript
// Sees public chapters + own organization's chapters
GET /api/v1/chapters
// Backend filters:
// WHERE (is_public = true AND center_id IS NULL)
//    OR (center_id = <student's center_id>)

// Can access chapter content if visible
GET /api/v1/chapters/:id
GET /api/v1/chapters/:id/units
```

---

## 🔄 Content Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ CHAPTER (created by AGENCY or CENTER)                   │
│  • center_id: NULL → public (AGENCY)                    │
│  • center_id: <id> → org-specific (CENTER)              │
├─────────────────────────────────────────────────────────┤
│  └── UNIT (created by TEACHER, CENTER, or AGENCY)       │
│       └── LEVEL (created by TEACHER, CENTER, or AGENCY) │
│            └── QUESTION (created by TEACHER, CENTER, AGENCY) │
└─────────────────────────────────────────────────────────┘
```

**Important Notes:**
- Once a chapter exists, teachers can add units/levels/questions
- Only AGENCY and CENTER can create chapters
- Teachers cannot create chapters but can contribute to existing ones

---

## 🌐 API Endpoints

### **Public Chapter Endpoints (AGENCY)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/agency/chapters` | List all chapters |
| POST | `/api/v1/agency/chapters` | Create public chapter |
| GET | `/api/v1/agency/chapters/:id` | Get chapter details |
| PATCH | `/api/v1/agency/chapters/:id` | Update any chapter |
| DELETE | `/api/v1/agency/chapters/:id` | Delete any chapter |

### **Organization Chapter Endpoints (CENTER)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/center/chapters` | List own + public chapters |
| POST | `/api/v1/center/chapters` | Create org chapter |
| GET | `/api/v1/center/chapters/:id` | Get chapter details |
| PATCH | `/api/v1/center/chapters/:id` | Update own org chapter |
| DELETE | `/api/v1/center/chapters/:id` | Delete own org chapter |

### **Student Chapter Endpoints (STUDENT)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/chapters` | List accessible chapters |
| GET | `/api/v1/chapters/:id` | Get chapter details |
| GET | `/api/v1/chapters/:id/units` | Get chapter units |

---

## 🧪 Business Logic

### **Chapter Visibility Rules**

```typescript
// For STUDENT
function getAccessibleChapters(studentCenterId: number) {
  return db.chapters.where(
    (chapter) =>
      // Public chapters
      (chapter.isPublic === true && chapter.centerId === null) ||
      // Own organization chapters
      (chapter.centerId === studentCenterId && chapter.isPublic === false)
  );
}

// For CENTER
function getAccessibleChapters(centerUserId: number, centerId: number) {
  return db.chapters.where(
    (chapter) =>
      // Public chapters (read-only)
      (chapter.isPublic === true && chapter.centerId === null) ||
      // Own organization chapters (editable)
      (chapter.centerId === centerId && chapter.isPublic === false)
  );
}

// For AGENCY
function getAccessibleChapters() {
  return db.chapters.all(); // See everything
}
```

### **Chapter Creation Rules**

```typescript
// AGENCY creating public chapter
async function createPublicChapter(agencyUser: User, dto: CreateChapterDto) {
  if (agencyUser.role !== 'agency') {
    throw new ForbiddenException();
  }

  return db.chapters.create({
    ...dto,
    centerId: null,
    isPublic: true,
  });
}

// CENTER creating org-specific chapter
async function createOrgChapter(centerUser: User, dto: CreateChapterDto) {
  if (centerUser.role !== 'center') {
    throw new ForbiddenException();
  }

  return db.chapters.create({
    ...dto,
    centerId: centerUser.centerId, // From user's organization
    isPublic: false,
  });
}
```

---

## 📋 Migration Details

**File**: `src/database/migrations/1732250000000-AddChapterOwnership.ts`

### **Changes Made**

1. **Added Columns**:
   - `center_id INTEGER NULL` - Organization ownership
   - `is_public BOOLEAN NOT NULL DEFAULT false` - Public flag

2. **Added Constraints**:
   - `FK_chapters_center_id` - Foreign key to centers table
   - `CHK_chapters_public_ownership` - Ensures ownership rules
   - Composite unique indexes for ordering

3. **Removed Constraints**:
   - Global unique constraint on `order_index`
   - Each organization now has independent ordering

### **Running the Migration**

```bash
# Development
npm run migration:run

# Production
npm run migration:run:prod

# Rollback if needed
npm run migration:revert
```

---

## 🔍 Example Scenarios

### **Scenario 1: National Standard Curriculum**
```
AGENCY creates public chapters:
  1. "Basic Greetings" (public, center_id: null)
  2. "Numbers" (public, center_id: null)
  3. "Colors" (public, center_id: null)

→ All students across all organizations can access these
```

### **Scenario 2: Organization-Specific Curriculum**
```
CENTER "ABC English Center" creates org chapters:
  1. "Business English" (org-specific, center_id: 123)
  2. "IELTS Preparation" (org-specific, center_id: 123)

→ Only students enrolled in "ABC English Center" can access
→ Students in other centers cannot see these chapters
```

### **Scenario 3: Mixed Access**
```
Student at "ABC English Center" sees:
  ✅ Public: "Basic Greetings"
  ✅ Public: "Numbers"
  ✅ Public: "Colors"
  ✅ Org-specific: "Business English"
  ✅ Org-specific: "IELTS Preparation"

Student at "XYZ Language School" sees:
  ✅ Public: "Basic Greetings"
  ✅ Public: "Numbers"
  ✅ Public: "Colors"
  ❌ Org-specific: "Business English" (belongs to ABC)
  ❌ Org-specific: "IELTS Preparation" (belongs to ABC)
  ✅ Org-specific: "XYZ Custom Chapter" (if XYZ created one)
```

---

## ✅ Testing Checklist

- [ ] AGENCY can create public chapters
- [ ] AGENCY can view all chapters (public + all org-specific)
- [ ] AGENCY can edit/delete any chapter
- [ ] CENTER can create org-specific chapters
- [ ] CENTER can view public chapters (read-only)
- [ ] CENTER can view own org chapters (editable)
- [ ] CENTER cannot edit/delete public chapters
- [ ] CENTER cannot edit/delete other orgs' chapters
- [ ] STUDENT sees public chapters + own org chapters only
- [ ] STUDENT cannot see other organizations' chapters
- [ ] Order index is unique per organization
- [ ] Public chapters have center_id = NULL
- [ ] Org chapters have center_id set correctly
- [ ] Database constraints prevent invalid data

---

## 📚 Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Main backend documentation
- [REACT_INTEGRATION_GUIDE.md](../../REACT_INTEGRATION_GUIDE.md) - React integration
- [API_DESIGN_GUIDELINES.md](./API_DESIGN_GUIDELINES.md) - API standards
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Complete database schema

---

**Last Updated**: 2025-11-22
**Author**: NestJS Backend Team
**Status**: ✅ Ready for Implementation

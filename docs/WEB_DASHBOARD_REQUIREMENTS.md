# Web Dashboard Requirements - Story Quest English Learning Platform

## 🎯 Overview

**Backend-First Design:** NestJS project is the base, React frontend will follow.

Hệ thống web dashboard phục vụ 4 roles chính:

### Role Structure & Hierarchy

```
┌─────────────────────────────────────┐
│  AGENCY (Super Admin Role)          │
│  - Quản lý toàn bộ hệ thống         │
│  - Quản lý Centers                  │
│  - Marketplace & Content Review     │
└─────────────────────────────────────┘
              ↓ manages
┌─────────────────────────────────────┐
│  CENTER (Organization Role)          │
│  - Khách hàng mua dịch vụ           │
│  - Quản lý chi nhánh, lớp học       │
│  - Quản lý giáo viên                │
└─────────────────────────────────────┘
              ↓ employs
┌─────────────────────────────────────┐
│  TEACHER (Teacher Role)              │
│  - Giảng viên trực thuộc Center     │
│  - Tạo & quản lý nội dung học       │
│  - Quản lý học sinh được gán        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  REVIEWER (Content Reviewer Role)    │
│  - Kiểm duyệt nội dung              │
│  - Independent role                  │
│  - Works for Agency                  │
└─────────────────────────────────────┘
```

### **IMPORTANT Notes:**
1. ✅ **Backend First:** Focus on NestJS API, database design
2. ✅ **4 Web Roles Only:** Agency, Center, Teacher, Reviewer
3. ⚠️ **Students NOT in Web:** Students only use mobile app
4. ✅ **Step-by-step:** Database schema → Entities → APIs → Frontend later

---

## 🗄️ Database Schema - User Roles

### Updated Users Table

```sql
-- Extend existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'student';

-- Role values:
-- 'agency'   - Super admin, manages entire system
-- 'center'   - Organization admin, manages their center
-- 'teacher'  - Teacher, works for a center
-- 'reviewer' - Content reviewer, works for agency
-- 'student'  - Student (mobile app only, not web dashboard)

-- Add role constraint
ALTER TABLE users ADD CONSTRAINT check_user_role
CHECK (role IN ('agency', 'center', 'teacher', 'reviewer', 'student'));

CREATE INDEX idx_users_role ON users(role);
```

### Role-Based Access Control (RBAC)

```typescript
// src/common/enums/user-role.enum.ts
export enum UserRole {
  AGENCY = 'agency',     // Super admin
  CENTER = 'center',     // Organization admin
  TEACHER = 'teacher',   // Teacher
  REVIEWER = 'reviewer', // Content reviewer
  STUDENT = 'student',   // Mobile app only
}

// Permission hierarchy
const ROLE_HIERARCHY = {
  agency: 100,    // Can access everything
  center: 50,     // Can manage their organization
  teacher: 30,    // Can manage assigned classes
  reviewer: 40,   // Can review content
  student: 10,    // Mobile app only
};
```

### Authentication Flow

```
1. User logs in → Generates JWT token
2. JWT payload includes: { sub, email, username, role }
3. Frontend checks role:
   - role === 'agency' → Redirect to /agency dashboard
   - role === 'center' → Redirect to /center dashboard
   - role === 'teacher' → Redirect to /teacher dashboard
   - role === 'reviewer' → Redirect to /reviewer dashboard
   - role === 'student' → ERROR: "Please use mobile app"
4. Backend validates role with @Roles() decorator
```

---

## 📋 I. CENTER WEB (Organization Role)

### 1. Authentication & Account Management

#### 1.1 Đăng ký, Đăng nhập, Thiết lập lại mật khẩu
- Đăng ký tài khoản trung tâm
- Xác thực email/số điện thoại
- Đăng nhập với email/username
- Quên mật khẩu (gửi email reset)
- 2FA (optional)

#### Cơ chế đăng ký:
- Điền thông tin trung tâm (tên, địa chỉ, số điện thoại, email)
- Chọn gói dịch vụ (trial hoặc paid)
- Thanh toán (nếu có)
- Xác thực tài khoản
- Agency duyệt trung tâm

### 2. Dashboard

#### 2.1 Tiến độ học của trung tâm
```typescript
interface CenterProgress {
  totalStudents: number;
  activeStudents: number;
  averageScore: number;
  completionRate: number;
  monthlyGrowth: number;
  topPerformingBranch: string;
  lowestPerformingBranch: string;
}
```

#### 2.2 Tiến độ học theo chi nhánh
```typescript
interface BranchProgress {
  branchId: number;
  branchName: string;
  totalStudents: number;
  activeStudents: number;
  averageScore: number;
  completionRate: number;
  grades: GradeProgress[];
}
```

#### 2.3 Tiến độ học theo lớp
```typescript
interface ClassProgress {
  classId: number;
  className: string;
  gradeLevel: number;
  totalStudents: number;
  averageScore: number;
  completionRate: number;
  teacher: {
    id: number;
    name: string;
  };
}
```

### 3. Báo cáo tổng hợp

#### 3.1 Tổng số lượng học viên
- **Tổng số học viên**: Toàn trung tâm
- **Mỗi chi nhánh**: Breakdown theo chi nhánh
- **Mỗi khối**: Khối 3, 4, 5
- **Mỗi lớp**: Chi tiết từng lớp học

#### 3.2 Ranking

**Chi nhánh:**
- Chi nhánh đông nhất/thưa nhất (theo số lượng học sinh)
- Chi nhánh học tốt nhất/kém nhất (theo điểm trung bình)

**Khối:**
- Khối có số lượng học sinh học tốt nhất/kém nhất
- Tỷ lệ hoàn thành cao nhất/thấp nhất

**Lớp:**
- Lớp nổi bật nhất (điểm cao, tỷ lệ hoàn thành cao)
- Lớp kém nổi bật nhất

**Học sinh:**
- Top 10 học sinh có thành tích tốt nhất
- Top 10 học sinh cần hỗ trợ thêm

#### 3.3 Xuất báo cáo

**Loại báo cáo:**
- Báo cáo tiến độ tổng quan
- Báo cáo theo chi nhánh
- Báo cáo theo khối/lớp
- Báo cáo học sinh cá nhân

**Định dạng:**
- PDF (cho in ấn)
- CSV (cho phân tích dữ liệu)

#### 3.4 Chia sẻ báo cáo

**Loại báo cáo:**
- Báo cáo phụ huynh
- Báo cáo giáo viên
- Báo cáo ban giám hiệu

**Định dạng:**
- PDF (email, download)
- Word (có thể chỉnh sửa)

### 4. Quản lý chung

#### 4.1 Quản lý trung tâm
- Thông tin trung tâm (tên, địa chỉ, logo, thông tin liên hệ)
- Cập nhật thông tin
- Xem lịch sử thay đổi

#### 4.2 Quản lý chi nhánh
```typescript
interface Branch {
  id: number;
  centerId: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// CRUD operations:
// - Tạo chi nhánh mới
// - Sửa thông tin chi nhánh
// - Xóa chi nhánh (soft delete)
// - Tắt/Bật chi nhánh
```

#### 4.3 Quản lý lớp học
```typescript
interface Class {
  id: number;
  branchId: number;
  gradeLevel: number; // 3, 4, 5
  name: string;
  teacherId: number;
  maxStudents: number;
  currentStudents: number;
  schedule: string; // JSON string
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// CRUD operations:
// - Tạo lớp học
// - Gán giáo viên
// - Sửa thông tin lớp
// - Xóa lớp (nếu không có học sinh)
```

#### 4.4 Quản lý slots
```typescript
interface Slot {
  id: number;
  centerId: number;
  totalSlots: number;      // Tổng số slot được mua
  usedSlots: number;       // Số slot đã sử dụng
  availableSlots: number;  // Số slot còn lại
  expiryDate: Date;        // Ngày hết hạn
  packageType: string;     // basic, pro, enterprise
}

// Quản lý:
// - Xem số slot hiện tại
// - Lịch sử sử dụng slot
// - Mua thêm slot
// - Cảnh báo khi sắp hết slot
```

#### 4.5 Quản lý học viên

**⚠️ NOTE: Students sử dụng Mobile App, KHÔNG có Web Dashboard**

**Center có thể:**
- Xem danh sách học sinh (read-only)
- Xem progress & analytics
- Export reports
- Manage giftcodes for student enrollment
- **KHÔNG TẠO TRỰC TIẾP:** Students tự đăng ký qua mobile app

```typescript
interface StudentManagement {
  // Read-only student list
  students: {
    id: number;
    fullName: string;
    classId: number;
    status: 'active' | 'inactive' | 'suspended';
    enrollmentDate: Date;
    parentEmail: string;
    parentPhone: string;
  }[];

  // Operations Center can do:
  operations: {
    viewList: () => Student[];
    viewProgress: (studentId: number) => StudentProgress;
    exportReport: (filters: any) => Promise<string>;
    transferClass: (studentId: number, newClassId: number) => Promise<void>;
    suspend: (studentId: number, reason: string) => Promise<void>;
    reactivate: (studentId: number) => Promise<void>;
  };
}
```

**Giftcode Management (for student enrollment):**
```typescript
interface Giftcode {
  id: number;
  centerId: number;  // Center tạo giftcode
  code: string;
  type: 'trial' | 'discount' | 'full_access';
  duration: number; // days
  maxUses: number;
  usedCount: number;
  assignedTo?: {
    classId?: number;
    gradeLevel?: number;
  };
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

// Workflow:
// 1. CENTER tạo giftcode trên web dashboard
// 2. CENTER gửi code cho phụ huynh/học sinh
// 3. STUDENT đăng ký qua MOBILE APP, nhập giftcode
// 4. Backend validate giftcode và activate student account
// 5. Student được gán vào class/grade theo giftcode config
// 6. CENTER xem usage report của giftcode

// Center Operations:
// - Tạo giftcode mới
// - Set expiry date & max uses
// - Assign to specific class/grade
// - View usage statistics
// - Deactivate giftcode
```

### 5. Quản lý chương trình học

#### 5.1 Danh sách chương trình học
```typescript
interface Curriculum {
  id: number;
  name: string;
  description: string;
  gradeLevel: number;
  totalLessons: number;
  createdBy: 'center' | 'teacher' | 'agency';
  authorId: number;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published';
  assignedTo: {
    branches?: number[];
    grades?: number[];
    classes?: number[];
  };
  chapters: Chapter[];
  createdAt: Date;
  updatedAt: Date;
}

// Views:
// - Theo chi nhánh
// - Theo khối
// - Theo lớp
```

#### 5.2 Thêm/Sửa/Xóa chương trình học hiện tại
- CRUD operations cho chương trình học
- Version control (lưu các phiên bản cũ)
- Rollback về phiên bản trước

#### 5.3 Tạo chương trình học mới

**Upload tài liệu và AI phân tích:**
```typescript
interface AIDocumentAnalysis {
  documentUrl: string;
  documentType: 'pdf' | 'docx' | 'pptx';
  analysisResult: {
    detectedGrade: number;
    suggestedChapters: ChapterSuggestion[];
    vocabularyList: string[];
    grammarPoints: string[];
    estimatedDuration: number; // minutes
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

// Workflow:
// 1. Upload file (PDF, Word, PowerPoint)
// 2. AI phân tích nội dung
// 3. Tạo structure tự động (chapters, units, levels)
// 4. User review và chỉnh sửa
// 5. AI generate questions
// 6. User review questions
// 7. Publish
```

**Form tạo:**
- Tên chương trình học
- Khối lớp áp dụng
- Mô tả
- Thêm chapters, units, levels thủ công
- Drag & drop để sắp xếp

**Chỉnh sửa kéo thả:**
- Drag & drop để reorder chapters/units/levels
- Visual editor cho content
- Preview real-time

**Phát hành:**
```typescript
interface PublishOptions {
  publishTo: 'branch' | 'grade' | 'class' | 'marketplace';
  targetIds: number[];
  effectiveDate: Date;
  expiryDate?: Date;
  price?: number; // nếu publish lên marketplace
  isPublic: boolean;
}

// Workflow:
// - Chọn phạm vi phát hành
// - Set ngày có hiệu lực
// - Preview trước khi publish
// - Publish và thông báo cho users
```

### 6. Quản lý bài tập về nhà

```typescript
interface Homework {
  id: number;
  curriculumId: number;
  title: string;
  description: string;
  dueDate: Date;
  totalPoints: number;
  assignedTo: {
    branches?: number[];
    grades?: number[];
    classes?: number[];
    students?: number[];
  };
  status: 'draft' | 'published';
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

// Features:
// - Tạo bài tập mới
// - Gán cho lớp/học sinh
// - Set deadline
// - Theo dõi tiến độ hoàn thành
// - Chấm điểm tự động (AI)
// - Export kết quả
```

### 7. Quản lý gói dịch vụ

#### 7.1 Danh sách gói dịch vụ đã tạo
```typescript
interface ServicePackage {
  id: number;
  name: string;
  description: string;
  features: string[];
  maxStudents: number;
  maxBranches: number;
  maxTeachers: number;
  priceMonthly: number;
  priceYearly: number;
  trialDays: number;
  isActive: boolean;
}

// Packages:
// - Basic: 50 students, 1 branch, 5 teachers
// - Pro: 200 students, 5 branches, 20 teachers
// - Enterprise: Unlimited
```

#### 7.2 Thêm/Sửa/Xóa gói
- Tạo gói custom cho trung tâm
- Chỉnh sửa gói hiện tại
- Deactivate gói

### 8. Quản lý gói tổ chức

#### 8.1 Gói áp dụng hiện tại
```typescript
interface ActivePackage {
  packageId: number;
  packageName: string;
  startDate: Date;
  expiryDate: Date;
  daysRemaining: number;
  currentUsage: {
    students: number;
    branches: number;
    teachers: number;
  };
  limits: {
    students: number;
    branches: number;
    teachers: number;
  };
  autoRenew: boolean;
}
```

#### 8.2 Danh sách các gói khác
- Xem các gói upgrade
- So sánh tính năng
- Upgrade/Downgrade package

### 9. Quản lý offers/vouchers

```typescript
interface Offer {
  id: number;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_trial';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: Date;
  validTo: Date;
  maxUses: number;
  usedCount: number;
  applicableTo: 'package' | 'curriculum' | 'marketplace';
  status: 'active' | 'paused' | 'expired' | 'deleted';
  assignedTo?: {
    branches?: number[];
    grades?: number[];
    classes?: number[];
  };
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

// Operations:
// - Tạo offer/voucher mới
// - Sửa/Xóa offer
// - Pause/Resume offer
// - Gán cho chi nhánh/khối/lớp cụ thể
// - Xem lịch sử sử dụng
// - Export danh sách người dùng đã dùng voucher
```

### 10. Quản lý giáo viên

```typescript
interface Teacher {
  id: number;
  centerId: number;
  branchId?: number;
  fullName: string;
  email: string;
  phone: string;
  specialization: string[];
  assignedGrades: number[];
  assignedClasses: number[];
  totalStudents: number;
  averageStudentScore: number;
  isActive: boolean;
  joinedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Views:
// - Danh sách tất cả giáo viên
// - Filter theo chi nhánh
// - Filter theo khối
// - Filter theo lớp

// Operations:
// - Thêm giáo viên mới
// - Gán giáo viên cho lớp
// - Xem performance của giáo viên
// - Deactivate teacher
```

### 11. Quản lý bảo lưu

```typescript
interface Suspension {
  id: number;
  studentId: number;
  reason: string;
  suspendedFrom: Date;
  suspendedTo: Date;
  remainingDays: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Operations:
// - Đăng ký bảo lưu
// - Duyệt/Từ chối bảo lưu
// - Extend thời gian bảo lưu
// - Kích hoạt lại sau bảo lưu
// - Xem lịch sử bảo lưu
```

### 12. Quản lý thưởng

#### 12.1 Thưởng từ truyện
```typescript
interface StoryReward {
  id: number;
  storyId: number;
  rewardType: 'coins' | 'stars' | 'badges' | 'certificates';
  rewardValue: number;
  condition: {
    completionRate: number;
    minScore: number;
    timeLimit?: number;
  };
  isActive: boolean;
}
```

#### 12.2 Thưởng ranking
```typescript
interface RankingReward {
  id: number;
  rankingType: 'daily' | 'weekly' | 'monthly' | 'semester';
  scope: 'class' | 'grade' | 'branch' | 'center';
  topN: number; // Top 1, 3, 5, 10
  rewards: {
    rank: number;
    rewardType: string;
    rewardValue: number;
  }[];
  isActive: boolean;
}
```

#### 12.3 Thưởng event
```typescript
interface EventReward {
  id: number;
  eventId: number;
  rewardType: string;
  rewardValue: number;
  eligibilityCriteria: any;
  isActive: boolean;
}
```

### 13. Quản lý event

```typescript
interface Event {
  id: number;
  name: string;
  description: string;
  type: 'competition' | 'challenge' | 'campaign';
  startDate: Date;
  endDate: Date;
  scope: 'center' | 'branch' | 'grade' | 'class';
  targetIds: number[];
  rules: {
    minScore?: number;
    minLevels?: number;
    timeLimit?: number;
  };
  prizes: {
    rank: number;
    description: string;
    value: number;
  }[];
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

// Operations:
// - Tạo event mới
// - Thiết lập cơ chế thưởng (giải nhất, nhì, ba)
// - Publish event
// - Monitor event progress
// - Announce winners
// - Distribute rewards
```

### 14. Marketplace

```typescript
interface MarketplaceItem {
  id: number;
  type: 'curriculum' | 'lesson' | 'homework' | 'story_scenario';
  name: string;
  description: string;
  preview: string;
  price: number;
  currency: 'VND';
  authorId: number;
  authorType: 'center' | 'teacher' | 'agency';
  rating: number;
  totalReviews: number;
  totalPurchases: number;
  status: 'pending_review' | 'approved' | 'rejected' | 'published';
  reviewStatus: {
    aiReview: 'pending' | 'approved' | 'rejected';
    humanReview: 'pending' | 'approved' | 'rejected';
  };
  createdAt: Date;
  updatedAt: Date;
}

// Operations:
// - Browse marketplace
// - Preview items
// - Purchase items
// - Review purchased items
// - Tạo kịch bản mới (AI agent)
// - Tạo qua form thủ công
// - Submit for review
```

#### Cơ chế phát hành và gán
```
1. Center/Teacher creates content
2. Submit for AI review
   - AI checks: content quality, appropriateness, educational value
   - Auto-approve or flag for human review
3. If flagged → Human Reviewer (Agency) reviews
   - Reviewer checks: images, grammar, cultural sensitivity
   - Approve/Reject with comments
4. If approved by Agency → Notify Center
5. Center confirms to publish
   - If confirmed → Published to marketplace
   - If not confirmed → Content suspended (even if approved by Agency)
6. Center can review and decide to allow or reject
```

### 15. Profile & Settings

#### 15.1 Profile
- Thông tin trung tâm
- Logo, banner
- Thông tin liên hệ
- Giấy phép kinh doanh

#### 15.2 Quản lý quyền truy cập
```typescript
interface Permission {
  id: number;
  role: 'admin' | 'manager' | 'teacher' | 'staff';
  permissions: {
    dashboard: boolean;
    students: 'read' | 'write' | 'admin';
    teachers: 'read' | 'write' | 'admin';
    curriculum: 'read' | 'write' | 'admin';
    reports: 'read' | 'write' | 'admin';
    billing: 'read' | 'write' | 'admin';
  };
}

// Operations:
// - Create roles
// - Assign permissions to roles
// - Assign roles to users
// - Audit log of permission changes
```

#### 15.3 Settings
- Notification preferences
- Language settings
- Timezone
- Report formats
- Auto-backup settings

#### 15.4 Theo dõi duyệt
- Xem status của các content đang chờ duyệt
- Xem lịch sử duyệt
- Xem comments từ reviewer

### 16. Thông báo

```typescript
interface Notification {
  id: number;
  userId: number;
  type: 'system' | 'content_approved' | 'content_rejected' | 'new_student' | 'payment' | 'event';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// Types:
// - Thông báo biến động (số lượng học sinh thay đổi, điểm số thay đổi)
// - Thông báo chương trình đã được duyệt
// - Thông báo gán nội dung cho lớp
// - Cần xác nhận từ trung tâm
```

---

## 📋 II. TEACHER WEB (Giáo viên)

### 1. Dashboard

#### 1.1 Tiến độ dạy
```typescript
interface TeacherDashboard {
  teacherId: number;
  assignedGrades: number[];
  assignedClasses: ClassProgress[];
  totalStudents: number;
  averageClassScore: number;
  lessonsCompleted: number;
  upcomingLessons: Lesson[];
}
```

#### 1.2 Tổng số lượng học viên đang phụ trách
- Breakdown theo khối
- Breakdown theo lớp
- Hiển thị danh sách học sinh

#### 1.3 View & Note học sinh
```typescript
interface StudentNote {
  id: number;
  studentId: number;
  teacherId: number;
  noteType: 'struggling' | 'excellent' | 'average' | 'needs_attention';
  content: string;
  tags: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// AI Analysis:
// - Phân tích notes của giáo viên
// - Generate bài tập bổ sung phù hợp
// - Suggest intervention strategies
// - Track improvement over time

// Đánh dấu học sinh yếu:
// → AI tạo bài tập nâng cao phù hợp với điểm yếu
// → Suggest learning path

// Đánh dấu học sinh giỏi:
// → AI tạo bài tập nâng cao để thử thách
// → Suggest advanced topics
```

### 2. Xuất báo cáo

**Loại báo cáo:**
- Báo cáo tiến độ lớp học
- Báo cáo học sinh cá nhân
- Báo cáo so sánh giữa các lớp
- Báo cáo hiệu quả giảng dạy

**Định dạng:**
- PDF
- CSV
- Excel

### 3. Quản lý học viên (Read-Only + Notes)

```typescript
// ⚠️ Teacher chỉ XEM học sinh, KHÔNG tạo/xóa students
interface TeacherStudentView {
  students: Student[];  // Read-only list from mobile app registrations

  filters: {
    byGrade: number[];
    byClass: number[];
    byPerformance: 'all' | 'excellent' | 'average' | 'struggling';
  };

  // What teacher CAN do:
  allowedActions: {
    viewProgress: true;       // ✅ Xem progress
    addNotes: true;           // ✅ Thêm notes
    assignHomework: true;     // ✅ Gán bài tập
    contactParents: true;     // ✅ Liên hệ phụ huynh (qua email)
  };

  // What teacher CANNOT do:
  forbiddenActions: {
    createStudent: false;     // ❌ Students register via mobile
    deleteStudent: false;     // ❌ Only center admin can
    editPersonalInfo: false;  // ❌ Students edit via mobile app
  };
}
```

### 4. Quản lý kịch bản (AI agent)

```typescript
interface AIScenario {
  id: number;
  teacherId: number;
  title: string;
  description: string;
  gradeLevel: number;
  difficulty: string;
  estimatedDuration: number;
  aiGeneratedContent: {
    dialogues: any[];
    questions: any[];
    activities: any[];
  };
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Operations:
// - Tạo kịch bản mới (AI agent support)
// - Form tạo thủ công
// - Sửa/Xóa kịch bản của mình
// - Submit for review (Flag đợi duyệt)
// - View review status
```

### 5. Nội dung học

**Danh sách:**
- Nội dung do bản thân tạo
- Nội dung của trung tâm
- Nội dung được gán để giảng dạy

**Operations:**
- View all assigned content
- Sửa/Xóa (chỉ content do mình tạo)
- Flag đợi duyệt
- Share content với teachers khác

**Tạo mới chương trình học:**
```
1. Form tạo curriculum
2. Thêm nội dung → AI review automatically
   - Grammar check
   - Content appropriateness
   - Educational value
3. Thêm hình ảnh → Reviewer Agency reviews
   - Image appropriateness
   - Copyright check
   - Quality check
4. Gán cho khối/lớp phụ trách
5. Thông báo cho Trung Tâm và Agency
6. Flag đợi duyệt
7. After approval → Publish
```

### 6. Bài tập

**Danh sách bài tập:**
- Bài tập đã tạo
- Đã gán cho khối/lớp nào
- Status (draft, published, completed)

**Operations:**
- Tạo bài tập mới
- Sửa/Xóa (chỉ bài tập của mình)
- Gán cho lớp
- View submission status
- Grade submissions (with AI assist)
- Flag đợi duyệt

**Tạo mới bài tập:**
```
1. Form tạo homework
2. Thêm nội dung → AI review
3. Thêm hình ảnh → Agency reviewer
4. Gán cho khối/lớp phụ trách
5. Set deadline
6. Thông báo cho Trung Tâm và Agency
7. Flag đợi duyệt
```

### 7. Profile & Settings

#### Profile
- Personal information
- Teaching qualifications
- Experience
- Performance metrics

#### Settings
- Notification preferences
- Class schedule
- Preferred teaching methods

#### Theo dõi tiến độ duyệt
- Content approval status
- Comments from reviewers
- Revision requests

### 8. Thông báo

**Từ trung tâm:**
- Schedule changes
- Policy updates
- New curriculum assignments

**Từ Agency:**
- Content approval/rejection
- Training opportunities
- Platform updates

**Từ app:**
- Student progress alerts
- Homework submissions
- Parent messages

### 9. Chat Support
- Chat với reviewer về content đang chờ duyệt
- Chat với center admin
- Chat với parents (optional)

---

## 📋 III. REVIEWER WEB (Kiểm duyệt viên)

### 1. Authentication
- Role-based login
- Reviewer permissions
- Activity tracking

### 2. Màn chung - Danh sách đợi duyệt

```typescript
interface ReviewQueue {
  id: number;
  contentType: 'curriculum' | 'homework' | 'scenario' | 'image';
  contentId: number;
  submittedBy: {
    userId: number;
    userName: string;
    userRole: 'teacher' | 'center';
    centerName: string;
  };
  submittedAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  aiAnalysis: {
    score: number;
    flags: string[];
    suggestions: string[];
  };
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  assignedTo?: number;
}

// Features:
// - Sort by priority
// - Sort by submission date
// - Filter by content type
// - Filter by submitter
// - Search by keywords
// - Auto-assign based on reviewer workload
```

### 3. Màn kiểm duyệt

```typescript
interface ReviewForm {
  contentId: number;
  contentType: string;
  contentPreview: any;

  aiAnalysis: {
    overallScore: number;
    grammarScore: number;
    contentQualityScore: number;
    appropriatenessScore: number;
    suggestions: string[];
    flaggedIssues: {
      severity: 'low' | 'medium' | 'high';
      issue: string;
      location: string;
    }[];
  };

  reviewChecklist: {
    grammarCheck: boolean;
    contentQuality: boolean;
    ageAppropriate: boolean;
    educationalValue: boolean;
    imageQuality: boolean;
    copyrightClear: boolean;
  };

  reviewerNotes: string;

  decision: 'approve' | 'reject' | 'request_revision';

  revisionRequests?: {
    section: string;
    issue: string;
    suggestion: string;
  }[];
}

// Review Process:
// 1. View content
// 2. Review AI analysis
// 3. Manual review
// 4. Fill checklist
// 5. Add notes
// 6. Make decision
// 7. Submit review
```

### 4. Trả kết quả

**Được duyệt:**
```typescript
interface ApprovalNotification {
  to: ['submitter', 'center_admin', 'agency_admin'];
  contentId: number;
  approvedAt: Date;
  reviewerNotes: string;
  publishPermission: boolean;
}
```

**Không được duyệt:**
```typescript
interface RejectionNotification {
  to: ['submitter', 'center_admin'];
  contentId: number;
  rejectedAt: Date;
  reasons: string[];
  revisionSuggestions: string[];
  canResubmit: boolean;
  reviewerNotes: string;
}
```

### 5. Lịch sử

```typescript
interface ReviewHistory {
  id: number;
  contentId: number;
  reviewerId: number;
  reviewerName: string;
  action: 'reviewed' | 'approved' | 'rejected' | 'revision_requested';
  decision: string;
  notes: string;
  timestamp: Date;
  duration: number; // minutes spent reviewing
}

// Features:
// - View all reviewed content
// - Filter by date range
// - Filter by decision
// - Export activity report
// - Performance metrics
```

### 6. Thông báo

**Yêu cầu mới:**
- Notification khi có content mới cần review
- Priority-based alerts
- Deadline warnings

**Phản hồi:**
- Notification khi submitter responds
- Notification khi revision submitted
- Follow-up reminders

### 7. Chat Support
- Chat với content creators
- Chat với agency admin
- Quick question & answer
- Request clarifications

---

## 📋 IV. AGENCY WEB (Đại lý)

### 1. Dashboard

```typescript
interface AgencyDashboard {
  totalCenters: number;
  activeCenters: number;
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;

  topPerformingCenters: Center[];
  pendingReviews: number;
  pendingApprovals: number;

  systemHealth: {
    apiUptime: number;
    avgResponseTime: number;
    errorRate: number;
  };

  recentActivity: Activity[];
}
```

### 2. Quản lý tổ chức/trung tâm

```typescript
interface CenterManagement {
  centers: Center[];

  operations: {
    create: (data: CreateCenterDto) => Promise<Center>;
    update: (id: number, data: UpdateCenterDto) => Promise<Center>;
    delete: (id: number) => Promise<void>;
    suspend: (id: number, reason: string) => Promise<void>;
    activate: (id: number) => Promise<void>;
  };

  packageStatus: {
    centerId: number;
    currentPackage: {
      name: string;
      slots: {
        total: number;
        used: number;
        available: number;
      };
      features: string[];
      expiryDate: Date;
    };
    usageStats: {
      students: number;
      teachers: number;
      branches: number;
      storageUsed: number; // GB
    };
  };
}
```

### 3. Quản lý gói cung cấp

```typescript
interface PackageManagement {
  packages: ServicePackage[];

  operations: {
    create: (pkg: ServicePackage) => Promise<ServicePackage>;
    update: (id: number, pkg: Partial<ServicePackage>) => Promise<ServicePackage>;
    delete: (id: number) => Promise<void>;
    assignToCenter: (pkgId: number, centerId: number) => Promise<void>;
    renewPackage: (centerId: number, pkgId: number) => Promise<void>;
  };

  analytics: {
    popularPackages: { packageId: number; subscriptions: number }[];
    revenueByPackage: { packageId: number; revenue: number }[];
    churnRate: number;
  };
}
```

### 4. Quản lý nội dung học (toàn bộ trung tâm)

```typescript
interface ContentManagement {
  content: {
    all: Curriculum[];
    byCenters: Map<number, Curriculum[]>;
    byGrade: Map<number, Curriculum[]>;
    marketplace: Curriculum[];
  };

  operations: {
    view: (filters: ContentFilters) => Curriculum[];
    approve: (id: number) => Promise<void>;
    reject: (id: number, reason: string) => Promise<void>;
    assign: (contentId: number, targetIds: number[]) => Promise<void>;
    unassign: (contentId: number, targetIds: number[]) => Promise<void>;
    delete: (id: number) => Promise<void>;
  };
}
```

### 5. Quản lý kiểm duyệt

```typescript
interface ReviewManagement {
  reviewers: Reviewer[];

  operations: {
    addReviewer: (data: CreateReviewerDto) => Promise<Reviewer>;
    removeReviewer: (id: number) => Promise<void>;
    assignReview: (reviewId: number, reviewerId: number) => Promise<void>;

    setupAutoReview: {
      aiThreshold: number; // 0-100, content với AI score > threshold → auto approve
      requireHumanReview: string[]; // content types requiring human review
      priorityRules: PriorityRule[];
    };
  };

  monitoring: {
    pendingReviews: Review[];
    reviewerWorkload: Map<number, number>;
    avgReviewTime: number;
    approvalRate: number;
  };
}
```

### 6. Quản lý Marketplace

```typescript
interface MarketplaceManagement {
  items: MarketplaceItem[];

  operations: {
    approve: (id: number) => Promise<void>;
    reject: (id: number, reason: string) => Promise<void>;
    feature: (id: number) => Promise<void>; // Featured items
    unfeature: (id: number) => Promise<void>;
    setPrice: (id: number, price: number) => Promise<void>;

    categories: {
      create: (name: string) => Promise<Category>;
      update: (id: number, name: string) => Promise<Category>;
      delete: (id: number) => Promise<void>;
    };
  };

  analytics: {
    topSellers: MarketplaceItem[];
    revenueByItem: Map<number, number>;
    purchasesByCenter: Map<number, number>;
  };
}
```

### 7. Quản lý học sinh (toàn bộ)

**⚠️ NOTE: Students register via MOBILE APP, Agency can only VIEW & MANAGE**

**Agency có thể:**
- Xem tất cả students across all centers (read-only personal info)
- View analytics & performance metrics
- Transfer students between classes/centers
- Suspend/reactivate accounts (admin action)
- Export reports
- **KHÔNG TẠO TRỰC TIẾP:** Students tự đăng ký qua mobile app

```typescript
interface StudentManagement {
  students: Student[];  // Read-only student data from mobile registrations

  filters: {
    byCenter: number;
    byBranch: number;
    byGrade: number;
    byClass: number;
    byPerformance: 'excellent' | 'average' | 'struggling';
  };

  aiAnalysis: {
    overallPerformance: number;
    learningPatterns: any[];
    riskStudents: Student[]; // at risk of dropping out
    recommendations: string[];
  };

  // What agency CAN do:
  operations: {
    viewDetails: (id: number) => Promise<StudentDetails>;  // ✅ View full details
    exportData: (filters: any) => Promise<string>;         // ✅ Export CSV/Excel
    bulkOperations: {
      transfer: (studentIds: number[], targetClassId: number) => Promise<void>;  // ✅ Transfer class/center
      suspend: (studentIds: number[], reason: string) => Promise<void>;          // ✅ Admin suspend
      reactivate: (studentIds: number[]) => Promise<void>;                       // ✅ Admin reactivate
    };
  };

  // What agency CANNOT do:
  forbiddenActions: {
    createStudent: false;         // ❌ Students register via mobile app
    deleteStudent: false;         // ❌ Permanent deletion not allowed
    editPersonalInfo: false;      // ❌ Students edit their own info via mobile
    changePassword: false;        // ❌ Students manage via mobile app
  };
}
```

### 8. Quản lý event

```typescript
interface EventManagement {
  events: Event[];

  operations: {
    create: (event: CreateEventDto) => Promise<Event>;
    update: (id: number, event: UpdateEventDto) => Promise<Event>;
    delete: (id: number) => Promise<void>;
    publish: (id: number) => Promise<void>;
    cancel: (id: number, reason: string) => Promise<void>;

    rewards: {
      setup: (eventId: number, rewards: Reward[]) => Promise<void>;
      distribute: (eventId: number) => Promise<void>;
    };
  };

  monitoring: {
    participation: Map<number, number>; // eventId -> participant count
    winners: Map<number, Student[]>;
    feedback: EventFeedback[];
  };
}
```

### 9. Quản lý offers/vouchers

```typescript
interface OfferManagement {
  offers: Offer[];

  operations: {
    create: (offer: CreateOfferDto) => Promise<Offer>;
    update: (id: number, offer: UpdateOfferDto) => Promise<Offer>;
    delete: (id: number) => Promise<void>;
    activate: (id: number) => Promise<void>;
    deactivate: (id: number) => Promise<void>;

    distribute: {
      toCenters: (offerIds: number[], centerIds: number[]) => Promise<void>;
      toStudents: (offerIds: number[], studentIds: number[]) => Promise<void>;
      bulk: (offerIds: number[], criteria: DistributionCriteria) => Promise<void>;
    };
  };

  analytics: {
    usageRate: Map<number, number>;
    revenueImpact: Map<number, number>;
    popularOffers: Offer[];
  };
}
```

### 10. Quản lý Consent/Agreement

```typescript
interface ConsentManagement {
  consents: Consent[];

  types: {
    dataSharing: 'center_to_agency' | 'agency_to_center' | 'center_to_student';
    purpose: 'analytics' | 'marketing' | 'improvement' | 'research';
  };

  operations: {
    createTemplate: (template: ConsentTemplate) => Promise<ConsentTemplate>;
    requestConsent: (userId: number, consentId: number) => Promise<void>;
    revokeConsent: (userId: number, consentId: number) => Promise<void>;
    viewConsentStatus: (userId: number) => Promise<ConsentStatus[]>;
  };

  compliance: {
    gdprCompliant: boolean;
    coppaCompliant: boolean;
    auditLog: ConsentAuditLog[];
  };
}
```

### 11. Quản lý du học / Quản lý hồ sơ

```typescript
interface StudyAbroadManagement {
  // Đặt lịch tư vấn
  consultations: {
    bookings: Consultation[];
    schedule: {
      create: (data: CreateConsultationDto) => Promise<Consultation>;
      reschedule: (id: number, newTime: Date) => Promise<void>;
      cancel: (id: number, reason: string) => Promise<void>;
    };
  };

  // Quản lý hồ sơ du học
  applications: {
    list: StudyAbroadApplication[];
    create: (data: CreateApplicationDto) => Promise<StudyAbroadApplication>;
    update: (id: number, data: UpdateApplicationDto) => Promise<StudyAbroadApplication>;

    documents: {
      upload: (appId: number, docs: Document[]) => Promise<void>;
      verify: (docId: number) => Promise<void>;
      request: (appId: number, docType: string) => Promise<void>;
    };
  };

  // Quản lý liên kết (trường/quốc gia)
  partnerships: {
    schools: School[];
    countries: Country[];

    operations: {
      addSchool: (school: School) => Promise<School>;
      updateSchool: (id: number, school: Partial<School>) => Promise<School>;

      // Portal đối tác
      partnerPortal: {
        sendApplication: (schoolId: number, appId: number) => Promise<void>;
        receiveResponse: (schoolId: number, response: any) => Promise<void>;
        trackStatus: (appId: number) => Promise<ApplicationStatus>;
      };
    };
  };

  // Quản lý giấy tờ/visa
  visaManagement: {
    applications: VisaApplication[];

    operations: {
      create: (data: CreateVisaDto) => Promise<VisaApplication>;
      trackStatus: (id: number) => Promise<VisaStatus>;
      uploadDocuments: (id: number, docs: Document[]) => Promise<void>;
      scheduleInterview: (id: number, date: Date) => Promise<void>;
    };
  };

  // Quản lý enroll vào trường
  enrollment: {
    enrollments: Enrollment[];

    operations: {
      submitApplication: (schoolId: number, studentId: number) => Promise<void>;
      trackAdmission: (enrollmentId: number) => Promise<AdmissionStatus>;
      acceptOffer: (enrollmentId: number) => Promise<void>;
      declineOffer: (enrollmentId: number, reason: string) => Promise<void>;
    };
  };

  // Quản lý tài chính du học
  financial: {
    tuitionFees: TuitionFee[];
    scholarships: Scholarship[];
    loans: Loan[];
    insurance: Insurance[];

    operations: {
      calculateTotal: (appId: number) => Promise<FinancialSummary>;
      applyScholarship: (studentId: number, scholarshipId: number) => Promise<void>;
      processPayment: (appId: number, payment: Payment) => Promise<void>;

      budgetPlanning: {
        tuition: number;
        accommodation: number;
        insurance: number;
        flights: number;
        livingExpenses: number;
        total: number;
      };
    };
  };

  // AI Features
  aiServices: {
    // AI tóm tắt cuộc gọi
    callSummary: {
      transcribe: (callId: number) => Promise<string>;
      summarize: (transcript: string) => Promise<CallSummary>;
      extractActionItems: (transcript: string) => Promise<string[]>;
    };

    // AI suggest trường phù hợp
    schoolMatching: {
      analyze: (studentProfile: StudentProfile) => Promise<SchoolRecommendation[]>;

      criteria: {
        academicPerformance: number;
        budget: number;
        location: string[];
        major: string;
        language: string;
        otherPreferences: any;
      };

      // Nếu không ưng → gợi ý lộ trình nâng cao
      improvementPlan: {
        currentGrade: number;
        targetGrade: number;
        suggestedActions: Action[];
        estimatedTime: number; // months
        recommendedCenters: Center[];
      };
    };

    // Quality check
    applicationQualityCheck: {
      checkDocuments: (appId: number) => Promise<QualityReport>;
      checkEssays: (essays: string[]) => Promise<EssayFeedback[]>;
      checkRecommendations: (letters: string[]) => Promise<LetterFeedback[]>;
      overallScore: number; // 0-100
    };
  };
}

// Result Types
interface FinancialSummary {
  tuitionFee: number;
  accommodation: number;
  insurance: number;
  flights: number;
  visa: number;
  livingExpenses: number;
  totalCost: number;
  scholarshipAmount: number;
  netCost: number;
  paymentPlan: PaymentSchedule[];
}

interface SchoolRecommendation {
  schoolId: number;
  schoolName: string;
  country: string;
  matchScore: number; // 0-100
  admissionChance: 'high' | 'medium' | 'low';
  estimatedCost: number;
  strengths: string[];
  concerns: string[];
  suggestedPrograms: Program[];
}

interface StudyAbroadPlan {
  student: StudentProfile;
  targetSchool: School;
  timeline: {
    preparation: Date;
    applicationDeadline: Date;
    visaApplication: Date;
    departure: Date;
  };
  financialPlan: FinancialSummary;
  requiredDocuments: Document[];
  actionItems: ActionItem[];
}
```

### 12. Enquiry Portal

```typescript
interface EnquiryPortal {
  // Xử lý yêu cầu tư vấn du học
  enquiries: Enquiry[];

  sources: {
    directUser: Enquiry[]; // User mua lẻ
    fromCenter: Enquiry[]; // Enroll từ trung tâm
    fromZalo: Enquiry[];
    fromEmail: Enquiry[];
    fromOutlook: Enquiry[];
    fromParents: Enquiry[];
  };

  operations: {
    create: (enquiry: CreateEnquiryDto) => Promise<Enquiry>;
    assign: (enquiryId: number, consultantId: number) => Promise<void>;
    respond: (enquiryId: number, response: string) => Promise<void>;
    convertToApplication: (enquiryId: number) => Promise<StudyAbroadApplication>;

    autoResponse: {
      enabled: boolean;
      templates: ResponseTemplate[];
      aiAssisted: boolean;
    };
  };

  // Tích hợp
  integrations: {
    zalo: {
      connected: boolean;
      webhook: string;
      handleMessage: (message: ZaloMessage) => Promise<void>;
    };
    email: {
      connected: boolean;
      inboxes: string[];
      handleEmail: (email: Email) => Promise<void>;
    };
    outlook: {
      connected: boolean;
      accounts: string[];
      syncCalendar: () => Promise<void>;
    };
  };
}
```

### 13. Agency/Admin Profile

```typescript
interface AgencyProfile {
  agencyInfo: {
    name: string;
    logo: string;
    website: string;
    email: string;
    phone: string;
    address: string;
    businessLicense: string;
  };

  team: {
    admins: Admin[];
    reviewers: Reviewer[];
    consultants: Consultant[];
  };

  settings: {
    branding: BrandingSettings;
    notifications: NotificationSettings;
    billing: BillingSettings;
    api: ApiSettings;
  };
}
```

---

---

## 🗄️ Database Schema Extensions

### Role & Permission Design

```typescript
// Backend role validation
export const WEB_ROLES = ['agency', 'center', 'teacher', 'reviewer'] as const;
export const MOBILE_ROLES = ['student'] as const;
export const ALL_ROLES = [...WEB_ROLES, ...MOBILE_ROLES] as const;

// Role-based route protection
@Roles('agency', 'center')  // Only agency and center can access
async getCenterList() { }

@Roles('teacher')  // Only teachers
async getMyClasses() { }

@Roles('agency')  // Super admin only
async manageReviewers() { }
```

### New Tables Required

```sql
-- Agencies Table (Super Admin)
CREATE TABLE agencies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  logo_url VARCHAR(500),
  website VARCHAR(255),
  business_license VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link users to agencies (for agency role)
ALTER TABLE users ADD COLUMN agency_id INT REFERENCES agencies(id) ON DELETE CASCADE;
CREATE INDEX idx_users_agency ON users(agency_id);

-- Centers and Branches
CREATE TABLE centers (
  id SERIAL PRIMARY KEY,
  agency_id INT REFERENCES agencies(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  logo_url VARCHAR(500),
  business_license VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  center_id INT REFERENCES centers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grades and Classes
CREATE TABLE grades (
  id SERIAL PRIMARY KEY,
  branch_id INT REFERENCES branches(id) ON DELETE CASCADE,
  grade_level INT NOT NULL CHECK (grade_level IN (3, 4, 5)),
  name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  grade_id INT REFERENCES grades(id) ON DELETE CASCADE,
  branch_id INT REFERENCES branches(id),
  name VARCHAR(255) NOT NULL,
  teacher_id INT REFERENCES users(id),
  max_students INT DEFAULT 30,
  current_students INT DEFAULT 0,
  schedule JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packages and Subscriptions
CREATE TABLE service_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  features JSONB,
  max_students INT,
  max_branches INT,
  max_teachers INT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  trial_days INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE center_subscriptions (
  id SERIAL PRIMARY KEY,
  center_id INT REFERENCES centers(id),
  package_id INT REFERENCES service_packages(id),
  start_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offers and Vouchers
CREATE TABLE offers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2),
  min_purchase DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  valid_from TIMESTAMP NOT NULL,
  valid_to TIMESTAMP NOT NULL,
  max_uses INT,
  used_count INT DEFAULT 0,
  applicable_to VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE offer_usage (
  id SERIAL PRIMARY KEY,
  offer_id INT REFERENCES offers(id),
  user_id INT REFERENCES users(id),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  order_value DECIMAL(10,2),
  discount_amount DECIMAL(10,2)
);

-- Events and Rewards
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  scope VARCHAR(50),
  target_ids JSONB,
  rules JSONB,
  prizes JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_participants (
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(id),
  student_id INT REFERENCES users(id),
  score INT,
  rank INT,
  reward_earned JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace
CREATE TABLE marketplace_items (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  preview TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'VND',
  author_id INT REFERENCES users(id),
  author_type VARCHAR(50),
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  total_purchases INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending_review',
  ai_review_status VARCHAR(50) DEFAULT 'pending',
  human_review_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE marketplace_purchases (
  id SERIAL PRIMARY KEY,
  item_id INT REFERENCES marketplace_items(id),
  buyer_id INT REFERENCES users(id),
  buyer_type VARCHAR(50),
  price_paid DECIMAL(10,2),
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE marketplace_reviews (
  id SERIAL PRIMARY KEY,
  item_id INT REFERENCES marketplace_items(id),
  user_id INT REFERENCES users(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Review
CREATE TABLE content_reviews (
  id SERIAL PRIMARY KEY,
  content_id INT NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  submitted_by INT REFERENCES users(id),
  reviewer_id INT REFERENCES users(id),
  ai_score INT,
  ai_flags JSONB,
  ai_suggestions JSONB,
  reviewer_notes TEXT,
  decision VARCHAR(50),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Notes (for teachers)
CREATE TABLE student_notes (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id),
  teacher_id INT REFERENCES users(id),
  note_type VARCHAR(50),
  content TEXT,
  tags JSONB,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suspensions (Bảo lưu)
CREATE TABLE suspensions (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id),
  reason TEXT,
  suspended_from TIMESTAMP NOT NULL,
  suspended_to TIMESTAMP NOT NULL,
  remaining_days INT,
  status VARCHAR(50) DEFAULT 'pending',
  approved_by INT REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Study Abroad
CREATE TABLE study_abroad_applications (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id),
  agency_id INT REFERENCES agencies(id),
  consultant_id INT REFERENCES users(id),
  target_country VARCHAR(100),
  target_schools JSONB,
  application_status VARCHAR(50) DEFAULT 'draft',
  documents JSONB,
  financial_plan JSONB,
  timeline JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consultations (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id),
  consultant_id INT REFERENCES users(id),
  scheduled_at TIMESTAMP NOT NULL,
  duration INT DEFAULT 60,
  type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  call_summary TEXT,
  action_items JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE school_partnerships (
  id SERIAL PRIMARY KEY,
  agency_id INT REFERENCES agencies(id),
  school_name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  programs JSONB,
  admission_requirements JSONB,
  tuition_fees JSONB,
  contact_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consents
CREATE TABLE consents (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  consent_type VARCHAR(100) NOT NULL,
  purpose VARCHAR(255),
  granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMP,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Messages
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT REFERENCES users(id),
  receiver_id INT REFERENCES users(id),
  message TEXT NOT NULL,
  attachments JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agencies
CREATE TABLE agencies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  logo_url VARCHAR(500),
  website VARCHAR(255),
  business_license VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 Implementation Priority

### Phase 1 - Core Features (Month 1-2)
1. ✅ Center authentication & registration
2. ✅ Basic dashboard (Center, Teacher)
3. ✅ Student management
4. ✅ Class management
5. ✅ Basic reporting

### Phase 2 - Content Management (Month 3-4)
1. ✅ Curriculum management
2. ✅ AI content review
3. ✅ Homework management
4. ✅ Marketplace basic

### Phase 3 - Analytics & Advanced Features (Month 5-6)
1. ✅ Advanced analytics
2. ✅ Ranking systems
3. ✅ Event management
4. ✅ Rewards system

### Phase 4 - Agency & Study Abroad (Month 7-8)
1. ✅ Agency dashboard
2. ✅ Study abroad portal
3. ✅ Enquiry management
4. ✅ AI consultation features

---

## 🔗 API Endpoints Structure

```
/api/v1/web/
  /center/
    /auth/
    /dashboard/
    /students/
    /teachers/
    /classes/
    /branches/
    /curriculum/
    /reports/
    /marketplace/
    /events/
    /offers/

  /teacher/
    /auth/
    /dashboard/
    /students/
    /curriculum/
    /homework/
    /notes/
    /reports/

  /reviewer/
    /auth/
    /queue/
    /review/
    /history/

  /agency/
    /auth/
    /dashboard/
    /centers/
    /packages/
    /content/
    /marketplace/
    /students/
    /events/
    /study-abroad/
    /consultations/
    /enquiries/
```

---

**Status:** 📋 Requirements Documented
**Next Steps:**
1. Review and confirm requirements with stakeholders
2. Create detailed technical specifications
3. Design database schema
4. Create API documentation
5. Start Phase 1 implementation

---

**Last Updated:** 2025-01-13

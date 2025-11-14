# React Frontend Expert Guidelines - Story Quest Web Dashboard

## 🎯 App Overview

Story Quest Web Dashboard is a multi-role admin panel built with React + TypeScript for managing the English learning platform. The frontend serves 4 distinct web roles with role-based dashboards.

**Backend Integration:** This React app consumes the NestJS API documented in `CLAUDE.md`. All backend endpoints, authentication, and business logic are defined in the backend project.

**Requirements Reference:** See `docs/WEB_DASHBOARD_REQUIREMENTS.md` for complete feature specifications, business logic, and user workflows.

### 🎭 Four Web Roles

```
┌─────────────────────────────────────┐
│  AGENCY (Super Admin)               │
│  /agency/* routes                   │
│  - System-wide management           │
│  - Content review oversight         │
│  - Study abroad management          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  CENTER (Organization Admin)         │
│  /center/* routes                    │
│  - Center & branch management       │
│  - Student analytics (read-only)    │
│  - Teacher & class management       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  TEACHER (Instructor)                │
│  /teacher/* routes                   │
│  - Content creation                 │
│  - Student notes & progress         │
│  - Homework management              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  REVIEWER (Content Moderator)        │
│  /reviewer/* routes                  │
│  - Content review queue             │
│  - Approval/rejection workflow      │
└─────────────────────────────────────┘
```

**⚠️ IMPORTANT:** Students use **MOBILE APP ONLY** (React Native/Flutter), NOT this web dashboard.

---

## 🏗️ Tech Stack

### Core Technologies
- **React 18+**: Latest React with Hooks, Suspense, Concurrent features
- **TypeScript 5+**: Strict mode enabled
- **Vite 5+**: Fast build tool and dev server
- **React Router v6**: Client-side routing with nested routes
- **React Query (TanStack Query) v5**: Server state management
- **Zustand**: Lightweight client state management
- **Ant Design 5**: UI component library (enterprise-grade)
- **Axios**: HTTP client with interceptors
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **date-fns**: Date manipulation
- **Recharts**: Chart library for analytics
- **i18next**: Internationalization (Vietnamese + English)

### Development Tools
- **ESLint**: Code linting with React + TypeScript rules
- **Prettier**: Code formatting
- **Vitest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **MSW (Mock Service Worker)**: API mocking for tests

### Build & Deployment
- **Vite**: Production build
- **Docker**: Containerization
- **Nginx**: Static file serving
- **Vercel/Netlify**: Hosting options

---

## 📁 Project Structure

```
react-dashboard/
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── locales/
│       ├── en/
│       │   └── translation.json
│       └── vi/
│           └── translation.json
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component
│   ├── vite-env.d.ts               # Vite type definitions
│   │
│   ├── config/
│   │   ├── constants.ts            # App constants
│   │   ├── env.ts                  # Environment variables
│   │   └── routes.ts               # Route constants
│   │
│   ├── types/
│   │   ├── api.types.ts            # API response types
│   │   ├── user.types.ts           # User & role types
│   │   ├── center.types.ts         # Center domain types
│   │   ├── teacher.types.ts        # Teacher domain types
│   │   ├── student.types.ts        # Student domain types
│   │   └── index.ts                # Type exports
│   │
│   ├── api/
│   │   ├── client.ts               # Axios instance & interceptors
│   │   ├── endpoints.ts            # API endpoint constants
│   │   ├── auth.api.ts             # Auth API calls
│   │   ├── center.api.ts           # Center API calls
│   │   ├── teacher.api.ts          # Teacher API calls
│   │   ├── student.api.ts          # Student API calls
│   │   ├── curriculum.api.ts       # Curriculum API calls
│   │   └── index.ts                # API exports
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Authentication hook
│   │   ├── useCurrentUser.ts      # Current user hook
│   │   ├── usePermission.ts       # Permission check hook
│   │   ├── useDebounce.ts         # Debounce hook
│   │   ├── useLocalStorage.ts     # Local storage hook
│   │   └── queries/
│   │       ├── useStudents.ts     # Student queries
│   │       ├── useCenters.ts      # Center queries
│   │       ├── useClasses.ts      # Class queries
│   │       └── index.ts           # Query hook exports
│   │
│   ├── stores/
│   │   ├── authStore.ts           # Auth state (Zustand)
│   │   ├── uiStore.ts             # UI state (sidebar, theme)
│   │   └── index.ts               # Store exports
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   ├── Card/
│   │   │   ├── Loading/
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── LoadingOverlay.tsx
│   │   │   │   └── index.ts
│   │   │   └── ErrorBoundary/
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── DashboardLayout/
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── index.ts
│   │   │   ├── AuthLayout/
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   └── index.ts
│   │   │   └── ProtectedRoute/
│   │   │       ├── ProtectedRoute.tsx
│   │   │       ├── RoleGuard.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── forms/
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.schema.ts  # Zod schema
│   │   │   │   └── index.ts
│   │   │   ├── StudentForm/
│   │   │   ├── ClassForm/
│   │   │   └── CurriculumForm/
│   │   │
│   │   └── features/
│   │       ├── dashboard/
│   │       │   ├── StatCard.tsx
│   │       │   ├── ProgressChart.tsx
│   │       │   └── RecentActivity.tsx
│   │       ├── students/
│   │       │   ├── StudentList.tsx
│   │       │   ├── StudentDetail.tsx
│   │       │   ├── StudentProgress.tsx
│   │       │   └── StudentNotes.tsx
│   │       ├── classes/
│   │       │   ├── ClassList.tsx
│   │       │   ├── ClassDetail.tsx
│   │       │   └── ClassAssignment.tsx
│   │       └── curriculum/
│   │           ├── CurriculumList.tsx
│   │           ├── CurriculumEditor.tsx
│   │           └── ContentReview.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   │
│   │   ├── agency/
│   │   │   ├── AgencyDashboard.tsx
│   │   │   ├── CenterManagement.tsx
│   │   │   ├── ContentReview.tsx
│   │   │   ├── MarketplaceManagement.tsx
│   │   │   ├── StudentAnalytics.tsx
│   │   │   ├── EventManagement.tsx
│   │   │   └── StudyAbroadManagement.tsx
│   │   │
│   │   ├── center/
│   │   │   ├── CenterDashboard.tsx
│   │   │   ├── BranchManagement.tsx
│   │   │   ├── ClassManagement.tsx
│   │   │   ├── TeacherManagement.tsx
│   │   │   ├── StudentList.tsx          # Read-only + giftcodes
│   │   │   ├── CurriculumManagement.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── GiftcodeManagement.tsx
│   │   │   └── Settings.tsx
│   │   │
│   │   ├── teacher/
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── MyStudents.tsx           # Read-only + notes
│   │   │   ├── StudentNotes.tsx
│   │   │   ├── MyCurriculum.tsx
│   │   │   ├── HomeworkManagement.tsx
│   │   │   ├── ContentCreation.tsx
│   │   │   └── Reports.tsx
│   │   │
│   │   ├── reviewer/
│   │   │   ├── ReviewerDashboard.tsx
│   │   │   ├── ReviewQueue.tsx
│   │   │   ├── ReviewDetail.tsx
│   │   │   ├── ReviewHistory.tsx
│   │   │   └── ChatSupport.tsx
│   │   │
│   │   ├── common/
│   │   │   ├── NotFoundPage.tsx
│   │   │   ├── UnauthorizedPage.tsx
│   │   │   └── ErrorPage.tsx
│   │   │
│   │   └── index.ts
│   │
│   ├── routes/
│   │   ├── index.tsx                   # Main router
│   │   ├── AgencyRoutes.tsx           # Agency sub-routes
│   │   ├── CenterRoutes.tsx           # Center sub-routes
│   │   ├── TeacherRoutes.tsx          # Teacher sub-routes
│   │   └── ReviewerRoutes.tsx         # Reviewer sub-routes
│   │
│   ├── utils/
│   │   ├── auth.utils.ts              # JWT decode, token management
│   │   ├── date.utils.ts              # Date formatting helpers
│   │   ├── number.utils.ts            # Number formatting
│   │   ├── validation.utils.ts        # Validation helpers
│   │   ├── storage.utils.ts           # Local/Session storage
│   │   └── permission.utils.ts        # Permission check utilities
│   │
│   ├── styles/
│   │   ├── global.css                 # Global styles
│   │   ├── variables.css              # CSS variables
│   │   ├── theme.ts                   # Ant Design theme config
│   │   └── animations.css             # Animation keyframes
│   │
│   └── tests/
│       ├── setup.ts                   # Test setup
│       ├── mocks/
│       │   ├── handlers.ts            # MSW handlers
│       │   └── data.ts                # Mock data
│       └── utils.tsx                  # Test utilities
│
├── .env.example
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── README.md
```

---

## 🔐 Authentication Flow

### JWT Token Management

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage');
      },

      clearAuth: () => set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### Axios Interceptors

```typescript
// src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { refreshTokenApi } from './auth.api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add access token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token API
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          await refreshTokenApi(refreshToken);

        // Update tokens in store
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### Login Flow

```typescript
// src/api/auth.api.ts
import { apiClient } from './client';
import type { LoginDto, LoginResponse, RefreshTokenResponse } from '@/types';

export const loginApi = async (credentials: LoginDto): Promise<LoginResponse> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    credentials
  );
  return response.data.data;
};

export const refreshTokenApi = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
    '/auth/refresh',
    { refreshToken }
  );
  return response.data.data;
};

export const logoutApi = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

export const getCurrentUserApi = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return response.data.data;
};
```

```typescript
// src/hooks/useAuth.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginApi, logoutApi, getCurrentUserApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const navigate = useNavigate();
  const { setTokens, setUser, logout: logoutStore } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);

      // Redirect based on role
      switch (data.user.role) {
        case 'agency':
          navigate('/agency/dashboard');
          break;
        case 'center':
          navigate('/center/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'reviewer':
          navigate('/reviewer/dashboard');
          break;
        case 'student':
          // Students should NOT access web dashboard
          throw new Error('Please use the mobile app');
        default:
          navigate('/');
      }
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      logoutStore();
      navigate('/login');
    },
  });

  // Get current user query
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserApi,
    enabled: !!useAuthStore.getState().accessToken,
    retry: false,
  });

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    currentUser,
    isLoading,
    isAuthenticated: useAuthStore((state) => state.isAuthenticated),
  };
};
```

---

## 🛡️ Role-Based Access Control (RBAC)

### Protected Routes

```typescript
// src/components/layout/ProtectedRoute/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/Loading';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
```

```typescript
// src/components/layout/ProtectedRoute/RoleGuard.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
```

### Router Configuration

```typescript
// src/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RoleGuard } from '@/components/layout/ProtectedRoute/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Import pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { NotFoundPage } from '@/pages/common/NotFoundPage';
import { UnauthorizedPage } from '@/pages/common/UnauthorizedPage';

// Import role-specific routes
import { agencyRoutes } from './AgencyRoutes';
import { centerRoutes } from './CenterRoutes';
import { teacherRoutes } from './TeacherRoutes';
import { reviewerRoutes } from './ReviewerRoutes';

export const router = createBrowserRouter([
  // Public routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // Redirect root to appropriate dashboard
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },

          // Agency routes (super admin only)
          {
            path: '/agency/*',
            element: <RoleGuard allowedRoles={['agency']} />,
            children: agencyRoutes,
          },

          // Center routes (center admin only)
          {
            path: '/center/*',
            element: <RoleGuard allowedRoles={['center']} />,
            children: centerRoutes,
          },

          // Teacher routes (teacher only)
          {
            path: '/teacher/*',
            element: <RoleGuard allowedRoles={['teacher']} />,
            children: teacherRoutes,
          },

          // Reviewer routes (reviewer only)
          {
            path: '/reviewer/*',
            element: <RoleGuard allowedRoles={['reviewer']} />,
            children: reviewerRoutes,
          },
        ],
      },
    ],
  },

  // Error pages
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
```

```typescript
// src/routes/CenterRoutes.tsx
import { RouteObject } from 'react-router-dom';
import { CenterDashboard } from '@/pages/center/CenterDashboard';
import { BranchManagement } from '@/pages/center/BranchManagement';
import { ClassManagement } from '@/pages/center/ClassManagement';
import { StudentList } from '@/pages/center/StudentList';
// ... other imports

export const centerRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: <CenterDashboard />,
  },
  {
    path: 'branches',
    element: <BranchManagement />,
  },
  {
    path: 'classes',
    element: <ClassManagement />,
  },
  {
    path: 'students',
    element: <StudentList />,  // Read-only for centers
  },
  {
    path: 'teachers',
    element: <TeacherManagement />,
  },
  {
    path: 'curriculum',
    element: <CurriculumManagement />,
  },
  {
    path: 'giftcodes',
    element: <GiftcodeManagement />,
  },
  {
    path: 'reports',
    element: <Reports />,
  },
  {
    path: 'settings',
    element: <Settings />,
  },
];
```

### Permission Hook

```typescript
// src/hooks/usePermission.ts
import { useAuth } from './useAuth';
import { UserRole } from '@/types';

interface PermissionMap {
  students: {
    view: UserRole[];
    create: UserRole[];
    edit: UserRole[];
    delete: UserRole[];
    addNotes: UserRole[];
  };
  teachers: {
    view: UserRole[];
    create: UserRole[];
    edit: UserRole[];
    delete: UserRole[];
  };
  curriculum: {
    view: UserRole[];
    create: UserRole[];
    edit: UserRole[];
    delete: UserRole[];
    publish: UserRole[];
  };
  // ... more permissions
}

const PERMISSIONS: PermissionMap = {
  students: {
    view: ['agency', 'center', 'teacher'],
    create: [], // NO ONE can create students via web (mobile only)
    edit: [], // Students edit their own info via mobile
    delete: ['agency'], // Only super admin can delete
    addNotes: ['teacher', 'center'], // Teachers and centers can add notes
  },
  teachers: {
    view: ['agency', 'center'],
    create: ['agency', 'center'],
    edit: ['agency', 'center'],
    delete: ['agency', 'center'],
  },
  curriculum: {
    view: ['agency', 'center', 'teacher'],
    create: ['agency', 'center', 'teacher'],
    edit: ['agency', 'center', 'teacher'],
    delete: ['agency', 'center'],
    publish: ['agency', 'center'],
  },
};

export const usePermission = () => {
  const { currentUser } = useAuth();

  const can = (resource: keyof PermissionMap, action: string): boolean => {
    if (!currentUser) return false;

    const resourcePermissions = PERMISSIONS[resource];
    if (!resourcePermissions) return false;

    const allowedRoles = resourcePermissions[action as keyof typeof resourcePermissions];
    if (!allowedRoles) return false;

    return allowedRoles.includes(currentUser.role);
  };

  return { can };
};
```

---

## 📊 React Query Patterns

### Query Configuration

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 0,
    },
  },
});

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
);
```

### Query Hooks Pattern

```typescript
// src/hooks/queries/useStudents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentsApi, getStudentByIdApi, transferStudentApi } from '@/api/student.api';
import type { Student, PaginationParams, TransferStudentDto } from '@/types';

// Query keys factory
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters: PaginationParams) => [...studentKeys.lists(), filters] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: number) => [...studentKeys.details(), id] as const,
};

// Get students list (with pagination & filters)
export const useStudents = (params: PaginationParams) => {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => getStudentsApi(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
};

// Get single student
export const useStudent = (id: number, enabled = true) => {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => getStudentByIdApi(id),
    enabled: enabled && !!id,
  });
};

// Transfer student mutation
export const useTransferStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferStudentDto) => transferStudentApi(data),
    onSuccess: () => {
      // Invalidate students list to refetch
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
};
```

### Usage in Components

```typescript
// src/pages/center/StudentList.tsx
import { useState } from 'react';
import { Table, Button, Space, Input } from 'antd';
import { useStudents } from '@/hooks/queries/useStudents';
import { useDebounce } from '@/hooks/useDebounce';
import type { Student } from '@/types';

export const StudentList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, error } = useStudents({
    page,
    limit: 20,
    search: debouncedSearch,
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Class',
      dataIndex: ['class', 'name'],
      key: 'class',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Student) => (
        <Space>
          <Button type="link" onClick={() => handleViewDetails(record.id)}>
            View
          </Button>
        </Space>
      ),
    },
  ];

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.meta?.total,
          onChange: (newPage) => setPage(newPage),
        }}
      />
    </div>
  );
};
```

---

## 📝 Form Management with React Hook Form + Zod

### Form Schema Pattern

```typescript
// src/components/forms/LoginForm/LoginForm.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or username is required')
    .refine(
      (val) => val.includes('@') || val.length >= 3,
      'Invalid email or username'
    ),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### Form Component Pattern

```typescript
// src/components/forms/LoginForm/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Button, Alert } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, LoginFormData } from './LoginForm.schema';

export const LoginForm = () => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert
          message={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form.Item
        label="Email or Username"
        validateStatus={errors.identifier ? 'error' : ''}
        help={errors.identifier?.message}
      >
        <Input
          {...register('identifier')}
          placeholder="Enter email or username"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Password"
        validateStatus={errors.password ? 'error' : ''}
        help={errors.password?.message}
      >
        <Input.Password
          {...register('password')}
          placeholder="Enter password"
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          size="large"
          block
        >
          Login
        </Button>
      </Form.Item>
    </form>
  );
};
```

### Complex Form Example (Class Creation)

```typescript
// src/components/forms/ClassForm/ClassForm.schema.ts
import { z } from 'zod';

export const classSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(255),
  gradeId: z.number().int().positive('Grade is required'),
  branchId: z.number().int().positive('Branch is required'),
  teacherId: z.number().int().positive('Teacher is required').nullable(),
  maxStudents: z.number().int().min(1).max(100).default(30),
  schedule: z
    .object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
    })
    .array()
    .optional(),
});

export type ClassFormData = z.infer<typeof classSchema>;
```

```typescript
// src/components/forms/ClassForm/ClassForm.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Select, InputNumber, Button } from 'antd';
import { classSchema, ClassFormData } from './ClassForm.schema';
import { useGrades } from '@/hooks/queries/useGrades';
import { useBranches } from '@/hooks/queries/useBranches';
import { useTeachers } from '@/hooks/queries/useTeachers';

interface ClassFormProps {
  initialValues?: Partial<ClassFormData>;
  onSubmit: (data: ClassFormData) => Promise<void>;
  onCancel: () => void;
}

export const ClassForm: React.FC<ClassFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const { data: grades } = useGrades();
  const { data: branches } = useBranches();
  const { data: teachers } = useTeachers();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: initialValues || {
      maxStudents: 30,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Class Name"
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
            required
          >
            <Input {...field} placeholder="e.g., Class 3A" size="large" />
          </Form.Item>
        )}
      />

      <Controller
        name="gradeId"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Grade Level"
            validateStatus={errors.gradeId ? 'error' : ''}
            help={errors.gradeId?.message}
            required
          >
            <Select
              {...field}
              placeholder="Select grade"
              size="large"
              options={grades?.data.map((g) => ({
                label: `Grade ${g.gradeLevel}`,
                value: g.id,
              }))}
            />
          </Form.Item>
        )}
      />

      <Controller
        name="branchId"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Branch"
            validateStatus={errors.branchId ? 'error' : ''}
            help={errors.branchId?.message}
            required
          >
            <Select
              {...field}
              placeholder="Select branch"
              size="large"
              options={branches?.data.map((b) => ({
                label: b.name,
                value: b.id,
              }))}
            />
          </Form.Item>
        )}
      />

      <Controller
        name="teacherId"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Assigned Teacher"
            validateStatus={errors.teacherId ? 'error' : ''}
            help={errors.teacherId?.message}
          >
            <Select
              {...field}
              placeholder="Select teacher"
              size="large"
              allowClear
              options={teachers?.data.map((t) => ({
                label: t.fullName,
                value: t.id,
              }))}
            />
          </Form.Item>
        )}
      />

      <Controller
        name="maxStudents"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Max Students"
            validateStatus={errors.maxStudents ? 'error' : ''}
            help={errors.maxStudents?.message}
          >
            <InputNumber
              {...field}
              min={1}
              max={100}
              size="large"
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}
      />

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {initialValues ? 'Update' : 'Create'} Class
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </form>
  );
};
```

---

## 🎨 Component Patterns

### Component Structure

```typescript
// src/components/features/students/StudentCard.tsx
import { Card, Tag, Button, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import type { Student } from '@/types';

const { Text } = Typography;

interface StudentCardProps {
  student: Student;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  showActions?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onView,
  onEdit,
  showActions = true,
}) => {
  return (
    <Card
      hoverable
      cover={
        <div style={{ padding: 24, textAlign: 'center', background: '#f0f2f5' }}>
          <UserOutlined style={{ fontSize: 48, color: '#1890ff' }} />
        </div>
      }
      actions={
        showActions
          ? [
              <Button type="link" onClick={() => onView?.(student.id)}>
                View
              </Button>,
              <Button type="link" onClick={() => onEdit?.(student.id)}>
                Notes
              </Button>,
            ]
          : undefined
      }
    >
      <Card.Meta
        title={student.fullName}
        description={
          <Space direction="vertical" size="small">
            <Text>
              <MailOutlined /> {student.email}
            </Text>
            <Text>Class: {student.class?.name || 'Not assigned'}</Text>
            <Tag color={student.status === 'active' ? 'green' : 'red'}>
              {student.status}
            </Tag>
          </Space>
        }
      />
    </Card>
  );
};
```

### Compound Component Pattern

```typescript
// src/components/common/DataTable/DataTable.tsx
import { Table, TableProps } from 'antd';
import { DataTableToolbar } from './DataTableToolbar';
import { DataTableFilters } from './DataTableFilters';

interface DataTableComposition {
  Toolbar: typeof DataTableToolbar;
  Filters: typeof DataTableFilters;
}

export const DataTable = <T extends object>(props: TableProps<T>) => {
  return <Table {...props} />;
};

DataTable.Toolbar = DataTableToolbar;
DataTable.Filters = DataTableFilters;

// Usage:
// <DataTable columns={columns} dataSource={data}>
//   <DataTable.Toolbar>
//     <DataTable.Filters />
//   </DataTable.Toolbar>
// </DataTable>
```

### Custom Hook Pattern

```typescript
// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

---

## 🗂️ Type Definitions

### API Response Types

```typescript
// src/types/api.types.ts

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    pagination?: PaginationMeta;
  };
}

// Error response
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
  meta: {
    timestamp: string;
  };
}

export interface ErrorDetail {
  field: string;
  message: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: PaginationMeta;
    timestamp: string;
  };
}
```

### Domain Types

```typescript
// src/types/user.types.ts

export type UserRole = 'agency' | 'center' | 'teacher' | 'reviewer' | 'student';

export interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDto {
  identifier: string; // email or username
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
```

```typescript
// src/types/student.types.ts

export interface Student {
  id: number;
  fullName: string;
  email: string;
  username: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  classId?: number;
  class?: {
    id: number;
    name: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  enrollmentDate: string;
  parentEmail?: string;
  parentPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgress {
  studentId: number;
  totalLevelsCompleted: number;
  averageScore: number;
  totalTimeSpent: number; // minutes
  currentStreak: number; // days
  lastAccessedAt: string;
  chapterProgress: ChapterProgress[];
}

export interface ChapterProgress {
  chapterId: number;
  chapterName: string;
  completedUnits: number;
  totalUnits: number;
  averageScore: number;
}

export interface StudentNote {
  id: number;
  studentId: number;
  teacherId: number;
  teacher: {
    id: number;
    fullName: string;
  };
  noteType: 'struggling' | 'excellent' | 'average' | 'needs_attention';
  content: string;
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransferStudentDto {
  studentId: number;
  targetClassId: number;
  reason?: string;
}
```

```typescript
// src/types/center.types.ts

export interface Center {
  id: number;
  agencyId?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  businessLicense?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: number;
  centerId: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: number;
  gradeId: number;
  branchId: number;
  name: string;
  teacherId?: number;
  teacher?: {
    id: number;
    fullName: string;
  };
  maxStudents: number;
  currentStudents: number;
  schedule?: ClassSchedule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSchedule {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface Giftcode {
  id: number;
  centerId: number;
  code: string;
  type: 'trial' | 'discount' | 'full_access';
  duration: number; // days
  maxUses: number;
  usedCount: number;
  assignedTo?: {
    classId?: number;
    gradeLevel?: number;
  };
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎭 State Management with Zustand

### UI State Store

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';

interface UiState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'vi';

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'en' | 'vi') => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  theme: 'light',
  language: 'vi',

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setTheme: (theme) => set({ theme }),

  setLanguage: (language) => set({ language }),
}));
```

---

## 🌐 Internationalization (i18n)

### i18n Configuration

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: require('../../public/locales/en/translation.json'),
      },
      vi: {
        translation: require('../../public/locales/vi/translation.json'),
      },
    },
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### Translation Files

```json
// public/locales/vi/translation.json
{
  "common": {
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    "save": "Lưu",
    "cancel": "Hủy",
    "delete": "Xóa",
    "edit": "Sửa",
    "view": "Xem",
    "search": "Tìm kiếm",
    "loading": "Đang tải...",
    "error": "Có lỗi xảy ra",
    "success": "Thành công"
  },
  "auth": {
    "loginTitle": "Đăng nhập vào hệ thống",
    "emailOrUsername": "Email hoặc tên đăng nhập",
    "password": "Mật khẩu",
    "forgotPassword": "Quên mật khẩu?",
    "loginFailed": "Đăng nhập thất bại"
  },
  "dashboard": {
    "title": "Tổng quan",
    "totalStudents": "Tổng số học sinh",
    "activeClasses": "Lớp đang hoạt động",
    "averageScore": "Điểm trung bình"
  },
  "students": {
    "title": "Quản lý học sinh",
    "addStudent": "Thêm học sinh",
    "studentList": "Danh sách học sinh",
    "studentDetails": "Chi tiết học sinh",
    "noStudents": "Chưa có học sinh nào"
  }
}
```

### Usage in Components

```typescript
// src/pages/auth/LoginPage.tsx
import { useTranslation } from 'react-i18next';

export const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('auth.loginTitle')}</h1>
      <LoginForm />
    </div>
  );
};
```

---

## 📊 Dashboard & Analytics Components

### Stat Card Component

```typescript
// src/components/features/dashboard/StatCard.tsx
import { Card, Statistic, Row, Col } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  precision?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  suffix,
  precision = 0,
  trend,
  loading = false,
}) => {
  return (
    <Card loading={loading}>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        suffix={suffix}
        valueStyle={{ color: '#1890ff' }}
      />
      {trend && (
        <div style={{ marginTop: 8 }}>
          <Statistic
            value={Math.abs(trend.value)}
            precision={1}
            suffix="%"
            prefix={trend.isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            valueStyle={{
              color: trend.isPositive ? '#3f8600' : '#cf1322',
              fontSize: 14
            }}
          />
        </div>
      )}
    </Card>
  );
};
```

### Chart Component

```typescript
// src/components/features/dashboard/ProgressChart.tsx
import { Card } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ProgressChartProps {
  data: Array<{
    date: string;
    score: number;
  }>;
  title?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data, title }) => {
  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#1890ff"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
```

---

## 🚨 Error Handling

### Error Boundary

```typescript
// src/components/common/ErrorBoundary/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Send to error monitoring service (e.g., Sentry)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="Something went wrong"
          subTitle="We're sorry for the inconvenience. Please try again."
          extra={
            <Button type="primary" onClick={this.handleReset}>
              Go Home
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```typescript
// src/utils/errorHandler.ts
import { message } from 'antd';
import type { ApiErrorResponse } from '@/types';

export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    const apiError = error.response.data as ApiErrorResponse;

    if (apiError.error?.details) {
      // Validation errors
      const firstError = apiError.error.details[0];
      message.error(`${firstError.field}: ${firstError.message}`);
      return firstError.message;
    }

    if (apiError.error?.message) {
      message.error(apiError.error.message);
      return apiError.error.message;
    }
  } else if (error.request) {
    // Request made but no response
    message.error('Network error. Please check your connection.');
    return 'Network error';
  }

  // Something else happened
  message.error('An unexpected error occurred');
  return 'Unexpected error';
};
```

---

## 🧪 Testing

### Component Test Example

```typescript
// src/components/forms/LoginForm/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders login form', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email or username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn();

    render(<LoginForm onSubmit={mockLogin} />);

    await user.type(screen.getByLabelText(/email or username/i), 'testuser@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        identifier: 'testuser@example.com',
        password: 'password123',
      });
    });
  });
});
```

### Hook Test Example

```typescript
// src/hooks/useDebounce.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('should debounce value', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Still old value

    await waitFor(() => expect(result.current).toBe('updated'), {
      timeout: 600,
    });
  });
});
```

---

## 🎨 Styling & Theming

### Ant Design Theme Configuration

```typescript
// src/styles/theme.ts
import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',

    borderRadius: 8,
    fontSize: 14,

    // Layout
    colorBgLayout: '#f0f2f5',
    colorBgContainer: '#ffffff',
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Input: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: 'rgba(0, 0, 0, 0.88)',
    },
  },
};
```

```typescript
// src/App.tsx
import { ConfigProvider } from 'antd';
import { theme } from '@/styles/theme';

export const App = () => {
  return (
    <ConfigProvider theme={theme}>
      {/* Your app */}
    </ConfigProvider>
  );
};
```

---

## 🚀 Build & Deployment

### Environment Variables

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Story Quest Dashboard
VITE_APP_VERSION=1.0.0
```

```bash
# .env.production
VITE_API_BASE_URL=https://api.storyquest.com/api/v1
VITE_APP_NAME=Story Quest Dashboard
VITE_APP_VERSION=1.0.0
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd'],
          charts: ['recharts'],
        },
      },
    },
  },
});
```

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# nginx.conf
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  # SPA routing
  location / {
    try_files $uri $uri/ /index.html;
  }

  # API proxy (optional)
  location /api {
    proxy_pass http://backend-api:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
}
```

---

## 📋 Code Style & Conventions

### Naming Conventions

```typescript
// Components: PascalCase
export const StudentList = () => {};
export const DashboardLayout = () => {};

// Hooks: camelCase with 'use' prefix
export const useAuth = () => {};
export const useStudents = () => {};

// Utils: camelCase
export const formatDate = () => {};
export const calculatePercentage = () => {};

// Constants: UPPER_SNAKE_CASE
export const API_BASE_URL = '';
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Types/Interfaces: PascalCase
export interface User {}
export type UserRole = 'admin' | 'teacher';
```

### File Naming

```
- Components: PascalCase (StudentList.tsx)
- Hooks: camelCase (useAuth.ts)
- Utils: camelCase (formatDate.ts)
- Types: camelCase (user.types.ts)
- Pages: PascalCase (LoginPage.tsx)
- Stores: camelCase (authStore.ts)
```

### Import Order

```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Table } from 'antd';

// 2. Internal modules (absolute imports)
import { useAuth } from '@/hooks/useAuth';
import { Student } from '@/types';

// 3. Relative imports
import { StudentCard } from './StudentCard';
import styles from './StudentList.module.css';
```

---

## 🎯 Best Practices

### Performance Optimization

```typescript
// 1. Lazy load routes
const AgencyDashboard = lazy(() => import('@/pages/agency/AgencyDashboard'));

// 2. Memoize expensive calculations
const sortedStudents = useMemo(
  () => students.sort((a, b) => a.name.localeCompare(b.name)),
  [students]
);

// 3. Use React.memo for expensive components
export const StudentCard = React.memo<StudentCardProps>(({ student }) => {
  // Component logic
});

// 4. Debounce search inputs
const debouncedSearch = useDebounce(searchTerm, 500);

// 5. Virtualize long lists
import { FixedSizeList } from 'react-window';
```

### Security Best Practices

```typescript
// 1. Never store sensitive data in localStorage (use httpOnly cookies for tokens)
// 2. Sanitize user input
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirtyInput);

// 3. Validate on both client AND server
// 4. Use HTTPS in production
// 5. Implement CSRF protection
// 6. Set proper CORS headers
```

### Code Quality

```typescript
// 1. Always type your components
interface Props {
  id: number;
  name: string;
}
const Component: React.FC<Props> = ({ id, name }) => {};

// 2. Handle loading and error states
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

// 3. Use meaningful variable names
const activeStudentsCount = students.filter(s => s.status === 'active').length;

// 4. Keep components small and focused
// 5. Extract reusable logic into custom hooks
// 6. Write unit tests for critical functionality
```

---

## 📚 Documentation References

- **Requirements**: See `docs/WEB_DASHBOARD_REQUIREMENTS.md` for complete feature specifications
- **Backend API**: See `CLAUDE.md` in NestJS project for API documentation
- **API Endpoints**: See `docs/API_DESIGN_GUIDELINES.md` for RESTful conventions

---

## 🎓 Learning Resources

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **React Query**: https://tanstack.com/query/latest
- **React Router**: https://reactrouter.com/
- **Ant Design**: https://ant.design/
- **Zustand**: https://zustand-demo.pmnd.rs/
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/

---

**Last Updated:** 2025-01-13

**Version:** 1.0.0

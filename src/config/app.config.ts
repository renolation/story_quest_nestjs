import { registerAs } from '@nestjs/config';

/**
 * Application Configuration
 *
 * Centralized configuration for the entire application.
 * Uses @nestjs/config for environment variable management.
 *
 * Usage in modules:
 * constructor(@Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>) {}
 */
export default registerAs('app', () => ({
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',

  // Server
  port: parseInt(process.env.PORT, 10) || 4000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  // CORS
  corsOrigins:
    process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000', // React dev
      'http://localhost:5173', // Vite dev
      'http://localhost:8080', // Flutter web (if needed)
    ],

  // Rate Limiting
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'log',

  // Application URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  mobileAppUrl: process.env.MOBILE_APP_URL || 'storyquest://app',

  // Feature Flags (for phased rollout)
  features: {
    phase1: true, // Auth + Content browsing
    phase2: false, // Progress tracking (TODO: Enable in Phase 2)
    phase3: false, // Audio & Pronunciation (TODO: Enable in Phase 3)
    phase4: false, // Gamification (TODO: Enable in Phase 4)
    phase5: false, // AI Stories (TODO: Enable in Phase 5)
    phase6: false, // Polish & Optimization (TODO: Enable in Phase 6)
    phase7: false, // Web Dashboard (TODO: Enable in Phase 7)
  },

  // File Upload (for Phase 3 - Audio files)
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'audio/mpeg',
      'audio/wav',
      'audio/webm',
    ],
  },

  // Pagination defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },
}));

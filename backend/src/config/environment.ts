import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration object
 *
 * Centralizes all environment variables and configuration settings
 * with proper typing and validation.
 */
interface Config {
  // Application
  nodeEnv: string;
  port: number;
  apiVersion: string;

  // Database
  database: {
    url: string;
    ssl: boolean;
    pool: {
      min: number;
      max: number;
    };
  };

  // JWT
  jwt: {
    secret: string;
    refreshSecret: string;
    accessExpire: string;
    refreshExpire: string;
  };

  // CORS
  cors: {
    origin: string[];
    credentials: boolean;
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // Upload
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    storagePath: string;
  };

  // Email
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };

  // Redis
  redis: {
    url: string;
    password: string;
  };

  // Logging
  logging: {
    level: string;
    file: string;
  };

  // Security
  security: {
    bcryptRounds: number;
    sessionSecret: string;
  };

  // WebSocket
  websocket: {
    port: number;
    corsOrigin: string[];
  };
}

/**
 * Validates required environment variables
 */
function validateConfig(): void {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Parse string to array (comma-separated values)
 */
function parseStringArray(
  value: string | undefined,
  defaultValue: string[] = []
): string[] {
  if (!value) return defaultValue;
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

/**
 * Parse string to number with default
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse string to boolean
 */
function parseBoolean(
  value: string | undefined,
  defaultValue: boolean = false
): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

// Validate configuration
validateConfig();

export const config: Config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseNumber(process.env.PORT, 5000),
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  database: {
    url: process.env.DATABASE_URL!,
    ssl: parseBoolean(process.env.DATABASE_SSL),
    pool: {
      min: parseNumber(process.env.DATABASE_POOL_MIN, 2),
      max: parseNumber(process.env.DATABASE_POOL_MAX, 10),
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },

  // CORS
  cors: {
    origin: parseStringArray(process.env.CORS_ORIGIN, [
      'http://localhost:19006',
    ]),
    credentials: parseBoolean(process.env.CORS_CREDENTIALS, true),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000), // 15 minutes
    maxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
  },

  // Upload
  upload: {
    maxFileSize: parseNumber(process.env.UPLOAD_MAX_FILE_SIZE, 5242880), // 5MB
    allowedTypes: parseStringArray(process.env.UPLOAD_ALLOWED_TYPES, [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]),
    storagePath: process.env.STORAGE_PATH || 'uploads/',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseNumber(process.env.SMTP_PORT, 587),
    secure: parseBoolean(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  // Security
  security: {
    bcryptRounds: parseNumber(process.env.BCRYPT_ROUNDS, 12),
    sessionSecret: process.env.SESSION_SECRET || 'default-session-secret',
  },

  // WebSocket
  websocket: {
    port: parseNumber(process.env.WEBSOCKET_PORT, 5001),
    corsOrigin: parseStringArray(process.env.WEBSOCKET_CORS_ORIGIN, [
      'http://localhost:19006',
    ]),
  },
};

/**
 * Export individual config sections for convenience
 */
export const {
  nodeEnv,
  port,
  apiVersion,
  database,
  jwt,
  cors,
  rateLimit,
  upload,
  email,
  redis,
  logging,
  security,
  websocket,
} = config;

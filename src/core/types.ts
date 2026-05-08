import { NextRequest } from "next/server";

/* ===================== */
/* Auth */
/* ===================== */
//auth context on is authenticated and role and userid and raw,
export interface AuthContext {
  isAuthenticated?: boolean;
  role?: string;
  userId?: string | number;
  raw?: unknown;
}

/* ===================== */
/* Middleware */
/* ===================== */

export type CrudMiddleware = (
  args: any,
  ctx: CrudContext
) => Promise<void>;

/* ===================== */
/* Rate Limit */
/* ===================== */

export interface RateLimitMeta {
  model: string;
  action: string;
  isWrite: boolean;
}

export interface RateLimitResult {
  ok: boolean;
  remaining?: number;
  reset?: number;
}

export type RateLimiter = (
  key: string,
  meta: RateLimitMeta
) => Promise<RateLimitResult>;

/* ===================== */
/* Meta */
/* ===================== */

export interface CrudMeta {
  model?: string;

  actions: string[];

  protectedFields?: string[];

  restricted?: Record<string, string | string[]>;

  allowGuestCreate?: boolean;

  /**
   * Per-model rate limit config
   */
  rateLimit?: {
    enabled?: boolean;
  };

  /**
   * Per-model middleware
   */
  middleware?: CrudMiddleware[];
}

/* ===================== */
/* Context */
/* ===================== */

export interface CrudContext {
  auth?: AuthContext;
  req: NextRequest;
  logger?: Console;
}

/* ===================== */
/* Registry */
/* ===================== */

export interface CrudModule {
  meta: CrudMeta;
  [key: string]: any;
}

export type CrudRegistry = Record<
  string,
  {
    module: CrudModule;
    meta: CrudMeta;
  }
>;

/* ===================== */
/* Handler Options */
/* ===================== */

export interface CreateCrudHandlerOptions {
  registry: CrudRegistry;
  resolveAuth?: (req: NextRequest) => Promise<AuthContext | null>;
  rateLimit?: RateLimiter | false;
  middleware?: CrudMiddleware[];
  logger?: Console;
}

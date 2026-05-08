// src/types/index.ts




export type SessionLike = any;

export interface CrudContext {
    prisma: any;
    session?: SessionLike | null;
    logger?: Console;
}

export type ActionName = string;

export interface CrudMeta {
    model?: string;
    actions: ActionName[];
    protectedFields?: string[];
    restricted?: Record<string, string | string[]>;
    allowGuestCreate?: boolean;
}

export interface CrudRegistryEntry {
    module: Record<string, Function | undefined>;
    meta?: CrudMeta;
}

export type CrudRegistry = Record<string, CrudRegistryEntry>;

export interface RateLimitResult {
    ok: boolean;
    remaining?: number;
}

export type RateLimitFn = (key: string, limit?: number, windowSec?: number) => RateLimitResult;

export interface AuthProvider {
    getSession: () => Promise<any>;
}

export interface CrudHandlerOptions {
    registry: CrudRegistry;
    prisma: any;
    auth?: AuthProvider;
    rateLimit?: RateLimitFn;
    logger?: Console;
    rateLimitOptions?: { limit?: number; windowSec?: number };
    defaultRateLimit?: { limit: number; windowSec: number };
}

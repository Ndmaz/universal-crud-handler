import {
  CreateCrudHandlerOptions,
  CrudContext,
} from "./types";
import {
  ModelNotFoundError,
  ActionNotAllowedError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitExceededError,
} from "./errors";
import { sanitizeInput } from "../helpers/sanitize";
import { resolveHandlerFunction } from "../helpers/actionResolver";

//
export async function dispatch(
  options: CreateCrudHandlerOptions,
  req: any,
  params: { model: string; action: string }
) {
  const {
    registry,
    resolveAuth,
    rateLimit,
    middleware = [],
    logger = console,
  } = options;

  const { model, action } = params;

  const entry = registry[model];
  if (!entry) throw new ModelNotFoundError(model);

  const { module, meta } = entry;

  if (!meta.actions.includes(action))
    throw new ActionNotAllowedError(action);

  const handlerFn = resolveHandlerFunction(
    module,
    action,
    model
  );

  if (!handlerFn)
    throw new ActionNotAllowedError(action);

  const auth =
    (await resolveAuth?.(req)) ?? undefined;

  const restricted = meta.restricted?.[action];
  const isWrite = ["POST", "PUT", "DELETE"].includes(
    req.method
  );

  const requiresAuth =
    restricted ||
    (isWrite && !meta.allowGuestCreate);

  if (requiresAuth && !auth?.isAuthenticated)
    throw new UnauthorizedError();

  if (restricted && auth?.role) {
    const allowedRoles = Array.isArray(restricted)
      ? restricted
      : [restricted];

    if (!allowedRoles.includes(auth.role))
      throw new ForbiddenError();
  }

  if (
    rateLimit &&
    meta.rateLimit?.enabled !== false
  ) {
    const key =
      auth?.userId?.toString() ||
      req.headers.get("x-forwarded-for") ||
      "anonymous";

    const result = await rateLimit(key, {
      model,
      action,
      isWrite,
    });

    if (!result.ok)
      throw new RateLimitExceededError();
  }

  let args =
    req.method === "GET"
      ? Object.fromEntries(
          req.nextUrl.searchParams.entries()
        )
      : await req.json().catch(() => ({}));

  args = sanitizeInput(args, meta.protectedFields);

  const ctx: CrudContext = {
    auth,
    req,
    logger,
  };

  for (const mw of middleware) {
    await mw(args, ctx);
  }

  for (const mw of meta.middleware || []) {
    await mw(args, ctx);
  }

  return handlerFn(args, ctx);
}

import { describe, expect, it, vi } from "vitest";
import { dispatch } from "../src/core/dispatcher";
import {
  ActionNotAllowedError,
  CrudError,
  ForbiddenError,
  ModelNotFoundError,
  RateLimitExceededError,
  UnauthorizedError,
} from "../src/core/errors";

function makeRequest(
  method: string,
  options: {
    query?: Record<string, string>;
    body?: unknown;
  } = {}
) {
  const query = new URLSearchParams(options.query);
  return {
    method,
    nextUrl: { searchParams: query },
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "x-forwarded-for"
          ? "127.0.0.1"
          : null,
    },
    json: vi.fn().mockResolvedValue(options.body ?? {}),
  } as any;
}

function makeRegistry(handler: (args: any, ctx: any) => unknown, overrides: any = {}) {
  const meta = {
    actions: ["create", "find", "update", "delete"],
    ...overrides,
  };

  return {
    User: {
      module: {
        meta,
        find: handler,
        create: handler,
        update: handler,
        delete: handler,
      },
      meta,
    },
  } as any;
}

const auth = (value: any) => async () => value;

describe("dispatch", () => {
  it("executes an allowed action and passes GET query parameters", async () => {
    const handler = vi.fn().mockResolvedValue({ id: 1 });
    const result = await dispatch(
      { registry: makeRegistry(handler) },
      makeRequest("GET", { query: { id: "1", q: "navid" } }),
      { model: "User", action: "find" }
    );

    expect(result).toEqual({ id: 1 });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0]).toEqual({ id: "1", q: "navid" });
  });

  it("passes non-GET JSON body to the handler", async () => {
    const handler = vi.fn().mockResolvedValue({ ok: true });
    const body = { name: "Navid" };

    await dispatch(
      { registry: makeRegistry(handler), resolveAuth: auth({ isAuthenticated: true, userId: 1 }) },
      makeRequest("POST", { body }),
      { model: "User", action: "create" }
    );

    expect(handler.mock.calls[0][0]).toEqual(body);
  });

  it("rejects an unknown model", async () => {
    await expect(
      dispatch(
        { registry: makeRegistry(vi.fn()) },
        makeRequest("GET"),
        { model: "Missing", action: "find" }
      )
    ).rejects.toBeInstanceOf(ModelNotFoundError);
  });

  it("rejects an action not declared in meta", async () => {
    await expect(
      dispatch(
        { registry: makeRegistry(vi.fn(), { actions: ["find"] }) },
        makeRequest("GET"),
        { model: "User", action: "delete" }
      )
    ).rejects.toBeInstanceOf(ActionNotAllowedError);
  });

  it("rejects a declared action with no handler", async () => {
    const registry = makeRegistry(vi.fn());
    delete registry.User.module.delete;

    await expect(
      dispatch(
        { registry },
        makeRequest("DELETE"),
        { model: "User", action: "delete" }
      )
    ).rejects.toBeInstanceOf(ActionNotAllowedError);
  });

  it("requires authentication for restricted actions", async () => {
    await expect(
      dispatch(
        {
          registry: makeRegistry(vi.fn(), { restricted: { delete: "ADMIN" } }),
          resolveAuth: auth(null),
        },
        makeRequest("DELETE"),
        { model: "User", action: "delete" }
      )
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejects an authenticated user with a disallowed role", async () => {
    await expect(
      dispatch(
        {
          registry: makeRegistry(vi.fn(), { restricted: { delete: "ADMIN" } }),
          resolveAuth: auth({ isAuthenticated: true, role: "USER" }),
        },
        makeRequest("DELETE"),
        { model: "User", action: "delete" }
      )
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects an authenticated user with no role", async () => {
    await expect(
      dispatch(
        {
          registry: makeRegistry(vi.fn(), { restricted: { delete: "ADMIN" } }),
          resolveAuth: auth({ isAuthenticated: true }),
        },
        makeRequest("DELETE"),
        { model: "User", action: "delete" }
      )
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("accepts an authenticated user with an allowed role", async () => {
    const handler = vi.fn().mockResolvedValue({ ok: true });

    await expect(
      dispatch(
        {
          registry: makeRegistry(handler, { restricted: { delete: ["ADMIN", "OWNER"] } }),
          resolveAuth: auth({ isAuthenticated: true, role: "OWNER" }),
        },
        makeRequest("DELETE"),
        { model: "User", action: "delete" }
      )
    ).resolves.toEqual({ ok: true });
  });

  it("allows guest create when explicitly configured", async () => {
    const handler = vi.fn().mockResolvedValue({ created: true });

    await expect(
      dispatch(
        {
          registry: makeRegistry(handler, { allowGuestCreate: true }),
        },
        makeRequest("POST", { body: { name: "guest" } }),
        { model: "User", action: "create" }
      )
    ).resolves.toEqual({ created: true });
  });

  it("does not make update guest-accessible when guest create is enabled", async () => {
    await expect(
      dispatch(
        {
          registry: makeRegistry(vi.fn(), { allowGuestCreate: true }),
        },
        makeRequest("PUT", { body: { name: "guest" } }),
        { model: "User", action: "update" }
      )
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("does not make delete guest-accessible when guest create is enabled", async () => {
    await expect(
      dispatch(
        {
          registry: makeRegistry(vi.fn(), { allowGuestCreate: true }),
        },
        makeRequest("DELETE"),
        { model: "User", action: "delete" }
      )
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("runs global middleware before model middleware", async () => {
    const order: string[] = [];
    const handler = vi.fn().mockResolvedValue({ ok: true });

    await dispatch(
      {
        registry: makeRegistry(handler, {
          middleware: [
            async () => {
              order.push("model");
            },
          ],
        }),
        middleware: [
          async () => {
            order.push("global");
          },
        ],
        resolveAuth: auth({ isAuthenticated: true, userId: 1 }),
      },
      makeRequest("POST", { body: {} }),
      { model: "User", action: "create" }
    );

    expect(order).toEqual(["global", "model"]);
  });

  it("passes the same mutable args object through middleware and handler", async () => {
    const handler = vi.fn().mockResolvedValue({ ok: true });

    await dispatch(
      {
        registry: makeRegistry(handler),
        middleware: [
          async (args) => {
            args.injected = "yes";
          },
        ],
        resolveAuth: auth({ isAuthenticated: true, userId: 1 }),
      },
      makeRequest("POST", { body: { original: true } }),
      { model: "User", action: "create" }
    );

    expect(handler.mock.calls[0][0]).toEqual({
      original: true,
      injected: "yes",
    });
  });

  it("passes auth and request through the handler context", async () => {
    const handler = vi.fn().mockResolvedValue({ ok: true });
    const request = makeRequest("GET");
    const authContext = {
      isAuthenticated: true,
      role: "ADMIN",
      userId: 42,
    };

    await dispatch(
      {
        registry: makeRegistry(handler),
        resolveAuth: auth(authContext),
      },
      request,
      { model: "User", action: "find" }
    );

    expect(handler.mock.calls[0][1].auth).toEqual(authContext);
    expect(handler.mock.calls[0][1].req).toBe(request);
  });

  it("rejects requests when the rate limiter denies them", async () => {
    const handler = vi.fn();
    const rateLimit = vi.fn().mockResolvedValue({ ok: false });

    await expect(
      dispatch(
        {
          registry: makeRegistry(handler),
          rateLimit,
        },
        makeRequest("GET"),
        { model: "User", action: "find" }
      )
    ).rejects.toBeInstanceOf(RateLimitExceededError);

    expect(handler).not.toHaveBeenCalled();
  });

  it("passes rate-limit metadata to the limiter", async () => {
    const handler = vi.fn().mockResolvedValue({ ok: true });
    const rateLimit = vi.fn().mockResolvedValue({ ok: true });

    await dispatch(
      {
        registry: makeRegistry(handler),
        resolveAuth: auth({ isAuthenticated: true, userId: 42 }),
        rateLimit,
      },
      makeRequest("POST", { body: {} }),
      { model: "User", action: "create" }
    );

    expect(rateLimit).toHaveBeenCalledWith(
      "127.0.0.1",
      { model: "User", action: "create", isWrite: true }
    );
  });

  it("sanitizes protected fields before the handler", async () => {
    const handler = vi.fn().mockResolvedValue({ ok: true });

    await dispatch(
      {
        registry: makeRegistry(handler, {
          protectedFields: ["password"],
        }),
        resolveAuth: auth({ isAuthenticated: true, userId: 1 }),
      },
      makeRequest("POST", {
        body: {
          name: "Navid",
          password: "secret",
          profile: { password: "nested-secret" },
        },
      }),
      { model: "User", action: "create" }
    );

    expect(handler.mock.calls[0][0]).toEqual({
      name: "Navid",
      profile: {},
    });
  });

  it("sanitizes protected fields after the handler", async () => {
    const handler = vi.fn().mockResolvedValue({
      id: 1,
      password: "secret",
      profile: {
        name: "Navid",
        password: "nested-secret",
      },
    });

    await expect(
      dispatch(
        {
          registry: makeRegistry(handler, {
            protectedFields: ["password"],
          }),
        },
        makeRequest("GET"),
        { model: "User", action: "find" }
      )
    ).resolves.toEqual({
      id: 1,
      profile: { name: "Navid" },
    });
  });

  it("propagates CrudError from the handler", async () => {
    const error = new CrudError("Business rule failed", 422);
    const handler = vi.fn().mockRejectedValue(error);

    await expect(
      dispatch(
        { registry: makeRegistry(handler) },
        makeRequest("GET"),
        { model: "User", action: "find" }
      )
    ).rejects.toBe(error);
  });
});

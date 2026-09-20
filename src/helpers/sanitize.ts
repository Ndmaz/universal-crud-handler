export function sanitizeInput(
  data: unknown,
  protectedFields?: string[]
) {
  return sanitize(data, protectedFields);
}

export function sanitizeOutput(
  data: unknown,
  protectedFields?: string[]
) {
  return sanitize(data, protectedFields);
}

function sanitize(
  data: unknown,
  protectedFields?: string[]
): unknown {
  if (!protectedFields?.length || data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item, protectedFields));
  }

  if (!isPlainObject(data)) {
    return data;
  }

  const clone: Record<string, unknown> = { ...data };

  for (const field of protectedFields) {
    delete clone[field];
  }

  for (const [key, value] of Object.entries(clone)) {
    clone[key] = sanitize(value, protectedFields);
  }

  return clone;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

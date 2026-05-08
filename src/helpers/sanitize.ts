export function sanitizeInput(
  data: any,
  protectedFields?: string[]
) {
  if (!data || typeof data !== "object") return data;
  if (!protectedFields?.length) return data;

  const clone = { ...data };
  for (const field of protectedFields) {
    delete clone[field];
  }

  return clone;
}

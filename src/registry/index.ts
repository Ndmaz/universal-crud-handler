import { CrudModule, CrudRegistry } from "../core/types";

export function defineCrudModule<T extends CrudModule>(
  module: T
): T {
  return module;
}

export function createRegistry(
  modules: Record<string, CrudModule>
): CrudRegistry {
  const registry: CrudRegistry = {};

  for (const key in modules) {
    registry[key] = {
      module: modules[key],
      meta: modules[key].meta,
    };
  }

  return registry;
}

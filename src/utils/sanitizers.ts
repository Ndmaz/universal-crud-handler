// src/utils/sanitizers.ts
export function omit(obj: any, keys: string[]) {
    if (!obj) return obj;
    const out = { ...obj };
    for (const k of keys) {
        if (Object.prototype.hasOwnProperty.call(out, k)) delete out[k];
    }
    return out;
}

export function pick(obj: any, keys: string[]) {
    const out: any = {};
    for (const k of keys) if (obj && Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
    return out;
}

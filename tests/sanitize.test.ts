import { describe, expect, it } from "vitest";
import { sanitizeInput, sanitizeOutput } from "../src/helpers/sanitize";

describe("sanitize", () => {
  it("removes protected fields recursively from input", () => {
    const input = {
      id: 1,
      password: "secret",
      profile: { password: "nested-secret" },
      items: [{ password: "array-secret", name: "item" }],
    };

    expect(sanitizeInput(input, ["password"])).toEqual({
      id: 1,
      profile: {},
      items: [{ name: "item" }],
    });
  });

  it("removes protected fields recursively from output", () => {
    const output = {
      id: 1,
      password: "secret",
      profile: { password: "nested-secret", name: "Navid" },
      items: [{ password: "array-secret", name: "item" }],
    };

    expect(sanitizeOutput(output, ["password"])).toEqual({
      id: 1,
      profile: { name: "Navid" },
      items: [{ name: "item" }],
    });
  });

  it("does not alter values when no protected fields are configured", () => {
    const value = { id: 1, nested: { value: true } };
    expect(sanitizeOutput(value)).toBe(value);
  });
});

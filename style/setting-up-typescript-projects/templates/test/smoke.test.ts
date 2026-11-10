import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { greet } from "../src/index.ts";

const entrypoint = fileURLToPath(new URL("../src/index.ts", import.meta.url));

describe("entrypoint", () => {
  it("runs, exits 0, and prints the greeting", () => {
    const output = execFileSync(process.execPath, [entrypoint], {
      encoding: "utf8",
    });
    expect(output).toBe("Hello, world!\n");
  });
});

describe("greet", () => {
  it.each([
    { name: "a name", input: "Ada", expected: "Hello, Ada!" },
    { name: "an empty name", input: "", expected: "Hello, !" },
  ])("greets $name", ({ input, expected }) => {
    expect(greet(input)).toBe(expected);
  });
});

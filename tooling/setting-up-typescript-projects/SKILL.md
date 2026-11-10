---
name: setting-up-typescript-projects
description: Adds TypeScript to a new Node project with a tsconfig that extends the @tsconfig/node base for the Node version in use, type checking with tsc, and native type stripping (or tsx on Node older than 24). Use when you create a new TypeScript project. Run it after setting-up-node-projects.
user-invocable: false
---

# Setting Up TypeScript Projects

This skill is for new projects. It adds a TypeScript layer on top of
`setting-up-node-projects`. Do that setup first. It sets pnpm, `.nvmrc`, Biome and
vitest.

## Defaults

| Concern        | Default                                                                        |
| -------------- | ------------------------------------------------------------------------------ |
| Base config    | `@tsconfig/node<major>`, where `<major>` is the Node major version in `.nvmrc` |
| Type checking  | `tsc` with `noEmit`                                                            |
| Running source | Node's native type stripping. On Node older than 24, use `tsx`                 |
| Build          | None. Node runs the source                                                     |

## Steps

1. **Run `setting-up-node-projects` first.** Read `<major>` from `.nvmrc`.
2. **Remove the JavaScript files** the Node setup copied: `src/index.js` and
   `test/smoke.test.js`.
3. **Copy this skill's `templates/` directory** into the project root. It adds
   `tsconfig.json`, `src/index.ts` and `test/smoke.test.ts`.
4. **Install the tools,** matched to the Node version:

   ```bash
   pnpm add -D typescript "@types/node@<major>" "@tsconfig/node<major>"
   ```

   Then edit `tsconfig.json` so that `extends` is `@tsconfig/node<major>/tsconfig.json`.
5. **Set the scripts:**

   ```bash
   pnpm pkg set scripts.start="node src/index.ts" scripts.typecheck="tsc" \
     scripts.check="biome check . && tsc"
   ```

6. **On Node older than 24, use `tsx`.** Native type stripping is not available there.
   - Run `pnpm add -D tsx`.
   - Set `scripts.start` to `tsx src/index.ts`.
   - In `test/smoke.test.ts`, start the child process with
     `["--import", "tsx", entrypoint]` instead of `[entrypoint]`.
7. **Run everything.** `pnpm run check`, `pnpm test` and `pnpm start` must all pass
   before you report done. Quote their output.

## What the tsconfig options do

| Option                       | Reason                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `noEmit`                     | `tsc` only checks types. Node runs the source, so there is no build                 |
| `allowImportingTsExtensions` | Imports name the real `.ts` file, as type stripping requires                        |
| `erasableSyntaxOnly`         | Rejects `enum`, `namespace` and parameter properties, which stripping cannot remove |
| `verbatimModuleSyntax`       | Type-only imports must use `import type`, so stripping is safe                      |

Do not set `strict`. TypeScript 6 and later enable it by default. Use TypeScript 6 or
later: version 5.9 cannot read `@tsconfig/node26`.

## Templates

| File                 | Purpose                                                 |
| -------------------- | ------------------------------------------------------- |
| `tsconfig.json`      | Extends the Node base and sets the four options above   |
| `src/index.ts`       | An entrypoint that exports `greet` and prints when run  |
| `test/smoke.test.ts` | The default tests, the same as the Node skill describes |

## Self-check

- [ ] `tsconfig.json` extends the `@tsconfig/node` package for the major version in
      `.nvmrc`.
- [ ] `pnpm run check` runs Biome and `tsc`, and a type error makes it fail.
- [ ] On Node older than 24, `tsx` is installed and used in `start` and in the smoke
      test.
- [ ] `pnpm run check`, `pnpm test` and `pnpm start` all pass, and I ran them after my
      last edit.

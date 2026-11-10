---
name: setting-up-node-projects
description: Sets up a new JavaScript project on Node with pnpm, an .nvmrc, Biome and vitest, and a smoke test. Use when you create a new Node or JavaScript project or package from scratch.
user-invocable: false
---

# Setting Up Node Projects

This skill is for new projects. To add tooling to an existing project, copy only the
files it lacks, and follow the conventions it already has.

## Defaults

| Concern         | Default                                                            |
| --------------- | ------------------------------------------------------------------ |
| Package manager | `pnpm`, always. Never `npm` or `yarn`. Commit `pnpm-lock.yaml`.    |
| Node version    | The latest LTS, in `.nvmrc`, unless the user names another version |
| Test runner     | `vitest`, with a `test` script                                     |
| Lint and format | `biome`, with minimal config                                       |
| Build           | None. Node runs the source                                         |

## Steps

1. **Look for conventions first.** Check the parent workspace, sibling projects and any
   rules the user gave. If they use ESLint, Prettier or Jest, follow them, and take only
   the parts of this skill that do not conflict.
2. **Find the latest LTS major version:**

   ```bash
   node -e "fetch('https://nodejs.org/dist/index.json').then(r=>r.json()).then(r=>console.log(r.find(x=>x.lts).version.slice(1).split('.')[0]))"
   ```

   Install that version with your version manager (`nvm install <major>`) and use it for
   the rest of the setup.
3. **Create the project and copy the templates.** Run `git init`, then copy everything
   in this skill's `templates/` directory into the project root, including the dotfiles.
4. **Edit `package.json`:** set `name`, and set `engines.node` to `>=<major>`. Write
   `<major>` alone in `.nvmrc`.
5. **Install the tools:**

   ```bash
   pnpm add -D vitest @biomejs/biome
   pnpm pkg set packageManager="pnpm@$(pnpm --version)"
   ```

6. **Run everything.** `pnpm run check`, `pnpm test` and `pnpm start` must all pass
   before you report done. Quote their output.

## Templates

| File                 | Purpose                                                           |
| -------------------- | ----------------------------------------------------------------- |
| `.nvmrc`             | The Node major version. Edit it to match step 2                   |
| `package.json`       | Scripts: `start`, `test`, `lint`, `format`, `check`               |
| `biome.json`         | The recommended rules, spaces for indentation, and sorted imports |
| `.gitignore`         | `node_modules`, build output, and `.env` files                    |
| `src/index.js`       | An entrypoint that exports `greet` and prints a greeting when run |
| `test/smoke.test.js` | The default tests, described below                                |

## Default tests

- **The entrypoint runs.** The test starts the entrypoint in a child process and expects
  exit code 0 and the exact output. If the project cannot start, this fails first.
- **The behavior is a table.** One `it.each` table covers `greet`. Add a row for each
  new case.

Replace `greet` with the project's real first behavior. Do not add coverage thresholds,
snapshot tests, or tests that read back a config value.

## Self-check

- [ ] `pnpm` is the only package manager, and `pnpm-lock.yaml` exists.
- [ ] `.nvmrc` holds the major version, and `engines.node` matches it.
- [ ] `pnpm run check`, `pnpm test` and `pnpm start` all pass, and I ran them after my
      last edit.
- [ ] No ESLint, Prettier or Jest config was added, unless the project already used
      them.

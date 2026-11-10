---
name: setting-up-python-projects
description: Sets up a new Python project with uv, a src layout, ruff for linting, black and isort for formatting, ty for type checking, pytest, and a Makefile. Use when you create a new Python project or package from scratch.
user-invocable: false
---

# Setting Up Python Projects

This skill is for new projects. To add tooling to an existing project, copy only the
files it lacks, and follow the conventions it already has.

## Defaults

| Concern         | Default                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| Package manager | `uv`, always. Never `pip` or `poetry`. Commit `uv.lock`.                         |
| Layout          | `src/<package>/`                                                                 |
| Python version  | The latest stable CPython that `uv python list` shows, unless the user names one |
| Linting         | `ruff check` only. Ruff does not format or sort imports                          |
| Formatting      | `black` and `isort`, both with default config, plus one setting (see below)      |
| Type checking   | `ty`                                                                             |
| Tests           | `pytest`, run with `make test`                                                   |

## Steps

1. **Look for conventions first.** Check the parent workspace, sibling projects and any
   rules the user gave. If they use `mypy`, `pyright`, `poetry` or `tox`, follow them,
   and take only the parts of this skill that do not conflict.
2. **Pick the Python version.** Run `uv python list`, choose the newest stable release
   (not an alpha), and run `uv python pin <version>`.
3. **Create the project and copy the templates.** Run `git init`, then copy everything
   in this skill's `templates/` directory into the project root, including the dotfiles.
4. **Rename the placeholders.**
   - Rename `src/my_project/` to `src/<package>/` (underscores).
   - In `pyproject.toml`, set `name` (hyphens), the `[project.scripts]` entry, and
     `requires-python` to match `.python-version`.
   - In `tests/test_smoke.py`, change the import and the `uv run` command.
5. **Install:** run `uv sync`. It writes `uv.lock`.
6. **Format, then run everything:** `make fmt`, `make check`, `make test`. All must pass
   before you report done. Quote their output.

## Why `isort` needs `profile = "black"`

With default isort config, a long import line is wrapped in a style that black then
rewrites, and each tool undoes the other's work. The setting `profile = "black"` makes
them agree. It is the only change to the defaults.

## Templates

| File                         | Purpose                                                             |
| ---------------------------- | ------------------------------------------------------------------- |
| `pyproject.toml`             | Project metadata, the `dev` dependency group, and the tool settings |
| `.python-version`            | The Python version `uv` uses                                        |
| `Makefile`                   | `test`, `check` (ruff, black, isort, ty) and `fmt`                  |
| `.gitignore`                 | Caches, the virtual environment, and `.env` files                   |
| `README.md`                  | A title. Replace it                                                 |
| `src/my_project/__init__.py` | Exports `greet`, and a `main` entrypoint that prints a greeting     |
| `src/my_project/py.typed`    | Marks the package as typed                                          |
| `tests/test_smoke.py`        | The default tests, described below                                  |

## Default tests

- **The entrypoint runs.** The test runs the console script with `uv run` and expects
  exit code 0 and the exact output. If the project cannot start, this fails first.
- **The behavior is a table.** One `parametrize` table covers `greet`. Add a row for
  each new case.

Replace `greet` with the project's real first behavior. Do not add coverage thresholds
or tests that read back a config value.

## Notes

- `ty` is before version 1.0, and its rules change between releases. The lockfile pins
  it. Upgrade it on purpose and run `make check` afterward.
- Ruff ignores `E501` (line length), because black wraps lines.

## Self-check

- [ ] `uv` is the only package manager, and `uv.lock` exists.
- [ ] `.python-version` and `requires-python` name the same version.
- [ ] No placeholder (`my_project`, `my-project`) remains.
- [ ] `make check` and `make test` pass, and I ran them after my last edit.
- [ ] No `mypy`, `pyright` or `poetry` file was added, unless the project already used
      them.

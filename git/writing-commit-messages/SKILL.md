---
name: writing-commit-messages
description: Guides how to write git commit messages in the conventional commits format. Use whenever you write or amend a commit message. The subject line is terse and conventional, and the body holds the reasoning and context that an agent would otherwise put in code comments.
user-invocable: false
---

# Writing Commit Messages

Git history is the changelog. It is also the right place for context that only an agent
has, such as why it chose an approach, what it rejected, and what it ran. That keeps the
code free of history.

The subject is short and machine-readable. The body can hold more. The writing rules
still apply to the body: short sentences, the active voice, and nothing that does not
change what a future reader knows.

## Subject: conventional commits, always

```text
type(scope)!: description
```

| Type       | Use for                                    |
| ---------- | ------------------------------------------ |
| `feat`     | New behavior                               |
| `fix`      | A bug fix                                  |
| `refactor` | A code change with no change in behavior   |
| `perf`     | A change that makes the code faster        |
| `test`     | Adding or changing tests only              |
| `docs`     | Documentation only                         |
| `build`    | Build system or dependency changes         |
| `ci`       | CI configuration                           |
| `style`    | Formatting only, with no change in meaning |
| `chore`    | Maintenance that fits no other type        |
| `revert`   | Reverting an earlier commit                |

- Pick the type from the effect on users: `feat` adds behavior, `fix` corrects it,
  `refactor` changes neither.
- The scope is optional. Use the module or area, such as `fix(webhooks):`.
- Write the description in the imperative mood and in lowercase. Do not end it with a
  period. Keep the whole line to 72 characters or fewer, and aim for 50.
- Say what changed at the level of intent. Do not list files.
- For a breaking change, add `!` after the type or scope, and add a `BREAKING CHANGE:`
  footer that says what breaks and how to migrate.
- A repo's own scopes, or its commitlint config, win over these defaults.

## Body

The body is optional. A subject alone is enough when it fully explains the change, such
as a typo, a rename or a dependency bump.

For anything else, leave a blank line after the subject, wrap the lines at 72
characters, and put these in order:

1. **The problem and the reason,** first. Say what was wrong or missing before you say
   what you did.
2. **Alternatives you rejected,** and why.
3. **Findings from your investigation,** such as the root cause.
4. **Assumptions you made** when nobody could be asked.
5. **Test evidence:** what you ran and what it showed.
6. **Known limits and follow-ups.**

This is the only place for verbose agent commentary. Still, cut what does not help the
reader. Do not narrate your process ("I ran...", "then I tried..."), and do not refer to
the conversation ("as you asked").

## Footers

- `Refs: #123` links a ticket or issue.
- `BREAKING CHANGE: ...` describes a breaking change.
- Do not add `Co-authored-by` or other attribution trailers unless the user asks.

## One purpose per commit

A commit does one thing, and its message describes that commit's diff, not the session.
If the diff mixes a fix and a refactor, split it into two commits.

## Example

```text
fix(webhooks): retry failed payment webhooks up to three times

A single network error dropped the event, and the order stayed unpaid.
Retry with exponential backoff so that a brief outage does not lose a
payment.

Rejected: queue the event for a later sweep. It needs a new table and
a worker, which is more than this bug justifies.

Rejected: retry without a limit. A dead endpoint would hold
connections open.

Assumed: the payment provider treats a repeated delivery as idempotent.
Its docs say so, but I did not test it against the sandbox.

Tested: the retry table in webhooks.test.ts covers 0, 1, 3 and 4
failures. All pass.

Refs: #123
```

## Self-check

- [ ] The subject follows `type(scope): description`, in the imperative, within 72
      characters.
- [ ] The type matches the effect on users.
- [ ] A body exists if the subject does not explain the change, and it starts with the
      problem.
- [ ] Verbose context is in the body, and not in a code comment.
- [ ] The message has no process narration and no references to the conversation.
- [ ] The commit has one purpose.
- [ ] No attribution trailer, unless the user asked.

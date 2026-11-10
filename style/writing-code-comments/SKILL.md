---
name: writing-code-comments
description: Guides how to write, edit and clean up code comments, doc comments and docstrings. Code comments are for people who read the code, not for agents, so they stay short and hold no history, except for rare tagged comments such as HACK. Use when you write or change any comment, and before you report code as done, because it requires a cleanup pass over every comment in your diff.
user-invocable: false
---

# Writing Code Comments

**Code comments are for people.** A person opens the file to learn what the code does.
They did not see your session, your prompt, your debugging or your review rounds, and
they do not want to.

You have a lot of context, and you will want to share it. Do not put it in the code.
Context is useful to an agent. In a comment, it buries the one line a person needs. The
history of a change belongs in the commit body, where an agent can find it and a person
can skip it.

A comment is the last resort for a _why_ that the code cannot carry. Fix unclear code
with better names and structure before you add a comment.

## Where each kind of information goes

| Information                                                                        | Where it goes                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------ |
| What the code does, and how                                                        | The code: names, types, structure          |
| Why the code is this way, when the reason is not obvious                           | A short comment                            |
| What callers can rely on in a public API                                           | A doc comment                              |
| How the code got this way: what you tried, what a reviewer asked for, what you ran | The commit body                            |
| What the change does and why, for a reviewer                                       | The PR description                         |
| Work that is not done yet                                                          | A ticket. In code, a `TODO` with a trigger |

Git history is the changelog. A reader who needs the history runs `git blame` and reads
the commit. Do not copy that history into the file.

## How long a comment is

- **Most comments are one line.** Two or three lines is rare.
- **Four lines or more is a warning.** It is almost always history, a design discussion,
  or an explanation of code that needs fixing. Find which one, and move it.
- **Each comment states one thing:** the constraint or the risk.

If you cannot say it in one or two short sentences, you are probably writing for an
agent, not a person. The one exception is a tagged comment (see "Tagged comments: the
exception").

## What a comment may say

Keep a comment only when a person who deleted it would ask "why?":

- a business rule or an external constraint
- an ordering or timing requirement that the code does not show
- a workaround, and the bug it avoids
- a choice that looks like a mistake but is not

```typescript
// GOOD: states the risk, and the order that avoids it
// Emit the result first, then delete the message. If the emit fails after the delete,
// the queue will not redeliver and the result is lost.
await emitResult(event);
await queue.delete(message);
```

## What a comment may not say

- **Narration or restatement.** `// Step 1`, `// First... // Then...`, or a line that
  says what the next line says.
- **History.** Ticket ids, PR numbers, reviewer names, review rounds, dates, and words
  like "now", "no longer", "previously", "new" or "fixed". Describe the code as it is
  today.
- **The story of how you got here:** bugs you hit, approaches you tried, what you
  changed and why you changed it.
- **A design discussion.** Alternatives considered and the reasons for choosing one.
- **Commented-out code.** Delete it. Git keeps it.
- **Banners and dividers.** `// ---- helpers ----` adds noise. Use file structure.
- **Hedges and apologies with nothing behind them.** "Hack", "for now" and "not sure
  why" tell the reader nothing they can use. State the constraint, or fix the code. A
  tagged comment that explains itself is different.
- **Warnings in capitals with no reason.** "IMPORTANT: do not remove" says nothing about
  why. Say why.

## Examples: cut the history of the world

Each BAD comment below is real in kind. An agent wrote it to record its work. Each GOOD
version is what a person needs.

### The debugging saga

```typescript
// BAD
// We used to call retry() directly here, but in March this caused a double charge
// when the payment provider returned a 502 after it had already processed the
// card. Dana added an idempotency key in the retry wrapper (PR #412), but we then
// found the proxy was stripping the header, so we now forward it explicitly. See
// also the incident review and the follow-up ticket about proxy header handling.
await chargeWithRetry(order, { idempotencyKey: order.id, forwardHeaders: true });

// GOOD
// The provider can return 502 after it has charged the card. The key makes a retry safe.
await chargeWithRetry(order, { idempotencyKey: order.id, forwardHeaders: true });
```

### The changelog in the file

```typescript
// BAD
// v1: returned all users
// v2 (2024-03): added offset pagination
// v3: switched to cursor pagination because offset skipped rows. The offset
// parameter is deprecated and will be removed in a future release.
export function listUsers(cursor?: string): Promise<Page<User>>;

// GOOD: the signature says it, and a doc comment states the contract
/** Pages through users by cursor. Rows added during a scan are not skipped. */
export function listUsers(cursor?: string): Promise<Page<User>>;
```

### The design document

```typescript
// BAD
// We considered three ways to stop two workers from claiming the same job. A Redis
// lock was rejected because it adds a new dependency and a failure mode when Redis is
// down. A database advisory lock was rejected because it blocks the whole queue while
// a worker holds it. An optimistic version column was chosen because it needs no new
// infrastructure and only the losing worker retries. The tradeoff is an extra read.
const claimed = await jobs.claim(id, { expectedVersion: job.version });

// GOOD
// Two workers can race for the same job. The version check lets only one win.
const claimed = await jobs.claim(id, { expectedVersion: job.version });
```

The rejected options and the tradeoff are useful. They go in the commit body.

### The task report

```typescript
// BAD
// Updated per the request to make the timeout configurable. It was hardcoded to 5000 ms
// before. It now reads config.timeoutMs and falls back to 5000 if the value is not set,
// so that existing deployments keep working without any change.
const timeoutMs = config.timeoutMs;

// GOOD: no comment. The default lives in the config loader, next to the parsing.
const timeoutMs = config.timeoutMs;
```

### The warning that does not explain

```typescript
// BAD
// IMPORTANT: Do NOT remove this null check! It was added to fix a crash that happened
// in production. Removing it will break things.
if (user === null) return;

// GOOD
// The API returns null for users deleted after the page was cached.
if (user === null) return;
```

### Where the cut text goes

The text you cut is not lost. Put it in the commit body, in plain sentences:

```text
fix(billing): forward the idempotency key through the proxy

The provider can return 502 after it has charged the card. A retry then
charged the customer twice. The key makes a retry safe, but the proxy
stripped the header, so the provider never saw it.

Forward the header explicitly.
```

## Tagged comments: the exception

Some code has to stay odd, and one line cannot say why. Developers mark these places
with a tag such as `HACK`, then explain at the length the reader needs. A tagged comment
is the one exception to the length rule and to the rule against background.

Tagged comments are rare. People avoid writing code that needs one. Before you write
one, try to remove the need: rename, restructure, or fix the root cause. Write the tag
only when the code has to stay as it is.

| Tag       | Marks                                                                   |
| --------- | ----------------------------------------------------------------------- |
| `TODO`    | Work to do later. One line, with a trigger. See below.                  |
| `FIXME`   | Code that is known to be wrong and should be fixed                      |
| `HACK`    | A workaround that forces the code to work, or avoids a known problem    |
| `XXX`     | Fragile or questionable code that needs a closer look                   |
| `QUIRK`   | Surprising behavior of an outside system (an API, a browser, a library) |
| `WARNING` | A gotcha that a reader could trip over                                  |

A repo's own tags win. Do not invent new ones.

**Rules**

1. **Put the tag first, in capitals, then a colon:** `HACK: ...`. Use one tag for each
   comment. People and tools search for these.
2. **Explain the situation as it is now:** what is odd, why the code must be this way,
   and what the risk is. For a `HACK` or a `FIXME`, say what would let you remove it.
3. **It may run long, and it may give background.** Facts about how the outside world
   works are fine: the other system's behavior, the constraint, the upstream bug. A link
   to an outside source helps.
4. **It is still for a person.** It describes the code as it is today. It has no review
   rounds, names, dates, or "I tried". Put how you found out in the commit body.
5. **The tag is not a loophole.** The history of your change is still history, even when
   it sits after a `NOTE:`.

```typescript
// HACK: The payment provider's sandbox returns 200 with an empty body for a declined
// card. Production returns 402. We treat the empty body as a decline so that tests
// behave like production. Remove this when the sandbox matches production:
// https://provider.example/changelog/sandbox-parity
if (response.status === 200 && response.body === "") return { type: "declined" };
```

```typescript
// QUIRK: Safari fires `blur` before `click` on a button inside a popover. The popover
// would close before the click handler ran, so we close it on `pointerup` instead.
button.addEventListener("pointerup", closePopover);
```

```typescript
// BAD: a story behind a tag
// NOTE: We changed this three times. First we used a Map, but Dana found it leaked in
// the worker (PR #388). Then we tried a WeakMap, but the keys are strings. Finally the
// load test showed an LRU was fastest, so that is what we use now.
const cache = new LruCache<string, User>({ max: 500 });

// GOOD: no tag, and one line
// Bounded, because the worker is long-running and an unbounded cache would leak.
const cache = new LruCache<string, User>({ max: 500 });
```

**TODO.** Write a `TODO` only with a concrete trigger. Do not put a name or a date in
it.

```typescript
// TODO: remove when the v1 endpoint is retired.
```

## Links

A link to an outside source is fine, because it carries a reason: a spec, an RFC, or an
upstream bug report. Do not link an internal ticket, PR or review thread. Put those in
the commit.

## Doc comments

Write a doc comment on public API when it adds what the name and types do not say:
units, valid ranges, side effects, error conditions, ordering, or an example. A doc
comment that repeats the signature is fluff.

A doc comment that is an interface contract (a public API, a tool description that a
model reads) can be as long as the caller needs. It still has no history.

```typescript
// BAD: repeats the names and types
/**
 * Gets a user.
 * @param id - The id
 * @returns The user
 */
export function getUser(id: string): Promise<User | null>;

// GOOD: says what the signature cannot
/** Returns null when the user was deleted. Reads from the replica, so it can lag by seconds. */
export function getUser(id: string): Promise<User | null>;
```

## Cleanup pass (required)

Before you report code as done, go over every comment in your diff.

1. List each comment you added or changed.
2. Delete the comment and read the code. If nothing is lost, leave it deleted.
3. Read each survivor as a person who has never seen this task. If it tells a story, or
   it needs the session to make sense, cut it.
4. Rewrite each survivor to the constraint or the risk, in one or two short sentences.
   Remove history. If it still runs to four lines or more, find out why and move that
   text. Keep a long one only if it is a tagged comment that follows the rules above.
   For each tagged comment, ask first whether you can remove the need for it.
5. Delete any commented-out code that you added or left behind.
6. Fix every comment and doc that your change made wrong (README, design doc), in the
   same change. Fix a wrong sentence in place. Do not append a note that contradicts it.
   A wrong comment is worse than none. When a comment and the code disagree, the code is
   the truth.
7. If a reader of the history needs what you cut, put it in the commit body.

Leave comments in code you did not touch. Cleaning those is a separate change.

## Self-check

- [ ] Every comment in my diff passed the delete test.
- [ ] A person who never saw this task can read each comment and use it.
- [ ] Most comments are one line. None runs to four lines or more unless it is a tagged
      comment.
- [ ] Tagged comments are rare. Each one says why the code must stay as it is, and what
      would remove it.
- [ ] No comment narrates, restates, or holds history, a story, a design discussion,
      ticket ids or names.
- [ ] No commented-out code remains in my diff.
- [ ] Doc comments say what the signature does not.
- [ ] Comments and docs that my change made wrong are fixed.
- [ ] Anything I cut that a future reader needs is in the commit body.

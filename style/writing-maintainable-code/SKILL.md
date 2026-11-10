---
name: writing-maintainable-code
description: Use when you write or review code in any language. It covers control flow, helpers, names, error handling, lint suppressions, and cross-service contracts.
user-invocable: false
---

# Writing Maintainable Code

Language-agnostic rules for how code reads and behaves. They cover how to write a
change, not whether to make it. Decide first whether to add, rework or remove code.

Slop teaches the next LLM to write more slop. Several BAD examples below were
copy-pasted into three or four files after the first one set the pattern. Every rule has
one goal: **the codebase stays cheap to read and change.** The BAD examples are patterns
seen in real codebases.

## Self-check

Run this before you report done, even when you were focused on something else.

- [ ] No block is nested where an early return would do.
- [ ] Values written once are `const` or never reassigned.
- [ ] Each function's length matches its complexity.
- [ ] Decisions are in functions that take inputs and return a result. I/O is in a thin
      outer layer.
- [ ] Values that vary by deploy are config, read once at the edge. No branch tests the
      environment name.
- [ ] Each helper is reused, or makes its caller clearer.
- [ ] I reused existing helpers, constants and enums instead of copying them.
- [ ] Names are domain words, not mechanics or jargon. New file names match their
      siblings.
- [ ] No scratch files are committed.
- [ ] No failure looks like success.
- [ ] No lint, format or type check is silenced.
- [ ] Wire-contract changes are safe in either deploy order.

## Control flow

### Return early

Put guard clauses at the top. Do not wrap a whole body in an `if`.

```typescript
// BAD
for (const endpoint of userEndpoints) {
  const response = await fetch(endpoint, { headers });
  if (response.ok) {
    const userData = await response.json();
    for (const field of ["email", "id", "userId", "username", "login"]) {
      if (field in userData && userData[field]) {
        return String(userData[field]);
      }
    }
  }
}

// GOOD
for (const endpoint of userEndpoints) {
  const response = await fetch(endpoint, { headers });
  if (!response.ok) continue;
  const userData = await response.json();
  for (const field of ["email", "id", "userId", "username", "login"]) {
    if (userData[field]) return String(userData[field]);
  }
}
```

Flatten deep pyramids the same way, one level at a time. Four nested `if`s usually each
become a guard.

### Combine conditions that gate one action

```typescript
// BAD
if (response.meta?.totalPages) {
  if (page >= response.meta.totalPages) {
    break;
  }
}

// GOOD
if (response.meta?.totalPages && page >= response.meta.totalPages) {
  break;
}
```

Check each condition once. Do not re-check it down two branches.

## Immutability

Bind once and do not reassign. Use `const` unless you really need `let`. Use
reassignment only for real accumulation, such as a list built in a loop or a running
total.

```typescript
// BAD
let visibleMessages = old.results;
if (hasConfirmedMessage) {
  visibleMessages = old.results.filter((m) => !m.id.startsWith("temp-"));
}

// GOOD
const visibleMessages = hasConfirmedMessage
  ? old.results.filter((m) => !m.id.startsWith("temp-"))
  : old.results;
```

When the logic has several cases, a small function that returns each one beats a nested
ternary:

```typescript
function resolveStatus(raw: string | undefined, results: Result[]): string {
  if (raw) return raw;
  if (results.length === 0) return "waiting";
  return results.some((r) => r.type === "result") ? "complete" : "running";
}
```

## Function length

There is no line limit. The question is whether the function does too much for its
length.

- **Long and flat is fine.** A 60-line config builder or field-by-field mapper reads top
  to bottom. Splitting it only scatters one idea.
- **Short and dense is the problem.** Nested branches and braided concerns are too much
  even at 20 lines. Split by responsibility, into steps with domain names.

A function nested six levels deep gets split. A flat serializer does not.

## Keep decisions apart from I/O

Put the logic that decides in functions that take inputs and return a result. Put I/O
(network, disk, clock, randomness) in a thin outer layer that fetches, calls those
functions, and stores the result. A function that decides is then easy to read, reuse
and test, because it needs no setup.

- **Pass in what a decision needs,** including the current time and any random value. Do
  not fetch it from inside.
- **Return a result instead of mutating an argument.** Mutate a local variable when that
  reads best, such as a list built in a loop.
- **Avoid shared mutable state.** When you need some (a cache, a connection), keep it
  small, named, and in one place.
- **Let rules be data when they are uniform.** A table or a map of rules is easier to
  extend and test than a chain of `if` branches. Use branches when the cases differ in
  kind. `switch` statements, or the language equivalent, are also suitable for this
  rule.
- **Use the language's own tools.** Model the domain with its types, such as a struct,
  record, enum, dataclass or class, whichever fits and whichever the codebase already
  uses. Do not avoid a language feature to look functional, and do not add a functional
  library or write point-free code for its own sake. A plain `for` loop often beats a
  clever `reduce`.

```typescript
// BAD: fetching, deciding and saving are tangled, and it mutates what it fetched
async function closeInvoice(id: string): Promise<void> {
  const invoice = await db.invoices.get(id);
  let total = 0;
  for (const line of invoice.lines) total += line.cents * line.quantity;
  if (invoice.customer.tier === "gold") total = Math.round(total * 0.9);
  invoice.totalCents = total;
  invoice.closedAt = new Date();
  await db.invoices.save(invoice);
}

// GOOD: one function decides, and a thin shell does the I/O
const DISCOUNT_PERCENT_BY_TIER: Record<Tier, number> = { standard: 0, gold: 10 };

function priceInvoice(invoice: Invoice, closedAt: Date): Invoice {
  const subtotal = invoice.lines.reduce((sum, l) => sum + l.cents * l.quantity, 0);
  const discount = DISCOUNT_PERCENT_BY_TIER[invoice.customer.tier];
  const totalCents = Math.round((subtotal * (100 - discount)) / 100);
  return { ...invoice, totalCents, closedAt };
}

async function closeInvoice(id: string): Promise<void> {
  const invoice = await db.invoices.get(id);
  await db.invoices.save(priceInvoice(invoice, new Date()));
}
```

If a function is hard to call without special setup, its shape is wrong. Move the I/O
out and pass the inputs in.

## Config, not code

When the user asks for a "12-factor" design, or a value must differ between deploys,
control the behavior with config instead of code. Anyone can then change it without a
code change or a rebuild.

- **Config is anything that varies by deploy:** URLs, credentials, timeouts, limits,
  feature flags and resource names. It does not live in a constant or a branch.
- **Branch on the setting, not the environment name.** Write `if (config.cacheEnabled)`,
  not `if (env === "production")`. The second form ties the behavior to a name and hides
  what it controls.
- **Read config once, at the edge.** Parse and validate it at startup into one typed
  object. Pass that object (or the part a unit needs) down as an argument. Do not read
  `process.env` deep inside a function.
- **Fail fast on missing or invalid config.** A required value that is absent stops the
  process at startup with a message that names the value. It does not fall back to a
  guess.
- **Defaults live in one place,** next to the parsing. Do not repeat them at the call
  sites.
- **No secrets or per-environment files in the repo.** The code is the same in every
  environment, and only the config changes.

```typescript
// BAD: reads the environment deep inside, and branches on its name
async function fetchWithRetry(request: () => Promise<Response>) {
  const limit = process.env.NODE_ENV === "production" ? 5 : 1;
  for (let attempt = 1; ; attempt++) {
    try {
      return await request();
    } catch (error) {
      if (attempt >= limit) throw error;
    }
  }
}

// GOOD: config is read once at the edge, and passed in
type Config = { readonly retryLimit: number };

function loadConfig(env: Record<string, string | undefined>): Config {
  const retryLimit = Number.parseInt(env.RETRY_LIMIT ?? "3", 10);
  if (!Number.isInteger(retryLimit) || retryLimit < 1) {
    throw new Error(`invalid config: RETRY_LIMIT=${env.RETRY_LIMIT}`);
  }
  return { retryLimit };
}

async function fetchWithRetry(request: () => Promise<Response>, config: Config) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await request();
    } catch (error) {
      if (attempt >= config.retryLimit) throw error;
    }
  }
}
```

The other 12-factor habits that affect code:

- **Stateless processes.** Keep state that must outlive a request in a database or
  cache, not in memory or on local disk.
- **Logs go to stdout** as a stream of events. The code does not manage log files.
- **Fast start and clean stop.** Handle the shutdown signal, finish in-flight work, and
  release resources.
- **Same code in every environment.** Dev, staging and production differ in config, not
  in code paths.

## Helpers

Extract a helper only when:

1. it is reused, or
2. naming a chunk makes a long, multi-step caller readable.

```typescript
// BAD: one caller, one comparison
function hasNoStepRun(run: Run): boolean {
  return run.stepRunId == null;
}

if (stepRun == null || hasNoStepRun(run)) {

// GOOD: inline
if (stepRun == null || run.stepRunId == null) {
```

```typescript
// GOOD: named steps clarify a long function
async function onboardCustomer(signup: Signup): Promise<Account> {
  const account = await createAccount(signup);
  await provisionWorkspace(account);
  await sendWelcomeSequence(account);
  return account;
}
```

**No pass-through wrappers.** A method whose body only calls another method with the
same arguments adds a jump and nothing else. Keep one only if a framework requires that
callsite.

```typescript
// BAD: async in name only
async saveAsync(installation: Installation): Promise<void> {
  return this.save(installation);
}
```

### Reuse the existing helper, constant or enum

Before you write a helper, constant, enum or config value, `grep` for the value and the
concept. If one exists, import it. If one is close, extend it or derive from it
(`const RETRYABLE = new Set([...BASE_RETRYABLE, 429])`). A second copy is a second
source of truth, and it goes wrong the day the first one changes.

## Naming

### Name the domain, not the mechanism

`handle`, `dispatch`, `process`, `doX` and `manager` for one specific action are wrong.
Name the action.

```typescript
// BAD
function handle(app: App, channelId: string, shortId: string, assigneeId: string) {}

// GOOD
function assignQueueItem(app: App, channelId: string, shortId: string, assigneeId: string) {}
```

### Not everything is a Manager, Wrapper, Factory or Handler

Name what the class is. If its doc comment already says "store", "facade" or "envelope",
use that word.

| BAD                                                           | GOOD                     |
| ------------------------------------------------------------- | ------------------------ |
| `ChatConversationManager` (only database reads/writes)        | `ConversationStore`      |
| `AccountWrapper` (has `unwrap()`)                             | `AccountEnvelope`        |
| `AsyncHttpClientWrapper` ("async facade over an HTTP client") | `AsyncHttpClient`        |
| `TokenManager` (acquires, refreshes)                          | `TokenProvider`          |
| `WorkItemHandler` (fetches from a helpdesk API)               | `HelpdeskWorkItemSource` |

### Generic variable names

A short name is fine when its scope says what it holds: `res` in a one-endpoint service,
`o` in `for o in orders`. Name it fully when a reader could mistake it, or when one name
holds two things:

```typescript
// BAD
let data = body.data ?? {}; // an audio frame
data = await fetchParticipant(data.id); // now a participant

// GOOD
const audioFrame = body.data ?? {};
const participant = await fetchParticipant(audioFrame.id);
```

## Files

- **Match the sibling pattern.** A new file in a directory of `kebab-case.ts` services
  is a `kebab-case.ts` service. If the pattern is unclear, confirm the name and place
  with the user.
- **No `utils` grab-bags.** Name the file for what it does, and split unrelated things.
  BAD: `lib/services/utils.ts` beside `auth.ts`, `runs.ts`. GOOD: `key-transforms.ts`.
- **No scratch files.** A probe with hardcoded ids belongs under `tests/`, in a
  git-ignored output directory, or nowhere. `tmp.ts`, a `test.ts` outside the test
  directory, and a scratch `index.ts` are smells on sight.

## Failures must look like failures

Never let a failure look like success.

- **A catch-all or fallback logs or counts itself**, with the ids that find the case
  (customer, run, tenant, the failing input). An empty `catch {}` or a silent
  `return []` hides bugs.
- **"Did nothing" is not "OK".** Report how many items you processed.
- **Failures that matter propagate.** Catch only what you can handle here.
- **Transient vs persistent.** A recovered retry can log a warning. Anything that stays
  broken logs an error or emits a metric someone watches.

```typescript
// BAD: the sync "succeeds" when every record fails
for (const record of records) {
  try {
    await push(record);
  } catch {}
}

// GOOD
const failed: string[] = [];
for (const record of records) {
  try {
    await push(record);
  } catch (error) {
    logger.error("push failed", { customerId: record.customerId, recordId: record.id, error });
    failed.push(record.id);
  }
}
if (failed.length > 0) {
  throw new SyncIncompleteError(`${failed.length} of ${records.length} records failed`);
}
```

Logging `error` is fine here. Don't log it when the failing input could hold a secret:
exception text often carries the value.

## Don't silence the checks

Code passes the repo's lint, format and type checks. Fix the code.

- Do not add `// eslint-disable`, `// @ts-ignore`, `// @ts-expect-error` or
  `// biome-ignore` to get green.
- If a suppression is really right, scope it to the one rule on the one line and give
  the reason:
  `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the SDK types this as unknown`.
- Do not widen a global or per-file ignore list to get past your change.
- Run the repo's checks before you report done.

## Wire contracts: safe in either deploy order

A change to anything another service reads (API response, queue message, event, stored
JSON) must work whichever side deploys first.

- **Additive only.** Add optional fields. To remove a field: stop reading it everywhere,
  deploy, then stop writing it.
- **Readers tolerate the unknown.** New readers handle a missing field. Old readers
  ignore new fields.
- **Bump the schema version when you add fields** to a versioned contract. For a
  published event schema, add a new version instead of editing it.
- **Check the deploy order.** A change that is safe only if the API deploys before the
  worker breaks during the window between them.

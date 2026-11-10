---
name: writing-typescript
description: Use when you write or review TypeScript. It covers types, functions, immutability, error handling, naming and module layout, and it links to details for hazards, classes, generics and config.
user-invocable: false
---

# Writing TypeScript

TypeScript standards that favor type safety, immutability, and explicit error handling.
They apply on top of `writing-maintainable-code`.

**Core principles:**

- Types as documentation and constraints
- Immutability by default prevents bugs
- Explicit over implicit (especially in function signatures)
- Expected failures are return values, not exceptions
- Configuration over decoration/magic

## How to apply these rules

The rules fall into two groups.

1. **Always apply:** hazards and type-safety rules. They prevent bugs, so they hold in
   every repo. Relax one only with a reason you can state in one sentence.
2. **Preferences:** style choices (`type` over `interface`, `null` over `undefined`, no
   enums, no barrel files). If the repo already follows a different convention, follow
   the repo. If you think that convention is wrong, tell the user. Do not silently
   diverge. If the repo has no convention, use these.

Where a lint rule exists, turn it on in the repo's config instead of relying on memory.
The rule names below come from ESLint core, `typescript-eslint` and common plugins.
Check that the repo has the plugin before you enable a rule.

Under deadline pressure you will default to muscle memory. Scan both tables before you
report done.

## Rule index

### Always apply

| Rule                                                                                  | Lint rule                                                      | Details                                                  |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| Use `===`, never `==`                                                                 | `eqeqeq`                                                       | [Sharp edges](references/sharp-edges.md): Equality       |
| Pass a radix to `parseInt`, or use `Number()`                                         | `radix`                                                        | Sharp edges: parseInt Radix                              |
| Give numeric `.sort()` a comparator                                                   | `@typescript-eslint/require-array-sort-compare`                | Sharp edges: Numeric Sort                                |
| Know which array methods mutate; copy first or use `toSorted()`                       | none                                                           | Sharp edges: Array Mutations                             |
| Never use `eval()` or `new Function()` with dynamic input                             | `no-eval`, `no-new-func`, `@typescript-eslint/no-implied-eval` | Sharp edges: eval and Function Constructor               |
| Never merge untrusted objects into plain objects; validate keys before bracket access | `security/detect-object-injection`                             | Sharp edges: Prototype Pollution, Unsafe Property Access |
| No nested quantifiers or overlapping alternatives in regex                            | `regexp/no-super-linear-backtracking`                          | Sharp edges: ReDoS                                       |
| Keep large integer ids as strings                                                     | none                                                           | Sharp edges: JSON Precision Loss                         |
| `Promise.all` fails fast; use `allSettled` when partial results are fine              | none                                                           | Sharp edges: Promise.all vs Promise.allSettled           |
| No native `number` for money or financial math                                        | none                                                           | Sharp edges: Money and Currency                          |
| Use `unknown`, not `any`                                                              | `@typescript-eslint/no-explicit-any`                           | [Type safety](#type-safety)                              |
| No type assertion without runtime validation or an explaining comment                 | `@typescript-eslint/consistent-type-assertions`                | Type safety                                              |
| Use `!` sparingly, with a comment                                                     | `@typescript-eslint/no-non-null-assertion`                     | Type safety                                              |
| Enable full strict mode plus extra checks                                             | `tsc`                                                          | [Compiler config](references/compiler-config.md)         |

### Preferences

| Rule                                                                                              | Lint rule                                                                                     | Details                                                                |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `type`, not `interface`, except for class contracts                                               | `@typescript-eslint/consistent-type-definitions`                                              | [Types](#types)                                                        |
| Follow the naming sections: type suffixes, casing, boolean prefixes                               | `@typescript-eslint/naming-convention`                                                        | Types                                                                  |
| Use a `FooParams` object for 3+ arguments, any optional argument, or unclear arguments            | none                                                                                          | Types                                                                  |
| Name an inline type with 3+ properties, nesting, or more than two uses                            | none                                                                                          | Types                                                                  |
| Top-level functions are `function` declarations; arrows are for callbacks                         | `func-style`                                                                                  | [Functions](#functions)                                                |
| Type Promise returns; use async/await; no `async` on pure functions                               | `@typescript-eslint/require-await`                                                            | Functions                                                              |
| Explicit types in signatures; infer locals                                                        | `@typescript-eslint/explicit-module-boundary-types`, `@typescript-eslint/no-inferrable-types` | [Type inference](#type-inference)                                      |
| `T[]`, not `Array<T>`                                                                             | `@typescript-eslint/array-type`                                                               | [Immutability](#immutability)                                          |
| Parameters are `Readonly<T>` or `readonly T[]`                                                    | `@typescript-eslint/prefer-readonly-parameter-types`                                          | Immutability                                                           |
| Use `Record<K, V>` for dynamic keys                                                               | `@typescript-eslint/consistent-indexed-object-style`                                          | [Generics and utility types](references/generics-and-utility-types.md) |
| Constrain generics; name multiple generics (`TItem`); no premature generics                       | none                                                                                          | Generics and utility types                                             |
| Use built-in utility types first; `type-fest` for deep operations                                 | none                                                                                          | Generics and utility types                                             |
| Return a discriminated union for expected failures; throw for bugs                                | none                                                                                          | [Error handling](#error-handling)                                      |
| Write error messages as lowercase fragments: `failed to connect: timeout`                         | none                                                                                          | Error handling                                                         |
| Use `null` for absent values; coalesce `undefined` with `?? null`                                 | none                                                                                          | [Nullability](#nullability)                                            |
| Use string literal unions, not enums                                                              | `no-restricted-syntax` (`TSEnumDeclaration`)                                                  | [Enums and unions](#enums-and-unions)                                  |
| Named exports only                                                                                | `import/no-default-export`                                                                    | [Modules](#modules)                                                    |
| No barrel files                                                                                   | `barrel-files/avoid-barrel-files`                                                             | Modules                                                                |
| Doc comments on exported API only where they add what the signature does not                      | none                                                                                          | [Documentation](#documentation)                                        |
| Prefer functions to classes, except for dependency injection; class fields are `private readonly` | `@typescript-eslint/prefer-readonly`                                                          | [Classes](references/classes.md)                                       |
| No `this` in object literals                                                                      | `no-invalid-this`                                                                             | Classes                                                                |
| Use factory functions for test data                                                               | none                                                                                          | [Test data](references/test-data.md)                                   |

## Types

### Type vs Interface

**Always use `type` except for class contracts.**

```typescript
// GOOD: type for object shapes
type UserData = {
  readonly id: string;
  name: string;
  email: string | null;
};

// GOOD: interface for class contract
interface UserStore {
  findById(id: string): Promise<User | null>;
}

class SqlUserStore implements UserStore {
  // implementation
}

// BAD: interface for object shape
interface UserData {
  id: string;
  name: string;
}
```

**Rationale:** Types compose better with unions and intersections, support mapped types,
and avoid declaration merging surprises. Interfaces are only for defining what a class
must implement.

**IMPORTANT:** Even when under deadline pressure, take 2 seconds to ask: "Is this a
class contract?" If no, use `type`. Don't default to `interface` out of habit.

### Naming: Type Suffixes

| Suffix                 | Usage                                                              | Example                             |
| ---------------------- | ------------------------------------------------------------------ | ----------------------------------- |
| `FooParams`            | Function parameter objects (3+ args, any optional, or non-obvious) | `CreateUserParams`                  |
| `FooConfig`            | Persistent configuration from storage                              | `DatabaseConfig`                    |
| `FooResult`            | Discriminated union return types                                   | `GetUserResult`                     |
| `Foo`+`-er/-or` suffix | Function/callback types                                            | `UserUpdater`, `RequestTransformer` |
| `FooProps`             | React component props                                              | `ButtonProps`                       |
| `FooState`             | State objects (component/application)                              | `AppState`                          |

### Naming: Casing

| Element                      | Convention                | Example                               |
| ---------------------------- | ------------------------- | ------------------------------------- |
| Variables & functions        | camelCase                 | `userName`, `getUser()`               |
| Types & classes              | PascalCase                | `UserData`, `UserService`             |
| Interfaces (class contracts) | PascalCase, no `I` prefix | `UserStore`                           |
| Constants                    | UPPER_CASE                | `MAX_RETRY_COUNT`, `API_ENDPOINT`     |
| Files                        | kebab-case                | `user-service.ts`, `process-order.ts` |

### Naming: Booleans

**Use is/has/can/should/will prefixes. Avoid negative names.**

```typescript
// GOOD
const isActive = true;
const hasPermission = checkPermission();
const canEdit = user.role === 'admin';
const shouldRetry = attempts < MAX_RETRIES;

// Also acceptable: adjectives for state
type User = {
  active: boolean;
  visible: boolean;
};

// BAD: negative names
const isDisabled = false; // prefer isEnabled
const notReady = true;    // prefer isReady
```

### FooParams - Parameter Objects

**Use for functions with 3+ arguments, any optional arguments, or when argument meaning
isn't obvious.**

```typescript
type CreateUserParams = {
  readonly name: string;
  readonly email: string;
  readonly age: number;
  readonly sendWelcome?: boolean;
};

// GOOD: destructure in body, not in parameters
function createUser(params: CreateUserParams): User {
  const { name, email, age, sendWelcome = true } = params;
  // implementation
}

// BAD: not using params pattern for 3+ args
function createUser(name: string, email: string, age: number, sendWelcome?: boolean): User {
  // hard to call, positional arguments
}

// GOOD: 2 required args — no params object needed
function divide(numerator: number, denominator: number): number {
  return numerator / denominator;
}

// GOOD: args are non-obvious even with 2 — use params
function retry(params: RetryParams): Promise<void> {
  // clearer than retry(fetchData, 3)
}
```

### Naming Inline Types

**Follow the rule of three. Name an inline type when it has 3+ properties or nested
structures, or when it appears a third time.** Apply the same restraint as for helpers
(see `writing-maintainable-code`).

```typescript
// First and second use: inline is fine
const user1 = { id: '1', name: 'Alice', email: 'alice@example.com' };

// Third use: now define the type
type User = { id: string; name: string; email: string };

// GOOD: extract when the inline type has 3+ properties or nesting
// Before
function process(data: { user: { name: string; email: string }; theme: string }): void {}

// After
type UserInfo = { name: string; email: string };
type ProcessData = { user: UserInfo; theme: string };
function process(data: Readonly<ProcessData>): void {}
```

## Functions

### Declaration Style

**Use `function` declarations for top-level functions. Use arrow functions for inline
callbacks.**

```typescript
// GOOD: function declaration for top-level
function processUser(data: Readonly<UserData>): ProcessUserResult {
  // implementation
}

// GOOD: arrow functions for inline callbacks
const users = rawData.map(u => transformUser(u));
button.addEventListener('click', (e) => handleClick(e));

// BAD: const arrow for top-level function
const processUser = (data: UserData): ProcessUserResult => {
  // implementation
};
```

**Rationale:** Function declarations are hoisted and more visible. Arrow functions
capture lexical `this` and are concise for callbacks.

### Const Arrow Functions

**Use `const foo = () => {}` only for stable references (e.g. React hooks, long event
listeners).**

```typescript
// GOOD: stable reference for React hooks
const handleSubmit = (event: FormEvent) => {
  event.preventDefault();
  // implementation
};
useEffect(() => { ... }, [handleSubmit]);

// BAD: const arrow for regular top-level function
const calculateTotal = (items: readonly Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// GOOD: use function declaration
function calculateTotal(items: readonly Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Async Functions

**Always explicitly type Promise returns. Prefer async/await over `.then()`. Avoid async
on pure functions.**

```typescript
// GOOD: explicit Promise return type, async/await
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// GOOD: Promise<void> for side effects
async function saveUser(user: User): Promise<void> {
  await fetch('/api/users', { method: 'POST', body: JSON.stringify(user) });
}

// BAD: promise chains
function processUserData(id: string): Promise<ProcessedUser> {
  return fetchUser(id)
    .then(user => enrichUserData(user))
    .then(enriched => transformUser(enriched));
}

// BAD: unnecessary async on pure function
async function transformUser(user: User): Promise<TransformedUser> {
  return { fullName: `${user.firstName} ${user.lastName}` };
}

// GOOD: keep sync
function transformUser(user: User): TransformedUser {
  return { fullName: `${user.firstName} ${user.lastName}` };
}
```

**Use async for:** network requests, database operations, file I/O, concurrent
execution. **Stay sync for:** pure calculations, data transformations, anything not
touching external systems.

## Type Inference

**Always explicit in function signatures. Infer in local variables, loops, and
destructuring.**

```typescript
// GOOD: explicit signature, inferred locals
function processUsers(users: readonly User[]): ProcessedUser[] {
  const results: ProcessedUser[] = [];
  for (const user of users) {        // user inferred as User
    const name = user.name;          // name inferred as string
    results.push({ id: user.id, name: name.toUpperCase() });
  }
  return results;
}

// BAD: missing return type
function processUsers(users: readonly User[]) { ... }

// BAD: excessive annotations on locals
for (const user: User of users) {
  const name: string = user.name; // unnecessary
}
```

## Immutability

### Readonly by Default

**Mark reference type parameters as `Readonly<T>`. Use `readonly T[]` for array
parameters. Use `const` for all bindings unless mutation is needed.**

```typescript
// GOOD: readonly parameters
function processData(
  data: Readonly<UserData>,
  config: Readonly<ProcessConfig>,
): ProcessResult {
  return { success: true };
}

// GOOD: readonly array parameter, mutable local result
function processItems(items: readonly Item[]): ProcessedItem[] {
  const results: ProcessedItem[] = [];
  for (const item of items) {
    results.push(transformItem(item));
  }
  return results;
}

// BAD: mutable parameters
function processData(data: UserData): ProcessResult {
  data.processed = true; // mutation — don't do this
}
```

### Arrays

**Use `T[]` and `readonly T[]`. Apply `readonly` for parameters and fields, mutable for
local accumulation.**

```typescript
// GOOD
const numbers: number[] = [1, 2, 3];
function calculateAverage(numbers: readonly number[]): number {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}
```

For deeply nested structures, see
[Generics and utility types](references/generics-and-utility-types.md): Deep
Immutability.

## Error Handling

For logging, propagation and "failures must look like failures", see
`writing-maintainable-code`.

### Expected Failures: Discriminated Unions

**Use discriminated unions for all anticipated failure modes. Do not throw for expected
failures. Name them `FooResult`.**

```typescript
// GOOD: discriminated union for expected outcomes
type GetUserResult =
  | { type: 'ok'; user: User }
  | { type: 'not_found' }
  | { type: 'forbidden' };

function getUser(id: string, requesterId: string): GetUserResult {
  const user = db.users.get(id);
  if (!user) return { type: 'not_found' };
  if (!canAccess(requesterId, user)) return { type: 'forbidden' };
  return { type: 'ok', user };
}

// Usage
const result = getUser(id, requesterId);
switch (result.type) {
  case 'ok':
    return result.user;
  case 'not_found':
    // handle not found
  case 'forbidden':
    // handle forbidden
}

// BAD: throwing for expected failures
function getUser(id: string): User {
  const user = db.users.get(id);
  if (!user) throw new Error('not found'); // caller can't distinguish from unexpected errors
  return user;
}
```

**Rule:** If a caller should reasonably handle an outcome, it belongs in the return
type. Throw only for genuinely unexpected errors — programming errors, violated
invariants, unrecoverable states.

### Unexpected Errors: Throw

```typescript
// GOOD: throw for genuinely unexpected error
function parseConfig(raw: string): Config {
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error('failed to parse config: invalid JSON');
  }
}
```

**Ask yourself:** "Should the caller handle this case?" If yes — return type. If it
signals a bug or unrecoverable state — throw.

### Error Messages

**Use lowercase fragments with colon-separated context. Not Title Case.**

```typescript
// GOOD
throw new Error('failed to connect: timeout after 5000ms');
throw new Error(`user not found: id=${userId}`);

// BAD
throw new Error('Failed To Connect');
throw new Error('User Not Found');
```

## Nullability

### Null vs Undefined

**Use `null` for absent values. `undefined` means uninitialized. Coalesce to `null` at
boundaries.**

```typescript
// GOOD: null for absent, undefined for uninitialized
type User = {
  name: string;
  phone: string | null; // may be absent
};

function findUser(id: string): User | null {
  const user = database.users.get(id);
  return user ?? null; // coalesce undefined to null
}

// GOOD: optional properties use ?:
type UserParams = {
  name: string;
  newsletter?: boolean; // may be undefined — that's fine for params
};

// BAD: undefined for explicitly absent values
function findUser(id: string): User | undefined { // prefer null
  ...
}
```

## Enums and Unions

### Prefer String Literal Unions

**Avoid enums. Use string literal unions instead.**

```typescript
// GOOD: string literal union
type Status = 'pending' | 'active' | 'complete' | 'failed';

function processStatus(status: Status): void {
  switch (status) {
    case 'pending': ...
    case 'active': ...
    case 'complete': ...
    case 'failed': ...
  }
}

// BAD: enum
enum Status {
  Pending = 'pending',
  Active = 'active',
}
```

**Rationale:** String literal unions are simpler, compose better with discriminated
unions, and don't generate runtime code.

## Type Safety

### Never Use 'any'

**Always use `unknown` for truly unknown data.**

```typescript
// GOOD: unknown, then narrow with a type guard (see Type Guards)
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

// BAD: using any
function parseJSON(json: string): any { ... }
```

### Type Assertions

**Only for TypeScript system limitations. Always include a comment explaining why.**

```typescript
// OK: DOM API limitation — we know the element type
const input = document.getElementById('email') as HTMLInputElement;

// BAD: assertion to suppress a type error
const user = data as User; // no runtime validation

// BAD: double assertion to escape the type system
const value = (someValue as any) as TargetType;
```

### Non-null Assertion (!)

**Sparingly, with a comment justifying it.**

```typescript
// OK (with comment): known initialization pattern
class Service {
  private connection!: Connection;
  // initialized in async init() called by constructor

  constructor() { this.init(); }
  private async init(): Promise<void> {
    this.connection = await createConnection();
  }
}

// BAD: hiding a real potential null
const value = map.get(key)!; // what if key doesn't exist?
```

### Type Guards

**Use type guards to narrow unknown types. Prefer built-in checks when possible.**

```typescript
// GOOD: typeof/instanceof for primitives/classes
function processValue(value: unknown): string {
  if (typeof value === 'string') return value.toUpperCase();
  if (typeof value === 'number') return value.toString();
  throw new Error(`unsupported value type: ${typeof value}`);
}

// GOOD: custom type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'email' in value
  );
}

// GOOD: discriminated union narrowing
type Result = { type: 'ok'; data: string } | { type: 'error'; message: string };

function handleResult(result: Result): void {
  if (result.type === 'ok') {
    console.log(result.data);
  } else {
    console.error(result.message);
  }
}
```

## Modules

### Exports

**Use named exports only. No default exports.**

```typescript
// GOOD
export function processUser(user: User): ProcessedUser { ... }
export type ProcessedUser = { id: string; name: string };

// BAD
export default function processUser(user: User): ProcessedUser { ... }
```

### No Barrel Files

**Import directly from the module where a thing is defined. Do not create index.ts files
solely to re-export.**

```typescript
// GOOD: import from source module
import { UserService } from './user-service';
import type { User } from './types';

// BAD: importing from a barrel
import { UserService, type User } from './users'; // hides where things live
```

### Import Organization

**Group by source type, alphabetize within groups.**

```typescript
// External dependencies
import { z } from 'zod';
import type { ReadonlyDeep } from 'type-fest';

// Internal modules
import { DatabaseService } from '@/services/database';
import { Logger } from '@/services/logger';

// Relative imports
import { UserRepository } from './user-repository';
import type { User, UserData } from './types';
```

## Documentation

### Doc Comments for Public APIs

**Write a doc comment on an exported function or type only when it says what the name
and types do not:** units, valid ranges, side effects, error conditions, or an example.
Do not repeat the signature. For the comment rules, see `writing-code-comments`.

```typescript
// BAD: repeats the names and types
/**
 * Retrieves a user by ID.
 *
 * @param id - The user's unique identifier
 * @returns The user
 */
export function getUser(id: string): Promise<User | null>;

// GOOD: says what the signature cannot
/** Returns null when the user was deleted. Reads from the replica, so it can lag by seconds. */
export function getUser(id: string): Promise<User | null>;

export type CreateUserParams = {
  readonly name: string;
  readonly email: string;
  /** Defaults to true. Set to false when an admin imports users in bulk. */
  readonly sendWelcome?: boolean;
};
```

## Reference files

Read these when the task needs them.

- [Sharp edges](references/sharp-edges.md): runtime hazards that TypeScript does not
  catch, and money.
- [Classes](references/classes.md): dependency-injection classes and `this`.
- [Generics and utility types](references/generics-and-utility-types.md): generics,
  built-in and `type-fest` utilities, deep immutability.
- [Compiler config](references/compiler-config.md): strict `tsconfig` options.
- [Test data](references/test-data.md): type assertions and factories in tests.

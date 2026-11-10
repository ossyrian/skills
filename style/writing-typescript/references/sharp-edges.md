# Sharp Edges

Runtime hazards that TypeScript doesn't catch. Know these cold.

## Equality

**Always use `===`. Never use `==`.**

```typescript
// BAD: loose equality has surprising coercion
"0" == false;        // true
null == undefined;   // true

// GOOD: strict equality
"0" === false;       // false
null === undefined;  // false
```

## Prototype Pollution

**Never merge untrusted objects into plain objects.**

```typescript
// DANGEROUS
const userInput = JSON.parse('{"__proto__": {"isAdmin": true}}');
Object.assign({}, userInput); // pollutes Object.prototype

// SAFE: use Map for dynamic keys from untrusted sources
const safeStore = new Map<string, unknown>();

// SAFE: validate keys before merge
function safeMerge<T extends object>(target: T, source: unknown): T {
  if (typeof source !== 'object' || source === null) return target;
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    (target as Record<string, unknown>)[key] = (source as Record<string, unknown>)[key];
  }
  return target;
}
```

## Regular Expression DoS (ReDoS)

**Avoid nested quantifiers and overlapping alternatives.**

```typescript
// DANGEROUS: catastrophic backtracking
const bad = /(a+)+$/;   // nested quantifiers
const bad2 = /(a|a)+$/; // overlapping alternatives

// SAFER: simple, anchored patterns
const safer = /^[a-z]+$/;
```

When accepting user-provided regex patterns, use a timeout or run in a worker.

## parseInt Radix

**Always specify the radix parameter.**

```typescript
// BAD: radix varies by engine/input
parseInt("08"); // 0 or 8 depending on engine

// GOOD
parseInt("08", 10);    // 8
Number("08");          // 8 — preferred for decimal
Number.parseInt("08", 10); // also fine
```

## Array Mutations

**Know which methods mutate in place.**

| Mutates                  | Non-mutating alternative   |
| ------------------------ | -------------------------- |
| `.sort()`                | `.toSorted()` (ES2023)     |
| `.reverse()`             | `.toReversed()` (ES2023)   |
| `.splice()`              | `.toSpliced()` (ES2023)    |
| `.push()`, `.pop()`      | `.concat()`, `.slice()`    |
| `.shift()`, `.unshift()` | spread: `[first, ...rest]` |

```typescript
// BAD: mutates original
const sorted = original.sort();

// GOOD: copy first (pre-ES2023)
const sorted = [...original].sort();

// GOOD: non-mutating (ES2023+)
const sorted = original.toSorted();
```

## Numeric Sort

**Default sort is lexicographic, not numeric.**

```typescript
// WRONG
[10, 2, 1].sort();             // [1, 10, 2]

// CORRECT
[10, 2, 1].sort((a, b) => a - b); // [1, 2, 10]
```

## eval and Function Constructor

**Never use `eval()` or `new Function()` with untrusted input.**

```typescript
// DANGEROUS: arbitrary code execution
eval(userInput);
new Function('return ' + userInput)();
```

## JSON Precision Loss

**`JSON.parse` loses precision for large integers.**

```typescript
// PROBLEM: > 2^53 loses precision
JSON.parse('{"id": 9007199254740993}'); // id becomes 9007199254740992

// SOLUTION: use string IDs
type ApiResponse = { id: string }; // keep as string, never parse as number
```

## Promise.all vs Promise.allSettled

**`Promise.all` fails fast. `Promise.allSettled` waits for all.**

```typescript
// Use Promise.all when all must succeed
async function fetchAllRequired(ids: readonly string[]): Promise<User[]> {
  return Promise.all(ids.map(id => fetchUser(id)));
}

// Use Promise.allSettled when partial results are acceptable
async function fetchBestEffort(ids: readonly string[]): Promise<User[]> {
  const results = await Promise.allSettled(ids.map(id => fetchUser(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<User> => r.status === 'fulfilled')
    .map(r => r.value);
}
```

| Method               | Behavior                          | Use when             |
| -------------------- | --------------------------------- | -------------------- |
| `Promise.all`        | Rejects on first failure          | All must succeed     |
| `Promise.allSettled` | Always resolves with status array | Need partial results |
| `Promise.race`       | First to complete wins            | Timeout patterns     |
| `Promise.any`        | First success wins                | Fallback/racing      |

## Unsafe Property Access

**Bracket notation with user input is dangerous.**

```typescript
// DANGEROUS
function getValue(obj: object, key: string): unknown {
  return (obj as Record<string, unknown>)[key]; // could access __proto__
}

// SAFER: validate before access
function safeGetValue(obj: Record<string, unknown>, key: string): unknown {
  if (!Object.hasOwn(obj, key)) return undefined;
  if (key === '__proto__' || key === 'constructor') return undefined;
  return obj[key];
}
```

## Money and Currency

**Native `number` uses IEEE 754 floating-point, which causes precision errors for
financial calculations.**

```typescript
// BAD: native number for currency
const total = 1.1 + 2.2; // 3.3000000000000003

// WARNING: do not use native number for:
// - Money or currency amounts
// - Financial reporting calculations
// - Precision-critical percentages
```

Use a BigNumber or arbitrary-precision library for any financial arithmetic. `number` is
fine for counters, indices, display coordinates, and non-critical calculations.

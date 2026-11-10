# Generics and Utility Types

## Generics

### Naming and Constraints

**Single `<T>` is fine when the generic is self-explanatory. Use descriptive names for
multiple generics or non-obvious cases. Always constrain when possible.**

```typescript
// GOOD: T is fine for a single, obvious generic
function identity<T>(value: T): T {
  return value;
}

// GOOD: descriptive names for multiple or non-obvious generics
function mapItems<TItem, TResult>(
  items: readonly TItem[],
  mapper: (item: TItem) => TResult,
): TResult[] {
  return items.map(mapper);
}

// GOOD: constrained generic
function getProperty<TObj extends object, TKey extends keyof TObj>(
  obj: TObj,
  key: TKey,
): TObj[TKey] {
  return obj[key];
}

// BAD: non-obvious single-letter names for multiple generics
function getProperty<T, K>(obj: T, key: K): any { ... }
```

### Avoid Over-Generalization

**Don't make things generic unless multiple concrete types will actually use it.**

```typescript
// GOOD: specific type for a single use case
function formatUser(user: User): string {
  return `${user.name} <${user.email}>`;
}

// BAD: premature generic
function format<T extends { name: string; email: string }>(item: T): string {
  return `${item.name} <${item.email}>`;
}
```

## Utility Types

### Built-in vs type-fest

**Use built-in utilities when available. Use type-fest for deep operations and
specialized needs.**

```typescript
// GOOD: built-in utilities
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type UserKeys = keyof User;

// GOOD: type-fest for deep operations
import type { PartialDeep, RequiredDeep, ReadonlyDeep } from 'type-fest';

type DeepPartialConfig = PartialDeep<AppConfig>;
```

### Dynamic Keys

**Use `Record<K, V>` for objects with dynamic keys.**

```typescript
// GOOD
type UserCache = Record<string, User>;

// BAD: index signature
type UserCache = { [key: string]: User };
```

### Derived Types

**Use mapped types for transformations. Prefer explicit types over clever utility
chains.**

```typescript
// GOOD: explicit type for a partial update shape
type UserUpdateData = {
  name?: string;
  email?: string;
};

// BAD: overly clever utility nesting
type UserUpdateData = Omit<Partial<User>, 'id' | 'createdAt' | 'updatedAt'>;
```

## Deep Immutability

**Use `Readonly<T>` for shallow immutability. Use `ReadonlyDeep<T>` from type-fest for
nested structures.**

```typescript
import type { ReadonlyDeep } from 'type-fest';

// GOOD: shallow readonly for flat objects
type UserData = Readonly<{
  id: string;
  name: string;
  email: string;
}>;

// GOOD: deep readonly for nested config
type AppConfig = ReadonlyDeep<{
  database: {
    host: string;
    port: number;
    credentials: { username: string; password: string };
  };
}>;
```

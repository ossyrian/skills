# Classes

## When to Use Classes

**Prefer functions over classes, EXCEPT for dependency injection patterns.**

```typescript
// GOOD: class as dependency container
class UserService {
  constructor(
    private readonly db: Database,
    private readonly logger: Logger,
    private readonly cache: Cache,
  ) {}

  async getUser(id: string): Promise<GetUserResult> {
    this.logger.info(`Fetching user ${id}`);
    const cached = await this.cache.get(`user:${id}`);
    if (cached) return { type: 'ok', user: cached };

    const user = await this.db.users.findById(id);
    if (!user) return { type: 'not_found' };

    await this.cache.set(`user:${id}`, user);
    return { type: 'ok', user };
  }
}

// BAD: class with no dependencies — use plain functions
class MathUtils {
  add(a: number, b: number): number {
    return a + b;
  }
}
```

## Class Structure

**Use constructor injection into private readonly fields.**

```typescript
// GOOD: constructor injection, private readonly
class OrderProcessor {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly paymentService: PaymentService,
    private readonly notifier: NotificationService,
  ) {}

  async processOrder(orderId: string): Promise<ProcessOrderResult> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) return { type: 'not_found' };
    // implementation
  }
}

// BAD: public mutable fields
class OrderProcessor {
  public orderRepo: OrderRepository; // should be private readonly
}
```

## The 'this' Keyword

**Use `this` only in class methods. Avoid in object literals.**

```typescript
// BAD: this in object literal (fragile, breaks as callback)
const counter = {
  count: 0,
  increment() { this.count++; },
};

// GOOD: closure over variable
function createCounter() {
  let count = 0;
  return {
    increment: () => count++,
    getCount: () => count,
  };
}
```

# Test Data

**Type assertions are acceptable in tests for test data setup. Prefer factory
functions.**

```typescript
// OK in tests: type assertions for test data
const mockUser = { id: '123', name: 'Test User' } as User;

// GOOD: factory function (preferred)
function createTestUser(overrides?: Partial<User>): User {
  return {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  };
}
```

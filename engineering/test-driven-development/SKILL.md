---
name: test-driven-development
description: Guides test-driven development for every code change that alters behavior. Use when writing, changing, fixing or deleting code, or when writing, editing or removing tests. Covers the red-green loop, what makes a test worth having, editing existing tests before adding new ones, and table-driven tests.
user-invocable: false
---

# Test-Driven Development

Do TDD by default. Write or edit the test first, watch it fail, then write the code.
Skip TDD only in these cases:

- The user says not to use it.
- The work is a throwaway spike or script.

If the repo has no test setup, or the change cannot be tested (styling, config), do not
skip TDD silently. Tell the user why, and ask whether they want tests added. Wait for
the answer before you write code. If no one can answer (an unattended run), continue
without tests and state that choice in your report.

## The loop

1. **Run the existing tests.** This baseline separates your regression from an old
   failure.
2. **Decide what the change is:** new behavior, changed behavior, removed behavior, a
   bug fix or a refactor. The next section says what each one does to the tests.
3. **Red.** Write or edit the test. Run it. Confirm it fails, and that it fails for the
   reason you expect. A test that has never failed proves nothing.
4. **Green.** Write the simplest code that passes.
5. **Refactor.** Clean up while the tests stay green.
6. **Run the full suite after your last edit.** Report the count from that run, not from
   an earlier one.

For a bug fix, the failing test reproduces the bug. Write it before you touch the code.

## What a proper test is

A test states one behavior in one sentence: "a returned folder path moves the file into
that folder." If you cannot write that sentence, do not write the test.

**Test behavior.** Assert on what a caller can observe: return values, saved state,
output, and calls that cross a boundary (network, disk, clock). Mock only at those
boundaries.

**Do not test brittle artifacts.** These break when the code changes shape but the
behavior stays the same:

- rendered markup, class names, and snapshots of rendered output
- log text and exact error wording (unless the wording is the contract)
- which internal function was called, or in what order
- private functions

```tsx
// BAD: breaks when the markup changes, and proves nothing about behavior
expect(render(<Cart items={items} />)).toMatchSnapshot();

// GOOD: asserts what the user can do and see
render(<Cart items={items} />);
expect(screen.getByRole("status")).toHaveTextContent("2 items");
```

**Test what happens when config is set, not that it is set.** Config exists to change
behavior without a code change. A test that reads a value back proves only that an
assignment works. Set the config, then assert on the behavior it controls.

```typescript
// BAD: checks that the flag was set
it("reads the retry limit", () => {
  process.env.RETRY_LIMIT = "3";
  expect(loadConfig().retryLimit).toBe(3);
});

// GOOD: checks what the limit does
describe("fetchWithRetry", () => {
  it.each([
    { name: "stops at a limit of 1", retryLimit: 1, expectedCalls: 1 },
    { name: "stops at a limit of 3", retryLimit: 3, expectedCalls: 3 },
  ])("$name", async ({ retryLimit, expectedCalls }) => {
    const request = vi.fn().mockRejectedValue(new Error("down"));
    await expect(fetchWithRetry(request, { retryLimit })).rejects.toThrow("down");
    expect(request).toHaveBeenCalledTimes(expectedCalls);
  });
});
```

Pass config in as an argument, so the test needs no environment edits. Test the config
loader only for logic it owns, such as parsing, defaults, and rejecting a missing or
invalid value. Assert on that outcome too: `loadConfig({})` throws.

**Do not test a library or framework.** Those have their own tests. Test the decision
your code makes with the library.

```typescript
// BAD: tests that the validation library validates
it("rejects a bad email", () => {
  expect(z.string().email().safeParse("nope").success).toBe(false);
});

// GOOD: tests your rule
it("rejects a signup with a disposable email domain", () => {
  expect(validateSignup({ email: "a@mailinator.com" })).toEqual({
    ok: false,
    reason: "disposable_email",
  });
});
```

A test that cannot fail is also wrong. Do not assert on constants or on your own mocks.

## Existing code: change tests before you add them

When code already exists, its behavior is already covered, at least in part. Do not
reach for a new test first. Find the test that covers the nearby behavior, and use this
table:

| The request                        | The test change                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Changes existing behavior          | **Edit** the test for the old behavior. Watch it fail.                                                   |
| Removes behavior                   | **Delete** the test for it.                                                                              |
| Adds new behavior                  | **Add** a test, or a row in the existing table.                                                          |
| Fixes a bug nothing covered        | **Add** a test that reproduces it.                                                                       |
| Refactors, with no behavior change | **Leave tests alone.** If one breaks, it tested the implementation. Fix or remove that test, and say so. |

Before you add a test, search for one that should already cover the case. Extend it.

Do not loosen or delete a test to get green. If the old behavior is truly gone, edit or
delete the test, and tell the user which tests you changed and why.

## Table-driven tests by default

Write one table per behavior. Each row is data: a name, the inputs, and the expected
result. One body runs every row.

```typescript
describe("shippingCost", () => {
  it.each([
    { name: "free over the threshold", subtotal: 100, region: "US", expected: 0 },
    { name: "flat rate under the threshold", subtotal: 20, region: "US", expected: 5 },
    { name: "international surcharge", subtotal: 20, region: "EU", expected: 15 },
    { name: "zero subtotal", subtotal: 0, region: "US", expected: 5 },
  ])("$name", ({ subtotal, region, expected }) => {
    expect(shippingCost({ subtotal, region })).toBe(expected);
  });
});
```

Why this is the default:

- A new case is one more row, so there is no reason to special-case the code.
- Rows that look alike make an odd case stand out.
- A table asks for code that takes inputs and returns outputs. That code is small,
  encapsulated, and easy to reuse.

**Use a table when** the cases share one setup and differ only in input and expected
output.

**Do not force a table when** the cases need different setup or different flows. Write
separate tests.

**If a table is hard to write, fix the code.** Rows that need different mocks, a
specific order, or shared state mean the code is inconsistent. Split the function, give
it one signature, and move the side effects to the edge. Then the table fits.

## Self-check

- [ ] I ran the tests before my edit and after my last edit, and I report the later
      count.
- [ ] I wrote or edited the test first, and I saw it fail for the right reason.
- [ ] Each test states one behavior in one sentence.
- [ ] No test depends on markup, snapshots, log text or internal calls.
- [ ] No test checks a library or framework.
- [ ] No test only reads back a config value. Each one asserts the behavior the config
      controls.
- [ ] For a change to existing behavior, I edited or deleted a test before I added one.
- [ ] Cases that share a setup are rows in a table.
- [ ] I told the user about every test I deleted or loosened.

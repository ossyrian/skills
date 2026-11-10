---
name: pragmatic-engineering
description: Use when you write, review or ship code, tests, docs or design documents. It helps you choose the simplest change that fits the existing pattern, so a person who did not write it can maintain it.
user-invocable: false
---

# Pragmatic Engineering

Agents write most of what we ship. A person who did not write it maintains it. Make each
change as simple as possible for that person, but no simpler.

Adding is the change an agent reaches for first. A new guard, special case, file,
paragraph or test breaks nothing and passes review alone. Ten of them make a system
nobody can explain. An agent sees only part of the system, so it can add something that
is correct locally and still breaks a pattern it never saw.

This skill decides **what kind of change to make**. Other skills decide the rest:

- `writing-maintainable-code`: how code reads and behaves (names, files, helpers, error
  handling, contracts).
- `writing-code-comments`: comments and doc comments.
- `writing-commit-messages`: commit messages, in the conventional commits format.
- `test-driven-development`: tests.
- `technical-writing`: how prose reads.

This skill applies to code, tests, docs, skills and prompts alike. For language-specific
rules, follow the house style skills for that language.

## 1. Find the pattern

Answer these before you write. Put the answers in your plan when the change is not
trivial.

1. **What is the pattern?** How do siblings do the same job? What did the user set
   earlier in the session or in earlier commits? (Rules for reusing names, files and
   helpers are in `writing-maintainable-code`.)
2. **Does my change follow it, extend it, or work around it?** A workaround is a special
   case. It needs a reason you can say in one sentence.
3. **Is the pattern itself the problem?** Following a bad pattern spreads it. If
   siblings share a flaw, say so. Follow the pattern in this change, and propose the fix
   as a separate change. Do not silently copy the flaw, and do not silently diverge.
4. **Is this the Nth patch of one kind?** At the third guard, flag or exception, stop.
   The model is the problem, not the missing patch.
5. **Is what I build on still in use?** Check that the feature, field or tool is not
   being retired.

### Research what "good" means here

The pattern is not always visible in the current file. The history and the tickets show
what the owners chose, what they rejected, and where the system is going. Check these
before you decide:

1. **Commit history of the code you are changing.**
   - `git log --oneline -- <path>` and `git log -p -S '<symbol>'` show how the code got
     its shape.
   - `git blame -w <file>`, then `git show <sha>`, shows why a line exists. Read the
     commit message and its PR (`gh pr list --search <sha> --state merged`, then
     `gh pr view <n>`).
   - Recent refactors show where the owners are taking the code. Repeated patches to one
     area show a model that does not fit.
   - Reverts and "remove X" commits show what was already tried and rejected.
2. **A ticket tracking system, when a ticket is in play.** A ticket ID in the request, a
   branch name, a commit or a PR means: read the ticket and its comments. Then search
   the system for the feature or component. Look for a project that is retiring it, a
   parent ticket with the real plan, or duplicates that already tried your fix. Use
   whatever tool the session has (MCP, CLI or API). If it has none, say so. Do not skip
   the step silently.
3. **The PRs and review threads around the code.**
   `gh pr list --search '<path or symbol>'`. Owners' review comments often state the
   rule more plainly than any doc.

Stop when you can name the pattern and the direction with evidence. Cite it in your
plan: "`foo.py` moved to the options pattern in `abc123`; I follow it." If the history
and the tickets disagree, or do not answer the question, ask the user.

## 2. Choose the change

| Situation                                                  | Change                                                                      |
| ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| New behavior with no home                                  | **Add**, in the shape of its siblings                                       |
| An existing structure almost handles it                    | **Extend** that structure. Do not build a parallel one                      |
| Special cases pile up, or the shape fights the requirement | **Rework** the model, then express the cases in it                          |
| Unused, duplicated, or supports something retired          | **Remove** it                                                               |
| The cause is config, data or a caller                      | **Fix it there.** It may need no code change                                |
| Behavior must differ by environment or deploy              | Make it **config**, read at the edge. Do not branch on the environment name |

Prefer the simplest change that fully does the job. It may delete more than it adds.

If the right change is bigger than the task (a rework, not a patch), say so and let the
user choose. Do not silently do either one.

### Expedience is a valid choice. Say when you make it

Sometimes the faster change is the right one: an incident, a deadline, a throwaway
script, or a rework that costs more than it saves. That is the user's call. Before you
take the shortcut, say so in one line: what you are choosing, and what it costs later.
For example: "This adds a fourth guard instead of fixing the timeout model. Faster now;
the model still needs the rework." This applies to every kind of change, not only code.

## 3. Look, or ask

- **You know where to look: look.** Read siblings, `main`, the history, the ticket
  tracker, the APIs, logs and data. Do not ask the user for what you can read.
- **You do not know where to look: ask.** Say what you need and why.
- **Do not present a guess as a finding.** Finish the check, or label the point
  unverified.
- **Ask about direction, ownership and history.** Code cannot tell you these. When a fix
  comes from your own investigation, the user lacks your context and you lack theirs. A
  back and forth is a good outcome.
- **Nobody to ask** (a pipeline, subagent or unattended run): write your assumption in
  the PR or report, and take the choice that is easiest to undo.
- **Tiny changes skip the research.** A typo, rename, comment or one-line config value
  does not need a history or ticket search.

## 4. Write for the person who maintains it

The reader of your change did not watch you write it. They have the diff, the PR
description, and the code. Give them what they need to judge the change quickly.

- **Say which choice you made and why,** in the PR description or your report. Name the
  pattern you followed, and say if you added, extended, reworked, removed or fixed it
  elsewhere. One or two sentences are enough.
- **Keep the diff on one purpose.** Put a rework, a rename or a cleanup you spotted in
  its own change, or ask first. A reviewer cannot check a mixed diff.
- **Make the code explain itself.** Names, structure and sibling patterns come before
  comments. See `writing-maintainable-code`.
- **Keep history out of the code.** Put the reasoning, rejected alternatives and test
  evidence in the commit body, not in comments. See `writing-code-comments` and
  `writing-commit-messages`.
- **Write prose for a reader who is new to the topic,** following `technical-writing`.
  Lead with the point, and cut what does not change what the reader does.

### Reviewing a change

Review with the questions from section 1, not only "is the code correct?". Also ask
whether a smaller fix exists in config, a caller, or a deletion.

If a subagent reviewed it, read the design yourself before you pass on its verdict. A
reviewer that checks correctness approves a well-written wrong approach.

## 5. Docs, skills and prose

- **Edit in place.** Fix the wrong sentence. Do not append a note or gotcha that
  contradicts it.
- **Document the contract, not one caller.** A shared package's README does not describe
  one consumer's setup.
- **Cut what is beside the point.** Side findings, open questions that do not test the
  cause, and extra caveats hide the sentence that matters. If the user asks you to
  shorten, the draft was too long. Fix the habit, not only that draft.
- Sentences: `technical-writing`.

## 6. Tests

Tests are the main proof that code does what was meant. For when and how to write them,
use `test-driven-development`.

## Self-check

- [ ] I can name the pattern, and I chose add, extend, rework, remove or fix-elsewhere
      on purpose.
- [ ] If the pattern is flawed, I said so instead of copying it silently.
- [ ] If I took the faster path over the right one, I said so and named the cost.
- [ ] I am not adding the Nth guard, flag or special case of one kind.
- [ ] I checked the commit history, and the ticket tracker if a ticket is in play, for
      what "good" means here.
- [ ] Every new file, type, layer or section has a one-sentence reason.
- [ ] I edited docs and skills in place instead of appending.
- [ ] I looked before I asked. I asked about direction instead of guessing.
- [ ] The diff has one purpose, and the description names the choice I made.
- [ ] I followed `test-driven-development` for any test I ran, added or changed.

## Example cases

Each case names the section it illustrates.

- **Right design, wrong fix (sections 1 and 2).** A service had an opt-out flag for a
  companion tool. A new planner rule injected the tool anyway, and a reviewer approved
  it because the code was correct. The design was wrong: the rule bypassed the opt-out.
  The fix was one config line, or a `depends_on` field. It needed no new rule.
- **The seventh guard (sections 1 and 2).** A browser tool had six timeout guards. A
  seventh was proposed, and it read liveness from log lines. The fix was to write the
  timeout model once and fold the guards into it.
- **Building on a retiring feature (section 1).** A change wired success policies into
  step status while the team was retiring success policies. A search of the ticket
  tracker would have found the retirement project.
- **Breaking the pattern (sections 1 and 4).** A refactor added registry, options,
  constants and customizations files, each with "no good reason". They broke the user's
  `ThingOptions` → `Thing(options)` pattern, which was visible in the sibling modules.
- **Stale test count (section 6).** A PR reported "97 passed" from a run before the last
  edit, and CI failed. The end-to-end test, run after the last edit, found a real bug
  that the unit tests missed.

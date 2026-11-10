---
name: writing-pull-request-descriptions
description: Use when you write or review a pull request description. It sets a template with a short visible part for the human reviewer and a collapsed details block for the long text.
user-invocable: false
---

# Writing Pull Request Descriptions

A pull request description has two parts for two readers:

- **The visible part** is for the human reviewer. It is short. It gives enough context
  to understand the change and to review it.
- **The collapsed `<details>` block** holds the long text an LLM usually writes. A
  reader who needs it opens it. Other readers skip it.

## Title

Write the title as a conventional commit subject: `type(scope): description`, in the
imperative, in lowercase, at 72 characters or fewer. Many repos squash-merge, and the
title then becomes the commit subject. Example:
`fix(webhooks): retry failed payment
webhooks up to three times`.

## Template

```md
# Summary

# What is this?

# Why are we doing this?

# Caveats/gotchas

# Full details

<details>
    <summary>{model_name}</summary>
    {the full description of this change}
</details>
```

| Section                    | Content                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------- |
| **Summary**                | A few sentences. State the core change and the problem it solves.                       |
| **What is this?**          | Bullets only. One bullet for each distinct change.                                      |
| **Why are we doing this?** | Bullets only. Give the motivation, not the mechanics. Link the ticket or issue.         |
| **Caveats/gotchas**        | Omit the section if there are none. Include only what affects a reviewer or a deployer. |
| **Full details**           | Always inside `<details>`. Set the summary text to the name of the model that wrote it. |

## What goes inside `<details>`

- Long explanations of the design and the reasons for it
- Alternatives you considered, and why you did not choose them
- Implementation notes and step-by-step walk-throughs
- Test evidence, command output and investigation notes

Put nothing in `<details>` that a reviewer must know. A reviewer who never opens the
block must still be able to review the PR. Move that text to the visible part and make
it short.

## Write for a reader who did not see your conversation

You built up a lot of context while you worked. The reader has none of it. Read each
visible line as a person who has never seen this task, and check these points:

1. **Name things in full.** Not "the new helper", "the fix" or "as discussed". Say which
   helper, which fix.
2. **Define terms on first use,** or link to where they are defined. Do not use a name
   that you or the user made up during the session, unless the PR explains it.
3. **State the problem before the solution.** Say what was wrong or missing, in terms
   the reader can check.
4. **Do not refer to the conversation.** Not "as you asked", "now" or "finally". Do not
   mention earlier attempts that are not in the repository history.
5. **Say where to look.** Name the module, the behavior or the one file that matters
   most.
6. **Link instead of repeating.** Link the ticket, the design document or the related
   PR.
7. **Say what you did not do,** in one bullet, if a reader may expect it.

If a sentence makes sense only to someone who saw the conversation, rewrite it or move
it into `<details>`.

```md
<!-- BAD: depends on the conversation -->

Fixes the issue we discussed by using the second approach.

<!-- GOOD: stands alone -->

Retries a failed payment webhook up to three times. Before, one network error dropped
the event and the order stayed unpaid.
```

## Style

- Use short sentences, one idea each, in the active voice.
- Use one word for one thing. Do not change a term in the middle of a PR.
- Use the plain word: "use", not "leverage". Keep the small words ("the", "a", "that").
- Cut filler: "This PR...", "In this change we...", "As part of...".
- Prefer fewer, denser bullets to many shallow ones.
- Be specific: name the thing that changed, not "updated X logic".
- Do not list every file, class or function you touched. The diff shows that. Describe
  the concept and the intent.
- Tell the reviewer what matters, where to look and how to think about the change. Be
  pointed, not exhaustive.

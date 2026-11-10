---
name: technical-writing
description: "Load before you write prose that a person will read: a README, design doc, PR description, skill, ticket, code comment or docstring. It sets a plain-writing standard based on ASD-STE100. Do not use it for code or an agent's own notes."
---

# Technical Writing

We write so another person can understand and act. An LLM draft is often longer, vaguer
and harder to read than what the author would have written alone. That makes things
worse, not better. This standard follows the ideas of ASD-STE100 (Simplified Technical
English), the writing standard for aerospace maintenance manuals. The rules below are a
summary, not the specification.

**Use it for:** READMEs, docs, design docs and RFCs, PR descriptions, skills, tickets,
code comments, docstrings and commit message bodies. The user's own style preferences
come first. Chat is free-form unless the user says otherwise. **Don't use it for:** code
itself, or an agent's own scratch notes, memory and trajectories, where brevity rules
differ.

## Sentences

1. **Keep sentences short.** Aim for 20 words or fewer in an instruction and 25 or fewer
   in a description. Split a long sentence into two.
2. **One idea per sentence.** If a sentence has "and" joining two separate facts, make
   two sentences.
3. **Use the active voice.** Say who does what. "The loader caches the rules," not "The
   rules are cached."
4. **Use simple verb forms.** Prefer the present and the simple past. Avoid "will have
   been", and avoid verbs hidden in nouns: "configure it", not "perform the
   configuration of it".
5. **Don't stack nouns.** At most three nouns in a row. "the cache refresh timeout", not
   "the rules cache background refresh worker lock timeout".
6. **Keep the small words.** Write "the", "a" and "that". Dropping them makes text
   harder to parse, not shorter in any useful way.

## Words

1. **One word for one thing.** Pick a term and keep it. If you call it a "run", don't
   later call it a "job" or "execution".
2. **One meaning for one word.** Don't use "check" for both "verify" and "a CI check" in
   the same section.
3. **Prefer the plain word.** "use", not "leverage"; "start", not "initiate"; "about",
   not "approximately"; "help", not "facilitate".
4. **Define a term the first time,** or link to where it's defined. Don't assume the
   reader knows an acronym.
5. **Cut filler.** Remove "basically", "simply", "in order to", "it is important to note
   that", and sentences that only restate the previous one.

## Instructions

1. **Write steps as a numbered list,** one action per step, in the order they happen.
2. **Start each step with the verb:** "Run `make test`." "Open the settings file."
3. **Put a warning before the step it applies to,** not after it.
4. **Say what success looks like** after a step that can fail: the output or state to
   expect.

## Paragraphs and structure

1. **One topic per paragraph,** and at most about six sentences.
2. **Lead with the point.** Put the conclusion or the action first, then the reasons.
3. **Use a table or a list** when you compare things or list more than three items.
4. **Use headings a reader can scan** to find their part.

## Before you finish

Read it once as someone new to the topic:

- Can they act on it without asking you a question?
- Is every sentence needed?
- Would it be shorter and clearer if you had written it without an LLM? If yes, rewrite
  it.

## Example

**Before:**

> In order to facilitate the configuration of the loader, it is important to note that
> the installation script should be leveraged, which will perform the merging of the
> hook configuration into existing settings files while ensuring idempotency is
> maintained.

**After:**

> Run `install_loader.py <repo>` to install the loader. It adds the hooks to your
> existing settings files. You can run it again safely: a second run changes nothing.

## Reports and agent write-ups

Use this for any report an agent writes for a person: a status report, an audit, an
investigation, a recurring digest.

- **Put a TL;DR first,** as short as necessary, but no shorter. It has the answer, and
  at least: why this exists, what it is, and how it was made. Add who it is for and the
  decision or action it asks for, how sure you are, the as-of date, and (for recurring
  reports) what changed since last time.
- **Cut "AI slop".** Slop means style and verbosity, not hallucination.
  - Delete any sentence that does not change what the reader does.
  - Do not clear your throat ("it's worth noting", "let's dive in") or restate ("in
    summary").
  - Use bullets, bold and headers only where they help.
  - Avoid rhythm tricks: lists of three, "it's not X, it's Y", em-dashes, rhetorical
    questions.
  - Do not stack hedges.
  - Use a number or a name instead of "significant" or "various".
  - Do not narrate the process ("I analyzed…"). Lead with the answer.
- **Keep the signal with a raw report and a translated sister doc.** The working agent
  writes a RAW report with no style rules in its prompt. Then the same agent thread
  (same context, history and tool calls) gets one more user message that asks for a
  translated version in this style. Keep both together, for example `report.raw.md` and
  `report.md`. The translation adds no new facts, and every number comes from the raw
  report.
- **Send people the translated report.** The raw one is for agents and audit.
- **Keep a reader's own preferences** (how they like decisions framed, what to lead
  with) in their personal style skill, not here.

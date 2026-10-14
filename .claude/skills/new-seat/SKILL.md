---
name: new-seat
description: Use when the user wants to add a new advisor to the Roast Room, says "add a seat", "new council member", "build a brain for <person>", "make <person> an advisor", or gives a person's name and asks for their brain, agent, or portraits. Takes one name, researches that person's public work, writes the brain folder (_hot, frameworks, principles, positions, voice, stories, books, sources), the seat's agent file, and the four Gemini text-to-image prompts for the animated portrait frames (base, open, mid, blink). Not for running a council (that is /roast-room).
argument-hint: "<person's full name> [--pillar \"Business knowledge and homework\"] [--key lynch]"
---

## What this does

One name in, a complete Roast Room seat out:

1. **Brain**: `.claude/skills/roast-room/brains/<slug>/` with the eight markdown files every seat has.
2. **Agent**: `.claude/agents/council-<key>.md`, the sub-agent that reads that brain.
3. **Portrait prompts**: four Gemini image prompts (base, open, mid, blink), saved to `docs/portraits/<key>-prompts.md` and printed in chat.
4. **Registration snippets**: the lines to add to `app/lib/seats.mjs` and `references/seats.md`. Shown, not applied, unless the user says to apply them (a new seat changes "seven" in several places and the weighting rules).

Read once before you start: `references/brain-formats.md` (what each brain file looks like), `references/agent-template.md`, `references/portrait-prompts.md`. For a model of the finished product, open `.claude/skills/roast-room/brains/warren-buffett/` and `.claude/agents/council-buffett.md`.

## The rules that do not bend

- **Every quote is verbatim from a source you actually fetched.** Never write a quote from memory, never "clean up" wording beyond adding punctuation to captions. If you cannot find the line in the fetched text, it is not a quote; paraphrase it and drop the quotation marks.
- **Every claim ties to a source id** (`S001`, `S002`, ...) that exists in `sources.md`.
- **No invented facts, numbers, stories, or opinions.** If the corpus has nothing on a topic, write "No recorded position" like the existing brains do.
- **No book text.** Cover books through how the person teaches them in public. Keep each quote short (the existing brains stay under about 40 words).
- The seat is a simulation built from public work. Say so in `sources.md` and the agent file. Never write words for the person that are not in the corpus.
- Use the pronouns the person uses publicly in their own sources. If you cannot tell, write "they".
- House writing rules: plain English, short sentences, no em dashes, no hype, no filler.

## Step 1: Scope the seat

From the user's input, settle these. Propose defaults for anything missing, state them in one line, and go. Ask (AskUserQuestion, one batch) only when the person is ambiguous (two people share the name) or the pillar is a real fork.

- **Name, key, slug.** `key` is the short lowercase handle used in agent and file names (`lynch`, `garyvee`); `slug` is `first-last` (`peter-lynch`). Both must be unused: check `.claude/agents/` and `brains/`.
- **Pillar and owned question.** The one business area this person is a world-class operator in, and a question in the same shape as the roster in `references/seats.md` ("Will people pay, how much, and how do we close?"). It must not duplicate an existing pillar. If the person does not fit any gap, tell the user before building.
- **Dimension**: the label the seat scores on (`Offer strength and unit economics`).
- **Color**: a hex not used by the current seats (see `app/lib/seats.mjs`).

## Step 2: Build the corpus

Work in a scratch folder outside the repo: the session scratchpad if you were given one, else `$TMPDIR/new-seat-<slug>/`. Never put transcripts in the repo.

1. Find the person's best public work: their own writing (essays, letters, posts), long talks, long interviews, their own channel or podcast, official pages for any method they own. Prefer long-form with a transcript or full text. Aim for 40 to 120 sources; 25 is the floor for a usable brain. If you find fewer, say so plainly, keep going on the best material, and mark the brain as thin in `sources.md`.
2. Fetch the text with whatever is available: WebSearch to find, then WebFetch or `ctx_fetch_and_index` to read. For YouTube, use a transcript tool only if it is already installed (check `which yt-dlp`); do not install anything without asking. If a source cannot be fetched as text, do not use it.
3. Save each source as `S001-short-title.txt`, `S002-...`, numbered in the order you add them. These files are the corpus the checker reads.
4. Keep a running table (id, title, url, date, type, words) for `sources.md`. Types: own channel, own writing, talk, long interview, official method page. Label anything second-hand as such.

If the corpus is large, skim by search first (grep the corpus for each topic) instead of reading everything into the conversation. Do not spawn sub-agents unless the user asks.

## Step 3: Write the brain

Write the eight files into `.claude/skills/roast-room/brains/<slug>/` using `references/brain-formats.md`. Build them in this order, because later files lean on earlier ones:

1. `sources.md` (ids, urls, dates, counts)
2. `frameworks.md` (name each framework the person teaches, how to use it, how to score an option with it, a quote, the sources)
3. `principles.md` (decision rules clustered across sources, with confidence: high = 3+ sources, medium = 2, low = 1)
4. `positions.md` (topic by topic stance, dated quotes, and how the stance changed over time)
5. `stories.md` and `books.md`
6. `voice.md` (cadence, structure, word habits, what they never do, 8 to 12 verbatim voice anchors)
7. `_hot.md` last: the one-page sheet the agent reads first, distilled from the other files (worldview, the rules they decide by, first five frameworks, decision loop, signature questions, voice cheat sheet, where this lens misfires)

Count words and sources honestly; the numbers in `_hot.md`, `sources.md`, and the agent description must match.

## Step 4: Write the agent

Copy `references/agent-template.md` to `.claude/agents/council-<key>.md` and fill it in. The "Your lens" bullets come from the `_hot.md` decision loop. The "natural opponents" line must name real seats from the roster and say where the lens misfires, taken from `_hot.md`. Keep the `description` in the same shape as the other agents (pillar, how many sources, when to use it).

## Step 5: Verify

Run the checker from the project root:

```bash
python3 .claude/skills/new-seat/scripts/check_brain.py <slug> --corpus <scratch folder>
```

It fails on: a missing brain file or `_hot.md` section, a cited source id that is not in `sources.md`, a quoted line that is not in the cited source's text, and any em dash. Fix every failure by correcting the wording or removing the quote, never by editing the corpus. Also confirm the agent file exists and its `Root:` path matches the brain folder.

Then run the portrait step below, and finish with the report.

## Step 6: Portrait prompts

Follow `references/portrait-prompts.md`. Fill the look block (face, hair, glasses or facial hair, signature clothing, any prop with text) from what the sources and public images show; keep it descriptive and do not name the person in the prompts. Save to `docs/portraits/<key>-prompts.md` and print the four prompts in chat, each in its own fenced block, plus the three-line workflow and the `cwebp` commands for the finished frames.

## Step 7: Report

Keep it short:

- What was built: the brain path with source count and word count, the agent path, the prompts path. Flag anything thin (few sources, topics with no recorded position).
- The checker result, in one line.
- The four prompts (in their blocks), or a pointer if they were already printed.
- Registration, ready to paste: the `SEATS` entry for `app/lib/seats.mjs` and the table row for `references/seats.md`. Ask once whether to apply them. If yes, also tell the user what else says "seven" or "21 runs" (`CLAUDE.md`, `README.md`, `roast-room/SKILL.md`, `scoring.md`) and update those too.
- One line: portraits go in `app/public/portraits/` as `<key>-base|open|mid|blink.webp`, and the room will not show the seat until it is registered.

## Files

- `references/brain-formats.md`: the schema of each brain file.
- `references/agent-template.md`: the agent file with placeholders.
- `references/portrait-prompts.md`: the Gemini prompt templates, workflow, and QA checklist.
- `scripts/check_brain.py`: structure, source id, quote, and em dash checks.

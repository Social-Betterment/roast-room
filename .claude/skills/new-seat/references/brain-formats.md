# Brain file formats

Every seat's brain is eight markdown files in `.claude/skills/roast-room/brains/<slug>/`. The shapes below are taken from the existing brains (`warren-buffett` is a good model). Match them: the app loads `_hot.md`, `frameworks.md`, `positions.md`, `principles.md`, and `voice.md` into the seat's prompt, and `check_quotes.py` reads every file when it verifies a council.

Quote format everywhere: `"verbatim words" (S012)` or `"verbatim words" (S012, 2026-08-19)`. The quote must sit inside one source. Add punctuation to auto captions if needed, but keep the words. Do not join two passages into one quote.

## sources.md

```markdown
# Sources: <Name>

<N> sources, <types>, about <words> words, <first year> to <last year>. <How many are their own channel or writing, how many are interviews.> No book text: the books are covered through their own public teaching of them. <Note if the brain is thin.>

Dates are publish dates. Quotes come from <auto captions | the published text>, so <punctuation was added during extraction>.

| ID | Title | URL | Date | Type | Words |
|---|---|---|---|---|---|
| S001 | ... | https://... | 2023-08-05 | own channel | 9,945 |
```

IDs run `S001` upward with no gaps. These are the only ids any other file may cite.

## frameworks.md

```markdown
# Frameworks: <Name>

<N> frameworks, grouped by the job they do (<groups>). "Sources" counts distinct sources that use the framework or a clear synonym.

---

## <Group>

### 1. <Framework name> *(<book, if any>)*
- **What it is:** one or two sentences, with the formula if there is one.
- **Parts:** the pieces, each with a source id.
- **When to use:** the decisions it fits.
- **How to score:** how the seat rates an option with it, 1 to 10, and what scores low.
- **Quote:** "verbatim" (S115)
- **Sources:** 20 (S002, S003, ...)
```

Aim for 15 to 30 frameworks. Only include methods the person actually teaches.

## principles.md

```markdown
# Principles: <Name>

<N> decision rules, clustered across sources. Confidence: high = 3+ sources, medium = 2, low = 1. Quotes are verbatim.

## <Cluster>

**1. <The rule as a short imperative, one or two sentences.>**
- "verbatim" (S114)
- "verbatim" (S117)
- Sources: 9 (S012, S013, ...). Confidence: high.
```

Aim for 20 to 35 rules. Order clusters by how often the person decides from them.

## positions.md

```markdown
# Positions: <Name>

<N> founder topics. Each has the stance, verbatim quotes with source id and date, and changes over time side by side. Dates are publish dates; note compilations of older material. "No recorded position" means the corpus has nothing direct.

## <Area, e.g. Money and pricing>

**1. <Topic>.** The stance in one or two sentences.
- "verbatim" (S012, 2026-08-19)
- Shift: <year> says X (S114); <year> says Y (S044). Or "Consistent 2020 to 2026."

**No recorded position:** <topic>, <why it is thin>.
```

Cover the topics a founder brings to the room: pricing, hiring, raising money, new products, partnerships, pivots, spending, focus, risk, exits, and anything the person is known for. Do not stretch a stance to fill a topic.

## stories.md

```markdown
# Stories: <Name>

<N> stories and case studies they reuse, most-told first. Figures are as they tell them; they sometimes vary between tellings.

1. **<Short title.>** What happened, in two or three sentences with the real figures. Lesson: one line. (S029, S037, ...)
```

## books.md

```markdown
# Books: <Name>

Built only from how they teach the books in public. No book text is reproduced.

## <Book title> (<Month Year>)

- **Year:** ...
- **Core thesis:** one or two sentences.
- **Key frameworks:** names, with pointers to frameworks.md numbers.
- **Taught in:** S001, S002, ...
- **Figures they cite:** ...
```

If the person has no books, say so in one line and list the closest long-form body of work (a letter series, an essay archive, a course) in the same shape.

## voice.md

```markdown
# Voice: <Name>

## How they talk

- **Cadence:** ...
- **Structure:** ...
- **Opening an argument:** ...
- **Math or evidence, live:** ...
- **Closing:** ...
- **Disagreeing:** ...
- **Analogies:** the recurring ones.
- **Word habits:** words and how many sources use them (count them in the corpus; do not guess).
- **Signature phrases (sources using them):** ...

## What they never or rarely do (inferred from the <N> sources)

- bullets, each backed by a count or an absence you checked in the corpus.

## Voice anchors (verbatim)

1. "..." (S006)
... 8 to 12 anchors, each different in tone or move.
```

## _hot.md

The one-page sheet the agent reads first. Keep it near 4 to 5 KB.

```markdown
# <Name> seat: hot sheet

**Pillar:** <pillar>. **Question this seat owns:** <question>

Built from <N> public <types> (<years>, about <words> words). Not <Name> themselves; quotes are verbatim with ids from `sources.md`.

## Worldview

Three or four sentences: how this person sees a business, in their logic.

## The <N> rules they decide by

1. **<Rule.>** "verbatim" (S114)

## First 5 frameworks

1. **<Name>:** one line (S115, S114).

## Decision loop

1. Numbered steps the seat runs on any brief, each tied to sources where it helps.

## Signature questions

- The five or so questions they always ask.

## Voice cheat sheet

- Five short bullets.

## Where this lens misfires

- **<Case.>** Where the person's own words or record show the lens failing: stage, industry, survivorship, topics they came to late (S052).
```

The misfire section is required and must be honest. It is what lets the other seats and the Chair weigh this seat fairly.

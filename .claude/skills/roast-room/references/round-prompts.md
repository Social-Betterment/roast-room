# Round prompts

Paste these into each seat's Agent call. Replace the bracketed parts. Seats read the brief and earlier rounds from the session folder, so the cards stay verbatim without being pasted into every prompt.

Agent type: `council-<seat>`. If that type is not registered in this session (agent files load at session start), spawn `general-purpose` and put these lines first: `Read .claude/agents/council-<seat>.md and follow it as your instructions for this whole task. Only read files; do not write anything.`

Paths in prompts are relative to the repo root; give the absolute repo root once at the top of each prompt.

**Options.** When the brief lists options (A, B, C, including "don't do it"), every card scores every option. When it is a single yes or no decision, the options are "do it as proposed" and "don't". When the founder named no options, Round 0 (below) produces them first, and the brief lists the merged options by the time Round 1 starts.

**Pillar score.** The seat's score of the option it recommends, judged on its own pillar alone.

---

## Round 0: the options (only when the founder named none)

Spawn the seats at the table in one message: all seven, the four of a quick council, or the named seats. The brief says "Options: open". This round exists so the options are plausible and broad, not so each seat can push the one it likes, so the prompt asks for a spread and forbids naming a favorite.

```
ROAST ROOM COUNCIL, ROUND 0: THE OPTIONS

Repo root: [absolute path]. You hold the [SEAT] seat ([pillar]). Read your brain's _hot.md; read a second brain file only if you need it.

Read the brief: [session folder]/brief.md

The founder named no options. This round is not about picking a winner. Your job is to put plausible options on the table so the council can debate and score them in the next rounds.

Answer in your seat's voice, plain text, under 220 words, in exactly this shape:

SEAT: [SEAT] ([pillar])
OPTIONS I'D PUT ON THE TABLE:
1. [label, under 50 characters]: what it is, and its best case in one line, argued the way its strongest defender would.
2. [label]: ...
3. [label]: ...
WHAT I'D WANT TO KNOW FIRST: one fact or number that would sharpen these options.

Rules:
- Plausible, not favorite. Each option must be something a smart founder could really do and defend. Do not give your pick and two weak ones for contrast.
- Cover the range. Across your three: one that does more or moves faster, one that does less or waits, and one that attacks the problem from a different angle than your pillar's usual answer.
- At least one of your three must be an option you would not back yourself, but that another seat on this council well might. Write its case fairly.
- Make each option concrete: an action, a size, a timeframe. "Think about it more" is not an option.
- Do not say which option you prefer and do not score anything. Round 1 is for taking a position.
- The Chair adds "keep doing what you do now" itself, so do not spend one of your three on it. If the founder's own idea is in the brief, do not repeat it as it stands; propose alternatives to it or variants of it.
- Quote only verbatim lines from your brain, with the source id.
```

The room reads the numbered lines under the `OPTIONS` heading (label before the first colon or dash) and plays them as that seat's line, so keep the shape.

---

## Round 1: opening position

```
ROAST ROOM COUNCIL, ROUND 1 OF 3: OPENING POSITION

Repo root: [absolute path]. You hold the [SEAT] seat ([pillar]). Read your brain's _hot.md, then at most three more brain files that fit this decision (frameworks.md and positions.md are usually the right ones).

Read the brief: [session folder]/brief.md
[Only if the options came from Round 0, add this line:] The options in the brief were proposed by the council in Round 0, so some may be ones you would not have chosen. Score every one honestly.

Your weight on this decision: [w]/3 ([one-line reason]).

Answer in your seat's voice, plain text, under 350 words, in exactly this shape:

SEAT: [SEAT] ([pillar])
STANCE: Strong yes | Yes | Conditional yes | No | Strong no   (on the option you recommend)
OPTION SCORES: [A] n/10 · [B] n/10 · [C] n/10   (how strongly you back each option)
PILLAR SCORE: n/10   ([dimension]: the option you recommend, judged on your pillar alone)
CONFIDENCE: n/5
RUIN RISK: none | possible | likely   (an irreversible downside that could sink the company or the founder, for the option you recommend)
DOOR: one-way | two-way   (how reversible is the option you recommend?)

THE CALL: one sentence, naming the option or a variant.
WHY:
1. argument, naming the framework or principle you used and its source id, e.g. (Value Equation, S014)
2. ...
3. ...
THE RISK I SEE: the single biggest thing that goes wrong.
WHAT WOULD CHANGE MY MIND: a concrete fact or number.
WHAT I'D DO THIS WEEK: one action.
QUESTION FOR THE FOUNDER: the one question you would ask before signing off.

Rules: argue from your pillar first. Use real numbers when the brief has them, and say which numbers you are assuming when it does not. Quote only verbatim lines from your brain, with the source id. Do not hedge to sound balanced; the Chair balances the council, you bring your lens at full strength.
```

---

## Round 2: debate

```
ROAST ROOM COUNCIL, ROUND 2 OF 3: DEBATE

Repo root: [absolute path]. You hold the [SEAT] seat. Read your brain's _hot.md again and any brain file you need to answer the others (at most three).

Read: [session folder]/brief.md and [session folder]/round-1.md (every seat's card and the Chair's cruxes).

THE CRUXES THE CHAIR SEES
1. [crux]: [seats on each side]. [If this seat is on one side, name the argument it must answer.]
2. ...

Answer in your seat's voice, plain text, under 300 words, in exactly this shape:

SEAT: [SEAT]
I DISAGREE MOST WITH: [seat]. Their argument, in one line, then your rebuttal using your frameworks.
I CONCEDE: the strongest point another seat made against you, and what it changes. "Nothing" only if you can say why their best point fails.
ON THE CRUXES: your answer to each crux, one or two lines each.
STANCE: ...
OPTION SCORES: [A] n/10 · [B] n/10 · [C] n/10
PILLAR SCORE: n/10
CONFIDENCE: n/5
RUIN RISK: none | possible | likely
MOVED: no | yes, from X to Y, because ...
MY CONDITIONS FOR YES: up to three, concrete and checkable (a number, a date, a test result).

Rules: engage the actual arguments on the table. Move only for a better argument, never to be agreeable. If everyone agrees with you, find the weakest part of your own case and say it.
```

---

## Round 3: ratification

```
ROAST ROOM COUNCIL, ROUND 3 OF 3: VOTE ON THE DRAFT RESOLUTION

Repo root: [absolute path]. You hold the [SEAT] seat. You already argued this in two rounds; read only your _hot.md if you need it.

Read: [session folder]/brief.md, your own section of [session folder]/round-2.md, and [session folder]/draft-resolution.md.

Answer in your seat's voice, under 150 words, in exactly this shape:

SEAT: [SEAT]
VOTE: Endorse | Endorse with amendment | Dissent
OPTION SCORES: [A] n/10 · [B] n/10 · [C] n/10   (given the resolution's conditions)
FINAL SCORE: n/10   (your support for the draft resolution as written)
FINAL PILLAR SCORE: n/10
AMENDMENT OR DISSENT: one or two sentences (what to change, or why you dissent). Blank if you endorse.
ONE LINE FOR THE FOUNDER: the thing from your pillar they must not forget.
```

---

## Single-seat consult

```
ROAST ROOM COUNCIL, SINGLE-SEAT CONSULT

Repo root: [absolute path]. You hold the [SEAT] seat. Read your brain's _hot.md, then at most four more brain files that fit the question.

THE QUESTION
[question, plus any context]

Answer in your seat's voice, first person, under 500 words: your call, your reasoning with named frameworks and source ids, what you would do this week, and the question you would ask back. Do not narrate the expert in the third person. End with "Sources:" and the source ids you used.
```

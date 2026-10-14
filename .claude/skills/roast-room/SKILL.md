---
name: roast-room
description: Use when a founder wants a hard business decision debated by a council of world-class operators, says "roast room", "put this in the Roast Room", "founder council", "convene the council", "take this to the board", "what would Lynch, Bezos, or Buffett say", "should I do X", or can't make up their mind on pricing, hiring, raising money, a new product, a partnership, a pivot, an event, or spending. Seven sub-agents, each built from one expert's public work (Bezos, Mohnish Pabrai, Lynch, Philip Fisher, Dan Martell, Howard Marks, Buffett), argue it over three rounds, then a Chair returns a scored verdict, the reasoning, the dissent, and next steps. When the founder names no options, the seats first propose plausible ones (Round 0). Also does a one-seat consult ("ask the Lynch seat"). Not /roast (generic personas, idea validation).
argument-hint: "[the decision] [--quick] [--seats lynch,buffett,...] | ask <seat> [question]"
---

## What this does

The Roast Room: runs a board meeting on one decision. Seven seats, one per business pillar, each a sub-agent that reasons and talks the way its expert does, grounded in a brain compiled from that person's videos, essays, letters, talks, and books as they teach them in public. The seats argue across three rounds: open, debate, vote. If the founder names no options, a short **Round 0** comes first: every seat proposes plausible options, you merge them into one list, and the three rounds then debate and score that list. You act as the **Chair**: you never argue a side, you run the room, keep the score, and write the verdict.

Read once before the first run: `references/seats.md` (roster, weights, tensions), `references/round-prompts.md` (what each seat gets), `references/scoring.md` (math and overrides), `references/report-template.md` (output), `references/live-room.md` (the small JSON files the visual room plays). A finished example council lives in `sessions/2026-10-09-example-take-the-seed/`.

## Modes

- **Full council** (default): all seven seats, three rounds. For decisions that are expensive or hard to undo.
- **Quick** (`--quick`): four seats chosen per `seats.md`, Rounds 1 and 2, Round 3 only if the scores did not converge. For reversible calls.
- **Named seats** (`--seats a,b,c`): only those seats, three rounds.
- **Consult** (`ask <seat> ...`): one seat, one answer, using the single-seat prompt. No scoring, no session folder needed.

Round 0 applies in every mode except Consult, and only when the founder named no options. It uses the seats at the table (all seven, the four of a quick council, or the named seats). It is not scored and does not count as one of the three rounds.

## Step 1: The brief

The council is only as good as the brief. Build it from what the user gave you. If any of the first four items is missing, ask for them in one batch (AskUserQuestion, at most four questions), then proceed. **Missing options are never a reason to ask**: Round 0 handles them. If the user says "just run it", fill gaps with stated assumptions.

1. **The decision** in one line, and the options if the founder gave them.
   - **Options given** (two or more alternatives, an either/or, or "Options: Yes, No"): list them as A, B, C in the founder's words. Always include "don't do it" (or "keep doing what you do now") and any alternative the founder mentioned. Skip Round 0.
   - **No options** (an open question such as "what should I do about churn?", or one idea with no alternatives such as "should I hire a CFO?"): do not ask for options and do not write any yourself. Put "Options: open, proposed in Round 0" in the brief and run Round 0 (Step 2b). If the founder named one idea, it stays on the final list as the founder's own idea, and the seats propose alternatives to it.
2. **The business**: what it sells, to whom, stage, monthly revenue, margin if known, team size.
3. **The resources**: cash or runway, founder hours, deadline.
4. **What success looks like** and the time horizon.
5. **Which way the founder is leaning, and why** (the council tests the lean, it does not echo it).

Context lookup: if this project holds notes about the founder's business (a `CLAUDE.md`, a `business.md`, or similar), read them for real numbers before asking.

Keep the brief under 300 words. Mark every assumption as `(assumed)`.

## Step 2: Set up the room

- Set a relevance weight per seat (1 to 3) with a one-line reason, per `seats.md`. The weights do not depend on the options, so set them now, before Round 0.
- Create the session folder: `sessions/YYYY-MM-DD-<decision-slug>/` at the project root. Save `brief.md` (the brief, the options, and the weights table) and `council.json` (`live-room.md`). When the options are open, write `"options": []` and `"options_open": true` in `council.json`.
- Tell the user once: "Watch it live at http://localhost:4730" (the Roast Room plays the council as these files land; it is optional and the council runs the same without it).

## Step 2b: Round 0, the options (only when the options are open)

Skip this step when the founder gave options.

Spawn every seat at the table in **one message**, in parallel, foreground (`run_in_background: false`), `subagent_type: council-<seat>`, with the Round 0 prompt (`round-prompts.md`). The prompt asks each seat for three plausible options across the range, including one it would not back itself, and forbids naming a favorite, so the list is broad and not seven pitches.

When the cards come back, save them verbatim to `round-0.md`, one `## <Seat>` heading per card, and write the file right away so the room can start playing. Check each card: three numbered options, labels under 50 characters, no favorite named, and not one real option plus two strawmen. Send a card back once if it fails. Then merge the proposals into the options the council will score:

- **Merge only true duplicates** (same action, same size and timing). Keep a seat's own wording for the label and shorten it only past 50 characters. Credit every seat that proposed a version.
- **Keep the range.** The list should span doing more or moving faster, doing less or waiting, and a different angle, whenever the seats proposed them. Do not drop an option because only one seat proposed it if it is really different: the odd one out is often the one the room needs. Drop only duplicates, strawmen, and anything that cannot be done, and say what you dropped and why.
- **Do not invent.** The only option you add yourself is the baseline, "keep doing what you do now" or "don't do it", if no seat proposed it. If every proposal points the same way, put the other side to the two seats whose pillars sit furthest from it (one more short run each) instead of writing it yourself.
- **The founder's own idea**, if there is one, stays on the list.
- **At most five options**, ids A to E, boldest first and the baseline last. Four is the sweet spot. If more than four distinct options remain besides the baseline, merge the two neighbors that differ least into one option (use the clearer label and name the difference in a few words), and say so in the Chair notes.

Then add `## Chair notes` to `round-0.md`: the final list with who proposed each, what you merged, and what you dropped and why. Rewrite `council.json` with the final `options` (each with `by`), `"options_open": false`, `"options_from": "round0"`, and an `options_note` (one or two plain sentences), and put the same options in `brief.md`. The weights do not change. Then go on to Round 1.

## Step 3: Round 1, opening positions

Spawn every seat in **one message**, in parallel, foreground (`run_in_background: false`), `subagent_type: council-<seat>`, with the Round 1 prompt (add its Round 0 line when the options came from Round 0). If a `council-*` type is not registered in this session, use `general-purpose` with the fallback lines from `round-prompts.md`.

When the cards come back, save them verbatim to `round-1.md`, one `## <Seat>` heading per card (Bezos, Pabrai, Lynch, Fisher, Martell, Marks, Buffett), and write the file right away so the room can start playing. Check each card has every field; send a card back once if it is missing scores or a stance. Then add a `## Chair notes` section at the bottom of `round-1.md`:

- The **cruxes**: the one to three underlying disagreements that explain why seats split (a factual question, a numbers question, or a values question such as speed versus safety), with the seats on each side.
- The **unanimity check** (`scoring.md`): if Round 1 converged, make the strongest unargued alternative a crux and name which seats must argue it at full strength.
- Any card that broke format or misread the brief.

Then write `cruxes.json` (`live-room.md`).

## Step 4: Round 2, debate

Spawn every seat again, in one message, with the Round 2 prompt (it points them at `brief.md` and `round-1.md`). Save the cards to `round-2.md` (same `## <Seat>` headings, written as soon as the cards are back) with `## Chair notes`: who moved and why, which cruxes resolved, which numbers are still open, and the interim option scores.

## Step 5: Draft resolution

Write `draft-resolution.md`: the recommendation (named option and verdict label), the conditions the seats asked for (merge duplicates, keep them checkable, pick one number when seats differ and say whose), the next steps with dates, the cheapest test, and kill criteria. Weigh arguments, not headcount: a single seat with a decisive fact beats three seats with vibes. Apply the overrides. Also write `draft.json` (`live-room.md`).

## Step 6: Round 3, ratification

Spawn every seat with the Round 3 prompt. Save to `round-3.md` (same headings, written as soon as the cards are back), and add a `## Chair` section listing each amendment and whether it was adopted, with the reason. Adopt an amendment when no seat objects or the argument for it went unanswered; when seats conflict, adopt the better-argued side and put the other in the minority report. Do not run a fourth round.

Quick mode skips this round when the Round 2 spread on the top option is 3 or less and no seat is at `RUIN RISK: likely`.

## Step 7: Verify, then verdict

1. Run `python .claude/skills/roast-room/scripts/check_quotes.py <session folder>` (try `python3` if `python` is missing). Every quote attributed to a source id must be in a brain. Remove any unverified quote from the verdict (and say so in the Chair notes). If Python is not installed, do not stop or ask the user to install it: check each attributed quote yourself by searching that seat's brain folder for the exact words, and treat any you cannot find as unverified.
2. Compute the numbers from the last round's cards per `scoring.md`, apply the overrides, and write `verdict.md` from `report-template.md`. Write `verdict.json` last (`live-room.md`); it tells the room the council is over.
3. Show the user a short verdict in chat, not the full report: the label and the call, the option scores on one line (when Round 0 ran, name the options once with who proposed each, so the user sees what was scored), the three arguments that carried the room (one line each, with the seat), the strongest objection (one line, with the seat), and the next steps (at most three). Then the path to `verdict.md` for the full detail, one line saying the branded PDF is one click away ("Download PDF" on the verdict at http://localhost:4730), and one line offering a follow-up with any seat or a rerun with new facts. Keep it under 200 words: a founder should be able to decide from it at a glance.

## Chair rules

- You never argue a side and never add your own pillar. If no seat raised an important point, put it to the closest seat as a crux in the next round instead of inserting it yourself.
- Quote seats faithfully. Never put words in a seat's mouth or rewrite a card.
- Seats speak in their expert's voice; your report is plain English that follows the house writing rules (no em dashes, no AI tells, no tee-ups).
- Treat a unanimous Round 1 as a warning, not a win.
- Round 0: never rewrite a seat's proposal. Merge only true duplicates, add only the baseline, and keep the spread (Step 2b). A list where every option points the same way is a failed Round 0, not a consensus.
- Cost: a full council is 21 sub-agent runs, about 1M tokens; Round 0 adds one short run per seat (7 in a full council). Use `--quick` for small calls, and say which mode you used.
- The seats are simulations built from public work. Never present a seat's line as something the real person said unless it is a verbatim quote with a source id from the brain.

## Without sub-agents (Codex or a runtime that cannot spawn agents)

Run the same protocol sequentially yourself. For each seat, read `.claude/agents/council-<seat>.md` and its brain, write that seat's card, then clear your head before the next seat: do not let one seat's card shape the next one's in Round 1. Round 0 works the same way: write each seat's proposals without looking at the other seats' proposals. Rounds 2 and 3 work the same way with the prior cards in view.

## Files

- `brains/<slug>/`: one brain per seat (`_hot.md`, `frameworks.md`, `principles.md`, `positions.md`, `voice.md`, `stories.md`, `books.md`, `sources.md`).
- `scripts/check_quotes.py`: verifies every attributed quote in a session against the brains.
- Agents: `.claude/agents/council-{bezos,pabrai,lynch,fisher,martell,marks,buffett}.md`.
- The room app: `app/` (start at the project `README.md`).

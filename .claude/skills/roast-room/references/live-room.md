# Live room files

The Roast Room (a local web app on http://localhost:4730) watches the sessions folder and plays a council as its files appear: portraits talk one at a time, rebuttal arrows fly, votes land, and the verdict comes up. It reads the round files you already write, plus four small JSON files. Write each one at the moment listed, as plain JSON (no comments, no trailing commas). Seat names can be keys (`garyvee`) or display names (`Gary V`).

The room is optional. Write these files anyway; they cost a few lines and the council runs the same without the room.

## Order

| When | File |
|---|---|
| Step 2, with `brief.md` | `council.json` (with `"options": []` and `"options_open": true` when the founder named no options) |
| Round 0 cards back (only when the options are open) | `round-0.md` (one `## <Seat>` heading per card, cards verbatim, `## Chair notes` last) |
| After the Round 0 merge (only when the options are open) | `council.json` again, with the final options |
| Round 1 cards back | `round-1.md` (one `## <Seat>` heading per card, cards verbatim, `## Chair notes` last) |
| After the Round 1 Chair notes | `cruxes.json` |
| Round 2 cards back | `round-2.md` |
| With `draft-resolution.md` | `draft.json` (skip in quick mode when Round 3 is skipped) |
| Round 3 cards back | `round-3.md` |
| Last, after `verdict.md` | `verdict.json` |

## council.json

```json
{
  "title": "Raise coaching price to $3,500",
  "decision": "Raise the price from $2,000 to $3,500, and for whom.",
  "mode": "full",
  "options": [
    { "id": "A", "label": "Raise to $3,500 for everyone now" },
    { "id": "B", "label": "Raise for new clients only" },
    { "id": "C", "label": "Keep $2,000" }
  ],
  "weights": {
    "lynch": { "weight": 3, "reason": "The founder is entering a market they do not know" },
    "buffett": { "weight": 2, "reason": "Cash risk of losing clients" }
  },
  "seats": ["bezos", "pabrai", "lynch", "garyvee", "martell", "marks", "buffett"],
  "brief": "Two or three sentences.",
  "assumptions": ["Close rate holds at 50% (assumed)"]
}
```

`mode` is `full` or `quick`. `seats` lists only the seats at the table. Give every seat at the table a weight (1 to 3). Option labels stay short: under 50 characters.

## Open options (Round 0)

When the founder named no options, write `council.json` first with no options, so the room can seat the council while the seats propose some:

```json
{
  "title": "Unstick the newsletter",
  "decision": "What should I do next with a newsletter stuck at 4,000 subscribers?",
  "mode": "full",
  "options": [],
  "options_open": true,
  "weights": { "garyvee": { "weight": 3, "reason": "Growth here is an attention problem" } },
  "seats": ["bezos", "pabrai", "lynch", "garyvee", "martell", "marks", "buffett"],
  "brief": "Two or three sentences.",
  "assumptions": []
}
```

The seats answer in `round-0.md`: a `## <Seat>` heading per card, and under an `OPTIONS I'D PUT ON THE TABLE:` line three numbered options, each `label: what it is and its best case`. The room plays each seat's labels as that seat's line. Then the Chair merges the proposals and rewrites `council.json` with the final options:

```json
{
  "options": [
    { "id": "A", "label": "Run three cheap growth tests in 60 days", "by": ["bezos", "buffett"] },
    { "id": "B", "label": "Call twenty subscribers, then narrow the topic", "by": ["lynch", "marks"] },
    { "id": "C", "label": "Your own idea, kept on the list", "by": ["founder"] },
    { "id": "D", "label": "Keep doing what I do now", "by": ["chair"] }
  ],
  "options_open": false,
  "options_from": "round0",
  "options_note": "Merged 21 proposals into 4 options. Dropped two near-duplicates and one that could not be done."
}
```

Keep the other fields as they were. `by` lists who proposed each option: seat keys, plus `founder` for the founder's own idea and `chair` for the baseline the Chair adds. Two to five options (three or four is typical), ids A to E, baseline last, labels under 50 characters. The room treats `"options": []` (or `"options_open": true` at the start) as open, plays Round 0, waits until `options` is filled in, then shows the merged options and plays Round 1. Keep `round-0.md` and `"options_from": "round0"` in the finished folder so a replay shows Round 0 too.

## cruxes.json

```json
{
  "cruxes": [
    {
      "question": "Is customer cash enough to fund the next two hires?",
      "sides": [
        { "position": "Yes, prepay covers it", "seats": ["Lynch", "Martell"] },
        { "position": "No, prepay is pulled-forward revenue", "seats": ["Pabrai", "Bezos"] }
      ]
    }
  ],
  "unanimous": false,
  "note": "One plain sentence on what the room is fighting about."
}
```

One to three cruxes. Questions under 90 characters, positions under 50.

## draft.json

```json
{
  "option": "B",
  "label": "GO WITH CONDITIONS",
  "recommendation": "One or two sentences.",
  "conditions": ["Checkable condition"],
  "next_steps": ["Step with a date"],
  "cheapest_test": "One line.",
  "kill_criteria": "One line."
}
```

## verdict.json

```json
{
  "label": "GO WITH CONDITIONS",
  "call": "One or two sentences the founder can act on, naming the option.",
  "recommended": "B",
  "why": [
    { "point": "One line.", "seat": "Pabrai", "framework": "Heads I win, tails I do not lose much" }
  ],
  "minority": { "seat": "Martell", "quote": "The seat's own words, copied from a card.", "would_have_to_be_true": "One line." },
  "next_steps": [ { "when": "This week", "action": "One line." } ],
  "kill_criteria": "One line.",
  "conditions": ["Checkable condition"],
  "fights": [ { "crux": "The question", "story": "Who was on each side, who moved, how it resolved." } ],
  "amendments": [ { "seat": "Buffett", "amendment": "One line.", "adopted": true, "reason": "One line." } ],
  "cheapest_test": "One line.",
  "revisit": "When and with what numbers.",
  "override_note": ""
}
```

`label` is one of GO, GO WITH CONDITIONS, RESHAPE, WAIT, DON'T DO IT. Put the three strongest arguments first in `why` and at most three `next_steps`; the room shows those up front and folds the rest under "Full detail". The room computes the option scores, confidence, and votes itself from the cards, so they are not in this file.

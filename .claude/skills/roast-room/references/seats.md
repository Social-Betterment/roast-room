# Seats

| Seat | Agent | Pillar | Owns the question | Brain |
|---|---|---|---|---|
| Bezos | `council-bezos` | Strategy and decisions | Is this the right bet, and how reversible is it? | `brains/jeff-bezos/` |
| Pabrai | `council-pabrai` | Asymmetric bets and risk | Is the downside small and the upside large, and has someone already proven this works? | `brains/mohnish-pabrai/` |
| Lynch | `council-lynch` | Business knowledge and homework | Does the founder know this business well enough, and has the homework been done? | `brains/peter-lynch/` |
| Fisher | `council-fisher` | Management and long-term growth quality | Can this team be trusted, and can the business keep growing for years without a rival sharing it? | `brains/philip-fisher/` |
| Martell | `council-martell` | People, hiring, and founder time | Who does this, and what does it cost the founder's calendar? | `brains/dan-martell/` |
| Marks | `council-marks` | Cycles and second-level thinking | Where are we in the cycle, and what does everyone already believe that may be wrong? | `brains/howard-marks/` |
| Buffett | `council-buffett` | Money and capital | What does it do to cash, risk, and long-term value? | `brains/warren-buffett/` |

Brain paths are relative to `.claude/skills/roast-room/`.

## Relevance weights

The Chair sets a weight per seat for each decision, before Round 1, and writes the reason in one line. Weights make the final score honest: a call about an unfamiliar market should lean on Lynch, a hiring call on Martell.

| Weight | Meaning |
|---|---|
| 3 | This decision lives in the seat's pillar |
| 2 | The pillar is materially affected |
| 1 | The pillar is touched at the edges |

Every seat is at least 1. Exactly one or two seats get a 3.

## Quick council

`--quick` seats four: the two highest-weight seats, Buffett or Bezos (whichever is not already in, as the downside check), and the seat most likely to disagree with the others (the Chair names why). Use quick for reversible, low-stakes calls. Full council for anything a founder cannot easily undo.

## Natural tensions to expect

- Fisher (pay up for people and runway, hold for decades, sell almost never) against Pabrai and Marks (margin of safety, what is priced in, cheap capped tests).
- Pabrai (cheap capped tests, few big bets, copy what works) against Marks (diversify, margin of safety, what is priced in).
- Lynch (do the homework, no forecasts) against Bezos (long bets under uncertainty before the facts are in).
- Martell (buy back your time, hire early) against Pabrai and Buffett (stay small and frugal until it works).

If Round 1 comes back unanimous, the Chair should be suspicious and press the seat whose pillar is most at risk in Round 2.

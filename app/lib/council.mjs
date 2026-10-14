import fs from "node:fs";
import path from "node:path";
import { SEATS, byKey, systemFor, parseCard, parseProposals, checkQuotes } from "./seats.mjs";
import * as ai from "./anthropic.mjs";
import { S } from "./anthropic.mjs";
import { SESSIONS_DIR } from "./env.mjs";

export const MODELS = {
  seat: process.env.SEAT_MODEL || "claude-sonnet-5-5",
  chair: process.env.CHAIR_MODEL || "claude-opus-5-5",
};

const CHAIR_SYSTEM = `You are the Chair of a Roast Room council: seven simulated advisors built from the public work of Jeff Bezos (strategy and decisions), Mohnish Pabrai (asymmetric bets and risk), Peter Lynch (business knowledge and homework), Philip Fisher (management and long-term growth quality), Dan Martell (people, hiring, and founder time), Howard Marks (cycles and second-level thinking), and Warren Buffett (money and capital).
You never argue a side and never add your own pillar. You run the room, keep score, and write in plain English: short sentences, no em dashes, no hype, no tee-ups like "here's the thing", no filler. Seat keys (for key fields only): bezos, pabrai, lynch, fisher, martell, marks, buffett. Whenever you write a seat's name in prose or in a seat field, use its display name: Bezos, Pabrai, Lynch, Fisher, Martell, Marks, Buffett.`;

export const DISCLAIMER = "Simulated advisors built from each person's public work. They are not the people and do not speak for them.";

// ---------------------------------------------------------------- sessions
const sessions = new Map();
export const getSession = (id) => sessions.get(id);

function slugify(t) {
  return (t || "council").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "council";
}

function newSession(prompt, mode) {
  const id = `${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`;
  const s = { id, prompt, mode, status: "running", events: [], subs: new Set(), started: Date.now(), state: {} };
  sessions.set(id, s);
  return s;
}

function emit(s, type, data = {}) {
  const ev = { type, t: Date.now() - s.started, ...data };
  // text deltas are streamed live but not stored one by one; the final card is stored
  if (type !== "delta") s.events.push(ev);
  const line = `data: ${JSON.stringify(ev)}\n\n`;
  for (const res of s.subs) res.write(line);
}

export function subscribe(s, res) {
  for (const ev of s.events) res.write(`data: ${JSON.stringify(ev)}\n\n`);
  if (s.status !== "running") { res.write(`data: ${JSON.stringify({ type: "end" })}\n\n`); return; }
  s.subs.add(res);
  res.on("close", () => s.subs.delete(res));
}

// ---------------------------------------------------------------- prompts
function briefBlock(st) {
  const opts = st.options.length
    ? st.options.map((o) => `(${o.id}) ${o.label}`).join("\n")
    : `(none named by the founder; the council proposes them in Round 0)${st.founderIdea ? `\nThe founder's own idea, which stays on the list: ${st.founderIdea}` : ""}`;
  return `THE DECISION: ${st.decision}\n\nOPTIONS:\n${opts}\n\n${st.brief}\n\nAssumptions the Chair made (marked as assumed; challenge them if they matter):\n${st.assumptions.map((a) => `- ${a}`).join("\n")}`;
}
const optLine = (st) => st.options.map((o) => `${o.id} n/10`).join(" · ");

// Round 0 runs when the founder named no options: each seat proposes plausible ones, the Chair merges them.
const MAX_OPTIONS = 5;
const ROUND0_RULES = `Rules:
- Plausible, not favorite. Each option must be something a smart founder could really do and defend. Do not give your pick and two weak ones for contrast.
- Cover the range. Across your three: one that does more or moves faster, one that does less or waits, and one that attacks the problem from a different angle than your pillar's usual answer.
- At least one of your three must be an option you would not back yourself, but that another seat on this council well might. Write its case fairly.
- Make each option concrete: an action, a size, a timeframe. "Think about it more" is not an option.
- Do not say which option you prefer and do not score anything. Round 1 is for taking a position.
- The Chair adds "keep doing what you do now" itself, so do not spend one of your three on it. If the founder's own idea is in the brief, do not repeat it as it stands; propose alternatives to it or variants of it.
- Quote only verbatim lines from your brain, with the source id.`;

function round0Prompt(st, seat) {
  return `ROAST ROOM COUNCIL, ROUND 0: THE OPTIONS

You hold the ${seat.short.toUpperCase()} seat (${seat.pillar}).

THE BRIEF
${briefBlock(st)}

The founder named no options. This round is not about picking a winner. Your job is to put plausible options on the table so the council can debate and score them in the next rounds.

Answer in your seat's voice, first person, plain text, under 220 words, in exactly this shape:

SEAT: ${seat.short.toUpperCase()} (${seat.pillar})
OPTIONS I'D PUT ON THE TABLE:
1. [label, under 50 characters]: what it is, and its best case in one line, argued the way its strongest defender would.
2. [label]: ...
3. [label]: ...
WHAT I'D WANT TO KNOW FIRST: one fact or number that would sharpen these options.

${ROUND0_RULES}`;
}

function round1Prompt(st, seat) {
  const w = st.weights[seat.key];
  const fromR0 = st.optionsFromRound0 ? "\nThe options above were proposed by the council in Round 0, so some may be ones you would not have chosen. Score every one honestly.\n" : "";
  return `ROAST ROOM COUNCIL, ROUND 1 OF 3: OPENING POSITION

You hold the ${seat.short.toUpperCase()} seat (${seat.pillar}).

THE BRIEF
${briefBlock(st)}
${fromR0}
Your weight on this decision: ${w.weight}/3 (${w.reason}).

Answer in your seat's voice, first person, plain text, under 300 words, in exactly this shape:

SEAT: ${seat.short.toUpperCase()} (${seat.pillar})
STANCE: Strong yes | Yes | Conditional yes | No | Strong no   (on the option you recommend)
OPTION SCORES: ${optLine(st)}
PILLAR SCORE: n/10   (${seat.dimension}: the option you recommend, judged on your pillar alone)
CONFIDENCE: n/5
RUIN RISK: none | possible | likely
DOOR: one-way | two-way

THE CALL: one sentence, naming the option or a variant.
WHY:
1. argument, naming the framework or principle you used and its source id, e.g. (Value Equation, S014)
2. ...
3. ...
THE RISK I SEE: the single biggest thing that goes wrong.
WHAT WOULD CHANGE MY MIND: a concrete fact or number.
WHAT I'D DO THIS WEEK: one action.
QUESTION FOR THE FOUNDER: the one question you would ask before signing off.

Rules: argue from your pillar first. Use real numbers when the brief has them, and say which numbers you are assuming. Quote only verbatim lines from your brain, with the source id. Do not hedge to sound balanced; the Chair balances the council.`;
}

function cardsBlock(st, round) {
  return st.seats.map((k) => `### ${byKey[k].short} (weight ${st.weights[k].weight})\n${st.cards[round][k]?.text || "(no card)"}`).join("\n\n");
}

function round2Prompt(st, seat) {
  const cr = st.cruxes.map((c, i) => `${i + 1}. ${c.question} (${c.sides.map((x) => `${x.position}: ${x.seats.map((k) => byKey[k]?.short || k).join(", ")}`).join("; ")})`).join("\n");
  const push = st.pressure?.[seat.key] ? `\nFor you specifically: ${st.pressure[seat.key]}\n` : "";
  return `ROAST ROOM COUNCIL, ROUND 2 OF 3: DEBATE

You hold the ${seat.short.toUpperCase()} seat.

THE BRIEF
${briefBlock(st)}

ROUND 1, EVERY SEAT'S CARD
${cardsBlock(st, 1)}

THE CRUXES THE CHAIR SEES
${cr}
${push}
Answer in your seat's voice, first person, plain text, under 280 words, in exactly this shape:

SEAT: ${seat.short.toUpperCase()}
I DISAGREE MOST WITH: [seat name]. Their argument, in one line, then your rebuttal using your frameworks.
I CONCEDE: the strongest point another seat made against you, and what it changes. "Nothing" only if you can say why their best point fails.
ON THE CRUXES: your answer to each crux, one or two lines each.
STANCE: ...
OPTION SCORES: ${optLine(st)}
PILLAR SCORE: n/10
CONFIDENCE: n/5
RUIN RISK: none | possible | likely
MOVED: no | yes, from X to Y, because ...
MY CONDITIONS FOR YES: up to three, concrete and checkable (a number, a date, a test result).

Rules: engage the actual arguments on the table. Move only for a better argument, never to be agreeable. If everyone agrees with you, attack the weakest part of your own case.`;
}

function round3Prompt(st, seat) {
  const d = st.draft;
  return `ROAST ROOM COUNCIL, ROUND 3 OF 3: VOTE ON THE DRAFT RESOLUTION

You hold the ${seat.short.toUpperCase()} seat.

THE BRIEF
${briefBlock(st)}

YOUR ROUND 2 CARD
${st.cards[2][seat.key]?.text || ""}

THE CHAIR'S DRAFT RESOLUTION
Recommendation: ${d.label} on option ${d.option}. ${d.recommendation}
Conditions:
${d.conditions.map((c) => `- ${c}`).join("\n")}
Next steps:
${d.next_steps.map((c) => `- ${c}`).join("\n")}
Cheapest test: ${d.cheapest_test}
Kill criteria: ${d.kill_criteria}

Answer in your seat's voice, first person, under 140 words, in exactly this shape:

SEAT: ${seat.short.toUpperCase()}
VOTE: Endorse | Endorse with amendment | Dissent
OPTION SCORES: ${optLine(st)}   (given the resolution's conditions)
FINAL SCORE: n/10   (your support for the draft resolution as written)
FINAL PILLAR SCORE: n/10
AMENDMENT OR DISSENT: one or two sentences. Blank if you endorse.
ONE LINE FOR THE FOUNDER: the thing from your pillar they must not forget.`;
}

// ---------------------------------------------------------------- scoring
export function optionScores(st, round) {
  const out = {};
  for (const o of st.options) {
    let num = 0, den = 0;
    const parts = [];
    for (const k of st.seats) {
      const v = st.cards[round][k]?.parsed.optionScores[o.id];
      const w = st.weights[k].weight;
      if (typeof v === "number") { num += w * v; den += w; parts.push(`${w}x${v}`); }
    }
    out[o.id] = { score: den ? Math.round((num / den) * 10) / 10 : null, math: den ? `(${parts.join(" + ")}) / ${den}` : "" };
  }
  return out;
}

function bandFor(score) {
  if (score == null) return "RESHAPE";
  if (score >= 7.5) return "GO";
  if (score >= 6) return "GO WITH CONDITIONS";
  if (score >= 4.5) return "RESHAPE";
  return "DON'T DO IT";
}

// ---------------------------------------------------------------- chair calls
async function chairSetup(st) {
  const schema = S.obj({
    title: S.str,
    decision: S.str,
    brief: S.str,
    options_given: S.bool,
    founder_idea: S.str,
    options: S.arr(S.obj({ id: S.enum("A", "B", "C", "D", "E"), label: S.str })),
    assumptions: S.arr(S.str),
    weights: S.arr(S.obj({ seat: S.enum(...SEATS.map((s) => s.key)), weight: S.int, reason: S.str })),
    quick_seats: S.arr(S.enum(...SEATS.map((s) => s.key))),
  });
  return ai.json({
    model: MODELS.chair, system: CHAIR_SYSTEM, schema, maxTokens: 3000,
    prompt: `A founder brought this to the council:

"""${st.prompt}"""

Set up the room.
- title: the decision in 3 to 7 words.
- decision: one line.
- options_given: true only if the founder named two or more alternatives or asked an either/or ("A or B", "yes or no"). A single idea ("should I hire a CFO?") or an open question ("what should I do about churn?") is false.
- options: if options_given, the founder's options in their own words with ids A, B, C (D and E only if they named that many), and add "don't do it" or "keep doing what you do now" if it is missing. If options_given is false, an empty list. Never invent options here: when the founder named none, the council proposes them in Round 0.
- founder_idea: if the founder named one idea but no alternatives, that idea as a label under 50 characters; otherwise an empty string.
- brief: under 200 words covering the business, resources, what success looks like, and the founder's lean, using only what the founder said. Do not invent facts.
- assumptions: any number or fact you had to assume to make the brief usable, each one line. Keep it to what matters.
- weights: one entry for every seat, weight 1 to 3 (3 = the decision lives in this pillar, 2 = materially affected, 1 = touched at the edges). Exactly one or two seats at 3. Reason in one line.
- quick_seats: the four seats for a quick council: the two highest-weight seats, Buffett or Bezos as the downside check (whichever is not already in), and the seat most likely to disagree with the others.`,
  });
}

/** The Chair merges the Round 0 proposals into the options the council will debate and score. */
async function chairOptions(st) {
  const schema = S.obj({
    options: S.arr(S.obj({ id: S.enum("A", "B", "C", "D", "E"), label: S.str, by: S.arr(S.enum(...SEATS.map((s) => s.key), "founder", "chair")), baseline: S.bool })),
    note: S.str,
  });
  const m = await ai.json({
    model: MODELS.chair, system: CHAIR_SYSTEM, schema, maxTokens: 2500,
    prompt: `${briefBlock(st)}

ROUND 0 PROPOSALS (every seat at the table, in its own words)
${cardsBlock(st, 0)}

Merge these into the options the council will debate and score.
- Merge only true duplicates (same action, same size and timing). Keep a seat's own label wording; shorten it only if it is over 50 characters. List every seat that proposed a version in by.
- Keep the range. The list should span doing more or moving faster, doing less or waiting, and a different angle, whenever the seats proposed them. Do not drop an option because only one seat proposed it if it is genuinely different. Drop only duplicates, strawmen, and anything that cannot be done.
- If the founder named an idea, keep it as an option with by ["founder"] (plus any seat that also proposed it).
- Always include the baseline: "keep doing what you do now" or "don't do it", with baseline true. It is the only option you add yourself (by ["chair"], unless a seat proposed it). Put it last. Every other option has baseline false.
- At most ${MAX_OPTIONS} options, ids A to E in order, boldest first, baseline last. Prefer four. If more than four distinct options remain besides the baseline, merge the two neighbors that differ least into one option (use the clearer label and name the difference in a few words).
- note: one or two plain sentences: how many proposals came in, what you merged, and what you dropped and why.`,
  });
  return finalizeOptions(m, st.founderIdea);
}

/** Whatever the Chair returned, the room gets 2 to 5 options: the founder's own idea kept, the
 * baseline last, ids A to E in order. */
export function finalizeOptions(m, founderIdea = "") {
  const all = (m.options || []).filter((o) => String(o.label || "").trim()).map((o) => ({ label: o.label.trim().slice(0, 60), by: [...new Set(o.by || [])], baseline: Boolean(o.baseline) }));
  const bi = all.findIndex((o) => o.baseline);
  const baseline = bi >= 0 ? all.splice(bi, 1)[0] : { label: "Keep doing what I do now", by: ["chair"] };
  const rest = all.filter((o) => !o.baseline);
  if (String(founderIdea).trim() && !rest.some((o) => o.by.includes("founder"))) rest.unshift({ label: String(founderIdea).trim().slice(0, 60), by: ["founder"], baseline: false });
  // over the cap: cut from the end, but never the founder's own idea
  while (rest.length > MAX_OPTIONS - 1) rest.splice(rest.findLastIndex((o) => !o.by.includes("founder")), 1);
  const list = [...rest, baseline];
  return { options: list.map((o, i) => ({ id: "ABCDE"[i], label: o.label, by: o.by })), note: m.note || "" };
}

async function chairCruxes(st) {
  const schema = S.obj({
    cruxes: S.arr(S.obj({ question: S.str, sides: S.arr(S.obj({ position: S.str, seats: S.arr(S.enum(...SEATS.map((s) => s.key))) })) })),
    unanimous: S.bool,
    note: S.str,
    pressure: S.arr(S.obj({ seat: S.enum(...SEATS.map((s) => s.key)), ask: S.str })),
  });
  return ai.json({
    model: MODELS.chair, system: CHAIR_SYSTEM, schema, maxTokens: 3000,
    prompt: `${briefBlock(st)}

ROUND 1 CARDS
${cardsBlock(st, 1)}

Name the one to three cruxes: the underlying disagreements that explain why seats split (a fact, a number, or a value such as speed versus safety), with the seats on each side.
Unanimity check: if every seat's top option is the same and their scores for it sit within 1 point, set unanimous true, make the strongest unargued alternative a crux, and say which seats whose pillars are most at risk must argue it at full strength.
note: one or two plain sentences for the founder on what the room is fighting about.
pressure: for each seat that holds a minority view, or that the unanimity check names, one sentence telling it exactly which argument it must answer in Round 2. Leave others out.`,
  });
}

async function chairDraft(st, interim) {
  const schema = S.obj({
    option: S.str,
    label: S.enum("GO", "GO WITH CONDITIONS", "RESHAPE", "WAIT", "DON'T DO IT"),
    recommendation: S.str,
    conditions: S.arr(S.str),
    next_steps: S.arr(S.str),
    cheapest_test: S.str,
    kill_criteria: S.str,
  });
  return ai.json({
    model: MODELS.chair, system: CHAIR_SYSTEM, schema, maxTokens: 3000,
    prompt: `${briefBlock(st)}

ROUND 2 CARDS (the debate)
${cardsBlock(st, 2)}

Interim weighted option scores: ${JSON.stringify(Object.fromEntries(Object.entries(interim).map(([k, v]) => [k, v.score])))}
Band rule: 7.5+ GO, 6.0 to 7.4 GO WITH CONDITIONS, 4.5 to 5.9 RESHAPE, under 4.5 DON'T DO IT. Use WAIT when the top option is good but depends on a prerequisite not met yet. Overrides: any seat at RUIN RISK likely caps at RESHAPE until a mitigation it endorsed is in the conditions.

Write the draft resolution. Weigh arguments, not headcount: one seat with a decisive fact beats three with vibes. Merge duplicate conditions, keep each checkable (a number or a date), and where seats gave different numbers pick one and say whose. Next steps carry dates or day counts. recommendation is one or two sentences.`,
  });
}

async function chairVerdict(st, finalScores, recommended) {
  const lastRound = st.rounds.at(-1);
  const schema = S.obj({
    label: S.enum("GO", "GO WITH CONDITIONS", "RESHAPE", "WAIT", "DON'T DO IT"),
    call: S.str,
    override_note: S.str,
    why: S.arr(S.obj({ point: S.str, seat: S.str, framework: S.str })),
    fights: S.arr(S.obj({ crux: S.str, story: S.str })),
    minority: S.obj({ seat: S.str, quote: S.str, would_have_to_be_true: S.str }),
    amendments: S.arr(S.obj({ seat: S.str, amendment: S.str, adopted: S.bool, reason: S.str })),
    conditions: S.arr(S.str),
    next_steps: S.arr(S.obj({ when: S.str, action: S.str })),
    cheapest_test: S.str,
    kill_criteria: S.str,
    revisit: S.str,
  });
  return ai.json({
    model: MODELS.chair, system: CHAIR_SYSTEM, schema, maxTokens: 5000,
    prompt: `${briefBlock(st)}

CRUXES: ${JSON.stringify(st.cruxes)}

ROUND 2 CARDS
${cardsBlock(st, 2)}

${lastRound === 3 ? `DRAFT RESOLUTION\n${JSON.stringify(st.draft)}\n\nROUND 3 VOTES\n${cardsBlock(st, 3)}` : "(Quick mode: Round 3 skipped.)"}

FINAL WEIGHTED OPTION SCORES (computed, do not change): ${JSON.stringify(Object.fromEntries(Object.entries(finalScores).map(([k, v]) => [k, v.score])))}
Recommended option by score: ${recommended}. Band for it: ${bandFor(finalScores[recommended]?.score)}.
Any seat at ruin risk likely: ${st.seats.filter((k) => st.cards[lastRound][k]?.parsed.ruin === "likely" || st.cards[2][k]?.parsed.ruin === "likely").join(", ") || "none"}.

Write the verdict for the founder.
- label: the band, or WAIT if the recommended option depends on an unmet prerequisite, or a cap from an override. If you change the band, say why in override_note; otherwise override_note is "".
- call: one or two sentences the founder can act on, naming the option.
- why: 3 to 5 arguments that carried the room, each tagged with the seat and the framework.
- fights: one entry per crux: who was on each side, who moved and why, how it resolved.
- minority: the strongest losing view; quote copies the seat's own words exactly from a card; would_have_to_be_true in one line. If unanimous, use the least-tested assumption instead.
- amendments: every Round 3 amendment, adopted or not, with the reason (empty in quick mode). Adopt when no seat objected or the argument went unanswered.
- conditions, next_steps (with when), cheapest_test, kill_criteria, revisit: final, merged, checkable.`,
  });
}

// ---------------------------------------------------------------- the run
async function runSeat(s, st, round, key, prompt) {
  const seat = byKey[key];
  emit(s, "seat_start", { round, seat: key });
  let text = "";
  try {
    text = await ai.stream({
      model: MODELS.seat, system: systemFor(key), maxTokens: 1400,
      messages: [{ role: "user", content: prompt }],
      onText: (d) => { text += d; emit(s, "delta", { round, seat: key, text: d }); },
    });
  } catch (e) {
    emit(s, "seat_error", { round, seat: key, error: String(e.message || e) });
    throw e;
  }
  const parsed = round === 0 ? parseProposals(text) : parseCard(text, st.options.map((o) => o.id));
  const quotes = checkQuotes(key, text);
  st.cards[round][key] = { text, parsed, quotes };
  emit(s, "seat_done", { round, seat: key, text, parsed, quotes, name: seat.name });
}

async function roundAll(s, st, round, promptFn) {
  emit(s, "round_start", { round });
  // stagger starts slightly so speech bubbles open in a ripple around the table
  await Promise.all(st.seats.map((k, i) => new Promise((r) => setTimeout(r, i * 350)).then(() => runSeat(s, st, round, k, promptFn(st, byKey[k])))));
  if (round === 0) { emit(s, "round_done", { round: 0, scores: null }); return; } // proposals are not scored
  const scores = optionScores(st, round);
  st.scores[round] = scores;
  emit(s, "round_done", { round, scores });
}

export function startCouncil(prompt, mode = "full") {
  const s = newSession(prompt, mode);
  run(s).catch((e) => {
    s.status = "error";
    emit(s, "error", { error: String(e.message || e) });
    for (const res of s.subs) res.write(`data: ${JSON.stringify({ type: "end" })}\n\n`);
    save(s);
  });
  return s;
}

async function run(s) {
  const st = (s.state = { prompt: s.prompt, mode: s.mode, cards: { 0: {}, 1: {}, 2: {}, 3: {} }, scores: {}, rounds: [] });
  emit(s, "phase", { phase: "setup", label: "The Chair is reading your question" });
  const setup = await chairSetup(st);
  // The founder named no options: the seats propose them in Round 0 (weights do not depend on them).
  const optionsOpen = !setup.options_given || !setup.options?.length;
  Object.assign(st, {
    title: setup.title, decision: setup.decision, brief: setup.brief,
    options: optionsOpen ? [] : setup.options, founderIdea: optionsOpen ? setup.founder_idea || "" : "",
    assumptions: setup.assumptions,
    weights: Object.fromEntries(SEATS.map((x) => [x.key, { weight: 1, reason: "" }])),
  });
  for (const w of setup.weights) st.weights[w.seat] = { weight: Math.max(1, Math.min(3, w.weight)), reason: w.reason };
  st.seats = s.mode === "quick" ? [...new Set(setup.quick_seats)].slice(0, 4) : SEATS.map((x) => x.key);
  if (s.mode === "quick" && st.seats.length < 4) {
    for (const x of SEATS) if (st.seats.length < 4 && !st.seats.includes(x.key)) st.seats.push(x.key);
  }
  emit(s, "setup", { title: st.title, decision: st.decision, brief: st.brief, options: st.options, options_pending: optionsOpen, assumptions: st.assumptions, weights: st.weights, seats: st.seats, mode: s.mode });

  if (optionsOpen) {
    emit(s, "phase", { phase: "round0", label: "Round 0: the seats propose options" });
    st.rounds.push(0);
    await roundAll(s, st, 0, round0Prompt);
    emit(s, "phase", { phase: "options", label: "The Chair is merging the options" });
    const merged = await chairOptions(st);
    st.options = merged.options;
    st.optionsFromRound0 = true;
    st.optionsNote = merged.note;
    emit(s, "options", { options: st.options, note: merged.note });
  }

  emit(s, "phase", { phase: "round1", label: "Round 1: opening positions" });
  st.rounds.push(1);
  await roundAll(s, st, 1, round1Prompt);

  emit(s, "phase", { phase: "cruxes", label: "The Chair is finding the fault lines" });
  const cx = await chairCruxes(st);
  st.cruxes = cx.cruxes;
  st.pressure = Object.fromEntries((cx.pressure || []).map((p) => [p.seat, p.ask]));
  emit(s, "cruxes", { cruxes: cx.cruxes, unanimous: cx.unanimous, note: cx.note, pressure: st.pressure });

  emit(s, "phase", { phase: "round2", label: "Round 2: the debate" });
  st.rounds.push(2);
  await roundAll(s, st, 2, round2Prompt);

  const s2 = st.scores[2];
  const top2 = Object.entries(s2).sort((a, b) => (b[1].score ?? 0) - (a[1].score ?? 0))[0][0];
  const vals = st.seats.map((k) => st.cards[2][k]?.parsed.optionScores[top2]).filter((v) => typeof v === "number");
  const spread = vals.length ? Math.max(...vals) - Math.min(...vals) : 0;
  const ruin = st.seats.some((k) => st.cards[2][k]?.parsed.ruin === "likely");
  const skip3 = s.mode === "quick" && spread <= 3 && !ruin;

  if (!skip3) {
    emit(s, "phase", { phase: "draft", label: "The Chair is drafting a resolution" });
    st.draft = await chairDraft(st, s2);
    emit(s, "draft", { draft: st.draft });
    emit(s, "phase", { phase: "round3", label: "Round 3: the vote" });
    st.rounds.push(3);
    await roundAll(s, st, 3, round3Prompt);
  } else {
    emit(s, "phase", { phase: "skip3", label: `Quick mode: spread ${spread} and no ruin risk, so the vote round is skipped` });
  }

  const { last, finalScores, recommended, spreadF, confidence, support, votes } = finalNumbers(st);

  emit(s, "phase", { phase: "verdict", label: "The Chair is writing the verdict" });
  const v = await chairVerdict(st, finalScores, recommended);
  st.verdict = { ...v, recommended, scores: finalScores, spread: spreadF, confidence, support, votes, disclaimer: DISCLAIMER };
  emit(s, "verdict", { verdict: st.verdict, seats: verdictSeats(st, last) });
  s.status = "done";
  emit(s, "usage", { usage: ai.usage });
  for (const res of s.subs) res.write(`data: ${JSON.stringify({ type: "end" })}\n\n`);
  save(s);
}

/** The verdict's numbers, computed from the last round's cards (shared with the folder watcher). */
export function finalNumbers(st) {
  const last = st.rounds.at(-1);
  const finalScores = st.scores[last] || optionScores(st, last);
  const recommended = Object.entries(finalScores).sort((a, b) => (b[1].score ?? 0) - (a[1].score ?? 0))[0][0];
  const fv = st.seats.map((k) => st.cards[last][k]?.parsed.optionScores[recommended]).filter((v) => typeof v === "number");
  const confs = st.seats.map((k) => st.cards[2][k]?.parsed.confidence ?? st.cards[1][k]?.parsed.confidence).filter((v) => typeof v === "number");
  const spreadF = fv.length ? Math.max(...fv) - Math.min(...fv) : 0;
  const confidence = confs.length ? Math.max(1, Math.min(10, Math.round((confs.reduce((a, b) => a + b, 0) / confs.length) * 2) - (spreadF >= 5 ? 1 : 0))) : null;
  const support = last === 3 ? (() => {
    let n = 0, d = 0;
    for (const k of st.seats) { const v = st.cards[3][k]?.parsed.finalScore; if (typeof v === "number") { n += v * st.weights[k].weight; d += st.weights[k].weight; } }
    return d ? Math.round((n / d) * 10) / 10 : null;
  })() : null;
  const votes = last === 3 ? st.seats.reduce((acc, k) => { const v = st.cards[3][k]?.parsed.vote || "endorse"; acc[v] = (acc[v] || 0) + 1; return acc; }, {}) : null;
  return { last, finalScores, recommended, spreadF, confidence, support, votes };
}

export function verdictSeats(st, last) {
  return st.seats.map((k) => ({
    key: k, weight: st.weights[k].weight,
    stance: st.cards[last][k]?.parsed.vote || st.cards[2][k]?.parsed.stance,
    optionScores: st.cards[last][k]?.parsed.optionScores,
    pillar: st.cards[last][k]?.parsed.pillar ?? st.cards[2][k]?.parsed.pillar,
    moved: st.cards[2][k]?.parsed.moved,
    oneLine: st.cards[3][k]?.parsed.oneLine || st.cards[2][k]?.parsed.stance,
  }));
}

// ---------------------------------------------------------------- persistence
export function save(s) {
  try {
    const st = s.state || {};
    const dir = path.join(SESSIONS_DIR, `${s.id.slice(0, 10)}-${slugify(st.title || s.prompt)}`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "events.json"), JSON.stringify({ id: s.id, prompt: s.prompt, mode: s.mode, status: s.status, title: st.title, events: s.events }, null, 1));
    if (st.options) {
      const lines = [`# ${st.title}`, "", `Asked: ${s.prompt}`, "", st.brief, "", st.optionsFromRound0 ? "Options (proposed by the council in Round 0, merged by the Chair):" : "Options:", ...st.options.map((o) => `- ${o.id}: ${o.label}${proposedBy(o)}`), ...(st.optionsNote ? ["", st.optionsNote] : []), "", "Assumptions:", ...(st.assumptions || []).map((a) => `- ${a}`), "", "| Seat | Weight | Reason |", "|---|---|---|", ...SEATS.map((x) => `| ${x.short} | ${st.weights[x.key].weight} | ${st.weights[x.key].reason} |`)];
      fs.writeFileSync(path.join(dir, "brief.md"), lines.join("\n") + "\n");
    }
    for (const r of st.rounds || []) {
      const body = (st.seats || []).map((k) => `## ${byKey[k].name} (weight ${st.weights[k].weight})\n\n${st.cards[r][k]?.text || ""}`).join("\n\n");
      fs.writeFileSync(path.join(dir, `round-${r}.md`), `# Round ${r}\n\n${body}\n`);
    }
    if (st.verdict) fs.writeFileSync(path.join(dir, "verdict.md"), verdictMarkdown(st));
    s.dir = dir;
  } catch (e) {
    console.error("save failed", e);
  }
}

/** " (proposed by Bezos, Marks)" for an option that came out of Round 0. */
function proposedBy(o) {
  if (!o.by?.length) return "";
  const names = o.by.map((k) => (k === "founder" ? "the founder" : k === "chair" ? "the Chair, as the baseline" : byKey[k]?.short || k));
  return ` (proposed by ${names.join(", ")})`;
}

function verdictMarkdown(st) {
  const v = st.verdict;
  const opt = (id) => st.options.find((o) => o.id === id)?.label || id;
  const L = [];
  L.push(`# Roast Room: ${st.title}`, "", `${new Date().toISOString().slice(0, 10)} · Seats: ${st.seats.map((k) => byKey[k].short).join(", ")} · Rounds: ${st.rounds.filter((r) => r > 0).length}${st.optionsFromRound0 ? " (plus Round 0 for the options)" : ""} · Mode: ${st.mode}`, "");
  if (st.optionsFromRound0) L.push("Options: " + st.options.map((o) => `${o.id} ${o.label}${proposedBy(o)}`).join(" · "), "");
  L.push(`## Verdict: ${v.label} (Option ${v.recommended}: ${opt(v.recommended)})`, "", `**The call:** ${v.call}`, "");
  L.push(`Option scores: ${st.options.map((o) => `${o.id} ${v.scores[o.id]?.score ?? "-"}`).join(" · ")}${v.support != null ? ` · Support for the resolution ${v.support}/10` : ""} · Confidence ${v.confidence ?? "-"}/10 · Spread ${v.spread}`);
  if (v.override_note) L.push("", v.override_note);
  L.push("", "Math: " + st.options.map((o) => `${o.id} ${v.scores[o.id]?.math} = ${v.scores[o.id]?.score}`).join(" · "));
  L.push("", "## Why the council landed here", "", ...v.why.map((w) => `- ${w.point} (${w.seat}, ${w.framework})`));
  L.push("", "## Where they fought", "", ...v.fights.map((f) => `- **${f.crux}** ${f.story}`));
  L.push("", "## Minority report", "", `${v.minority.seat}: "${v.minority.quote}" For this to be right: ${v.minority.would_have_to_be_true}`);
  if (v.amendments?.length) L.push("", "## Amendments", "", ...v.amendments.map((a) => `- ${a.seat}: ${a.amendment} ${a.adopted ? "Adopted" : "Not adopted"}: ${a.reason}`));
  L.push("", "## Conditions", "", ...v.conditions.map((c, i) => `${i + 1}. ${c}`));
  L.push("", "## What to do next", "", ...v.next_steps.map((n) => `- **${n.when}:** ${n.action}`));
  L.push("", `**Cheapest test:** ${v.cheapest_test}`, `**Kill criteria:** ${v.kill_criteria}`, `**Revisit:** ${v.revisit}`, "", "---", DISCLAIMER, "");
  return L.join("\n");
}

export function listSaved() {
  if (!fs.existsSync(SESSIONS_DIR)) return [];
  return fs.readdirSync(SESSIONS_DIR)
    .map((d) => path.join(SESSIONS_DIR, d, "events.json"))
    .filter((p) => fs.existsSync(p))
    .map((p) => { const j = JSON.parse(fs.readFileSync(p, "utf8")); return { id: j.id, title: j.title || j.prompt.slice(0, 60), prompt: j.prompt, mode: j.mode, status: j.status, file: p }; })
    .sort((a, b) => (a.id < b.id ? 1 : -1));
}

export function loadSaved(id) {
  const hit = listSaved().find((x) => x.id === id);
  return hit ? JSON.parse(fs.readFileSync(hit.file, "utf8")) : null;
}

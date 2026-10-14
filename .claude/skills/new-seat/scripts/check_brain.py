#!/usr/bin/env python3
"""
Check a new seat's brain before it ships.

Usage:
  python3 .claude/skills/new-seat/scripts/check_brain.py <slug> --corpus <folder of S###-*.txt files>

Checks:
  1. All eight brain files exist and _hot.md has its required sections.
  2. Every source id cited anywhere in the brain is listed in sources.md.
  3. Every quote attributed to a source id appears in that source's text (the corpus file whose
     name starts with the id). Skip this with no --corpus, and the script says so.
  4. No em dashes, in the brain or in the agent file.
Exit code 1 on any failure.
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BRAINS = ROOT / "skills" / "roast-room" / "brains"
AGENTS = ROOT / "agents"

FILES = ["_hot.md", "frameworks.md", "principles.md", "positions.md", "voice.md", "stories.md", "books.md", "sources.md"]
HOT_SECTIONS = ["worldview", "decision loop", "signature questions", "voice cheat sheet", "misfires"]
# a quote followed by a source id, e.g. "..." (S012) or "..." (S012, 2026-08-19) or "..." [S012]
QUOTE = re.compile(r"[\"“]([^\"“”\n]{20,500})[\"”][^\n\"]{0,40}?[(\[](S\d{3})")


def norm(s):
    s = s.lower().replace("’", "'").replace("‘", "'")
    s = re.sub(r"[^a-z0-9' ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--corpus", help="folder holding S001-*.txt style source files")
    args = ap.parse_args()

    brain = BRAINS / args.slug
    problems = []

    if not brain.is_dir():
        sys.exit(f"no brain folder: {brain}")

    texts = {}
    for f in FILES:
        p = brain / f
        if p.exists():
            texts[f] = p.read_text(encoding="utf-8")
        else:
            problems.append(f"missing file: {f}")

    hot = texts.get("_hot.md", "").lower()
    for sec in HOT_SECTIONS:
        if sec not in hot:
            problems.append(f"_hot.md is missing a section about: {sec}")

    listed = set(re.findall(r"^\|\s*(S\d{3})\s*\|", texts.get("sources.md", ""), re.M))
    if not listed:
        problems.append("sources.md has no source rows (| S001 | ... |)")

    cited = set()
    for f, t in texts.items():
        if f == "sources.md":
            continue
        for sid in set(re.findall(r"\bS\d{3}\b", t)):
            cited.add(sid)
            if listed and sid not in listed:
                problems.append(f"{f}: cites {sid}, which is not in sources.md")

    quotes = [(f, q, sid) for f, t in texts.items() if f != "sources.md" for q, sid in QUOTE.findall(t)]
    verified = 0
    if args.corpus:
        corpus = {}
        for p in Path(args.corpus).glob("S*"):
            m = re.match(r"(S\d{3})", p.name)
            if m and p.is_file():
                corpus[m.group(1)] = norm(p.read_text(encoding="utf-8", errors="replace"))
        for f, q, sid in quotes:
            if sid not in corpus:
                problems.append(f"{f}: no corpus file for {sid}, cannot verify \"{q[:70]}\"")
            elif norm(q) in corpus[sid]:
                verified += 1
            else:
                problems.append(f"{f}: not in {sid}: \"{q[:90]}\"")
        unused = sorted(listed - set(corpus))
        if unused:
            problems.append(f"sources.md lists ids with no corpus file: {', '.join(unused[:10])}{' ...' if len(unused) > 10 else ''}")
    else:
        print("note: no --corpus given, quotes were NOT verified against source text")

    # the agent file that points at this brain
    to_scan = list(texts.items())
    agent_files = [p for p in AGENTS.glob("council-*.md") if f"brains/{args.slug}/" in p.read_text(encoding="utf-8")]
    if not agent_files:
        problems.append(f"no agent file in .claude/agents/ points at brains/{args.slug}/")
    to_scan += [(p.name, p.read_text(encoding="utf-8")) for p in agent_files]
    for name, t in to_scan:
        n = t.count("—")
        if n:
            problems.append(f"{name}: {n} em dash(es)")

    print(f"{args.slug}: {len(listed)} sources listed, {len(cited)} cited, {len(quotes)} attributed quotes, {verified} verified against the corpus")
    if problems:
        print(f"{len(problems)} problem(s):")
        for p in problems:
            print("  -", p)
        sys.exit(1)
    print("ok")


if __name__ == "__main__":
    main()

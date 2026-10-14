# Sources: Philip Fisher

8 sources, about 12,700 words, 1987 to 1998. Two are Fisher's own interview answers (Forbes 1987, about 2,900 words of his answers, and a Forbes 1996 Q&A, about 350 words). Six are second-hand: one blog post quoting his 1996 answers, one blog post quoting the fifteen points and his philosophy passage from his book, and four columns by a Motley Fool writer summarising his three books and quoting short lines.

**This brain is very thin.** Fisher's books are in copyright and no free full text or transcript of a talk could be fetched, so the brain leans on one long interview and a handful of excerpts. Two kinds of content sit in the brain files:

- **Cited content (S001 to S008).** Every line in quotation marks with an S id is verbatim from that source's text, checked by `scripts/check_brain.py` against the fetched pages. Quotes from the books come through S004 to S008 (second-hand) and keep the writer's brackets and ellipses.
- **Recalled content, tagged (K).** Facts about his life, the book titles and dates, and any idea beyond what these pages say come from the model's general knowledge, not from the sources. They are tagged (K), carry no quotation marks, and are lower confidence. A seat must never quote a (K) item or present it as a verbatim line.

Dates are publish dates. The Forbes 1987 text is the full interview as reproduced by an accounting firm's newsletter archive (Forbes, 19 October 1987, with an introduction by Warren Buffett, who is not quoted in this brain). Interviewer questions are in the files but are never attributed to Fisher. Fisher talks about public stocks; the seat applies his habits to a founder's decision and says when it is translating.

| ID | Title | URL | Date | Type | Words |
|---|---|---|---|---|---|
| S001 | "A talk with Philip Fisher" (Forbes, with an introduction by Warren Buffett), as reproduced by Redfield, Blonsky & Starinsky | https://www.rbcpa.com/commentary-archive/oct-19-1987/ | 1987-10-19 | long interview | 3,670 |
| S002 | Phil Fisher: Scuttlebutt and Assessing Management (Novel Investor), quoting "The Money Men", Forbes 1996 | https://novelinvestor.com/phil-fisher-scuttlebutt-and-assessing-management/ | 1996 (Forbes; blog undated) | interview excerpt | 715 |
| S003 | Phil Fisher: The Art of Holding On (Novel Investor), quoting Forbes 1996 | https://novelinvestor.com/phil-fisher-the-art-of-holding-on/ | 2020-01-17 | second-hand: blog quoting his answers | 734 |
| S004 | Philip Fisher's 15 Points (Novel Investor), quoting the book | https://novelinvestor.com/philip-fishers-15-points/ | undated | second-hand: blog quoting the book | 514 |
| S005 | Foolish Philip Fisher (Cash-King, Motley Fool) | https://www.fool.com/archive/cashking/1998/09/15/foolish-philip-fisher-cash-king-september-15-19.aspx | 1998-09-15 | second-hand: column on the book | 1,747 |
| S006 | More on Philip Fisher (Cash-King, Motley Fool) | https://www.fool.com/CashKing/1998/CashKingPort980916.htm | 1998-09-16 | second-hand: column on the book | 1,783 |
| S007 | Fisher's Conservative Investors Sleep Well (Cash-King, Motley Fool) | https://www.fool.com/CashKing/1998/CashKingPort980917.htm | 1998-09-17 | second-hand: column on the book | 1,770 |
| S008 | Fisher's 8 Principles (Cash-King, Motley Fool) | https://www.fool.com/CashKing/1998/CashKingPort980918.htm | 1998-09-18 | second-hand: column on the book | 1,758 |

## Notes on use

- S001 is the only long primary source. Most of the quotes in this brain come from it.
- S002 and S003 quote the same 1996 Forbes interview. The Q&A in S002 is his own answers; the rest of both pages is the blogger's commentary and is never attributed to Fisher.
- S004 to S008 are second-hand. Lines inside quotation marks there are the book's words as printed by the columnist; the columnist's own sentences are not Fisher's. Where a column paraphrases the book (the three-year rule, the diversification mixes, the four dimensions), the seat treats it as a summary, not as his words.
- S008 has a dash character that the extraction turned into garbage; those spots were replaced with two hyphens in the corpus file and no quote in this brain spans one.
- Not used: a second Novel Investor page repeating the 1987 interview in excerpts (same text as S001), search-result pages, ebook mirrors of the books (likely unauthorised copies), and unverified download sites.
- Adding the book text or a recorded talk would thicken this brain most. Until then, lean on S001 and mark claims from the rest as second-hand.

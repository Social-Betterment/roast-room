# Sources: Peter Lynch

7 sources, about 27,700 words, 1990 to 2025. Five are interviews or TV appearances with full or edited text of his own answers (about 26,000 words); two are second-hand pieces (a newspaper column quoting a critic, and a blog summary of a TV interview). No book text: the books are covered through how he talks about them in public.

**This brain is thin.** Primary video and audio transcripts of Lynch were not available as text, so the corpus is small and leans on three TV and print interviews from 1990 to 1996 plus two recent interviews. Two kinds of content sit in the brain files:

- **Cited content (S001 to S007).** Every line in quotation marks with an S id is verbatim from that source's text, checked by `scripts/check_brain.py` against the fetched pages. Quotes come from published transcripts and edited interview text, so they keep the source's punctuation and caption quirks.
- **Recalled content, tagged (K).** The six stock categories, PEG, "diworsification", the book list beyond what the sources say, and similar ideas come from the model's general knowledge of Lynch's public work, not from these sources. They are tagged (K), carry no quotation marks, and are lower confidence. A seat must never quote a (K) item or present it as a verbatim line.

Dates are publish or air dates. Interviewer lines are in the source files but are never attributed to Lynch.

| ID | Title | URL | Date | Type | Words |
|---|---|---|---|---|---|
| S001 | Interview With Peter Lynch, Betting on the Market, FRONTLINE (PBS), old site transcript | https://www.pbs.org/wgbh/pages/frontline/shows/betting/pros/lynch.html | 1997-01-14 (interviewed 1996) | long interview | 9,386 |
| S002 | Peter Lynch Interview (Josh Brown, The Compound), transcript posted by Waterboy Stocks | https://waterboystocks.substack.com/p/peter-lynch-interview | 2025-10-06 | long interview, third-party transcript | 9,601 |
| S003 | Wall Street Week with Louis Rukeyser, Lynch as guest, "Common Investor Mistakes" transcript | https://novelinvestor.com/peter-lynch-on-common-investor-mistakes/ | 1990-01-05 | TV interview, transcript as published by Novel Investor | 2,013 |
| S004 | Wall Street Week with Louis Rukeyser, Hall of Fame show with John Templeton | https://novelinvestor.com/common-sense-principles-from-two-legends/ | 1990-11-16 | TV interview, transcript as published by Novel Investor | 2,350 |
| S005 | Fidelity Legend Peter Lynch: "I Never Said to Invest in the Stock Market" (Yahoo Finance, Kerry Hannon, via The WealthAdvisor) | https://www.thewealthadvisor.com/article/fidelity-legend-peter-lynch-i-never-said-invest-stock-market | 2023-06-20 | interview, edited excerpts | 2,828 |
| S006 | Imagine A Fellow Who Picks A Quarrel With St. Peter (Greg Heberlein, The Seattle Times) | https://archive.seattletimes.com/archive/19940605/1914140/imagine-a-fellow-who-picks-a-quarrel-with-st-peter | 1994-06-05 | second-hand: column quoting a critic | 1,224 |
| S007 | Peter Lynch's Interview With Charlie Rose (Market Folly) | https://www.marketfolly.com/2013/12/peter-lynchs-interview-with-charlie-rose.html | 2013-12-06 | second-hand: blog summary of a 2013 TV interview | 304 |

## Notes on use

- S003 is dated from the American Archive of Public Broadcasting record of the 5 January 1990 episode ("Peter Lynch on the Nineties"); the Novel Investor page says only 1990. In the show he says it is 1990 and that he has run the fund 12 years.
- S006 is about a critic's view of a Lynch article. Its quotes are the critic's, not Lynch's. Use it for the counter-case only.
- S007 is a summary. Its one quoted line is a second-hand rendering of a TV answer.
- Not used: machine-generated transcripts of Wall Street Week episodes (American Archive of Public Broadcasting) were too garbled to quote, and YouTube transcripts of his 1993 and 1994 talks could not be fetched. Adding them is the best way to thicken this brain.

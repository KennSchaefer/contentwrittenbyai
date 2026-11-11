#!/usr/bin/env python3
"""EXP-002: build the fixed passage list before any detector is run.

Applies the passage rules in brief.md (and the 2026-10-18 amendment in
passages.md) to every source, with no hand-picking:

  1. Body text only: <p> and <li> text inside the article container.
     Headings, captions, tables, blockquotes and page furniture are dropped
     (furniture = the FURNITURE patterns below, plus bolded lines acting as
     headings: six words or fewer with no sentence punctuation, or four words
     or fewer ending in a colon).
  2. Under 300 words after cleaning: the piece is excluded.
  3. 300 to 600 words: used whole. Longer: split at paragraph breaks into
     consecutive passages of 300 to 600 words (greedy; a remainder under 300
     joins the previous passage if that stays at 600 or under, otherwise it
     is dropped). More than 3 passages: the first, middle and last are used.
  4. Westchester Bars (amendment): one passage per review, the first.

Sources are fixed: Wayback Machine captures by timestamp, git commits by
hash, and the frozen Westchester Bars drafts by file name.

Writes:
  passages.json            public: ids, sources, word counts, first and last
                           words, SHA-256 of the exact text. Full text only for
                           this site's own AI text (group A).
  <full-out>               private: every passage in full, for the score sheet.
                           Kept out of the repo (other writers' text).

  ./build_passages.py --full-out /path/to/passages_full.json
"""
import sys, os, re, gzip, json, time, hashlib, subprocess, urllib.request
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
WB_CONTENT = os.path.expanduser("~/projects/westchester-bars/content/")
UA = {"User-Agent": "Mozilla/5.0 (contentwrittenbyai.com EXP-002 passage builder)"}

# (id prefix, group, writer, published, url, wayback timestamp, container)
WEB = [
    ("H-SB-TBDATE", "H", "Laura Schaefer", "2023-08-26", "https://scatteredbooks.com/book-reviews/they-both-die-at-the-end-book-summary-a-heartbreaking-tale-by-adam-silvera/", "20250119140404", "post_content_holder"),
    ("H-SB-F451", "H", "Ken Schaefer", "2023-02-18", "https://scatteredbooks.com/book-reviews/fahrenheit-451-ray-bradbury/", "20250420025335", "wpb-content-wrapper"),
    ("H-SB-BSOG", "H", "Laura Schaefer", "2019-01-27", "https://scatteredbooks.com/book-reviews/between-shades-of-gray/", "20250323014918", "wpb-content-wrapper"),
    ("H-BCM-ROI", "H", "Ken Schaefer", "2019-10-03", "https://www.beebyclarkmeyler.com/what-we-think/roi-of-content-marketing", "20260711232029", "blog-post__body"),
    ("R-SB-ANNE", "R-mixed", "Laura Schaefer", "2023-11-30", "https://scatteredbooks.com/book-reviews/summary-of-the-diary-of-anne-frank/", "20241112202713", "wpb-content-wrapper"),
    ("R-BCM-AEO", "R-mixed", "Ken Schaefer", "2025-07-30", "https://www.beebyclarkmeyler.com/what-we-think/the-complete-guide-to-off-page-aeo-seo-ai-visibility", "20260510112623", "blog-post__body"),
    ("R-BCM-OPT", "R-mixed", "Ken Schaefer", "2025-06-26", "https://www.beebyclarkmeyler.com/what-we-think/guide-to-content-optimization-for-ai-search", "20260510111556", "blog-post__body"),
    ("R-SB-DUNE", "R-90", "Laura Schaefer", "2023-11-09", "https://scatteredbooks.com/book-reviews/dune-summary-review/", "20250209210853", "post_content_holder"),
    ("R-BCM-AIS", "R-90", "Ken Schaefer", "2026-03-13", "https://www.beebyclarkmeyler.com/what-we-think/what-weve-learned-about-ai-search-and-how-to-move-forward", "20260420024836", "blog-post__body"),
]
# Westchester Bars reviews published in 2022, with a Wayback capture from 2022 (writer: Ken Schaefer,
# Laura Schaefer or a Scattered Books employee; not recorded per review)
WB_HUMAN = [
    ("WH-937", "2022-01-04", "salsa-verde-taqueria-somers", "20221203045204"),
    ("WH-1181", "2022-01-11", "105-ten-in-briarcliff-manor", "20221201052026"),
    ("WH-1216", "2022-01-16", "unionville-tavern-hawthorne", "20221129074331"),
    ("WH-1270", "2022-01-19", "pipers-kilt-in-eastchester-ny", "20221130080913"),
    ("WH-1280", "2022-01-24", "green-growler-in-croton-ny", "20221129013934"),
    ("WH-1347", "2022-02-05", "tuckd-away-in-tuckahoe-ny", "20221201092345"),
    ("WH-1325", "2022-02-06", "growlers-beer-bistro-tuckahoe-ny", "20221129044934"),
    ("WH-1417", "2022-02-21", "craft-beer-pizza-pleasantville-ny", "20221130080914"),
    ("WH-1469", "2022-03-20", "wolf-warrior-brewing", "20221203082502"),
    ("WH-1478", "2022-11-26", "foleys-club-lounge-pleasantville-ny", "20221126145330"),
]
# Westchester Bars AI drafts, frozen before the editor saw them (build_<venue>_post.py --emit)
WB_AI = [
    ("WA-3033", "2026-09-05", "table9-3033-original.html", "https://westchesterbars.com/reviews/table-9-cortlandt-manor-ny/"),
    ("WA-3056", "2026-09-27", "horsefeathers-3056-original.html", "https://westchesterbars.com/reviews/horsefeathers-tarrytown-ny/"),
    ("WA-3074", "2026-09-27", "rikos-3074-original.html", "https://westchesterbars.com/reviews/rikos-pizza-white-plains-ny/"),
    ("WA-3411", "2026-10-04", "fat-sals-bar-grill-buchanan-ny-3411-original.html", "https://westchesterbars.com/reviews/fat-sals-bar-grill-buchanan-ny/"),
    ("WA-3531", "2026-10-13", "maracas-3531-original.html", "https://westchesterbars.com/reviews/maracas-bar-grill-ossining-ny/"),
    ("WA-3552", "2026-10-13", "here-coffee-beer-3552-original.html", "https://westchesterbars.com/reviews/here-coffee-beer-ossining-ny/"),
    ("WA-3580", "2026-10-17", "rubens-mexican-cafe-3580-original.html", "https://westchesterbars.com/reviews/rubens-mexican-cafe-peekskill-ny/"),
]
# This site's AI first drafts, verbatim from the "AI draft" commits
AI = [
    ("A-GOOG", "d3cd2be", "src/content/posts/does-google-penalize-ai-content.md", None),
    ("A-LLMS", "7ddbec4", "src/content/posts/llms-txt.md", None),
    # the section the editor asked for, added as an AI draft in 648b82e (only the lines that commit added)
    ("A-LLMS2", "648b82e", "src/content/posts/llms-txt.md", "added"),
]
# Constructed mixes: (id, target AI share, human passage, AI passage, which part comes first)
MIX = [
    ("M-25a", 0.25, "H-SB-TBDATE-1", "A-GOOG-1", "human"),
    ("M-25b", 0.25, "H-BCM-ROI-1", "A-LLMS-1", "ai"),
    ("M-50a", 0.50, "H-SB-F451-1", "A-GOOG-2", "human"),
    ("M-50b", 0.50, "WH-1478", "A-LLMS-2", "ai"),   # They Both Die gave one passage only
    ("M-75a", 0.75, "H-BCM-ROI-2", "A-GOOG-3", "human"),
    ("M-75b", 0.75, "H-SB-F451-2", "A-LLMS-3", "ai"),
]
MIX_WORDS = 400

FURNITURE = re.compile(r"https?://|bookshop\.org|libro\.fm|audiobook|isbn|^published by|number of pages|reading age|"
                       r"\(high school level\)|^author:|^answer:|^browse more:|^originally published|"
                       r"^(phone|website|hours|address|instagram|review summary):", re.I)

SKIP = {"script", "style", "figcaption", "table", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "noscript", "figure"}
VOID = {"br", "img", "hr", "input", "meta", "link", "source", "wbr", "area", "base", "col", "embed", "param", "track"}

class Body(HTMLParser):
    """<p>/<li> text inside the first div whose class list contains `container` (None = whole document)."""
    def __init__(self, container):
        super().__init__(convert_charrefs=True)
        self.container, self.depth, self.done = container, 0, False
        self.skip, self.stack, self.inp, self.buf, self.paras = 0, [], False, [], []
    def inside(self):
        return self.container is None or self.depth > 0
    def handle_starttag(self, tag, attrs):
        if self.done or tag in VOID:
            return
        cls = (dict(attrs).get("class") or "").split()
        if self.container and self.depth == 0:
            if tag == "div" and self.container in cls:
                self.depth = 1
            return
        if tag == "div" and self.container:
            self.depth += 1
        if self.skip:
            if tag == self.stack[-1]:
                self.skip += 1; self.stack.append(tag)
            return
        if tag in SKIP:
            self.skip += 1; self.stack.append(tag)
            return
        if tag in ("p", "li"):
            if self.inp:            # nested <li><p>: keep collecting into the outer one
                return
            self.inp, self.buf, self.open = True, [], tag
    def handle_endtag(self, tag):
        if self.done or not self.inside():
            return
        if self.skip and tag == self.stack[-1]:
            self.stack.pop(); self.skip -= 1
        elif self.inp and tag == self.open:
            t = re.sub(r"\s+", " ", "".join(self.buf)).strip()
            if t:
                self.paras.append(t)
            self.inp = False
        if tag == "div" and self.container:
            self.depth -= 1
            if self.depth == 0:
                self.done = True
    def handle_data(self, d):
        if self.inp and not self.skip and self.inside():
            self.buf.append(d)

def body(html, container):
    p = Body(container)
    p.feed(html)
    return p.paras

def is_furniture(t):
    w = t.split()
    if FURNITURE.search(t):
        return True
    if len(w) <= 6 and not re.search(r"[.!?…”\"')]$", t):
        return True
    if len(w) <= 4 and t.endswith(":"):
        return True
    return False

def clean(paras):
    return [p for p in paras if not is_furniture(p)]

def wc(ps):
    return len(" ".join(ps).split())

def split(paras):
    """Rule 3: whole if 300-600 words; else greedy 300-600 passages, first/middle/last if more than 3."""
    n = wc(paras)
    if n < 300:
        return []
    if n <= 600:
        return [paras]
    out, cur = [], []
    for p in paras:
        if cur and wc(cur) >= 300:
            out.append(cur); cur = []
        if cur and wc(cur + [p]) > 600:
            out.append(cur); cur = []
        cur.append(p)
    if cur:
        if wc(cur) >= 300:
            out.append(cur)
        elif out and wc(out[-1] + cur) <= 600:
            out[-1] = out[-1] + cur
    out = [x for x in out if 300 <= wc(x) <= 600]
    if len(out) > 3:
        out = [out[0], out[len(out) // 2], out[-1]]
    return out

def fetch(url, tries=4):
    for a in range(tries):
        try:
            raw = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read()
            if raw[:2] == b"\x1f\x8b":
                raw = gzip.decompress(raw)
            return raw.decode("utf-8", "replace")
        except Exception as e:
            print("  retry", url, e, file=sys.stderr); time.sleep(8 * (a + 1))
    raise SystemExit("could not fetch " + url)

def wayback(url, ts):
    return "https://web.archive.org/web/%sid_/%s" % (ts, url)

def autop(raw):
    """WordPress raw post content -> HTML: drop shortcodes and captions, wrap bare blocks in <p>, cut from Pros/Cons on."""
    raw = re.sub(r"\[caption[^\]]*\].*?\[/caption\]", "", raw, flags=re.S)
    raw = re.sub(r"\[/?[a-z_]+[^\]]*\]", "", raw)
    out = []
    for b in re.split(r"\n\s*\n", raw):
        b = b.strip()
        if re.match(r"^(<[^>]+>)*\s*Pros\s*(<[^>]+>)*$", b):
            break
        if b and not b.startswith("<"):
            b = "<p>" + b + "</p>"
        out.append(b)
    return "\n".join(out)

def md_paras(md):
    """Markdown post body -> paragraphs. Drops frontmatter, headings, tables, code, HTML blocks, blockquotes."""
    md = re.sub(r"\A---\n.*?\n---\n", "", md, flags=re.S)
    md = re.sub(r"```.*?```", "", md, flags=re.S)
    out = []
    for b in re.split(r"\n\s*\n", md):
        lines = []
        for ln in b.split("\n"):
            s = ln.strip()
            if not s or s.startswith(("#", "|", ">", "<div", "</div", "<!--", "import ", "export ")):
                continue
            if re.match(r"^<[^>]+>$", s):
                continue
            s = re.sub(r"^(?:[-*+]|\d+\.)\s+", "", s)
            s = re.sub(r"</?mark[^>]*>", "", s)
            s = re.sub(r"<[^>]+>", "", s)
            s = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", s)
            s = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)
            s = re.sub(r"(\*\*|__|`)", "", s)
            s = re.sub(r"(?<!\w)[*_](\S.*?\S|\S)[*_](?!\w)", r"\1", s)
            s = s.strip()
            if s:
                lines.append(s)
        # list items stay separate paragraphs; wrapped prose lines join
        if lines and all(re.match(r"^(?:[-*+]|\d+\.)\s", l.strip()) for l in b.split("\n") if l.strip()):
            out.extend(lines)
        elif lines:
            out.append(" ".join(lines))
    return out

def git(*args):
    return subprocess.run(["git", "-C", REPO] + list(args), check=True, capture_output=True, text=True).stdout

def added_lines(commit, path):
    diff = git("show", "--format=", "--unified=0", commit, "--", path)
    return "\n".join(l[1:] for l in diff.split("\n") if l.startswith("+") and not l.startswith("+++"))

def sha(t):
    return hashlib.sha256(t.encode("utf-8")).hexdigest()

def record(pid, group, paras, **src):
    text = "\n\n".join(paras)
    w = text.split()
    return {"id": pid, "group": group, "words": len(w), "first_words": " ".join(w[:8]),
            "last_words": " ".join(w[-8:]), "sha256": sha(text), "source": src, "_text": text}

def mix(h, a, share, first):
    """Paragraph-level splice: take AI paragraphs, then human paragraphs, from the start of each passage,
    each greedy to its word target (share * 400 and (1 - share) * 400)."""
    def take(paras, target):
        got = []
        for p in paras:
            if got and abs(wc(got + [p]) - target) > abs(wc(got) - target):
                break
            got.append(p)
        return got
    ai = take(a["_text"].split("\n\n"), share * MIX_WORDS)
    hu = take(h["_text"].split("\n\n"), (1 - share) * MIX_WORDS)
    return (hu + ai if first == "human" else ai + hu), wc(ai) / (wc(ai) + wc(hu))

def main():
    full_out = sys.argv[sys.argv.index("--full-out") + 1]
    out, excluded = [], []

    for pid, group, writer, pub, url, ts, cont in WEB:
        ps = split(clean(body(fetch(wayback(url, ts)), cont)))
        if not ps:
            excluded.append({"id": pid, "url": url, "reason": "under 300 words after cleaning"})
        for i, p in enumerate(ps, 1):
            out.append(record("%s-%d" % (pid, i), group, p, writer=writer, published=pub, url=url,
                              text_from=wayback(url, ts).replace("id_/", "/"), part="%d of %d" % (i, len(ps))))
        time.sleep(2)

    for pid, pub, slug, ts in WB_HUMAN:
        url = "https://westchesterbars.com/reviews/%s/" % slug
        ps = split(clean(body(fetch(wayback(url, ts)), "entry-content")))
        if not ps:
            excluded.append({"id": pid, "url": url, "reason": "under 300 words after cleaning"})
            continue
        out.append(record(pid, "WH", ps[0], writer="Ken Schaefer, Laura Schaefer or a Scattered Books employee",
                          published=pub, url=url, text_from=wayback(url, ts).replace("id_/", "/"),
                          part="1 of %d" % len(ps)))
        time.sleep(2)

    for pid, pub, f, url in WB_AI:
        ps = split(clean(body(autop(open(WB_CONTENT + f, encoding="utf-8").read()), None)))
        out.append(record(pid, "WA", ps[0], writer="Claude (AI draft from the editor's visit notes)", published=pub,
                          url=url, text_from="frozen draft content/%s (Westchester Bars project, not public)" % f,
                          part="1 of %d" % len(ps)))

    for pid, commit, path, mode in AI:
        md = added_lines(commit, path) if mode == "added" else git("show", "%s:%s" % (commit, path))
        ps = split(clean(md_paras(md)))
        if not ps:
            excluded.append({"id": pid, "commit": commit, "reason": "under 300 words after cleaning"})
        for i, p in enumerate(ps, 1):
            r = record("%s-%d" % (pid, i), "A", p, writer="Claude Opus 5.5", commit=commit, path=path,
                       part="%d of %d" % (i, len(ps)))
            r["text"] = r["_text"]          # our own text: published in full
            out.append(r)

    by_id = {r["id"]: r for r in out}
    for pid, share, hid, aid, first in MIX:
        if hid not in by_id or aid not in by_id:
            excluded.append({"id": pid, "reason": "missing %s or %s" % (hid, aid)})
            continue
        paras, actual = mix(by_id[hid], by_id[aid], share, first)
        r = record(pid, "M", paras, human_from=hid, ai_from=aid, target_ai_share=share,
                   actual_ai_share=round(actual, 3), order=first + " first")
        out.append(r)

    public = [{k: v for k, v in r.items() if k != "_text"} for r in out]
    json.dump({"experiment": "EXP-002", "built": time.strftime("%Y-%m-%d"), "rules": "build_passages.py docstring and passages.md",
               "passages": public, "excluded": excluded},
              open(os.path.join(HERE, "passages.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    json.dump([{"id": r["id"], "group": r["group"], "words": r["words"], "sha256": r["sha256"], "source": r["source"], "text": r["_text"]} for r in out],
              open(full_out, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    for r in out:
        print("%-16s %-8s %4d  %s ... %s" % (r["id"], r["group"], r["words"], r["first_words"][:40], r["last_words"][-40:]))
    for e in excluded:
        print("EXCLUDED", e)

if __name__ == "__main__":
    main()

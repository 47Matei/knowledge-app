"""Repairs card text fields that were shifted by the old builder bug (empty field "| |" split only on " | ").
One-time repair (run on 8 November 2026). For every card in data/<deck>.json whose d / en / m / f / alt contains a "|"
(or, with the same id, q and a, differs from the source - the 4 shifts that left no "|"), re-parse the reference source
(tools/src-reference/*.txt) with the fixed builder and copy back only the text fields d, en, f, m, alt -
pictures, maps, ids, q and a stay untouched. A card is repaired only if its id, q and a match the source exactly.
Usage (repo root): python3 tools/repair_shifted_fields.py [--write]"""
import json, os, sys, glob
sys.path.insert(0, os.path.dirname(__file__))
from deck_from_txt import parse
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FIELDS = ('d', 'en', 'f', 'm', 'alt')
def has_pipe(c):
    for k in FIELDS:
        v = c.get(k)
        if isinstance(v, str) and '|' in v: return True
        if isinstance(v, dict) and any('|' in a or '|' in str(b) for a, b in v.items()): return True
        if isinstance(v, list) and any('|' in x for x in v): return True
    return False
write = '--write' in sys.argv
total = {'bad': 0, 'fixed': 0, 'nosrc': 0, 'mismatch': 0}
for src in sorted(glob.glob(os.path.join(ROOT, 'tools', 'src-reference', '*.txt'))):
    deck, meta, errors = parse(src)
    did = deck['id']
    path = os.path.join(ROOT, 'data', did + '.json')
    if not os.path.exists(path): continue
    data = json.load(open(path))
    srcmap = {c['id']: c for c in deck['cards']}
    fixed = bad = mism = nosrc = 0
    for c in data['cards']:
        s = srcmap.get(c['id'])
        same_card = bool(s) and s.get('q') == c.get('q') and s.get('a') == c.get('a')
        differs = same_card and any(s.get(k) != c.get(k) for k in FIELDS)
        if not has_pipe(c) and not differs: continue
        bad += 1
        if not s: nosrc += 1; continue
        if s.get('q') != c.get('q') or s.get('a') != c.get('a'): mism += 1; continue
        for k in FIELDS:
            if k in s: c[k] = s[k]
            elif k in c: del c[k]
        if has_pipe(c): mism += 1; continue
        fixed += 1
    if write and fixed:
        with open(path, 'w', encoding='utf-8') as fh: json.dump(data, fh, ensure_ascii=False, separators=(',', ':'))
    total['bad'] += bad; total['fixed'] += fixed; total['nosrc'] += nosrc; total['mismatch'] += mism
    if bad: print(f'{did:14} afectate {bad:4}  reparate {fixed:4}  fără sursă {nosrc:3}  diferite {mism:3}')
print('TOTAL', total, '(scris)' if write else '(doar verificare; adaugă --write)')

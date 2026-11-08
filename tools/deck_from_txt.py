"""Build one domain (deck) from an authored text source and register it in data/index.json.

Usage (from the repo root):
    python3 tools/deck_from_txt.py path/to/new_domain.txt            # create a NEW domain
    python3 tools/deck_from_txt.py path/to/masini.txt --force        # rebuild an EXISTING domain (keeps images by card id)
    python3 tools/deck_from_txt.py path/to/x.txt --dry-run           # parse and report only

Source format (UTF-8, one item per line; see AGENTS.md section "Deck source format"):
    @id planete                         required: lowercase ascii id, also the file name data/<id>.json
    @title Planete și sateliți          required for a new domain (shown on the home grid)
    @sub Planete, sateliți, misiuni     short subtitle under the title
    @icon planet                        one of the ICON keys in app.js
    @hue 255                            0-360, tile color
    @source Pachet generat și verificat de Claude (noiembrie 2026), pe baza surselor enciclopedice publice.
    @prompt Răspunde la întrebare       default prompt for the whole deck
    @intrus {"by": "sub", "item": "a", "skip": []}   optional JSON, config for the "odd one out" quiz
    @append 1                           optional: merge cards into an existing deck instead of replacing it
    ## Subsection name | Prompt for this subsection
    question | answer | details | english name | Key=Value; Key2=Value2 | mnemonic | alt answer 1 / alt answer 2
    ~ card A question ~ card B question ~ tip for the "compare" mode
"""
import json, sys, re, unicodedata, os, argparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')


def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:40]


def parse(path):
    deck = {'cards': [], 'pairs': [], 'prompts': {}}
    meta, sub, raw_pairs, seen, errors = {}, None, [], set(), []
    for n, line in enumerate(open(path, encoding='utf-8'), 1):
        line = line.rstrip('\n')
        if not line.strip() or line.startswith('#!'):
            continue
        if line.startswith('@'):
            k, _, v = line[1:].partition(' ')
            meta[k] = v.strip()
            continue
        if line.startswith('## '):
            parts = [p.strip() for p in line[3:].split('|')]
            sub = parts[0]
            if len(parts) > 1 and parts[1]:
                deck['prompts'][sub] = parts[1]
            continue
        if line.startswith('~'):
            raw_pairs.append([p.strip() for p in line.strip('~ ').split('~')])
            continue
        if sub is None:
            errors.append(f'line {n}: card before the first "## " subsection')
            continue
        # split on every "|" (not only " | "), so an empty field written as "| |" stays empty instead of shifting the next fields
        f = [p.strip() for p in line.split('|')]
        if len(f) < 2 or not f[0] or not f[1]:
            errors.append(f'line {n}: needs at least "question | answer"')
            continue
        f += [''] * (7 - len(f))
        q, a, d, en, facts, m, alt = f[:7]
        if 'id' not in meta:
            raise SystemExit(f'{path}: "@id" must come before the cards')
        base = meta['id'][:4] + '-' + slug(q)
        cid, k = base, 2
        while cid in seen:
            cid, k = f'{base}-{k}', k + 1
        seen.add(cid)
        card = {'id': cid, 'sub': sub, 'q': q, 'a': a}
        if d: card['d'] = d
        if en: card['en'] = en
        if facts:
            card['f'] = {}
            for kv in facts.split(';'):
                if '=' in kv:
                    kk, vv = kv.split('=', 1)
                    card['f'][kk.strip()] = vv.strip()
        if m: card['m'] = m
        if alt: card['alt'] = [x.strip() for x in alt.split('/') if x.strip()]
        deck['cards'].append(card)
    if 'id' not in meta or not re.fullmatch(r'[a-z][a-z0-9_]{1,30}', meta['id']):
        errors.append('"@id" missing or not a lowercase ascii id')
    deck['id'] = meta.get('id', '')
    if meta.get('prompt'): deck['prompt'] = meta['prompt']
    for pr in raw_pairs:
        if len(pr) != 3:
            errors.append(f'pair needs 3 parts: {pr}')
            continue
        a, b, tip = pr
        ids = []
        for t in (a, b):
            c = next((c for c in deck['cards'] if c['q'] == t), None) or next((c for c in deck['cards'] if c['a'] == t), None)
            if not c: errors.append(f'pair target not found: {t}')
            else: ids.append(c['id'])
        if len(ids) == 2: deck['pairs'].append([ids[0], ids[1], tip])
    # duplicates (same question and answer) confuse the quizzes
    qa = {}
    for c in deck['cards']:
        key = (c['q'].lower(), c['a'].lower())
        if key in qa: errors.append(f'duplicate card: {c["q"]} | {c["a"]}')
        qa[key] = 1
    return deck, meta, errors


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('--force', action='store_true', help='allow replacing an existing domain')
    ap.add_argument('--dry-run', action='store_true')
    o = ap.parse_args()
    deck, meta, errors = parse(o.src)
    if errors:
        print('ERRORS:\n  ' + '\n  '.join(errors))
        raise SystemExit(1)
    did = deck['id']
    out = os.path.join(DATA, did + '.json')
    index = json.load(open(os.path.join(DATA, 'index.json'), encoding='utf-8'))
    existing = next((d for d in index['domains'] if d['id'] == did), None)
    if meta.get('append'):
        if not existing: raise SystemExit(f'@append: domain {did} does not exist')
        base = json.load(open(out, encoding='utf-8'))
        new_ids = {c['id'] for c in deck['cards']}
        keep = [c for c in base['cards'] if c['id'] not in new_ids]
        old = {c['id']: c for c in base['cards']}
        for c in deck['cards']:
            if c['id'] in old and 'img' in old[c['id']]: c['img'] = old[c['id']]['img']
        base['cards'] = keep + deck['cards']
        base['pairs'] = [p for p in base.get('pairs', []) if p[0] not in new_ids and p[1] not in new_ids] + deck['pairs']
        base['prompts'] = {**base.get('prompts', {}), **deck['prompts']}
        deck = base
    elif existing and not o.force:
        raise SystemExit(f'domain "{did}" already exists; use --force to rebuild it or @append 1 to add cards')
    elif existing:
        old = {c['id']: c for c in json.load(open(out, encoding='utf-8'))['cards']}
        kept = 0
        for c in deck['cards']:
            if c['id'] in old:
                for k in ('img', 'map', 'romap', 'rl', 'iso', 'flag', 'jud', 'big'):
                    if k in old[c['id']] and k not in c: c[k] = old[c['id']][k]; kept += 1
        print(f'kept {kept} image/map fields from the previous version')
    subs = {}
    for c in deck['cards']: subs[c['sub']] = subs.get(c['sub'], 0) + 1
    print(f'{did}: {len(deck["cards"])} cards, {len(subs)} subsections, {len(deck["pairs"])} pairs')
    for s, n in subs.items(): print(f'  {n:4d}  {s}')
    if o.dry_run: return
    json.dump(deck, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    entry = existing or {'id': did}
    if not existing:
        for k in ('title', 'sub', 'icon'):
            if not meta.get(k): raise SystemExit(f'a new domain needs @{k}')
        index['domains'].append(entry)
    for k in ('title', 'sub', 'icon', 'source'):
        if meta.get(k): entry[k] = meta[k]
    if meta.get('hue'): entry['hue'] = int(meta['hue'])
    entry.setdefault('hue', 200)
    entry.setdefault('source', 'Pachet generat și verificat de Claude, pe baza surselor enciclopedice publice.')
    if meta.get('intrus'): entry['intrus'] = json.loads(meta['intrus'])
    entry.setdefault('intrus', {'by': 'sub', 'item': 'a', 'skip': []})
    entry.setdefault('map', None)
    entry['count'] = len(deck['cards'])
    json.dump(index, open(os.path.join(DATA, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'wrote data/{did}.json and updated data/index.json ({len(index["domains"])} domains)')


if __name__ == '__main__':
    main()

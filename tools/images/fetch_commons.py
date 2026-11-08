"""Find and download one freely licensed photo per target from Wikimedia Commons.

Usage (repo root):  python3 tools/images/fetch_commons.py work/targets.json
  - targets.json: [{"tag": "astr-mars", "deck": "astronomie", "card": "<card id>", "q": "Mars planet", "must": ["mars"], "label": "Marte"}]
      tag    unique id of the picture (ascii, lowercase, hyphens); becomes the key inside the image pack
      card   the card id in data/<deck>.json that gets the picture
      q      Commons search text (English names work best)
      must   optional: words that must appear in the file title (default: words of q, 5-letter prefixes)
  - writes work/raw/<tag>.jpg|png and work/meta.json ({tag: {f, title, lic, by, page} | {none: true} | {err}})
  - resumable: targets already in work/meta.json are skipped. Run it again until it prints "done".
Needs normal internet access (it does NOT work from sandboxes that block upload.wikimedia.org).
Wikimedia rate-limits thumbnails (HTTP 429 + Retry-After): the script sleeps between downloads and honours Retry-After.
"""
import json, os, sys, time, re, urllib.request, urllib.parse, html, unicodedata
UA = 'CartotecaLearningApp/1.0 (personal educational flashcards; https://github.com/47Matei/knowledge-app)'
TARGETS = sys.argv[1]
WORK = os.path.dirname(os.path.abspath(TARGETS))
RAW = os.path.join(WORK, 'raw'); os.makedirs(RAW, exist_ok=True)
META = os.path.join(WORK, 'meta.json')
targets = json.load(open(TARGETS, encoding='utf-8'))
meta = json.load(open(META, encoding='utf-8')) if os.path.exists(META) else {}
PAUSE = float(os.environ.get('PAUSE', '6'))

def norm(s): return unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
# file titles that are almost never a clean photo of the subject itself
BAD = re.compile(r'\b(logo|map|diagram|drawing|icon|flag|coat of arms|chart|graph|stamp|coin|banknote|interior|dashboard|engine|badge|emblem|toy|lego|scale model|modell|miniature|diecast|die-cast|cockpit|counterfeit|fake|replica|homage|portrait|movement|caliber|calibre|box|strap|bracelet|caseback|advert|advertisement|poster|catalog|catalogue|patent|crash|wreck|accident|burnt|rally|racing|tuning|modified|kit|detail)s?\b', re.I)
FREE = re.compile(r'(cc|public domain|pd|gfdl|cc0|attribution|no restrictions)', re.I)
used = {v.get('title') for v in meta.values() if 'f' in v}

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=30) as r: return r.read()
        except Exception as e:
            if getattr(e, 'code', None) == 429:
                time.sleep(max(2, int(e.headers.get('Retry-After') or 2)) * (attempt + 2)); continue
            raise
    raise RuntimeError('rate limited')

def strip(s): s = html.unescape(re.sub(r'<[^>]+>', '', s or '')).strip(); return re.sub(r'\s+', ' ', s)[:120]

def search(q, n=15):
    p = {'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': q + ' filetype:bitmap', 'gsrnamespace': '6', 'gsrlimit': str(n),
         'prop': 'imageinfo', 'iiprop': 'url|extmetadata|mime|size', 'iiurlwidth': '500', 'iiextmetadatafilter': 'LicenseShortName|Artist'}
    d = json.loads(get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(p)))
    return sorted((d.get('query') or {}).get('pages', {}).values(), key=lambda x: x.get('index', 99))

def pick(pages, toks):
    for p in pages:
        ii = (p.get('imageinfo') or [{}])[0]; t = p.get('title', ''); nt = norm(t)
        if ii.get('mime') not in ('image/jpeg', 'image/png') or BAD.search(nt) or t in used: continue
        w, h = ii.get('width', 0), ii.get('height', 1)
        if w < 600 or w < h * 0.6 or w > h * 2.6: continue
        if not all(x in nt for x in toks): continue
        lic = strip(ii.get('extmetadata', {}).get('LicenseShortName', {}).get('value'))
        if not lic or not FREE.search(lic): continue
        return p, ii, lic, strip(ii.get('extmetadata', {}).get('Artist', {}).get('value')) or 'autor necunoscut'
    return None

GEN = {'the', 'and', 'of', 'watch', 'car', 'photo'}
n = 0
for t in targets:
    if t['tag'] in meta and 'err' not in meta[t['tag']]: continue
    q = t['q']
    toks = [norm(x)[:5] for x in t.get('must') or [w for w in re.split(r'[^a-z0-9]+', norm(q)) if len(w) >= 2 and w not in GEN]]
    try:
        ch = pick(search(f'intitle:"{q}"'), toks) or pick(search(q), toks)
        if not ch: meta[t['tag']] = {'none': True}
        else:
            p, ii, lic, by = ch; ext = '.jpg' if ii['mime'] == 'image/jpeg' else '.png'
            fn = t['tag'] + ext
            open(os.path.join(RAW, fn), 'wb').write(get(ii['thumburl']))
            meta[t['tag']] = {'f': fn, 'title': p['title'], 'lic': lic, 'by': by, 'page': ii.get('descriptionurl', '')}
            used.add(p['title']); n += 1; print(t['tag'], '->', p['title'], flush=True); time.sleep(PAUSE)
    except Exception as e:
        meta[t['tag']] = {'err': str(e)[:80]}
    json.dump(meta, open(META, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('done, new images:', n, '| with image:', sum('f' in v for v in meta.values()), '/', len(targets))

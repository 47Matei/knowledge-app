# AGENTS.md - Cartoteca lui Matei (knowledge-app)

Handoff for coding agents (Codex, Claude). Read all of it before changing anything. Last updated: 8 November 2026, after Round 2 and before Stage 3.

## 1. Who and what

- **Matei** (Ciprian's son) uses the app every day on an Android phone, 30-45 minutes a day. **Ciprian** (the parent) owns the project and makes the decisions. Talk to Ciprian in **Romanian**. All app UI text is Romanian, with correct diacritics (ș ț with a comma below, ă â î).
- The app is a mobile learning app with:
  - flashcards scheduled with FSRS spaced repetition;
  - quizzes: multiple choice, written answer, timed, odd-one-out ("intrus"), image quiz;
  - compare mode, interactive maps, a lesson intro, a placement test, statistics, XP, streaks and badges.
- 17 domains with about 4,300 cards: mașini, ceasuri, comportament, capitale, localizare, județe, steaguri, avioane, elemente, astronomie, istorie, corp, biasuri, finanțe, monumente, arhitectură, vocabular.
- **Repository:** https://github.com/47Matei/knowledge-app (public). `main` is stable and identical to what is published; `dev` is the working branch. Changes go `feature/*` or `dev` → Pull Request → `main`.
- **Live copy:** the app is also published as a Claude artifact (https://claude.ai/artifact/4LowyueJzN8AvRkH5hL9DF, owner: Ciprian). Only a Claude session can publish there; see section 9.

## 2. Working rules (from Ciprian)

1. **Ask before big tasks.** Before a large or multi-direction task, ask clarifying questions (at least 3). When there are several directions, group the questions per direction in one short table, with your recommendation per question. For small, clear tasks, ask only if something essential is missing.
2. **Never invent facts.** No invented years, models, numbers or names. If unsure, leave the fact out or mark it "de verificat". Verify current facts (who owns a brand, prices, laws) before writing them.
3. **No wrong pictures.** No picture is better than a wrong picture. Every new photo is checked visually against its card before it ships.
4. **Hyphens, not dashes.** In documents and UI text use a hyphen (-), never an em or en dash.
5. **Flag limitations early.** If a tool or platform limit blocks something, say so before spending effort, and propose alternatives.
6. **Don't break what works.** Work in small steps. Run the tests (section 8) before every commit. Add tests for new behavior.
7. **Report at the end:** what changed, plus how Ciprian can test each point on the phone.

## 3. Repository layout

| Path | What it is |
|---|---|
| `index.html` | Full page: markup and all CSS. It loads `app.js`. No build step, no framework. |
| `app.js` | All logic (about 2,000 lines, plain ES2020, no dependencies). |
| `data/index.json` | List of domains (metadata, card count, intrus config, map). |
| `data/<id>.json` | One deck per domain. |
| `data/world.json`, `data/romania.json` | Map geometry (TopoJSON-derived, Natural Earth, public domain). |
| `data/intro.json` | Short starting lessons per domain. |
| `img/*.jpg` | Card photos, 500 px, Wikimedia Commons. |
| `img/pack-<deck>-<n>.json` | Photos added in Round 2: `{tag: "data:image/jpeg;base64,..."}`, 40 per file, loaded on demand. |
| `CREDITS.md` | Author, license and source of every photo. It must stay complete. |
| `tools/` | Build, image and test tools (Node and Python). Not used by the app at runtime. |
| `AGENTS.md`, `CLAUDE.md` | Instructions for coding agents (this file; CLAUDE.md imports it for Claude Code). |
| `tools/src-reference/*.txt` | The original authoring sources of the text decks (reference only, see 5.3). |

**Run locally:** `python3 -m http.server 8765` in the repo root, then open http://localhost:8765/. The app fetches `data/` and `img/`, so `file://` does not work.

## 4. How app.js is organized

The sections are marked with `// ---------- name ----------` comments; search for them.

- **State.**
  - `S`, saved under the localStorage key `cartoteca.v1`.
  - `freshState()` and `normalize()` build and repair it.
  - `S.cards[cardId]` holds the FSRS state, for example `{st, due, s, d, reps, lapses, last}`.
  - `S.days`, `S.xp`, `S.streak`, `S.badges`, `S.conf` (confusions), `S.quiz`.
  - `S.settings` (includes `pins`, at most 5) and `S.settingsAt`.
  - Card ids must stay stable forever: progress is keyed by them.
- **Cloud sync** (`initCloud`, `flushCloud`).
  - Runs only inside the Claude artifact, where `window.claude.use('db' | 'user')` exists.
  - It writes to the collection `data/users/<uid>`: doc `meta` holds the state without cards, docs `deck-<id>` hold the cards.
  - Writes are throttled: `CLOUD_MIN_GAP` = 60 s, plus a flush at session end and on `pagehide`.
  - Outside Claude (GitHub Pages, localhost) the app silently stays local-only.
  - Settings already has **Exportă / Importă** (copy the JSON text, paste it back).
- **Data loading.** `deck(id)` fetches and caches `data/<id>.json` in `DECKS`. `INDEX` is `data/index.json`. `promptOf(card, deck)` picks the question prompt, in this order: deck `prompts[sub]`, `SUB_PROMPT`, deck `prompt`, `DEFAULT_PROMPT`.
- **FSRS 4.5.**
  - Weights `W`, plus `schedule(prev, grade, now)` and `ivlLabel`.
  - The `SRS` config: `WRONG_DELAY_MIN: 60`, `WRONG_GAP_CARDS: 10`, `WRONG_MAX_REQUEUE: 1`.
  - "Greșit" means the card comes back after about 1 hour, with at least 10 other cards in between within a session.
  - `dueForSession()` shows learning cards only when they are really due.
- **Written-answer checker** (`checkAnswerDetail(card, input)` returns `{r: 'ok'|'close'|'bad', ...}`). Matching rules:
  - Normalization: case, diacritics, punctuation and anything in parentheses are ignored.
  - Components are split on " - ", ",", ";", ":". Required components can come in any order. "A/B" means either one.
  - Years and numbers must be exact.
  - Damerau-Levenshtein tolerance by word length: 0 typos for 1-3 letters, 1 for 4-7, 2 for 8+.
  - Aliases come from `ANS_ALIAS`, plus RO↔EN country names taken from the capitale deck.
  - Anti-confusion against the deck vocabulary, so "Austria" is never accepted for "Australia".
  - "close" counts as accepted. It shows "Aproape: ai scris X, corect e Y" and preselects the grade "Greu".
  - In the vocabulary deck, comma-separated synonyms are alternatives.
  - Tests: `tools/test/test_answers.js`. Every card must accept its own answer.
- **Quizzes.**
  - `makeQuestion(mode, deck, pool, used)`; `distractors()`; `intrusGroups()` reads `index.json` → `intrus`.
  - **Image quiz for ceasuri and mașini** (`modelGroups`): the question is "Ce model {marcă} este?". All options are models of the same brand.
  - A brand enters the image quiz only if it has at least `MIN_MODELS` = 4 distinct models with photos. Brands in the subsection "Mărci de supercaruri și electrice" need only `MIN_MODELS_SUPER` = 3, and then the question has 3 options.
  - Test: `tools/test/test_models.js`.
- **Pictures.** `imgEl(card)` renders `card.img`:
  - `{f}` means the file `img/<f>`;
  - `{p, f}` means key `f` inside `img/<p>.json` (loaded by `packImg`);
  - `{u}` means a direct URL (unused).
  - If loading fails, the figure is removed; it is never shown broken.
- **Maps.**
  - `viewport()` handles pinch zoom, pan, double-tap and tap-vs-drag (`TAP_PX` = 10, `TAP_MS` = 400). There is no jump when one finger lifts.
  - Small countries and cities get a 16 px hit radius.
  - A wrong answer makes the correct target blink.
- **UI conventions.**
  - Correct is green (`.ok`), wrong is red (`.bad`) on the card, the banner and the A/B/C/D options.
  - Grade buttons and "Următoarea" are sticky at the bottom (`.stickyact`).
  - `toast(msg, icon)` shows a message; icons are in `ICON`.
  - Pins: up to 5 domains are shown first, with a pin on the home grid and on the domain page.
- **Views.** `VIEWS.<name>`, with `go(name, params)` and `back()`; `render()` redraws the current view.

### Platform limits of the Claude artifact copy (keep the app compatible)

- **No network calls to other hosts.** `fetch` to any other host is blocked by the CSP. That includes the Anthropic API.
- **No service workers.** `alert`, `confirm` and `prompt` are refused, and so are downloads started by the page.
- **Clipboard writes only from a click handler.**
- **At most 512 files per published version.** That counts index.html, app.js, data/* and img/*; there are 476 today. This is why new photos go into packs.
- **Capabilities are frozen.** The artifact declares `db` and `user`. New capabilities (such as `sample`, which asks Claude) can no longer be added, because another account (Matei's progress sync) has written to it.
- So every new feature must **feature-detect**:
  - when `window.claude` exists, it runs as the artifact;
  - when the hostname ends in `github.io`, it runs as the PWA;
  - otherwise it runs on localhost.

## 5. Data formats

### 5.1 Deck file `data/<id>.json`

```json
{ "id": "astronomie", "prompt": "Răspunde la întrebare",
  "prompts": { "Planete": "Ce planetă este?" },
  "cards": [ { "id": "astr-cea-mai-apropiata-de-soare-si-cea-mai-m", "sub": "Planete",
      "q": "Cea mai apropiată de Soare și cea mai mică planetă", "a": "Mercur",
      "d": "details shown after answering", "en": "Mercury",
      "f": { "Poziție": "1", "Sateliți": "0" }, "m": "mnemonic", "alt": ["other accepted answers"],
      "img": { "f": "file.jpg", "by": "author", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:..." } } ],
  "pairs": [ ["cardIdA", "cardIdB", "how to tell them apart (compare mode)"] ] }
```

Required card fields are `id`, `sub` and `a`, plus `q` (except map cards, which use `map`, `romap` or `rl`, and flag cards). Card ids are `<first 4 letters of deck id>-<slug of q>`. Keep answers short: the written mode is offered only when the answer has at most 28 characters after normalization.

### 5.2 Domain entry in `data/index.json`

```json
{ "id": "astronomie", "title": "Astronomie", "sub": "Planete, sateliți, stele, misiuni", "icon": "planet", "hue": 255,
  "source": "Pachet generat și verificat de Claude (octombrie 2026), pe baza surselor enciclopedice publice.",
  "count": 164, "intrus": { "by": "sub", "item": "a", "skip": ["Misiuni"] }, "map": null }
```

- **`icon`** must be a key of `ICON` in app.js: car, watch, people, capital, globe, romania, flag, plane, atom, planet, crown, heart, brain, coin, arch, book, columns, and others.
- **`intrus.by`** says how the odd-one-out quiz groups cards: `sub`, `a` or `f:<fact key>`.
- **`intrus.item`** says what is shown: `q`, `a`, `qa` or `auto`.
- **`intrus.skip`** lists subsections that are excluded.

### 5.3 Deck source format (`.txt`, one item per line), built with `tools/deck_from_txt.py`

```
@id planete
@title Planete și sateliți
@sub Planete, sateliți, misiuni
@icon planet
@hue 255
@source Pachet generat și verificat de Claude (noiembrie 2026), pe baza surselor enciclopedice publice.
@prompt Răspunde la întrebare
@intrus {"by": "sub", "item": "a", "skip": []}
## Planete | Ce planetă este?
question | answer | details | english name | Key=Value; Key2=Value2 | mnemonic | alt 1 / alt 2
~ question of card A ~ question of card B ~ tip for telling them apart
```

- Fields are separated by ` | ` (space, pipe, space). Trailing fields can be omitted.
- `@append 1` merges cards into an existing deck.
- **`tools/src-reference/`** holds the original sources of the text decks.
  - These sources do **not** contain the pictures, maps or Round 2 image tags. The JSON files in `data/` are the source of truth.
  - To edit an existing deck, prefer editing `data/<id>.json` directly; never change existing card ids.
  - Rebuilding an existing deck with `--force` keeps pictures and maps by card id. Rebuilding `astronomie` from its reference source reproduces the current JSON exactly.

## 6. Adding a new domain (the standard workflow)

1. **Agree the scope with Ciprian.** Settle the topic, the subsections, the number of cards (usually 80-200), whether it needs pictures, and the intrus config.
2. **Write the source** in `work/<id>.txt` (the `work/` folder is git-ignored) using the format in 5.3.
   - Romanian, short answers, useful details in `d`, English name in `en`.
   - Facts must be verified; mark unsure ones "de verificat" or drop them.
   - Make it Matei-appropriate.
3. **Check, then build.**
   - `python3 tools/deck_from_txt.py work/<id>.txt --dry-run` (fix every reported error)
   - then without `--dry-run` to write `data/<id>.json` and register the domain in `data/index.json`.
4. **Pictures (optional),** on Ciprian's Mac, which can reach Wikimedia:
   - **Targets:** write `work/img-<id>/targets.json`:
     `[{"tag": "<deck4>-<slug>", "deck": "<id>", "card": "<card id>", "q": "<Commons search, English>", "must": ["word"], "label": "<what it should show>"}]`
   - **Download:** `python3 tools/images/fetch_commons.py work/img-<id>/targets.json`. It is resumable; re-run it until it prints "done". Wikimedia rate-limits to roughly 1 download every 6-8 s.
   - **Audit:** `node tools/images/audit_sheet.js work/img-<id>/targets.json` writes `work/img-<id>/audit/sheet-<n>.jpg`. Look at **every** photo and put the tag of every wrong or unclear one in `work/img-<id>/exclude.txt`.
     - Reject: coins, portraits, buildings instead of objects, interiors, close-up details, movements or casebacks of watches, rally or race liveries, the wrong variant (Yaris Cross is not Yaris, Evoque is not Range Rover), toys and models, logos.
   - **Pack:** `node tools/images/pack_images.js work/img-<id>/targets.json` packs the photos into `img/pack-<deck>-<n>.json`, sets `card.img` and appends to `CREDITS.md`. Use `--files` for separate jpgs only if the artifact copy is no longer needed.
5. **Test:** run `npm --prefix tools test`, then open the domain on localhost on a phone-size viewport. Check learn, quiz, intrus and compare.
6. **Ship:** commit on `dev` or a `feature/*` branch, open a PR to `main`, and tell Ciprian how to test it.

## 7. History and decisions so far

- **Stage 1 (October 2026)** built the app, the 17 domains, the maps, statistics and badges, cloud sync, export and import, and the first audited photos.
- **Stage 2** added the photos, with a visual audit of all 486. 35 wrong ones were removed (for example, Palatul Parlamentului showed Westminster).
- **Round 1 (6 November 2026)** fixed and changed:
  - pins (max 5);
  - green and red colors everywhere;
  - the tolerant written-answer checker;
  - sticky buttons and scroll reset;
  - "Greșit" set to 1 hour plus 10 cards apart;
  - map touch rewrite;
  - image audit;
  - cloud write throttling.
- **Round 2 (7 November 2026)** added:
  - "Ce model {marcă} este?" with same-brand options;
  - 25 supercar and EV brands (verified facts; for example, KTM Sportcar was sold in October 2025, Bugatti Rimac is owned 55/45 by Rimac Group and Porsche);
  - 16 watch brands and model cards;
  - 202 new audited photos in packs (38 rejected);
  - supercar threshold 3.
  - Model cards exist only where a good photo exists. Some brands still have only 1-2 models (Pagani, Rimac, Zenvo, SSC, Hennessey, KTM, Ariel, Praga, Vector, Devel, Saleen, Singer, Lucid, Gordon Murray). Adding good photos and models there is welcome.
- **8 November 2026:** a missing photo for Royal Oak Offshore was found by `test_decks.js` and restored (`img/ceas-royal-oak.jpg`).
- **Rejected ideas and why:**
  - Calling Claude from inside the artifact is not possible: capabilities are frozen, and it would use the viewer's account.
  - Pasting a prompt into the Claude app is not possible: Matei has no Claude chat access.
  - Ciprian then wants domain generation to be **independent**: an API call made by the app itself (section 10).

## 8. Tests

```bash
cd tools && npm install && npx playwright install chromium && cd ..   # once
npm --prefix tools test                       # decks + answers + models (about 30 s)
python3 -m http.server 8765 &                 # then:
npm --prefix tools run test:ui                # 15 UI checks in Chromium, Pixel 7 emulation
```

- **`test_decks.js`** checks data integrity: index and deck files match, ids are unique, there are no duplicate cards, every picture and pack key exists, licenses are present, pairs are valid, and the file count is at most 512.
- **`test_answers.js`** runs 34 checker cases plus a self-answer regression over all cards.
- **`test_models.js`** checks the same-brand image quiz and the thresholds.
- **`ui_test.js`** checks pins, colors, sticky buttons, "1 oră" and the scroll reset. Screenshots go to `tools/test/out/`.

All must pass before a PR. When you add a feature, add its test.

## 9. Two copies of the app: GitHub and the Claude artifact

- The repo is the single source of truth. The Claude artifact is published from the repo by a Claude session (Ciprian asks Claude: "publică ultima versiune din main"). That session clones the public repo and uploads `index.html`, `app.js`, `data/*` and `img/*`.
- Claude sessions can read the public repo but cannot push to it unless Ciprian attaches the repo with push access. Otherwise their changes arrive as a zip or patch that Ciprian commits.
- Never let the two drift: anything changed in a Claude session must be committed to the repo.

## 10. Stage 3 - what to build next (agreed direction; confirm open points with Ciprian first)

Order: 10.1 → 10.2 → 10.3 → 10.4.

### 10.1 GitHub Pages + PWA (becomes Matei's main app)

- Enable Pages: repo Settings → Pages → "Deploy from a branch", `main`, folder `/` (root). The URL will be `https://47matei.github.io/knowledge-app/`.
- Add `manifest.webmanifest`: name "Cartoteca lui Matei", `display: standalone`, theme colors from the CSS, 192 and 512 px PNG icons generated from the app's style, and `start_url` relative.
- Add `sw.js`:
  - cache the app shell (index.html, app.js, manifest, icons);
  - stale-while-revalidate for `data/*.json` and `img/*`;
  - a versioned cache name.
- Register the worker **only when not inside Claude**: `if (!window.claude && 'serviceWorker' in navigator)`, with try/catch.
- Progress on Pages is local only (localStorage). Migrate Matei's current progress once: Exportă in the Claude artifact → Importă on Pages.
- Add a gentle monthly reminder in Settings to export a backup.
- Write a short install guide: Chrome → ⋮ → "Adaugă pe ecranul de pornire".

### 10.2 "Domeniu nou" - independent generation through the Anthropic API

- **Where it works:** only on GitHub Pages and localhost. In the artifact the button is hidden or shows "disponibil în aplicația instalată".
- **Never put an API key in the repo or in client code.** The repo is public. Use a small proxy:
  - **Cloudflare Worker** (free plan), in `worker/` in this repo, deployed with `npx wrangler deploy`.
  - Secrets are set with `wrangler secret put`:
    - `ANTHROPIC_API_KEY`, from Ciprian's console.anthropic.com account. This is prepaid API credit, separate from any Claude subscription.
    - `APP_KEY`, a shared passphrase that Ciprian types once on Matei's phone; it is stored in localStorage and never committed.
  - CORS allows only `https://47matei.github.io` and `http://localhost:8765`.
  - Rate limit, using a KV counter per day: default 3 domains per day.
  - Ciprian also sets a monthly spend limit in the Anthropic Console (suggested: USD 5).
- **Endpoint:** `POST /generate` with `{topic, notes?, lang: "ro"}`. The Worker calls the Messages API: `POST https://api.anthropic.com/v1/messages` with headers `x-api-key`, `anthropic-version: 2023-06-01` and `content-type: application/json`.
- **Model:** `claude-sonnet-5-5` (accurate). Ciprian may choose `claude-haiku-5-5` (cheaper, more errors). Rough cost at November 2026 prices: about USD 0.12-0.15 per 100-card domain with Sonnet 5.5, under USD 0.01 with Haiku 5.5.
- **Output contract.** Ask for JSON only, and validate it in **both** the Worker and the app:
  `{"title": "...", "sub": "...", "icon": "<one ICON key>", "subsections": [{"name": "...", "prompt": "...", "cards": [{"q": "...", "a": "...", "d": "...", "en": "...", "alt": ["..."]}]}]}`
  - 80-120 cards in total, 4-8 subsections, Romanian, answers as short as possible, no pictures.
  - No duplicate question and answer pairs; `q` and `a` must be non-empty.
  - Content suitable for a child. The system prompt tells the model to refuse unsuitable topics with `{"error": "..."}`.
  - Retry once on invalid JSON. Use `max_tokens` large enough for 120 cards (about 16k).
- **Storage on the device.**
  - User domains live in IndexedDB (or localStorage key `cartoteca.userdecks.v1`), with ids `u-<slug>-<timestamp36>`.
  - Card ids are `<deck id>-<n>`, so they never collide with built-in ids.
  - `INDEX.domains` is extended at startup with the user domains, and `deck(id)` reads them from storage.
  - Export and import must include the user domains.
  - Deleting a domain needs a confirmation and also removes its card progress.
- **Marking.** The domain tile and every card face show a small "generat de Claude - de verificat" label. The domain's `source` says the same, with the date.
- **UI flow.**
  - Home → "Domeniu nou" → topic field and optional notes → "Generează".
  - Then a progress state (30-90 s).
  - Then a preview: title, subsections, the first 10 cards, "Adaugă" or "Renunță".
  - Errors are shown in plain Romanian.
- **Tests.** Add tests for the validator (good JSON, broken JSON, too few cards, duplicates, unknown icon fallback) and for the storage round-trip, including export and import. Test the Worker with a mocked Anthropic response; do not call the real API in tests.

### 10.3 "Raportează o eroare" on cards

- **Placement:** a small button on the answer side of every card, in learn, quiz and browse.
- **Report types:** "Răspuns greșit", "Poză greșită", "Întrebare neclară", "Altceva", plus an optional comment.
- **"Poză greșită"** hides that picture immediately on this device (`S.hiddenImgs`).
- **Storage:** reports go into `S.reports` (synced in the artifact through the existing per-user doc set; add a doc `reports`).
- **Settings → "Rapoartele mele":**
  - the list, with status;
  - "Copiază rapoartele" as text that Matei can send to Ciprian;
  - the report text includes the deck id, card id, question and answer, so an agent can fix the card directly.

### 10.4 Guide for Matei (Romanian, for a student, step by step)

- Write it as `docs/GHID-MATEI.md`. It covers:
  - what Git and GitHub are;
  - branches (`main` and `dev`) and how to open and merge a Pull Request;
  - how GitHub Pages publishes the app;
  - how to install the PWA on Android;
  - how to export and import progress;
  - "what to do if something breaks" (revert a PR).

## 11. Quick facts

- **Romanian copy style:** friendly and short. Use "tu" when addressing Matei.
- **Photos:** Wikimedia Commons only, with free licenses (PD, CC0, CC BY, CC BY-SA), 500 px JPEG, quality 72, with credits.
- **Commons access:** the Mac can reach Wikimedia. Sandboxes often cannot; if a download is blocked, run the fetch script in a normal terminal.
- **Previous image working folders on the Mac:** `~/Sites/cartoteca-imagini/` (Round 2 raw downloads and meta). Do not commit them.

## 12. Setup on Ciprian's Mac (Codex)

Claude Code reads this same file through `CLAUDE.md`; its own setup is described there.

### 12.1 GitHub access (once)

The repo belongs to Matei's GitHub account (`47Matei`). Ciprian's GitHub account needs write access:
1. **Matei invites Ciprian.** Logged in as 47Matei, open https://github.com/47Matei/knowledge-app → Settings → Collaborators → "Add people" → Ciprian's GitHub username.
2. **Ciprian accepts** the invitation (email, or https://github.com/notifications).

### 12.2 Local setup (Codex CLI or the Codex app, working on files on the Mac)

```bash
# tools (once): git, Homebrew, Node, GitHub CLI
xcode-select --install                    # installs git if missing
brew install node gh                      # install Homebrew first from https://brew.sh if missing
gh auth login                             # GitHub.com -> HTTPS -> login with browser (lets git push)

# Codex (once)
npm i -g @openai/codex                    # or: brew install codex
codex login                               # sign in with the ChatGPT account

# project (once)
cd ~/Sites
git clone https://github.com/47Matei/knowledge-app.git
cd knowledge-app
git switch -c dev                         # first time only; later: git switch dev && git pull
unzip -o ~/Downloads/cartoteca-agent-kit.zip -d .   # AGENTS.md, CLAUDE.md, tools/, .gitignore, restored photo
(cd tools && npm install && npx playwright install chromium)
npm --prefix tools test                   # must end with 0 failed
git add -A
git commit -m "Agent handoff: AGENTS.md, CLAUDE.md, tools and tests; restore Royal Oak Offshore photo"
git push -u origin dev

# every working session
cd ~/Sites/knowledge-app && git switch dev && git pull
codex                                     # Codex reads AGENTS.md automatically
python3 -m http.server 8765               # in a second terminal tab, to try the app at http://localhost:8765/
```

If a Commons download fails inside Codex (the sandbox may block the network), run `python3 tools/images/fetch_commons.py ...` yourself in a normal terminal.

### 12.3 Codex cloud (optional, working from chatgpt.com/codex)

This lets Codex work on the repo from the browser and open PRs. Menu labels may differ slightly; check the official Codex docs.

1. **Install the connector on Matei's account.** Logged in as 47Matei on GitHub, install the "ChatGPT Codex Connector" app on the account that owns the repo: https://github.com/apps/chatgpt-codex-connector/installations/new → choose the 47Matei account → "Only select repositories" → `knowledge-app`. An app installed only on Ciprian's own account does **not** cover Matei's repos.
2. **Connect GitHub in ChatGPT.** In ChatGPT (Ciprian's account), connect GitHub when Codex asks, or under the GitHub connector in settings. Wait a few minutes until `47Matei/knowledge-app` appears in the repository picker.
3. **Create the environment.** In Codex (Cloud → Environments → Create environment), select the repo and set the setup script to `npm --prefix tools install`. Internet access can stay off, except the npm registry for the setup.
4. **Run tasks.** Start tasks on the `dev` branch and ask Codex to open a PR. Merge it on GitHub, then `git pull` on the Mac.

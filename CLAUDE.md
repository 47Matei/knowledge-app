# CLAUDE.md - Cartoteca lui Matei

All project context, rules, data formats, workflows and the Stage 3 plan are in AGENTS.md (shared with Codex). It is imported here:

@AGENTS.md

The rest of this file covers only what is specific to Claude Code and to Claude sessions on claude.ai.

## A. Claude Code on Ciprian's Mac (terminal, desktop app or IDE)

GitHub access: Ciprian logs in to GitHub as `47Matei`, the account that owns the repo (AGENTS.md 12.1), so no collaborator step is needed. On this Mac, Node and `gh` are installed in `~/.local` (no Homebrew): use `export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"`.

```bash
# once
xcode-select --install                          # git, if missing
brew install node gh                            # Homebrew from https://brew.sh if missing
gh auth login                                   # GitHub.com -> HTTPS -> browser login (lets git push)
curl -fsSL https://claude.ai/install.sh | bash  # Claude Code, native installer (auto-updates)
# alternative: brew install --cask claude-code
claude --version && claude doctor               # check the install
# needs a Claude Pro, Max, Team, Enterprise or Console account; the free plan has no Claude Code

# project, once (skip if Codex already cloned it into the same folder: both agents share one checkout)
cd ~/Sites
git clone https://github.com/47Matei/knowledge-app.git
cd knowledge-app
git switch -c dev                               # later: git switch dev && git pull
unzip -o ~/Downloads/cartoteca-agent-kit.zip -d .
(cd tools && npm install && npx playwright install chromium)
npm --prefix tools test
git add -A && git commit -m "Agent handoff: AGENTS.md, CLAUDE.md, tools and tests" && git push -u origin dev

# every session
cd ~/Sites/knowledge-app && git switch dev && git pull
claude                                          # first run: log in via the browser; CLAUDE.md loads automatically
```

**Codex and Claude Code on the same checkout.** Never let both agents edit at the same time. Finish, commit and push with one before starting the other, or give each its own branch (`feature/codex-...`, `feature/claude-...`).

## B. Claude Code on the web and Claude sessions in the claude.ai project "Cartoteca Matei"

**Push access from claude.ai.** For a Claude session in claude.ai (Claude Code on the web, or this project's sessions) to push to the repo:
1. **Ciprian's GitHub account is `47Matei`**, the repo owner (AGENTS.md 12.1).
2. **Install the Claude GitHub app on Matei's account.** It must be installed on the account that owns the repo: logged in as 47Matei, open https://github.com/apps/claude → Install → choose 47Matei → "Only select repositories" → `knowledge-app`.
3. **Connect GitHub in claude.ai.** Ciprian connects his GitHub account in claude.ai (Settings → Connectors → GitHub, or when Claude Code on the web asks).
4. **Ask for push access.** In a session, ask: "atașează repo-ul 47Matei/knowledge-app cu drept de push". Without push access, a session can still clone the public repo and read it, and it returns changes as a zip or patch for Ciprian to commit.

**Claude-only jobs:**
- **Publishing the Claude artifact.** Only a Claude session can publish it: artifact slug `1b0f7af5-c87e-4d7a-aa4f-21c3c8b6cb5e`, owner Ciprian.
  - Clone `main`, run `npm --prefix tools test`, then publish with the artifact tools: `publish_files`, mode patch, with `base_version` taken from `get_artifact`.
  - Send only the changed files (index.html, app.js, data/*, img/*), at most 256 paths per call. List deleted files in `remove`.
  - Keep the total at 512 files or fewer (`test_decks.js` checks it).
  - Never publish `tools/`, `AGENTS.md`, `CLAUDE.md`, `CREDITS.md`, `manifest.webmanifest`, `sw.js`, `icons/` or `design/` to the artifact. They are not part of the app, and they count toward the file limit.
- **Artifact limits** (details in AGENTS.md section 4): `list_files`, `read_declaration` and `declare_capabilities` refuse this artifact, because Matei's account has written progress to its database. Publishing and the `db_*` tools still work, so reports or progress can be read with `db_list` (collection `data/users/<uid>`).
- **The claude.ai project doc** `claude/decizii-si-stare.md` (project "Cartoteca Matei") is the short decision log. Update it when a round or stage ships.
- **Picture downloads.** The cloud container cannot reach Wikimedia. When the session is linked to Ciprian's Mac, run the image scripts there (the Mac folder `~/Sites` is shared); otherwise Ciprian runs them in Terminal.

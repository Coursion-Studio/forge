# Forge landing-page screenshots

Drop PNGs here with the **exact filenames** below. The showcase on the landing
page is hidden until images exist — each block reveals itself the moment its
screenshot loads, so it's safe to add them one at a time (commit + push and it
goes live). Missing shots simply don't render; nothing breaks.

Shoot on a dark desktop, capture the whole Forge window (with its traffic
lights) unless noted, and export at **2× (Retina)** for crispness — the listed
size is the display size; supply double the pixels.

| File | Display size | What to capture |
|------|--------------|-----------------|
| `hero-dashboard.png` | 1020×720 | **Hero.** A full Forge window: project sidebar + 2–3 panes split (e.g. terminal + AI chat + browser). The money shot. |
| `command-palette.png` | 800×480 | The ⌘K command palette open (frecency list + templates + file finder). Floats over the hero — crop tight to the palette. |
| `terminal.png` | 1020×720 | A terminal pane running `claude` (or another agent) inside a project. |
| `chat.png` | 1020×720 | The AI chat pane mid-stream, with an inline 🔧 tool-call marker visible. |
| `browser.png` | 1020×720 | A browser pane previewing a local dev server, ideally next to a terminal. |
| `review.png` | 1020×720 | The code-review pane: a git diff with stage/commit controls. |
| `voice.png` | 360×360 | The voice HUD listening. Square; a transparent background looks best (it sits on a glowing card). |
| `board.png` | 800×480 | The planning-board kanban (To Do / In Progress / Done). |
| `compare.png` | 800×480 | The Compare pane running two agents side by side. |
| `http.png` | 800×480 | The HTTP pane: verb + URL + headers + a formatted response. |
| `editor.png` | 800×480 | The quick single-file editor with syntax highlighting. |

Note: this same folder is mirrored in the `forge-release` clone (same GitHub
repo, `Coursion-Studio/forge`) — committing here is enough; it's one repo.

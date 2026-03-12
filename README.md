# DesignerGames

A collection of interactive browser-based games that help designers sharpen their eye for typography, color, proportion, layout, and motion — no install required.

**Live site:** `https://JoeMighty.github.io/designer-games/`

---

## Games

### Typography
| Game | Description |
|------|-------------|
| **Kerning** | Adjust letter spacing with a slider to match the ideal kerning value |
| **Font Identifier** | Identify typefaces from text samples — 10-round multiple-choice quiz |

### Color Theory
| Game | Description |
|------|-------------|
| **Color Match** | Use RGB sliders to match a target color as closely as possible |
| **Contrast Checker** | Judge whether color combinations pass WCAG AA, AAA, or fail |

### Vector & Drawing
| Game | Description |
|------|-------------|
| **Bezier Curves** | Click and drag to place anchors with handles (Illustrator pen tool style) to match a target curve |
| **Icon Design** | Recreate target icons using pen, line, rect, and circle drawing tools |
| **ASCII Art Lab** | Convert any image into ASCII art — upload your own or use presets, adjust density, download as `.txt` |

### Layout & Proportion
| Game | Description |
|------|-------------|
| **Grid System** | Drag UI elements onto snap grid lines (8px / 16px / 32px) |
| **Golden Ratio** | Resize a rectangle by dragging to match φ (1.618) and other classic proportions |
| **Layout Balance** | Arrange elements so the visual center of mass lands at the stage center |

### Motion
| Game | Description |
|------|-------------|
| **Animation Timing** | Select an easing function and duration to match a target animation |

---

## Running Locally

No build step, no dependencies, no install.

```bash
git clone https://github.com/JoeMighty/designer-games.git
cd designer-games
```

Open `index.html` in any modern browser. That's it.

> Tip: if you use VS Code, the **Live Server** extension gives you auto-reload on save.

---

## Project Structure

```
designer-games/
├── index.html               # Landing page — all 11 game cards
├── games/
│   ├── kerning.html
│   ├── font-id.html
│   ├── color-match.html
│   ├── bezier.html
│   ├── ascii-art.html
│   ├── grid-align.html
│   ├── contrast-check.html
│   ├── golden-ratio.html
│   ├── icon-design.html
│   ├── layout-balance.html
│   └── animation-timing.html
├── css/
│   ├── variables.css        # Design tokens (colors, radii, shadows, transitions)
│   ├── base.css             # Reset + shared elements (buttons, sliders, container)
│   ├── home.css             # Landing page styles
│   └── game.css             # Shared game page styles
└── js/
    ├── shared/
    │   ├── storage.js       # localStorage wrapper (get / set / remove / clear)
    │   ├── scoring.js       # Per-game score state, persistence, reset
    │   └── ui.js            # Utility helpers (show, hide, enable, disable elements)
    └── games/
        ├── kerning.js
        ├── font-id.js
        ├── color-match.js
        ├── bezier.js
        ├── ascii-art.js
        ├── grid-align.js
        ├── contrast-check.js
        ├── golden-ratio.js
        ├── icon-design.js
        ├── layout-balance.js
        └── animation-timing.js
```

---

## Tech Stack

- **HTML5** — semantic markup, Canvas API
- **CSS3** — custom properties, Grid, Flexbox, no frameworks
- **Vanilla JavaScript** — ES6+, no build tools
- **Google Fonts** — DM Sans
- **localStorage** — session score persistence per game

---

## Scoring

Every game stores its score in `localStorage` under a unique key, so scores persist across browser sessions. Each game page has a **Reset** button to clear the score.

| Game | localStorage key |
|------|-----------------|
| Kerning | `kerningScore` |
| Font Identifier | `fontIdScore` |
| Color Match | `colorMatchScore` |
| Bezier Curves | `bezierScore` |
| Grid System | `gridAlignScore` |
| Contrast Checker | `contrastCheckScore` |
| Golden Ratio | `goldenRatioScore` |
| Icon Design | `iconDesignScore` |
| Layout Balance | `layoutBalanceScore` |
| Animation Timing | `animTimingScore` |

ASCII Art Lab has no scoring — it's a creative tool.

---

## Adding a New Game

1. **Create `games/new-game.html`** — link to `../css/variables.css`, `../css/base.css`, `../css/game.css` and your game script.

2. **Create `js/games/new-game.js`** — initialize scoring with the shared module:
   ```js
   Scoring.init('newGame', document.getElementById('scoreDisplay'), document.getElementById('resetScore'));
   ```

3. **Add a card to `index.html`** in the appropriate category section:
   ```html
   <a href="games/new-game.html" class="game-card">
       <div class="game-icon">
           <svg viewBox="0 0 120 120" fill="none"><!-- icon --></svg>
       </div>
       <div class="game-content">
           <h3>New Game</h3>
           <p>One-sentence description of what the player learns.</p>
           <div class="game-meta">
               <span class="game-tag">Category</span>
               <span class="game-arrow">→</span>
           </div>
       </div>
   </a>
   ```

4. **SVG icon guidelines** — geometric, minimal, `viewBox="0 0 120 120"`, 3–4px stroke weight, use `var(--sunset-orange)` and `var(--charcoal)`.

---

## Brand

| Token | Value | Usage |
|-------|-------|-------|
| `--sunset-orange` | `#FF6B35` | Primary accent, CTAs |
| `--warm-coral` | `#FF8C42` | Secondary accent |
| `--deep-terracotta` | `#D94F30` | Emphasis, tags |
| `--charcoal` | `#1A1A1A` | Text, anchors |
| `--warm-gray` | `#4A4A4A` | Secondary text |
| `--light-sand` | `#F5F1ED` | Page background |
| `--off-white` | `#FFFBF7` | Card/panel background |
| `--golden-yellow` | `#FFB627` | Highlights |
| `--soft-peach` | `#FFD4B8` | Tags, subtle fills |

**Font:** DM Sans (400, 500, 600, 700, 800) via Google Fonts.

---

## Deployment

The site deploys automatically to GitHub Pages on push to `main`.

**Setup (one-time):**
1. Go to **Settings → Pages**
2. Source: `Deploy from a branch`
3. Branch: `main` / `/ (root)`
4. Save

**Deploy:**
```bash
git add .
git commit -m "your message"
git push origin main
```

---

## Roadmap

- [ ] Daily challenges with streak tracking
- [ ] Global leaderboards (Firebase)
- [ ] Achievement badges
- [ ] Dark mode
- [ ] PWA / offline support

---

## Author

Created by [Jobin Bennykutty](https://github.com/JoeMighty/)

Issues and pull requests welcome.

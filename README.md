# DesignerGames

> Level up your design skills through interactive games

A collection of 11 browser-based games designed to sharpen your eye for typography, color, layout, and motion design. Perfect for designers who want to practice fundamental skills in an engaging, measurable way.

## Games

### Typography
- **Kerning Game** - Fine-tune letter spacing to perfection. Train your eye for subtle typographic details.
- **Font Identifier** - Test your typeface knowledge by identifying famous fonts at a glance.

### Color Theory
- **Color Match** - Train your eye for color using RGB sliders to match target colors.
- **Contrast Checker** - Identify WCAG accessibility levels (AA/AAA) visually to improve accessible design decisions.

### Vector & Drawing
- **Bezier Curves** - Master the bezier pen tool by matching target curves with precision.
- **Icon Design** - Create pixel-perfect icons by replicating reference designs on a grid.
- **ASCII Art** - Recreate patterns using characters to understand density, value, and composition.

### Layout & Composition
- **Grid Align** - Position elements precisely on a grid system to build layout accuracy.
- **Golden Ratio** - Train your eye for perfect proportions by resizing rectangles to match φ (≈ 1.618) and other key ratios.
- **Layout Balance** - Arrange elements to achieve perfect visual balance through size and position.

### Motion
- **Animation Timing** - Match animation easing curves and durations to learn the feel of different timing functions.

## Features

- **Skill-Based Learning** - Each game targets specific design skills that translate directly to professional work
- **Progress Tracking** - Session scores show improvement over time
- **Quick Practice** - Games take just minutes to play, perfect for focused skill-building
- **Immediate Feedback** - Learn what works and why through instant scoring

## Technology

Built with vanilla JavaScript, HTML5, and CSS3. No frameworks or dependencies required.

- Responsive design works on desktop and tablet
- LocalStorage for score persistence
- Custom SVG icons and graphics
- Modular JavaScript architecture

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/JoeMighty/Designer-Games.git
```

2. Open `index.html` in your browser

That's it. No build process, no installation required.

## Project Structure

```
Designer-Games/
├── index.html              # Main landing page
├── css/
│   ├── variables.css       # Design system tokens
│   ├── base.css            # Base styles
│   ├── home.css            # Landing page styles
│   └── game.css            # Shared game styles
├── games/
│   ├── kerning.html
│   ├── font-id.html
│   ├── color-match.html
│   ├── contrast-check.html
│   ├── bezier.html
│   ├── icon-design.html
│   ├── ascii-art.html
│   ├── grid-align.html
│   ├── golden-ratio.html
│   ├── layout-balance.html
│   └── animation-timing.html
└── js/
    ├── games/              # Individual game logic
    └── shared/             # Shared utilities
        ├── scoring.js      # Score calculation
        ├── storage.js      # LocalStorage handling
        └── ui.js           # UI helpers
```

## Design System

The project uses a warm, vibrant color palette:

- **Sunset Orange** (#FF6B35) - Primary accent
- **Warm Coral** (#FF8C42) - Secondary accent
- **Deep Terracotta** (#D94F30) - Hover states
- **Charcoal** (#1A1A1A) - Primary text
- **Warm Gray** (#4A4A4A) - Secondary text
- **Light Sand** (#F5F1ED) - Backgrounds
- **Golden Yellow** (#FFB627) - Highlights

Typography: DM Sans for UI, with display fonts loaded per-game as needed.

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

Contributions welcome. To add a new game:

1. Create HTML file in `/games/`
2. Add corresponding JS logic in `/js/games/`
3. Link from `index.html`
4. Follow existing game structure and scoring system

## License

This project is for educational and personal use only. Not licensed for commercial use.

## Credits

Created by [Jobin Bennykutty](https://github.com/JoeMighty/)

---

**DesignerGames** - 11 games to sharpen your design eye

# Design Spec - Landing Page "Python is Fun"

## Context
A gamified, Duolingo-style landing page designed for Junior High School (SMP) students, using the theme '"python" is "fun"'.

## Core Features
1. **Hero Section**: 
   - Gamified asymmetric layout.
   - Text "python" is "fun" using Google Font `Fredoka` or `Nunito`.
   - SVG illustration of a playful Python snake mascot.
   - Distinctive 3D tactical green and outline blue buttons.
   
2. **Interactive Code Sandbox (A)**:
   - A highly engaging, custom junior-friendly code editor.
   - Preserves Python-like execution using a smart JS-based parser mock that executes `print(...)` commands, string multiplication (like `"🐍" * 5`), simple loops, or basic arithmetic, and renders back interactive visuals/results (e.g. printing arrays of emojis, messages).
   - Audio feedback and beautiful successful prompts.

3. **Gamified Mini Quiz (B)**:
   - Duolingo-style progress bar.
   - Stacked multiple-choice cards that pop down on press.
   - A celebratory drawer slide-up from bottom when a question is answered correctly/wrongly with audio elements (optional/synthesized-beeps) or great visual stars particles.

## Design System (Duolingo Style Ref)
- **Primary Green**: `#58cc02`
- **Secondary Blue**: `#1cb0f6`
- **Text Color**: `#3c3c3c` (Almost Black)
- **Card Radius**: `12px`
- **Button Radius**: `12px`
- **Button Depth shadow**: `0 4px 0 #3f8f01` for Green, `0 4px 0 #1899d6` for Blue.

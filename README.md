# 🎪 Apna Utsav 2.0 (अपना उत्सव) - Intelligent Celebration Planner

> A production-grade, culturally authentic celebration planning application for weddings, milestone birthdays, community festivals, and housewarmings in India.

Built with clean architecture, zero bloat, Apple & Airbnb-inspired design aesthetics (**Option A: Clean Champagne & Royal Indigo**), pure SVG vector iconography, Google Gemini-style left drawer navigation, and zero-hallucination deterministic financial math.

---

## 🌟 What Makes Version 2.0 Different

1. **Zero Text-Leakage Guarantee (Pure SVG Vectors):**
   - 100% of icons (`menu`, `settings`, `mic`, `sparkles`, `budget`, `timeline`, `vendors`, `ideas`, `heart`) are inlined SVGs.
   - It is physically impossible for raw font names like `add_circle` or `light_mode` to ever appear on screen.

2. **Google Gemini-Style Left Drawer Navigation (☰):**
   - Clean, uncluttered mobile view. Tapping **☰** smoothly slides out the navigation drawer with background blur.
   - Tapping any destination navigates and **automatically slides the drawer back into hiding**.

3. **ChatGPT/Gemini-Style Clean Onboarding (Zero Default Clutter):**
   - When opened fresh, there are **no pre-loaded default plans**.
   - Features a clean, inviting greeting with a natural prompt bar, microphone button, and 4 one-tap inspiration starters.

4. **Interactive Voice Chat Board (Doubt Resolution Assistant):**
   - Users can tap the floating mic button to ask doubts in simple words (catering advance norms, how to save ₹30,000 on decor, loudspeaker permits).
   - Audio read-aloud TTS button included.

5. **Fresh, Dynamically Generated Ideas for Every Event:**
   - Wedding ideas match weddings (Mandap florals, kulhad chai counters, Sangeet family trivia, plantable seed paper favors).
   - Birthday ideas match birthdays (Outer Space Galaxy, DIY mini pizza station, space treasure hunt, STEM astronomy return kits).
   - Community Puja ideas match festivals (Eco-friendly clay pandals, Satvik Mahaprasad, bhajan sandhyas, tulsi sapling blessings).
   - Tap **"✨ Generate Fresh Ideas"** to dynamically generate 4 brand-new concepts on demand.

6. **Ironclad Deterministic Financial Math:**
   - Indian Lakh/Crore formatting (`₹12,00,000`).
   - Mandatory **8–10% Contingency Safety Reserve** locked in code.
   - Code calculates every rupee with zero penny drift.
   - Visual colorblind-safe SVG Donut chart with an accessible table view.

---

## 📱 Mobile-First Design & Contrast Standards

All design tokens are defined in `/public/css/tokens.css` with WCAG 2.2 AA verified contrast:

| Element | Color Token | Hex Code | Contrast Ratio | WCAG Compliance |
|---|---|---|---|---|
| Background Canvas | `--color-bg` | `#FAF9F6` (Alabaster Champagne) | — | Base canvas |
| Primary Action / Header | `--color-primary` | `#3730A3` (Royal Indigo) | > 8.5 : 1 (on white) | **AAA PASS** |
| Celebratory Accent | `--color-secondary` | `#BE123C` (Celebratory Rose) | > 5.2 : 1 (on white) | **AA PASS** |
| Gold Accent | `--color-gold` | `#B45309` (Marigold Gold) | > 5.1 : 1 (on white) | **AA PASS** |
| Primary Text | `--color-text-primary` | `#111827` (Near-Black) | > 15 : 1 (on canvas) | **AAA PASS** |

---

## 🚀 Quick Run Guide

### 1. Run the App
```bash
node server.js
```
Open **`http://127.0.0.1:3000`** in your browser.

### 2. Run Automated Unit Tests
```bash
node --test tests/math_and_timeline.test.js
```
All tests verify deterministic math, contingency reserve enforcement, over-budget calculations, and .ics generation.

# 🌿 MindGarden – Phase 2 Product Requirements Document (PRD)

## 1) Product Summary
Phase 2 expands MindGarden beyond the MVP by deepening engagement, increasing emotional attachment, and improving retention—without adding out‑of‑scope features like social, AI analysis, payments, or multi‑garden support.

---

## 2) Target User (Same as MVP)
- Busy professionals & students
- Mental wellness beginners
- Stressed digital natives

---

## 3) Phase 2 Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Increase week‑over‑week retention | +10–15% lift in Week‑2 retention |
| Improve emotional attachment | ≥ 70% of users complete 5+ actions in first 10 days |
| Sustain daily engagement | ≥ 40% of users complete ≥ 10 actions in first 21 days |

---

## 4) Key Product Enhancements (Phase 2 Scope)

### 4.1 Expanded Micro‑Action Library
- Add 2–4 new action types (still 1–2 minutes each)
- Examples:
  - Micro‑goal (“Set one tiny goal for today”)
  - Kindness ping (“Name one kind action you can do today”)
  - Body scan (“Notice 3 sensations in your body”)
  - Positive reframe (“Rewrite a stressful thought”)

**Requirement:** Daily rotation includes new actions, with unique prompts and inputs per type.

---

### 4.2 Plant Variety Within Single Garden
- Add visual or descriptive variation by seed type and growth stage
- Example: Calm seed evolves with soft blue‑green palette, Focus seed has sharper leaf shapes

**Requirement:** No multi‑garden support. Users still have a single active seed.

---

### 4.3 Streak Protection / Grace Day
- Allow 1 missed day per week (or per streak cycle) without full reset
- Adds emotional safety net without removing incentive to return daily

**Requirement:** One grace day per defined window; clearly explained in UI.

---

### 4.4 Personalized Daily Prompts
- Slightly tailor the daily prompt based on seed type or recent mood trend
- Example: “For your Calm seed, take three slow breaths.”

**Requirement:** No AI or heavy analysis required—template logic only.

---

### 4.5 Enhanced Progress Visualization
- Add “growth timeline” showing milestones (2, 5, 10, 21 days)
- Add “next stage in X days” indicator on Home screen
- Optionally add a lightweight “last 7 actions” history list

---

## 5) User Experience Flow (Phase 2)

**Open app → See growth timeline → Complete personalized action → Growth feedback (with grace day if used) → Return next day**

---

## 6) Data Model Additions

| Field | Type | Purpose |
|------|------|---------|
| `grace_used_at` or `grace_days_remaining` | timestamp/int | Streak protection tracking |
| `seed_variant` (optional) | text | Visual styling for plant variety |
| `action_variant` (optional) | text | Prompt personalization tracking |

---

## 7) Out of Scope (Still Not in Phase 2)

- Social features
- AI analysis
- Premium plants
- Customization marketplace
- Payments
- Multi‑garden support

---

## 8) Acceptance Criteria

- New action types appear in rotation and are fully functional
- Home screen shows growth timeline and “next stage in X days”
- Grace day logic works and is visible to users
- Seed‑specific personalization appears in prompts
- No regression in existing MVP flows

---

## 9) Delivery Milestones

1. **M1: Action Expansion + Prompt Personalization**
2. **M2: Plant Variety + Progress Visualization**
3. **M3: Grace Day + UX polish**

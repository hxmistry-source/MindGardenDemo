# 🌱 MindGarden V2 — Product Requirements Document (PRD)

**Version:** 2.0  
**Status:** Ready for Engineering

---

## 1. Product Overview

MindGarden V2 expands the MVP into a **personalized, emotionally engaging wellness companion** that increases retention, emotional attachment, and habit continuity through customization, progression systems, optional social encouragement, and weekly insights — while remaining lightweight, gentle, and non-clinical.

---

## 2. Objectives

| Objective | KPI |
|----------|----|
| Increase retention | +15–25% Day-7, +10–20% Day-30 |
| Increase engagement | +30% actions/week |
| Strengthen emotional attachment | ≥40% customize garden |
| North Star Metric | Weekly Active Gardeners (≥3 actions/week) |

---

## 3. Target Users

Busy professionals, students, and wellness beginners who prefer short, emotionally rewarding mental wellness interactions over long meditations or clinical tools.

---

## 4. Product Principles

- Always gentle  
- Always optional  
- No clinical therapy language  
- Visual progress > raw metrics  
- Emotional attachment over pressure  

---

## 5. New Capabilities in V2

---

### 5.1 Multi-Action Days

Users may complete:
- **1 Core Action/day** (maintains streak)
- **Up to 2 Bonus Actions/day**

| Rule | Behavior |
|-----|--------|
| Streak | Only Core Action affects streak |
| Cap | Max 3 actions/day |
| Bonus | Grants XP + nutrient boosts |

---

### 5.2 Garden Progression System

| Metric | Purpose |
|------|--------|
| XP | Overall garden growth |
| Garden Level | Unlocks items/themes |
| Nutrients | Cosmetic visual boosts |

**Nutrient Mapping**

| Seed | Nutrient |
|----|--------|
| Calm | Water |
| Focus | Sunlight |
| Resilience | Soil |
| Gratitude | Bloom |

---

### 5.3 Garden Customization

Users can customize:
- Garden backgrounds  
- Decorative items  
- Plant skins  

Unlockables earned by:
- Streak milestones  
- Garden level milestones  

---

### 5.4 Expanded Action Library

V2 introduces 15–25 micro-actions across:
Calm, Focus, Resilience, Gratitude, Mood

**Action Selection Logic**
- Weighted by preferences  
- Weighted by completion history  
- One swap allowed per day  

---

### 5.5 Weekly Insights (Rule-Based + Optional AI)

Users receive:
- Mood trend  
- Consistency summary  
- Most-used categories  
- Gentle next-week recommendation  

Optional AI-generated recap (opt-in, non-clinical).

---

### 5.6 Social-Lite Support (Opt-In)

Users may:
- Add friends via invite code  
- Send water/sunshine/encouragement gestures  
- Receive cosmetic garden boosts  

No feeds. No open chat. Fully private.

---

### 5.7 Monetization Readiness

Architecture supports:
- Premium cosmetics  
- Seasonal themes  
- Enhanced insights  

(Payments not required to ship V2.)

---

## 6. Information Architecture

| Tab | Purpose |
|---|---|
| Garden | Home & progress |
| Actions | Browse & complete |
| Insights | Weekly summaries |
| Profile | Settings, customization, friends |

---

## 7. Functional Requirements

- Core & bonus actions  
- XP, levels, nutrients  
- Garden customization  
- Action personalization  
- Weekly insights  
- Social-lite gestures  

---

## 8. Data Model (Supabase)

**New Tables**
- actions_catalog  
- user_actions  
- user_garden  
- unlockables  
- user_unlocks  
- friends  
- friend_gestures  

---

## 9. Non-Functional Requirements

| Area | Requirement |
|----|-------------|
| Performance | Garden loads <2s |
| Privacy | RLS on all tables |
| Availability | 99.5% uptime |
| Security | Friends scoped only to participants |
| Notifications | Gentle reminders only |

---

## 10. Acceptance Criteria

V2 is complete when:
- Users can do Core + Bonus actions  
- XP/Levels/Unlockables work  
- Garden customization persists  
- Weekly insights visible  
- Friend gestures functional  
- Retention metrics instrumented  

---

## 11. Out of Scope

- Public social feeds  
- Therapy-grade analytics  
- Community forums  
- Video content  

---

## 12. Milestones

| Milestone | Scope |
|----------|------|
| M1 | Action expansion + XP/Levels |
| M2 | Customization + unlockables |
| M3 | Weekly insights |
| M4 | Social-lite |

---

*MindGarden V2 turns habit-building into emotional attachment — and is designed for daily love, not clinical tracking.* 🌱

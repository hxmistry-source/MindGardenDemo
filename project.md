# 🌱 MindGarden – MVP Product Requirements Document (PRD)

---

## 1. Product Summary

**MindGarden** is a lightweight, gamified mental wellness app that helps users build daily emotional resilience through 1–2 minute micro-actions that grow a personal virtual garden.

Instead of tracking “habits,” users emotionally *raise a garden* — turning consistency into visible, meaningful progress.

---

## 2. Target User

| Persona | Description |
|--------|------------|
| Busy professionals & students | Want emotional balance but hate long meditations |
| Mental wellness beginners | Curious but intimidated by therapy-style apps |
| Stressed digital natives | Want something emotionally rewarding, playful, and private |

---

## 3. Product Goals (MVP)

| Goal | Metric |
|-----|------|
| Encourage daily usage | ≥ 30% Day-30 retention |
| Build emotional attachment | ≥ 60% of users return after Day 1 |
| Validate habit → reward loop | ≥ 3 actions per user in first 7 days |

---

## 4. Core User Loop

**Open App → Complete 1 micro action → Garden grows → User feels progress → Returns next day**

---

## 5. MVP Scope

### 5.1 Onboarding Flow

1. Welcome screen  
2. Choose your first seed:
   - Calm 🌿  
   - Focus 🌼  
   - Resilience 🌳  
   - Gratitude 🌸  
3. Set daily reminder time  
4. Enter Garden Home  

---

### 5.2 Garden Home Screen

Displays:
- Current plant  
- Growth stage  
- Streak counter  
- “Do today’s action” CTA  
- Encouraging message  

---

### 5.3 Daily Micro Actions (1 per day)

System rotates one of:

| Action Type | UI |
|------------|---|
| Mood Check | Slider 1–5 |
| Gratitude | 1 text input |
| Calm Breath | 3-breath animation |
| Stress Reflection | 1 question |

Completing today’s action grows the plant.

---

### 5.4 Plant Growth Logic

| Stage | Completion Needed |
|------|-------------------|
| Seed | 0 |
| Sprout | 2 days |
| Plant | 5 days |
| Flower | 10 days |
| Tree | 21 days |

Streak resets on missed day.

---

### 5.5 Progress & Stats

User sees:
- Current streak  
- Total actions completed  
- Growth stage  
- Last 7-day mood trend (simple chart)  

---

### 5.6 Notifications

Daily gentle reminder:

> “Your garden is ready for today 🌱”

---

## 6. Out of Scope (Not in MVP)

- Social features  
- AI analysis  
- Premium plants  
- Customization  
- Payments  
- Multi-garden support  

---

## 7. Data Model

### User
```json
{
  "id": "string",
  "email": "string",
  "created_at": "timestamp",
  "reminder_time": "string",
  "current_seed_type": "string",
  "current_stage": "number",
  "streak_count": "number",
  "last_action_date": "date"
}

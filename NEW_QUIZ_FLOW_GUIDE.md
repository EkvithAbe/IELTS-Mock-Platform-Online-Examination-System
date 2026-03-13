# 🎯 New Quiz Flow - Complete Guide

## ✅ What's Changed

The quiz system now has a **3-level structure** similar to the image you provided:

1. **Dashboard** → Shows modules (Listening, Reading, Writing, Speaking)
2. **Quiz List** → Shows 5 individual quizzes per module (2 unlocked initially)
3. **Quiz Attempt Page** → Individual quiz with attempt history
4. **Take Quiz** → Actual quiz interface

---

## 🔄 Complete User Flow

### **Step 1: Customer Buys Module**
```
Customer Dashboard
├── 🎧 Listening Quiz [🔒 Locked] → Click to buy
├── 📖 Reading Quiz [🔒 Locked] → Click to buy
├── ✍️ Writing Quiz [🔒 Locked] → Click to buy
└── 🎤 Speaking Quiz [🔒 Locked] → Click to buy

Customer clicks → Payment form → Admin approves → Module unlocked
```

### **Step 2: Customer Clicks Unlocked Module**
```
Customer Dashboard
└── 🎧 Listening Quiz [✓ Unlocked] → Click here

Redirects to: /quiz-list/listening
```

### **Step 3: Quiz List Page (NEW!)**
```
┌─────────────────────────────────────────────────┐
│  🎧 Listening Module                            │
│  Choose a quiz to start practicing              │
│                                                 │
│  💡 2 quizzes unlocked with your purchase       │
│                                                 │
│  ┌───────────────────────────────────────┐     │
│  │ 1  🎧 Listening Quiz 1               │     │
│  │    Social Conversation               │     │
│  │    ⏱️ 30 min | 📝 40 Q | 🟢 Easy    │  ✓  │
│  └───────────────────────────────────────┘     │
│                                                 │
│  ┌───────────────────────────────────────┐     │
│  │ 2  🎧 Listening Quiz 2               │     │
│  │    Monologue                         │     │
│  │    ⏱️ 30 min | 📝 40 Q | 🟢 Easy    │  ✓  │
│  └───────────────────────────────────────┘     │
│                                                 │
│  ┌───────────────────────────────────────┐     │
│  │ 3  🎧 Listening Quiz 3            🔒 │     │
│  │    Educational Discussion            │     │
│  │    ⏱️ 30 min | 📝 40 Q | 🟡 Medium  │     │
│  └───────────────────────────────────────┘     │
│                                                 │
│  ... (Quizzes 4 & 5 also locked)               │
└─────────────────────────────────────────────────┘
```

**Features:**
- ✅ **2 quizzes unlocked** (Quiz 1 & 2)
- 🔒 **3 quizzes locked** (Quiz 3, 4, 5)
- 📊 **Difficulty badges** (Easy, Medium, Hard)
- 🎨 **Color-coded** per module
- ℹ️ **Info banner** explaining unlock status

### **Step 4: Customer Clicks Unlocked Quiz**
```
Quiz List → Click "Listening Quiz 1"

Redirects to: /quiz/listening/listening-1
```

### **Step 5: Quiz Attempt Page**
```
┌─────────────────────────────────────────────────┐
│  🎧 Listening Quiz 1 - Social Conversation      │
│  [✓ Unlocked]                                   │
│  ⏱️ 30 min | 📝 40 questions | ♾️ Unlimited     │
│                                                 │
│  [🚀 Start New Attempt]                         │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Your Attempt History                           │
│  📝 No attempts yet                             │
└─────────────────────────────────────────────────┘
```

### **Step 6: Customer Starts Quiz**
```
Quiz Attempt Page → Click "Start New Attempt"

Redirects to: /take-quiz/listening?quizId=listening-1

Shows actual quiz interface (already built!)
```

---

## 📁 File Structure

```
pages/
├── dashboard.js                    ← Updated: Routes to quiz-list
├── quiz-list/
│   └── [module].js                ← NEW: Shows 5 quizzes per module
├── quiz/
│   └── [module]/
│       └── [quizId].js            ← NEW: Individual quiz attempt page
└── take-quiz/
    └── [module].js                ← Existing: Quiz interface
```

---

## 🎯 Quiz Structure Per Module

### **Each module has 5 quizzes:**

**Listening Module** (🎧):
1. ✓ Listening Quiz 1 - Social Conversation (Easy) - UNLOCKED
2. ✓ Listening Quiz 2 - Monologue (Easy) - UNLOCKED
3. 🔒 Listening Quiz 3 - Educational Discussion (Medium) - LOCKED
4. 🔒 Listening Quiz 4 - Academic Lecture (Medium) - LOCKED
5. 🔒 Listening Quiz 5 - Full Practice Test (Hard) - LOCKED

**Reading Module** (📖):
1. ✓ Reading Quiz 1 - Social Context (Easy) - UNLOCKED
2. ✓ Reading Quiz 2 - Workplace Context (Easy) - UNLOCKED
3. 🔒 Reading Quiz 3 - Academic Texts (Medium) - LOCKED
4. 🔒 Reading Quiz 4 - Scientific Articles (Medium) - LOCKED
5. 🔒 Reading Quiz 5 - Full Practice Test (Hard) - LOCKED

**Writing Module** (✍️):
1. ✓ Writing Quiz 1 - Basic Task 1 (Easy) - UNLOCKED
2. ✓ Writing Quiz 2 - Basic Task 2 (Easy) - UNLOCKED
3. 🔒 Writing Quiz 3 - Complex Data (Medium) - LOCKED
4. 🔒 Writing Quiz 4 - Argumentative Essays (Medium) - LOCKED
5. 🔒 Writing Quiz 5 - Full Practice Test (Hard) - LOCKED

**Speaking Module** (🎤):
1. ✓ Speaking Quiz 1 - Introduction (Easy) - UNLOCKED
2. ✓ Speaking Quiz 2 - Cue Card (Easy) - UNLOCKED
3. 🔒 Speaking Quiz 3 - Discussion (Medium) - LOCKED
4. 🔒 Speaking Quiz 4 - Advanced Topics (Medium) - LOCKED
5. 🔒 Speaking Quiz 5 - Full Practice Test (Hard) - LOCKED

---

## 🧪 Test Flow

### **Complete Test Scenario:**

1. **Login as student** with approved Listening module

2. **Dashboard:**
   - See "🎧 Listening Quiz" with "✓ Unlocked" badge
   - Click it

3. **Quiz List Page:**
   - See header: "🎧 Listening Module"
   - See banner: "2 quizzes unlocked with your purchase"
   - See 5 quizzes:
     - Quiz 1 & 2: Unlocked (clickable)
     - Quiz 3, 4, 5: Locked (grayed out)
   - Click "Listening Quiz 1"

4. **Quiz Attempt Page:**
   - See quiz details
   - See "✓ Unlocked" badge
   - See "🚀 Start New Attempt" button
   - See "No attempts yet" message
   - Click "Start New Attempt"

5. **Quiz Interface:**
   - See reading quiz interface (already built!)
   - Answer questions
   - Submit
   - See score

---

## 🎨 UI Features

### **Quiz List Page:**
- 📊 **Progress banner**: Shows how many quizzes unlocked
- 🎨 **Color-coded cards**: Each module has its own color
- 🔒 **Lock indicators**: Visual lock icon on locked quizzes
- ✓ **Unlock badges**: Green checkmark on unlocked quizzes
- 📈 **Difficulty badges**: Color-coded (Green=Easy, Yellow=Medium, Red=Hard)
- ➡️ **Click arrow**: Shows on unlocked quizzes
- 🚫 **Disabled state**: Locked quizzes are grayed out

### **Quiz Attempt Page:**
- 📝 **Quiz info card**: Large card with all details
- 📊 **Attempt history**: Shows past attempts (empty for now)
- 📋 **Instructions box**: Blue info box with rules
- 🔙 **Back button**: Returns to quiz list

---

## 🔄 Navigation Flow

```
Dashboard
    ↓ (Click unlocked module)
Quiz List
    ↓ (Click unlocked quiz)
Quiz Attempt Page
    ↓ (Click start attempt)
Take Quiz Interface
    ↓ (Submit quiz)
Quiz Attempt Page (with results)
```

**Back Navigation:**
- Take Quiz → Back to Attempt Page
- Attempt Page → Back to Quiz List
- Quiz List → Back to Dashboard

---

## ✅ What Works Now

**Dashboard:**
- ✅ Shows 4 modules
- ✅ Shows lock/unlock status
- ✅ Redirects to quiz-list for unlocked modules
- ✅ Redirects to buy-quiz for locked modules
- ✅ Hover tooltips

**Quiz List Page:**
- ✅ Shows 5 quizzes per module
- ✅ 2 quizzes unlocked initially
- ✅ 3 quizzes locked
- ✅ Difficulty badges
- ✅ Module-specific colors
- ✅ Lock indicators
- ✅ Click handling (locked shows alert)

**Quiz Attempt Page:**
- ✅ Shows quiz details
- ✅ Shows attempt history
- ✅ Start button routes to quiz interface
- ✅ Back to quiz list

**Take Quiz Interface:**
- ✅ Reading quiz (3 passages, 15 questions)
- ✅ Writing quiz (2 tasks)
- ✅ Timer, auto-save, navigation
- ✅ Submit and scoring

---

## 🚀 Test URLs

**Dashboard:**
```
http://localhost:3000/dashboard
```

**Quiz List (after unlocking Listening):**
```
http://localhost:3000/quiz-list/listening
http://localhost:3000/quiz-list/reading
http://localhost:3000/quiz-list/writing
http://localhost:3000/quiz-list/speaking
```

**Individual Quiz:**
```
http://localhost:3000/quiz/listening/listening-1
http://localhost:3000/quiz/listening/listening-2
http://localhost:3000/quiz/reading/reading-1
... etc
```

**Take Quiz:**
```
http://localhost:3000/take-quiz/listening?quizId=listening-1
http://localhost:3000/take-quiz/reading?quizId=reading-1
http://localhost:3000/take-quiz/writing?quizId=writing-1
```

---

## 📝 Summary

**New Flow:**
1. Customer buys module → Gets 2 quizzes unlocked
2. Click module → See quiz list (5 quizzes, 2 unlocked)
3. Click unlocked quiz → See attempt page
4. Click start → Take quiz
5. Complete locked quizzes or buy to unlock more

**Files Created:**
1. `/pages/quiz-list/[module].js` - Quiz list page (5 quizzes per module)
2. `/pages/quiz/[module]/[quizId].js` - Individual quiz attempt page
3. Updated `/pages/dashboard.js` - Routes to quiz-list

**Everything is ready to test!** 🎉

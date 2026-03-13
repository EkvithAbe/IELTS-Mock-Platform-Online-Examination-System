# IELTS Quiz System Documentation

## Overview
This document describes the complete quiz/subscription system for the IELTS Mock Platform. The system allows customers to purchase and take IELTS tests across four modules: Listening, Reading, Writing, and Speaking.

## Features Implemented

### 1. **Subscription System**
- Users can purchase individual test modules or complete packages
- Two test types: Academic and General Training
- Four modules: Listening, Reading, Writing, Speaking
- Payment support via bank transfer or WhatsApp
- Subscription status tracking (pending, active, expired)

### 2. **Test Management**
- Test modules with customizable content
- Support for different question types:
  - Multiple Choice
  - True/False/Not Given
  - Fill in the blanks
  - Short Answer
  - Sentence Completion
  - Essay (Writing)
  - Audio responses (Speaking)

### 3. **Attempt System**
- Multiple attempts per subscription
- Progress saving (pause and resume)
- Timer functionality
- Question flagging
- Auto-grading for objective questions (Listening/Reading)
- Manual grading workflow for Writing/Speaking

### 4. **User Interface**
As shown in your images:
- **Quiz List** (Image 1): Shows purchased quizzes with icons
- **Quiz Details** (Image 2): Displays attempt history, status, scores, and grades
- **Quiz Taking** (Image 3): Interactive quiz interface with navigation, timer, and text editor

## Database Models

### Subscription Model
```javascript
{
  user: ObjectId,
  testType: 'Academic' | 'General',
  testModule: 'listening' | 'reading' | 'writing' | 'speaking' | 'full_package',
  price: Number,
  status: 'pending' | 'active' | 'expired' | 'cancelled',
  paymentStatus: 'pending' | 'completed' | 'failed',
  testsAllowed: Number,
  testsUsed: Number,
  startDate: Date,
  expiryDate: Date
}
```

### TestModule Model
```javascript
{
  title: String,
  description: String,
  testType: 'Academic' | 'General',
  moduleType: 'listening' | 'reading' | 'writing' | 'speaking',
  price: Number,
  duration: Number,
  questions: [Question],
  content: Object,
  isActive: Boolean
}
```

### Attempt Model
```javascript
{
  user: ObjectId,
  testModule: ObjectId,
  subscription: ObjectId,
  attemptNumber: Number,
  status: 'in_progress' | 'finished' | 'abandoned',
  startedAt: Date,
  completedAt: Date,
  duration: Number,
  answers: Map,
  score: {
    obtained: Number,
    total: Number,
    percentage: Number,
    grade: String
  },
  isGraded: Boolean,
  flaggedQuestions: [Number]
}
```

## User Flow

### 1. Purchase Flow
1. User visits `/subscription` page
2. Selects Academic or General Training
3. Chooses individual module or full package
4. Clicks "Subscribe" button
5. Redirected to `/payment/[id]` page
6. Completes payment (bank transfer/WhatsApp)
7. Admin approves payment → Subscription becomes active

### 2. Taking a Quiz
1. User visits `/my-tests` to see purchased quizzes
2. Clicks on a quiz to view details at `/test/[id]`
3. Views attempt history and scores
4. Clicks "Start New Attempt" or "Continue your attempt"
5. Redirected to `/attempt/[id]` for quiz taking
6. Answers questions with auto-save
7. Can flag questions for review
8. Submits when finished
9. View results and review answers at `/attempt/[id]/review`

### 3. Review Flow
1. After completing a quiz, user can click "Review"
2. Sees all questions with:
   - Their answers
   - Correct answers (for objective questions)
   - Explanations
   - Color-coded feedback (green=correct, red=incorrect)

## API Endpoints

### Subscriptions
- `POST /api/subscriptions/create` - Create new subscription
- `GET /api/subscriptions/my-subscriptions` - Get user's subscriptions
- `GET /api/subscriptions/[id]` - Get subscription details
- `POST /api/subscriptions/[id]/payment` - Submit payment
- `POST /api/subscriptions/[id]/activate-free` - Activate free subscription

### Test Modules
- `GET /api/test-modules/[id]` - Get test module with attempts

### Attempts
- `POST /api/attempts/start` - Start new attempt
- `GET /api/attempts/[id]` - Get attempt details
- `POST /api/attempts/[id]/save` - Save progress
- `POST /api/attempts/[id]/finish` - Submit and finish attempt

## Pages

### User Pages
1. **`/subscription`** - Browse and purchase test modules
2. **`/my-tests`** - View purchased quizzes (Image 1 style)
3. **`/test/[id]`** - Quiz details with attempts (Image 2 style)
4. **`/attempt/[id]`** - Take the quiz (Image 3 style)
5. **`/attempt/[id]/review`** - Review completed attempt
6. **`/payment/[id]`** - Complete payment for subscription

### Admin Features (To be implemented)
- Approve/reject payments
- Grade Writing/Speaking tests
- Manage test modules
- View user statistics

## Grading System

### Auto-grading (Listening & Reading)
- Immediate results after submission
- Compares user answers with correct answers
- Calculates score and percentage
- Assigns letter grade (A+, A, B, C, D, F)

### Manual Grading (Writing & Speaking)
- Marked as "pending grading" after submission
- Admin reviews and assigns score
- Provides detailed feedback
- User notified when grading is complete

## Key Features

### 1. Real-time Progress Saving
- Answers automatically saved as user types
- Can close browser and resume later
- Progress indicator shows saved status

### 2. Timer System
- Countdown timer based on test duration
- Visual warning when time is running low
- Auto-submit when time expires

### 3. Question Navigation
- Grid-based navigation sidebar
- Color-coded question status:
  - Green: Answered
  - Red: Flagged
  - Gray: Not answered
  - Blue: Current question
- Previous/Next buttons

### 4. Writing Editor
- Rich text toolbar (bold, italic, links)
- Word counter
- Large text area for essays
- Undo/redo functionality

### 5. Attempt History
- View all previous attempts
- See scores and completion times
- Review correct/incorrect answers
- Track improvement over time

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Sample Data
```bash
node scripts/seedTestModules.js
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access the Application
- Main app: http://localhost:3000
- Subscription page: http://localhost:3000/subscription
- My Tests: http://localhost:3000/my-tests

## Environment Variables
Required in `.env.local`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## File Structure
```
/models
  - Subscription.js (subscription data)
  - TestModule.js (test content)
  - Attempt.js (attempt tracking)

/pages
  - subscription.js (purchase page)
  - my-tests.js (purchased quizzes list)
  - /test/[id].js (quiz details & attempts)
  - /attempt/[id].js (quiz taking interface)
  - /attempt/[id]/review.js (review answers)
  - /payment/[id].js (payment processing)

/pages/api
  - /subscriptions/* (subscription APIs)
  - /test-modules/* (test module APIs)
  - /attempts/* (attempt management APIs)

/scripts
  - seedTestModules.js (sample data)
```

## Pricing Structure

### Individual Modules
- Listening: $15
- Reading: $15
- Writing: $25
- Speaking: $30
- **Total: $85**

### Full Package
- **Price: $64** (25% discount)
- Includes all 4 modules
- Best value for complete preparation

### Current Promotion
- **FREE** subscription available
- Click "Subscribe for Free" button
- Instant activation

## Future Enhancements

1. **Payment Integration**
   - Stripe/PayPal integration
   - Automated payment verification
   - Recurring subscriptions

2. **Analytics**
   - Performance tracking
   - Weakness identification
   - Progress charts

3. **Social Features**
   - Compare scores with peers
   - Leaderboards
   - Study groups

4. **Advanced Question Types**
   - Drag and drop
   - Matching exercises
   - Audio recording for speaking

5. **Mobile App**
   - Native iOS/Android apps
   - Offline test taking
   - Push notifications

## Support

For issues or questions:
- Email: support@ielts-mock.com
- Documentation: See README.md
- API Docs: See API_DOCUMENTATION.md

## License
Proprietary - IELTS Mock Platform © 2025

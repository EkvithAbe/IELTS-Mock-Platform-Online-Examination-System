# 🎓 IELTS Mock Platform - Complete Quiz System

## ✨ What's New - Quiz & Subscription System

I've built a comprehensive quiz system for your IELTS Mock Platform that matches the UI you shared. Customers can now purchase and take IELTS tests with full attempt tracking, grading, and review features.

---

## 🎯 Key Features Implemented

### 1. **Subscription-Based Purchase System**
- ✅ Two test types: **IELTS Academic** & **IELTS General Training**
- ✅ Four test modules: **Listening**, **Reading**, **Writing**, **Speaking**
- ✅ Individual module purchase ($15-$30 each)
- ✅ Complete package with 25% discount ($64 vs $85)
- ✅ Free demo option for testing
- ✅ Payment via bank transfer or WhatsApp
- ✅ Payment slip upload functionality

### 2. **My Tests Page** (Like Image 1)
- ✅ Grid layout showing all purchased quizzes
- ✅ Module-specific icons (🎧 Listening, 📖 Reading, ✍️ Writing, 🎤 Speaking)
- ✅ Color-coded cards for each module type
- ✅ Subscription status badges (Active/Pending/Expired)
- ✅ Usage tracking (attempts used/allowed)
- ✅ Filter by module type
- ✅ Quick access to start tests

### 3. **Quiz Details Page** (Like Image 2)
- ✅ Test information (duration, questions, marks)
- ✅ **Your Attempts** section showing:
  - Attempt number (Attempt 1, Attempt 2, etc.)
  - Status (In progress / Finished)
  - Start and completion timestamps
  - Duration in minutes
  - Marks obtained and total
  - Grade and percentage
- ✅ **Continue your attempt** button for in-progress tests
- ✅ **Start New Attempt** button
- ✅ **Review** link for completed attempts
- ✅ Grading method display

### 4. **Quiz Taking Interface** (Like Image 3)
- ✅ Professional quiz header with module icon
- ✅ Timer countdown (auto-submit when time expires)
- ✅ **Question Panel** with:
  - Question number and status
  - "Not yet answered" / "Answered" indicator
  - Marks display
  - Flag question button (🚩)
- ✅ **Answer Input** supporting:
  - Multiple choice with radio buttons
  - Text input for fill-in-the-blanks
  - Rich text editor for writing tasks (with toolbar)
  - Word counter for writing
- ✅ **Quiz Navigation Sidebar** with:
  - Grid of question numbers
  - Color coding (green=answered, red=flagged, gray=not answered, blue=current)
  - "Finish attempt ..." button
  - Legend explaining colors
- ✅ Previous/Next navigation buttons
- ✅ Auto-save functionality
- ✅ Back button to exit

### 5. **Review Mode**
- ✅ View all questions with answers
- ✅ Color-coded correct/incorrect indicators
- ✅ Show user's answer vs correct answer
- ✅ Question explanations
- ✅ Score summary at top
- ✅ Navigate through all questions
- ✅ Performance statistics

---

## 📁 Files Created

### **Database Models** (`/models`)
1. **`Subscription.js`** - Manages user subscriptions
   - Tracks purchased test modules
   - Payment status and method
   - Attempt limits and usage
   - Expiry dates

2. **`TestModule.js`** - Stores quiz content
   - Questions and answers
   - Module type (listening/reading/writing/speaking)
   - Test type (Academic/General)
   - Content (audio, passages, tasks)
   - Pricing and duration

3. **`Attempt.js`** - Tracks quiz attempts
   - User answers
   - Attempt status and timing
   - Scores and grading
   - Flagged questions

### **User Pages** (`/pages`)
1. **`subscription.js`** - Purchase/pricing page
2. **`my-tests.js`** - Shows purchased quizzes (Image 1)
3. **`test/[id].js`** - Quiz details with attempts (Image 2)
4. **`attempt/[id].js`** - Quiz taking interface (Image 3)
5. **`attempt/[id]/review.js`** - Review completed attempts
6. **`payment/[id].js`** - Payment processing page

### **API Endpoints** (`/pages/api`)
1. **`subscriptions/create.js`** - Create new subscription
2. **`subscriptions/my-subscriptions.js`** - Get user's subscriptions
3. **`subscriptions/[id].js`** - Get subscription details
4. **`subscriptions/[id]/payment.js`** - Submit payment
5. **`subscriptions/[id]/activate-free.js`** - Activate free subscription
6. **`test-modules/[id].js`** - Get test module with attempts
7. **`attempts/start.js`** - Start new attempt
8. **`attempts/[id].js`** - Get attempt details
9. **`attempts/[id]/save.js`** - Save progress
10. **`attempts/[id]/finish.js`** - Submit and finish attempt

### **Utilities & Scripts**
1. **`scripts/seedTestModules.js`** - Sample data seeding
2. **`QUIZ_SYSTEM.md`** - Complete system documentation
3. **`QUICK_START.md`** - Quick setup guide

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Sample Data
```bash
node scripts/seedTestModules.js
```

This creates 6 sample test modules:
- Academic: Listening, Reading, Writing, Speaking
- General Training: Listening, Reading

### 3. Run the Application
```bash
npm run dev
```

### 4. Test the System
1. Register/Login at http://localhost:3000
2. Go to `/subscription` and click "Subscribe for Free"
3. Activate free subscription
4. Go to `/my-tests` to see your quizzes
5. Click on a quiz to view details
6. Start a new attempt and take the quiz!

---

## 🎨 UI Implementation

### Matches Your Images Exactly:

**Image 1 - Quiz List:**
- ✅ Cards with module icons
- ✅ Color-coded by module type
- ✅ Status badges
- ✅ "View Details & Start" buttons

**Image 2 - Attempt History:**
- ✅ "Continue your attempt" button
- ✅ Grading method display
- ✅ Attempts table with all details
- ✅ Status, dates, duration, marks, grade
- ✅ Review link for finished attempts

**Image 3 - Quiz Interface:**
- ✅ Question panel on left
- ✅ Navigation sidebar on right
- ✅ Timer at top
- ✅ Question number grid
- ✅ Flag question feature
- ✅ Text editor for writing
- ✅ "Finish attempt ..." button

---

## 💡 Key Functionality

### Auto-Grading
- **Listening & Reading**: Instant grading when submitted
- **Writing & Speaking**: Pending manual grading by admin

### Progress Tracking
- Answers auto-save every change
- Can pause and resume anytime
- Progress preserved across sessions

### Multiple Attempts
- Users can take tests multiple times
- History shows all attempts
- Track improvement over time

### Question Types Supported
1. Multiple Choice
2. True/False/Not Given
3. Fill in the Blanks
4. Short Answer
5. Sentence Completion
6. Essay Writing
7. Speaking Tasks

---

## 📊 Grading System

### Letter Grades
- **A+**: 90-100%
- **A**: 80-89%
- **B**: 70-79%
- **C**: 60-69%
- **D**: 50-59%
- **F**: Below 50%

### Display Format
```
Score: 20.00/30.00
Grade: 6.67 out of 10.00 (66.67%)
```

---

## 🔄 User Flow

```
1. Purchase Subscription
   ↓
2. View "My Tests" page
   ↓
3. Select a quiz
   ↓
4. View attempt history
   ↓
5. Start new attempt
   ↓
6. Answer questions (auto-save)
   ↓
7. Submit quiz
   ↓
8. View results
   ↓
9. Review answers
```

---

## 🛠️ Technical Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Auth**: JWT tokens
- **File Upload**: Formidable
- **Styling**: TailwindCSS with custom components

---

## 📝 Next Steps

### To Use the System:
1. ✅ Install dependencies
2. ✅ Seed sample data
3. ✅ Start the server
4. ✅ Test with a user account

### For Production:
1. Add real test content
2. Implement admin grading panel
3. Add email notifications
4. Integrate payment gateway (Stripe/PayPal)
5. Add analytics dashboard
6. Deploy to production

### For Customization:
1. Modify pricing in `/pages/subscription.js`
2. Add more test modules via seeding script
3. Customize grading criteria
4. Add more question types
5. Modify UI colors/styling

---

## 📚 Documentation

- **`QUIZ_SYSTEM.md`** - Complete technical documentation
- **`QUICK_START.md`** - Step-by-step setup guide
- **API Endpoints** - See `/pages/api` directory
- **Models** - See `/models` directory

---

## 🎉 Summary

You now have a **complete subscription-based quiz system** with:

✅ Purchase flow with payment processing  
✅ Quiz listing page (Image 1 style)  
✅ Attempt history page (Image 2 style)  
✅ Interactive quiz interface (Image 3 style)  
✅ Auto-grading for objective questions  
✅ Review mode with correct answers  
✅ Progress saving and resumption  
✅ Timer with auto-submit  
✅ Question flagging  
✅ Multiple attempt tracking  
✅ Score calculation and grading  
✅ Complete API backend  
✅ Sample data for testing  

**Everything is ready to use!** Just install dependencies, seed data, and run the server.

---

## 🆘 Need Help?

Check these files:
- Setup issues → `QUICK_START.md`
- System overview → `QUIZ_SYSTEM.md`
- API details → Check `/pages/api` files
- Database schema → Check `/models` files

**Happy Testing! 🚀**

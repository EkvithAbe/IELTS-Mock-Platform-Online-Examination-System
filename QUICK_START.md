# Quick Start Guide - IELTS Quiz System

## 🚀 Get Started in 5 Minutes

This guide will help you set up and run the IELTS quiz system with sample data.

## Prerequisites
- Node.js 18+ installed
- MongoDB running (local or cloud)
- Git installed

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Next.js (React framework)
- Mongoose (MongoDB ODM)
- TailwindCSS (styling)
- JWT (authentication)
- Formidable (file uploads)
- And more...

## Step 2: Configure Environment

Create or update `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/ielts-mock-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**For MongoDB Atlas (cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ielts-mock?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Step 3: Seed Sample Test Data

```bash
node scripts/seedTestModules.js
```

This creates:
- ✅ 4 Academic test modules (Listening, Reading, Writing, Speaking)
- ✅ 2 General Training test modules (Listening, Reading)
- ✅ Sample questions for each module

Expected output:
```
✅ Connected to MongoDB
✅ Cleared existing data
✅ Inserted 6 test modules

📊 Summary:
- Academic modules: 4
- General Training modules: 2
- Total modules: 6

✨ Sample data seeded successfully!
```

## Step 4: Run the Application

```bash
npm run dev
```

Application will start at: **http://localhost:3000**

## Step 5: Create a Test Account

1. Go to http://localhost:3000/register
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Phone: +1234567890
   - Password: password123
3. Click "Register"

## Step 6: Purchase a Test (Free Demo)

1. After login, click **"Book a Test"** or go to `/subscription`
2. Choose between **Academic** or **General**
3. Click **"Subscribe for Free"** on the Complete Package
4. On the payment page, click **"Activate Free Subscription"**
5. ✅ Subscription activated!

## Step 7: Take Your First Quiz

### Method 1: From Dashboard
1. Go to Dashboard → Click **"Browse Tests"**
2. Click on any test card
3. Click **"Start New Attempt"**

### Method 2: From My Tests
1. Click **"My Tests"** in navigation
2. Select a quiz (e.g., "Listening Quiz")
3. View attempt history
4. Click **"Start New Attempt"**

### Method 3: Direct Navigation
1. Go to http://localhost:3000/my-tests
2. Follow steps above

## Taking a Quiz - Quick Guide

### Quiz Interface Features:
- ⏱️ **Timer**: Top-right corner (counts down)
- 📝 **Question Navigation**: Right sidebar (grid view)
- 🚩 **Flag Questions**: Click flag icon to mark for review
- 💾 **Auto-save**: Answers save automatically
- ➡️ **Navigation**: Previous/Next buttons at bottom

### Question Types You'll See:

**Multiple Choice:**
- Click on the correct answer
- Only one option is correct

**Fill in the Blanks:**
- Type your answer in the text field
- Case-insensitive for grading

**Writing Tasks:**
- Use the text editor
- Word count displayed below
- Formatting toolbar available

**Speaking Tasks:**
- Read the questions
- (Audio recording feature - coming soon)

### Completing the Quiz:
1. Answer all questions
2. Review flagged questions (red in sidebar)
3. Click **"Finish attempt ..."** in sidebar
4. Confirm submission
5. View your results!

## Understanding Your Results

### For Listening & Reading:
- ✅ **Instant Grading**: Results shown immediately
- 📊 **Score**: e.g., "20.00/30.00"
- 📈 **Percentage**: e.g., "66.67%"
- 🎓 **Grade**: A+, A, B, C, D, or F
- 🔍 **Review**: Click "Review" to see correct answers

### For Writing & Speaking:
- ⏳ **Pending Grading**: Requires manual review
- 👨‍🏫 **Admin Review**: Waiting for teacher evaluation
- 📧 **Notification**: You'll be notified when graded

### Review Mode:
- Green boxes ✅ = Correct answers
- Red boxes ❌ = Incorrect answers
- See explanations for each question
- Navigate through all questions

## Directory Structure (What You Built)

```
📁 ielts-mock-platform/
├── 📁 models/
│   ├── User.js              (user accounts)
│   ├── Subscription.js      (purchased tests)
│   ├── TestModule.js        (quiz content)
│   └── Attempt.js           (quiz attempts)
│
├── 📁 pages/
│   ├── subscription.js      (💳 buy tests)
│   ├── my-tests.js          (📚 purchased tests)
│   ├── 📁 test/
│   │   └── [id].js          (📝 quiz details)
│   ├── 📁 attempt/
│   │   ├── [id].js          (✏️ take quiz)
│   │   └── [id]/review.js   (🔍 review answers)
│   └── 📁 payment/
│       └── [id].js          (💰 payment)
│
├── 📁 pages/api/
│   ├── 📁 subscriptions/    (API: manage subscriptions)
│   ├── 📁 test-modules/     (API: get quiz data)
│   └── 📁 attempts/         (API: save/submit quizzes)
│
└── 📁 scripts/
    └── seedTestModules.js   (🌱 sample data)
```

## Common Tasks

### View All Purchased Tests
```
URL: http://localhost:3000/my-tests
```

### Browse Available Tests
```
URL: http://localhost:3000/subscription
```

### View Dashboard
```
URL: http://localhost:3000/dashboard
```

### Admin Panel (Coming Soon)
- Approve payments
- Grade Writing/Speaking tests
- Manage test content

## Troubleshooting

### "Cannot connect to MongoDB"
**Solution:**
- Check MongoDB is running: `mongod --version`
- Verify MONGODB_URI in `.env.local`
- For local: `mongodb://localhost:27017/ielts-mock-platform`
- For Atlas: Get connection string from MongoDB Atlas

### "No tests showing in My Tests"
**Solution:**
1. Make sure subscription is activated
2. Check subscription status in database
3. Run seed script again: `node scripts/seedTestModules.js`

### "Answers not saving"
**Solution:**
- Check browser console for errors
- Ensure you're logged in
- Check network tab for API errors

### "Cannot start attempt"
**Solution:**
- Verify active subscription
- Check test module exists in database
- Look at console logs for errors

## Testing the Complete Flow

### End-to-End Test:
1. ✅ Register new account
2. ✅ Login
3. ✅ Purchase subscription (free)
4. ✅ Go to My Tests
5. ✅ Start a Listening quiz
6. ✅ Answer some questions
7. ✅ Flag a question
8. ✅ Submit the quiz
9. ✅ View results
10. ✅ Review answers

**Expected Time:** ~10 minutes

## What's Next?

### For Development:
1. Add more test modules
2. Implement admin grading panel
3. Add payment gateway (Stripe/PayPal)
4. Create analytics dashboard
5. Build mobile app

### For Production:
1. Set strong JWT_SECRET
2. Use production MongoDB (Atlas)
3. Add SSL certificate
4. Configure email notifications
5. Set up backup system

## Support & Resources

- **Main Documentation**: See `QUIZ_SYSTEM.md`
- **API Reference**: Check `/pages/api/` files
- **Models**: Check `/models/` directory
- **Sample Data**: See `scripts/seedTestModules.js`

## Need Help?

Create an issue or check the documentation:
- Backend errors: Check terminal logs
- Frontend errors: Check browser console (F12)
- Database issues: Check MongoDB logs

---

**🎉 Congratulations!** You now have a fully functional IELTS quiz platform!

Start creating your test content and customize the platform to your needs.

**Happy Testing! 📚**

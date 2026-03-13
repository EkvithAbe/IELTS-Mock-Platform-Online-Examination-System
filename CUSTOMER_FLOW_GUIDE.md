# 🎯 Customer Flow - Testing Guide

## ✨ What's Been Built

I've created the **customer-facing UI** for your quiz purchase flow with locked quizzes on the dashboard.

---

## 🚀 Testing the New Flow

### **Server is Running at: http://localhost:3001**

### **Step 1: Login to Dashboard**
1. Go to http://localhost:3001/login
2. Login with your account
3. You'll be redirected to the dashboard

### **Step 2: See Locked Quizzes**
On the dashboard, you'll see **4 locked quiz cards**:

1. **🎧 Listening Quiz** - $15 (Blue card with lock overlay)
2. **📖 Reading Quiz** - $15 (Green card with lock overlay)
3. **✍️ Writing Quiz** - $25 (Purple card with lock overlay)
4. **🎤 Speaking Quiz** - $30 (Orange card with lock overlay)

Each card shows:
- Lock icon overlay with "Click to Unlock"
- Quiz icon and name
- Duration and question count
- Price

### **Step 3: Click to Purchase**
1. Click on any locked quiz (e.g., Listening Quiz)
2. You'll be redirected to `/buy-quiz/listening`

### **Step 4: Fill Payment Form**
The payment form has these sections:

**Personal Information** (auto-filled from your account):
- Full Name *
- Email Address *
- Phone Number *
- Country *
- Address
- City

**Payment Method**:
- Bank Transfer (default)
- Online Payment

**Bank Details Displayed**:
- Bank Name: ABC Bank
- Account Name: IELTS Mock Platform
- Account Number: 1234567890
- IFSC Code: ABCD0123456
- Amount: $15 (or quiz price)

**Transaction Details**:
- Transaction ID / Reference Number * (e.g., TXN123456789)

**Upload Payment Receipt**:
- Click to upload image/PDF
- Accepts PNG, JPG, PDF up to 5MB

**Additional Notes** (optional)

### **Step 5: Submit Payment**
1. Fill all required fields (marked with *)
2. Upload your payment receipt
3. Click **"Submit Payment"** button
4. You'll see success message
5. Redirected back to dashboard

---

## 📋 Customer Journey

```
Dashboard (4 Locked Quizzes)
    ↓ Click Quiz
Payment Form Page
    ↓ Fill Info + Upload Receipt
Submit Payment
    ↓ 
Status: Pending Admin Approval
    ↓ (Admin unlocks - not built yet)
Quiz Unlocked → Can Take Test
```

---

## 🎨 UI Components Created

### 1. **Dashboard with Locked Quizzes**
File: `/pages/dashboard.js`

Features:
- 4 locked quiz cards in grid layout
- Lock icon overlay
- Color-coded by quiz type
- Hover effects
- Click to purchase

### 2. **Payment Form Page**
File: `/pages/buy-quiz/[module].js`

Features:
- Dynamic quiz info card
- Comprehensive form with validation
- File upload for payment receipt
- Bank details display
- Pre-filled user info
- Responsive design

### 3. **Payment Submission API**
File: `/pages/api/quiz-purchase/submit.js`

Features:
- Accepts form data + file upload
- Saves to database
- Creates subscription record (status: pending)
- Stores customer info in notes

---

## 💾 Database Structure

When customer submits payment, a **Subscription** record is created:

```javascript
{
  user: userId,
  testModule: 'listening' | 'reading' | 'writing' | 'speaking',
  price: 15 | 25 | 30,
  status: 'pending', // Waiting for admin approval
  paymentStatus: 'pending',
  paymentMethod: 'bank_transfer',
  paymentSlip: '/uploads/payment-receipts/filename.jpg',
  transactionId: 'TXN123456789',
  notes: 'Customer info and details...',
  testsAllowed: 1,
  testsUsed: 0
}
```

---

## 📸 How It Looks

### Dashboard View:
```
┌────────────────────────────────────┐
│   IELTS Test Modules               │
│                                    │
│  [🎧 Listening]  [📖 Reading]      │
│  [🔒 Locked]     [🔒 Locked]       │
│  $15             $15               │
│                                    │
│  [✍️ Writing]    [🎤 Speaking]     │
│  [🔒 Locked]     [🔒 Locked]       │
│  $25             $30               │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│   My Purchased Tests               │
│                                    │
│   No Tests Purchased Yet           │
│   Click on locked quiz to buy      │
└────────────────────────────────────┘
```

### Payment Form View:
```
┌────────────────────────────────────┐
│  🎧 Listening Quiz                 │
│  30 minutes · 40 questions         │
│  $15                               │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  Personal Information              │
│  [Full Name] [Email]               │
│  [Phone] [Country]                 │
│  [Address] [City]                  │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  Payment Method                    │
│  ○ Bank Transfer                   │
│  ○ Online Payment                  │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  Our Bank Details                  │
│  Account: 1234567890               │
│  Amount: $15                       │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  Transaction ID                    │
│  [Enter transaction ID]            │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  Upload Payment Receipt            │
│  [📁 Click to upload]              │
└────────────────────────────────────┘

[Cancel] [Submit Payment]
```

---

## 🧪 Test Scenarios

### Test 1: View Locked Quizzes
1. Login → Dashboard
2. ✅ See 4 locked quiz cards
3. ✅ All have lock overlay
4. ✅ Prices displayed correctly

### Test 2: Navigate to Payment
1. Click on Listening Quiz
2. ✅ Redirected to `/buy-quiz/listening`
3. ✅ Quiz info displayed
4. ✅ Form pre-filled with user data

### Test 3: Submit Payment
1. Fill transaction ID: `TEST123`
2. Upload a test image file
3. Click Submit
4. ✅ See success message
5. ✅ Redirected to dashboard
6. ✅ Check browser console (no errors)

### Test 4: Check Database
Open MongoDB and check:
```javascript
db.subscriptions.find({ status: 'pending' })
```
Should show your submission with:
- Customer info
- Payment slip path
- Status: pending

---

## 📁 Files Created/Modified

**Created:**
1. `/pages/buy-quiz/[module].js` - Payment form page
2. `/pages/api/quiz-purchase/submit.js` - Payment submission API
3. `/public/uploads/payment-receipts/` - Directory for receipts

**Modified:**
1. `/pages/dashboard.js` - Added 4 locked quiz cards

---

## 🎯 What's Working

✅ Dashboard shows 4 locked quizzes  
✅ Click quiz → navigate to payment form  
✅ Payment form with all required fields  
✅ File upload for payment receipt  
✅ Form validation  
✅ Payment submission to database  
✅ Creates pending subscription  
✅ Success message and redirect  

---

## 🚧 What's NOT Built Yet (Admin Part)

❌ Admin panel to view pending payments  
❌ Admin approval/rejection functionality  
❌ Unlocking quizzes after approval  
❌ Email notifications  
❌ Dashboard showing unlocked quizzes  
❌ Taking the actual quiz (existing code)  

---

## 🔜 Next Steps (For You to Request)

After you test and approve the customer UI, I'll build:

1. **Admin Dashboard**
   - View all pending payments
   - See customer info and receipts
   - Approve/Reject buttons

2. **Unlock Mechanism**
   - Admin clicks approve
   - Subscription status → active
   - Quiz appears unlocked on customer dashboard

3. **Taking Quiz Flow**
   - Update existing quiz pages
   - Check subscription before allowing access
   - Show attempt history

---

## 🎨 Color Scheme

- **Listening**: Blue (`#2563eb`)
- **Reading**: Green (`#16a34a`)
- **Writing**: Purple (`#9333ea`)
- **Speaking**: Orange (`#ea580c`)

---

## 📝 Notes

- Payment receipts saved in `/public/uploads/payment-receipts/`
- All form data stored in subscription `notes` field
- Status starts as `pending` (awaiting admin)
- User can submit multiple purchase requests

---

## ✨ Ready to Test!

**Start URL**: http://localhost:3001

1. Login
2. See locked quizzes
3. Click to buy
4. Fill form
5. Submit payment
6. Check success!

**Test it out and let me know if you want any changes to the UI!** 🚀

---

## 🐛 Troubleshooting

**Issue**: Can't see quizzes on dashboard
- **Fix**: Clear cache, refresh page

**Issue**: Payment form not loading
- **Fix**: Check console for errors, verify `module` parameter

**Issue**: File upload fails
- **Fix**: Check file size (<5MB), verify `/public/uploads` directory exists

**Issue**: Success but no redirect
- **Fix**: Check browser console, verify API response

---

**Everything is ready for your testing! 🎉**

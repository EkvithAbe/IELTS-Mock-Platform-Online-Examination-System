# ⚡ Quick Test Guide - Admin Approval System

## 🎯 Complete Flow in 5 Minutes

### **Server**: http://localhost:3001

---

## 🧪 Test Scenario

### **Step 1: Student Purchases Quiz** (2 min)

1. Register student account:
   - Go to: http://localhost:3001/register
   - Email: `test@student.com`
   - Password: `password123`

2. After login → Dashboard
   - See 4 locked quizzes with 🔒

3. Click **Listening Quiz**
   - Payment form opens
   - Fill Transaction ID: `TEST123`
   - Upload any image file
   - Click **Submit Payment**

4. Back to dashboard
   - Quiz still locked (waiting approval)

---

### **Step 2: Admin Approves** (2 min)

1. Logout from student

2. Login as admin:
   - Email: `admin@gmail.com`
   - Password: `admin@123`
   - **Auto-redirects to Admin Dashboard** ✅

3. Admin Dashboard shows:
   - **Pending: 1** (yellow card)
   - Table with 1 row

4. Click **"View"** button
   - Modal opens with customer info
   - See payment receipt

5. Click **"✓ Approve Payment"**
   - Confirm
   - Success! Stats update

---

### **Step 3: Student Sees Unlocked** (1 min)

1. Logout from admin

2. Login as student again

3. Dashboard now shows:
   - **Listening Quiz** with **"✓ Unlocked"** badge
   - No lock overlay
   - Green badge in corner

4. Click the unlocked quiz
   - Redirects to `/quiz/listening`

---

## 📋 Quick Checklist

**Customer Side:**
- [ ] Register & login
- [ ] See locked quizzes
- [ ] Click quiz → payment form
- [ ] Submit payment
- [ ] Quiz still locked

**Admin Side:**
- [ ] Login with admin credentials
- [ ] See admin dashboard (not student dashboard)
- [ ] View pending payments
- [ ] See customer details & receipt
- [ ] Approve payment
- [ ] Stats update

**After Approval:**
- [ ] Student sees unlocked badge
- [ ] Can click to access quiz

---

## 🔑 Credentials

**Admin:**
```
Email: admin@gmail.com
Password: admin@123
```

**Student (create yourself):**
```
Email: test@student.com
Password: password123
```

---

## 🎨 What You'll See

### Customer Dashboard (Before Approval):
```
🎧 Listening Quiz    📖 Reading Quiz
   [🔒 LOCKED]          [🔒 LOCKED]
   Click to Unlock       Click to Unlock
   $15                   $15

✍️ Writing Quiz      🎤 Speaking Quiz
   [🔒 LOCKED]          [🔒 LOCKED]
   Click to Unlock       Click to Unlock
   $25                   $30
```

### Admin Dashboard:
```
┌─────────────────────────────────────────┐
│ IELTS Admin Panel              [Admin]  │
└─────────────────────────────────────────┘

Stats:
[Pending: 1] [Approved: 0] [Rejected: 0] [Total: 1] [Revenue: $0]

Tabs: [Pending] [Approved] [Rejected] [All]

Table:
┌──────────────┬──────────┬───────┬────────────┬────────┐
│ Customer     │ Quiz     │ Price │ Trans ID   │ Action │
├──────────────┼──────────┼───────┼────────────┼────────┤
│ Test Student │ 🎧 List. │ $15   │ TEST123    │ [View] │
└──────────────┴──────────┴───────┴────────────┴────────┘
```

### Customer Dashboard (After Approval):
```
🎧 Listening Quiz    📖 Reading Quiz
   [✓ Unlocked]         [🔒 LOCKED]
   30 min · 40 Q        Click to Unlock
   $15                  $15

✍️ Writing Quiz      🎤 Speaking Quiz
   [🔒 LOCKED]          [🔒 LOCKED]
   Click to Unlock       Click to Unlock
   $25                   $30
```

---

## ⚠️ Troubleshooting

**Problem: Quiz still locked after approval**
- Solution: Refresh the page (F5)

**Problem: Can't login as admin**
- Solution: Run `node scripts/createAdmin.js` again

**Problem: Payment receipt not showing**
- Solution: Check `/public/uploads/payment-receipts/` exists

**Problem: Admin sees student dashboard**
- Solution: Clear localStorage and login again

---

## ✅ Success Indicators

1. **Student submits payment** → See "Payment submitted successfully" message
2. **Admin dashboard** → Shows pending payment with customer details
3. **Admin approves** → See "Payment approved successfully" message
4. **Student dashboard** → Quiz card shows green "✓ Unlocked" badge
5. **Click unlocked quiz** → Redirects to quiz page

---

## 🚀 Everything Ready!

The complete system is working:
- ✅ Admin user created
- ✅ Customer purchase flow
- ✅ Payment submission
- ✅ Admin dashboard
- ✅ Approve/Reject functionality
- ✅ Quiz unlocking
- ✅ Visual feedback

**Start testing now!**

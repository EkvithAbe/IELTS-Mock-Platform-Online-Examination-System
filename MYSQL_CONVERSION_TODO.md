# MySQL Conversion - Remaining Tasks

## ✅ What's Been Done:

1. **Dashboard Updated** - Now shows:
   - Tabs for Academic/General IELTS
   - 4 individual quizzes per tab (Listening, Reading, Writing, Speaking)
   - Each quiz is purchased separately
   - Prices: Listening $15, Reading $15, Writing $25, Speaking $30

## 🔧 What Needs MySQL Conversion:

### 1. **API Endpoints to Convert from MongoDB to MySQL:**

#### `/pages/api/quiz-purchase/submit.js`
- Currently uses MongoDB
- Needs to INSERT into MySQL `subscriptions` table
- Fields to save:
  ```sql
  INSERT INTO subscriptions (
    user_id, test_type, test_module, price, status,
    payment_status, payment_method, payment_slip, 
    transaction_id, notes, created_at
  ) VALUES (?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, NOW())
  ```

#### `/pages/api/admin/subscriptions/index.js`
- Currently uses MongoDB `.find()` and `.populate()`
- Needs MySQL JOIN query:
  ```sql
  SELECT s.*, u.name as user_name, u.email as user_email, u.phone as user_phone
  FROM subscriptions s
  LEFT JOIN users u ON s.user_id = u.id
  ORDER BY s.created_at DESC
  ```

#### `/pages/api/admin/subscriptions/[id]/approve.js`
- Needs to be created
- UPDATE subscription status to 'active':
  ```sql
  UPDATE subscriptions 
  SET status = 'active', payment_status = 'completed'
  WHERE id = ?
  ```

#### `/pages/api/admin/subscriptions/[id]/reject.js`
- Needs to be created
- UPDATE subscription status to 'cancelled':
  ```sql
  UPDATE subscriptions 
  SET status = 'cancelled', notes = CONCAT(notes, '\n\nRejection Reason: ', ?)
  WHERE id = ?
  ```

#### `/pages/api/my-subscriptions.js` (or similar)
- Get user's subscriptions:
  ```sql
  SELECT * FROM subscriptions
  WHERE user_id = ? AND status = 'active'
  ORDER BY created_at DESC
  ```

### 2. **Database Schema (MySQL)**

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  test_type ENUM('Academic', 'General') NOT NULL,
  test_module ENUM('listening', 'reading', 'writing', 'speaking') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'active', 'expired', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_slip VARCHAR(255),
  transaction_id VARCHAR(100),
  start_date DATETIME,
  expiry_date DATETIME,
  tests_allowed INT DEFAULT 1,
  tests_used INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS test_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subscription_id INT NOT NULL,
  test_type ENUM('Academic', 'General') NOT NULL,
  test_module ENUM('listening', 'reading', 'writing', 'speaking') NOT NULL,
  answers JSON,
  score INT,
  total_questions INT,
  time_spent INT COMMENT 'in seconds',
  status ENUM('in_progress', 'completed') DEFAULT 'completed',
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);
```

### 3. **Files to Update/Create:**

#### Update These (Remove MongoDB, Use MySQL):
- ✅ `/pages/dashboard.js` - Already updated with tabs
- `/pages/buy-quiz/[module].js` - Change to handle `[type]/[module]` route
- `/pages/api/quiz-purchase/submit.js` - Convert to MySQL
- `/pages/api/admin/subscriptions/index.js` - Convert to MySQL
- `/pages/admin/dashboard.js` - Already partially ready

#### Create These (New):
- `/pages/buy-quiz/[type]/[module].js` - New route structure
- `/pages/api/admin/subscriptions/[id]/approve.js` - Approve API
- `/pages/api/admin/subscriptions/[id]/reject.js` - Reject API
- `/pages/api/subscriptions/my-subscriptions.js` - Get user subscriptions

### 4. **Remove MongoDB Files:**
Delete or ignore these:
- `/lib/mongodb.js`
- `/models/Subscription.js` (MongoDB model)
- `/models/Attempt.js` (MongoDB model)
- `/pages/api/test-attempts/*.js` (if using MongoDB)
- `/pages/my-purchased-tests/*` (if using MongoDB)
- `/pages/test-attempt/*` (if using MongoDB)
- `/pages/test-results/*` (if using MongoDB)

---

## 📝 Quick Implementation Steps:

### Step 1: Create MySQL Tables
Run the SQL schema above in your MySQL database.

### Step 2: Update `.env.local`
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mockpaperilets
DB_PORT=3306
JWT_SECRET=your_secret_key_here
```

### Step 3: Test MySQL Connection
Go to any existing MySQL-based page (like `/login`) and check if database connects.

### Step 4: Convert APIs One by One
1. Start with `/api/quiz-purchase/submit.js`
2. Then `/api/admin/subscriptions/index.js`
3. Create approve/reject endpoints
4. Test the full flow

---

## 🎯 Expected Flow After Conversion:

1. **Student Dashboard**:
   - Clicks "Academic" or "General" tab
   - Sees 4 locked quizzes (Listening, Reading, Writing, Speaking)
   
2. **Purchase Flow**:
   - Clicks a locked quiz
   - Goes to `/buy-quiz/Academic/listening` (or similar)
   - Fills form, uploads receipt
   - Subscription created with `status='pending'` in MySQL
   
3. **Admin Approval**:
   - Admin sees pending subscriptions in `/admin/dashboard`
   - Clicks "Approve" → Updates `status='active'` in MySQL
   - Quiz unlocks for student
   
4. **Student Takes Test**:
   - Clicks unlocked quiz
   - Takes test
   - Results saved to MySQL `test_attempts` table

---

## ⚠️ Important Notes:

1. **No More MongoDB** - All references to mongoose, dbConnect (MongoDB version), and MongoDB models must be removed
2. **Use MySQL Queries** - Use the existing `/lib/mysql.js` with `query()` function
3. **Route Structure** - Individual quizzes now, not packages
4. **Pricing** - Each quiz has its own price (not $50 package)

---

This conversion ensures your project uses **MySQL only** with **individual quiz purchases** per Academic/General type!

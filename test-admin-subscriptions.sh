#!/bin/bash

echo "🧪 Testing Admin Subscriptions API..."
echo ""

# First login to get token
echo "🔐 Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin@123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful! Token obtained."
echo ""

# Now fetch subscriptions
echo "📋 Fetching subscriptions..."
SUBS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/admin/subscriptions \
  -H "Authorization: Bearer $TOKEN")

echo "$SUBS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SUBS_RESPONSE"

#!/bin/bash

# Script to replace all MongoDB imports with MySQL imports

echo "🔄 Fixing MongoDB imports in API files..."

# Find all .js files in pages/api and replace mongodb imports
find pages/api -name "*.js" -type f -exec sed -i '' \
  -e "s|from '@/lib/mongodb'|from '@/lib/mysql'|g" \
  -e "s|from '../../lib/mongodb'|from '../../lib/mysql'|g" \
  -e "s|from '../../../lib/mongodb'|from '../../../lib/mysql'|g" \
  -e "s|from '../../../../lib/mongodb'|from '../../../../lib/mysql'|g" \
  -e "s|from '../../../../../lib/mongodb'|from '../../../../../lib/mysql'|g" \
  -e "s|dbConnect|connectDB|g" \
  {} +

echo "✅ All MongoDB imports have been replaced with MySQL imports!"
echo "📝 Files updated in pages/api/"

# Count how many files were affected
count=$(find pages/api -name "*.js" -type f | wc -l)
echo "📊 Total API files checked: $count"

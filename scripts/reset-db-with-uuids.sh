#!/bin/bash

# Reset Database with UUID Migration
# This script completely drops and recreates the database with UUID schema

echo "🔄 Resetting database with UUID schema..."

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-postgres}
DB_USER=${DB_USER:-postgres}
export PGPASSWORD=${PGPASSWORD:-postgres}

# Step 1: Drop all tables
echo "📦 Dropping all existing tables..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'EOF'
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
EOF

if [ $? -eq 0 ]; then
  echo "✅ All tables dropped successfully"
else
  echo "❌ Failed to drop tables"
  exit 1
fi

# Step 2: Push new UUID schema
echo "🚀 Pushing UUID schema..."
npm run db:push

if [ $? -eq 0 ]; then
  echo "✅ UUID schema applied successfully!"
  echo ""
  echo "📊 Migration Summary:"
  echo "  - All tables now use UUID primary keys"
  echo "  - All foreign keys updated to reference UUIDs"
  echo "  - IDs generated via crypto.randomUUID()"
  echo ""
  echo "🎉 Database migration complete!"
else
  echo "❌ Failed to push UUID schema"
  exit 1
fi

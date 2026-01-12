#!/bin/bash
# Script to run database migrations to Supabase
# Make sure you have set up your Supabase environment variables in your .env file

echo "Checking if environment variables are set..."

# Check if required variables are set
if [ -z "$SUPABASE_DATABASE_URL" ]; then
    echo "Error: SUPABASE_DATABASE_URL is not set in your environment"
    echo "Please set up your .env file with your Supabase connection details"
    echo "and run: source .env"
    exit 1
fi

if [ -z "$SUPABASE_URL" ]; then
    echo "Error: SUPABASE_URL is not set in your environment"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Error: SUPABASE_SERVICE_ROLE_KEY is not set in your environment"
    exit 1
fi

echo "Environment variables are set. Proceeding with database migration..."

# Run the database migration
echo "Running drizzle-kit push to migrate schema to Supabase..."
yarn db:push

echo "Migration complete!"
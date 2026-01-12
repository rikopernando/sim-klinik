# Connecting to Supabase

This project has been configured to work with Supabase. Follow these steps to set up your connection and run migrations.

## Setup Instructions

### 1. Get Supabase Credentials

1. Go to [Supabase](https://supabase.com) and create an account
2. Create a new project
3. From your project dashboard, get the following:
   - Database connection string
   - Project URL
   - Service role key

### 2. Configure Environment Variables

Create a `.env` file in the root of your project (or update the existing one) with these values:

```
SUPABASE_DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database_name]
SUPABASE_URL=https://[project_ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your_service_role_key]
```

### 3. Run Migrations

To run the database migrations to your Supabase database, use:

```bash
yarn db:push
```

Or use the migration script:

```bash
source .env && ./scripts/migrate-to-supabase.sh
```

## Alternative: Local Testing

If you want to test locally before connecting to Supabase:

1. Start the local PostgreSQL database:
   ```bash
   yarn db:dev
   ```

2. Make sure your `.env` file has the `DATABASE_URL` set to your local database (this is already in the `.env.example` file)

3. Run migrations:
   ```bash
   yarn db:push
   ```

## Troubleshooting

- If you get a `TypeError: Cannot read properties of undefined (reading 'searchParams')` error, double check that your environment variables are properly set
- Make sure the database server is running and accessible
- Verify that your connection string format is correct
- If using the local Docker database, ensure Docker is running and the PostgreSQL container is active
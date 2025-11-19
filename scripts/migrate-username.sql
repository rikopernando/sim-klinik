-- Step 1: Add username column without NOT NULL constraint
ALTER TABLE "user" ADD COLUMN "username" text;

-- Step 2: Update existing users with username from email
UPDATE "user" SET "username" = SPLIT_PART("email", '@', 1);

-- Step 3: Make username NOT NULL
ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL;

-- Step 4: Add unique constraint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");

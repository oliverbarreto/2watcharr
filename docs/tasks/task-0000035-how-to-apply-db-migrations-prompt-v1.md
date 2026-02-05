# Task: How to apply db migrations


the changes on the schema.sql and migrations.sql imply modifying the database estructure, in production how can i apply the migrations to not losse existing data

Thought for <1s


The good news is that the migration system I implemented for this project is designed to be safe and automatic. You don't need to run any manual SQL commands or worry about data loss.

Here is how it works and how you should apply it to production:

## 1. The Migration is "Non-Destructive"
In `src/lib/db/migrations.ts`, I used the command:

```sql
ALTER TABLE users ADD COLUMN api_token TEXT;
```

In SQLite, this command simply adds a new "empty" column to your existing table. It does not touch your existing data (the usernames, passwords, and watchlists remain exactly as they are).

## 2. Automatic Execution
The application is configured to run these migrations automatically every time the server starts.

- When you deploy the new code to production and the Next.js server boots up, it checks the migrations table in your database.
- It will see that add_api_token hasn't been run yet.
- It will execute the ALTER TABLE command once and then mark it as completed.

## 3. How to Deploy it safely:
To apply this in your production environment (e.g., your Docker setup):

1. Backup (Just in case): Before any database schema change, it's a best practice to copy your  `data/2watcharr.db` file to a safe place.
2. Pull the Code: Merge the changes that include the updated `migrations.ts` and  `schema.sql`.
3. Restart the Container: Restart your 2watcharr service.
```bash
docker compose restart 2watcharr
```
4. Verification:
- Log in to your production instance.
- Go to Settings > User Management.
- You should see the "API Token" section appearing for your users.
- Click the Regenerate (refresh) icon to generate an initial token for your account, as the existing users will have a null token initially.

Note: If you are using a shared database volume (which you are), the data persists across restarts, and the code handles the "upgrade" of the file structure seamlessly.
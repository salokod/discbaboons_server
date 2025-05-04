## Database Migrations

To run migrations using Flyway:

```sh
npm run migrate
```

To check migration status:

```sh
npm run migrate:info
```

> **Note:** Make sure Flyway is installed and available in your PATH.

## Creating a New Database User for Flyway Migrations

When setting up a new database user for Flyway migrations:

1. **Create the user in your database.**
2. **Grant only the necessary privileges:**

   - Allow `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on all tables in the target schema.
   - Allow `USAGE` and `CREATE` on the schema (required for migrations that create tables or other objects).
   - Do **not** grant privileges to drop tables, drop/alter schema, or manage users.

   Example SQL (run as a superuser/admin):

   ```sql
   GRANT USAGE, CREATE ON SCHEMA public TO <username>;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO <username>;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO <username>;
   ```

3. **Configure Flyway:**

   - Create a config file (e.g., `conf/flyway.<env>.conf`) with the following:

     ```properties
     flyway.url=jdbc:postgresql://<host>:<port>/<database>
     flyway.user=<username>
     flyway.password=<password>
     flyway.locations=filesystem:sql
     flyway.schemas=public
     flyway.cleanDisabled=false
     ```

4. **Add the config file to `.gitignore` and provide an example file for others.**

---

**Tip:**  
Never grant unnecessary privileges to migration users. Only allow what is needed for schema changes and data manipulation.

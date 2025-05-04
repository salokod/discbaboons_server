# Instructions for Running Migrations and Managing Schema

This README provides instructions on how to run the Flyway migrations for the `users` and `user_profiles` tables in the database.

## Prerequisites

- Ensure that you have Flyway installed on your machine. You can download it from the [Flyway website](https://flywaydb.org/download/).
- Make sure your database is accessible and that you have the necessary credentials.

## Configuration

Before running the migrations, ensure that your `conf/flyway.conf` file is correctly configured with the following details:

- `flyway.user`: Your database username
- `flyway.password`: Your database password
- `flyway.url`: The JDBC URL for your database (including host and port)
- `flyway.schemas`: The schema where the tables will be created (if applicable)

## Running Migrations

1. Open a terminal and navigate to the `flyway-migration-project` directory.
2. Run the following command to apply the migrations:

   ```
   flyway migrate
   ```

3. Flyway will execute the migration scripts in the `sql` directory in the order defined by their version numbers (e.g., `V1`, `V2`).

## Managing the Schema

- The `V1__create_users_table.sql` file creates the `users` table with the following schema:

  - `id`: INT, Primary Key, Auto Increment
  - `username`: VARCHAR, Unique
  - `password_hash`: VARCHAR
  - `created_at`: TIMESTAMP
  - `last_password_change`: TIMESTAMP

- The `V2__create_user_profiles_table.sql` file creates the `user_profiles` table with the following schema:

  - `id`: INT, Primary Key, Auto Increment
  - `user_id`: INT, Foreign Key referencing `users(id)`
  - `name`: VARCHAR
  - `location`: VARCHAR
  - `bio`: TEXT
  - `created_at`: TIMESTAMP
  - `updated_at`: TIMESTAMP

## Rollback

If you need to rollback a migration, you can use the following command:

```
flyway undo
```

Note that this requires that you have defined undo scripts for your migrations.

## Additional Resources

For more information on Flyway and its features, refer to the [Flyway documentation](https://flywaydb.org/documentation/).
# Database Documentation

## Overview

This documentation provides details about the database schema, migrations, and design decisions for the DiscBaboons Server project.

## Schema Structure

The database currently consists of the following main tables:

- **users**: Core user authentication data
- **user_profiles**: Extended user profile information

## Migration History

| Version | File | Description | Date Applied |
|---------|------|-------------|--------------|
| V1 | [V1__create_users_table.sql](/sql/versioned/V1__create_users_table.sql) | Creates the initial users table | - |
| V2 | [V2__create_user_profiles_table.sql](/sql/versioned/V2__create_user_profiles_table.sql) | Creates the user_profiles table | - |
| V3 | [V3__user_profiles_update_at_trigger.sql](/sql/versioned/V3__user_profiles_update_at_trigger.sql) | Adds automatic timestamp update trigger | - |

## Entity Relationship Diagram

```
users (1) ---> (1) user_profiles
```

## Design Decisions

- **Authentication Model**: Username/password authentication with password hashing
- **Profile Separation**: User authentication data is separated from profile data for security
- **Audit Trail**: Automatic tracking of creation and update timestamps
- **Database Triggers**: Used for automatic timestamp maintenance during updates
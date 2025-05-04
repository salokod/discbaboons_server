# Database Migration Documentation

This document provides details about the database migrations in the DiscBaboons Server project.

## Migration: V1__create_users_table.sql

**Purpose:** Create the initial users table for authentication.

**SQL:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_password_change TIMESTAMP
);
```

**Design Notes:**
- Core authentication table
- Uses SERIAL for auto-incrementing primary key
- Enforces unique usernames
- Includes audit timestamps

## Migration: V2__create_user_profiles_table.sql

**Purpose:** Create the user_profiles table to store extended user information.

**SQL:**
```sql
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Design Notes:**
- Extends user data with profile information
- Maintains reference integrity with CASCADE delete
- Includes audit timestamps for creation and updates
- Optional fields for location and biography

## Migration: V3__user_profiles_update_at_trigger.sql

**Purpose:** Create a trigger to automatically update the `updated_at` timestamp.

**SQL:**
```sql
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();
```

**Design Notes:**
- Ensures `updated_at` is automatically set on updates
- Implements the standard PostgreSQL pattern for timestamp triggers
- Applied only to the user_profiles table
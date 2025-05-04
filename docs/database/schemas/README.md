# Database Schema Documentation

This document provides detailed information about the database schema used in the DiscBaboons Server project.

## Table: users

Core table for user authentication and identity.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for the user |
| username | VARCHAR(50) | NOT NULL, UNIQUE | User's login name |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password (never stored in plaintext) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When the user account was created |
| last_password_change | TIMESTAMP | | When the password was last changed |

### Indexes
- Primary key on `id`
- Unique index on `username`

### Design Decisions
- Using SERIAL for auto-incrementing IDs
- Username has a uniqueness constraint to prevent duplicates
- Password is stored as a hash for security
- Tracking creation time and password change time for security auditing

## Table: user_profiles

Extended information about users.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for the profile |
| user_id | INT | NOT NULL, FOREIGN KEY | Reference to users.id |
| name | VARCHAR(255) | NOT NULL | User's display name |
| location | VARCHAR(255) | | User's location |
| bio | TEXT | | User's biography or description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When the profile was created |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When the profile was last updated |

### Indexes
- Primary key on `id`
- Foreign key on `user_id` referencing `users(id)`

### Design Decisions
- One-to-one relationship with the users table
- Separated from authentication data for security and modularity
- Includes timestamps for tracking when profile information changes
- Auto-updating timestamp via database trigger
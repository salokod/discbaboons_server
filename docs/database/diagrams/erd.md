# Entity Relationship Diagram

This document provides a visual representation of the database schema relationships.

## Current Schema

```
┌─────────┐       ┌───────────────┐
│  users  │       │ user_profiles │
├─────────┤       ├───────────────┤
│ id      │──┐    │ id            │
│ username│  │    │ user_id       │◄─┘
│ password│  │    │ name          │
│ created │  └────│ location      │
│ last_pwd│       │ bio           │
└─────────┘       │ created_at    │
                  │ updated_at    │
                  └───────────────┘
```

## Relationships

- **users** to **user_profiles**: One-to-One relationship
  - A user record can have one user profile
  - Foreign key: `user_profiles.user_id` references `users.id`
  - Deletion cascade: When a user is deleted, their profile is also deleted
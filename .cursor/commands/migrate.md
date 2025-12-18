---
name: migrate
description: "Database migrations and schema updates"
category: database
complexity: intermediate
mcp-servers: []
personas: []
---

# /sc:migrate - Database Migrations

## Triggers
- Database schema change needs
- Migration creation requirements
- Schema update requests
- Database version management

## Usage
```
/sc:migrate [action] [name] [--up|--down] [--dry-run]
```

## Behavioral Flow
1. **Analyze**: Examine current schema
2. **Plan**: Create migration strategy
3. **Generate**: Create migration files
4. **Execute**: Run migrations (if not dry-run)
5. **Verify**: Confirm migration success

Key behaviors:
- Migration file generation
- Schema change tracking
- Safe migration execution
- Rollback support
- Migration validation

## Tool Coordination
- **Read**: Analyze database schema
- **Write**: Create migration files
- **Bash**: Execute migration commands
- **Grep**: Find migration patterns
- **Codebase Search**: Understand schema structure

## Key Patterns
- **Migration Creation**: Analyze → plan → generate
- **Schema Updates**: Create → execute → verify
- **Rollback Support**: Track → reverse → confirm
- **Validation**: Check → verify → report

## Examples

### Create Migration
```
/sc:migrate create add_user_subscriptions
# Creates new migration file
# Adds schema changes
```

### Run Migrations
```
/sc:migrate up
# Executes pending migrations
# Updates database schema
```

### Rollback Migration
```
/sc:migrate down
# Rolls back last migration
# Reverts schema changes
```

### Dry Run
```
/sc:migrate up --dry-run
# Shows what would be migrated
# Does not execute
```

## Boundaries

**Will:**
- Create migration files
- Execute migrations safely
- Support rollbacks
- Validate migrations

**Will Not:**
- Modify database without approval
- Skip validation
- Delete data
- Execute destructive migrations without warning

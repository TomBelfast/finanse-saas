---
name: check
description: "Type checking, validation, and error detection"
category: quality-assurance
complexity: basic
mcp-servers: []
personas: []
---

# /sc:check - Type Checking and Validation

## Triggers
- TypeScript type checking needs
- Validation requests before commits
- Error detection requirements
- Code correctness verification

## Usage
```
/sc:check [target] [--type typescript|linter|all] [--strict]
```

## Behavioral Flow
1. **Analyze**: Run type checker on code
2. **Detect**: Identify type errors and issues
3. **Categorize**: Group errors by type and severity
4. **Report**: Present findings with solutions
5. **Suggest**: Provide fix recommendations

Key behaviors:
- TypeScript type checking
- Error categorization
- Fix suggestions
- Validation reporting
- Configuration checking

## Tool Coordination
- **Bash**: Execute type checking commands
- **Read Lints**: Get TypeScript diagnostics
- **Read**: Analyze type definitions
- **Grep**: Find type errors
- **Codebase Search**: Understand type relationships

## Key Patterns
- **Type Checking**: Run checker → detect errors → report
- **Error Analysis**: Categorize → prioritize → suggest fixes
- **Validation**: Check → verify → confirm
- **Fix Suggestions**: Identify → recommend → apply

## Examples

### Type Check All Files
```
/sc:check
# Runs TypeScript type checker
# Reports all type errors
```

### Strict Type Checking
```
/sc:check --strict
# Enforces strict type checking
# Treats warnings as errors
```

### Check Specific Module
```
/sc:check apps/functions/src/modules/auth
# Type checks only specified module
```

### All Checks
```
/sc:check --type all
# Runs type checking and linting
# Comprehensive validation
```

## Boundaries

**Will:**
- Run type checking
- Detect type errors
- Suggest fixes
- Validate code correctness

**Will Not:**
- Modify code automatically
- Change type definitions without approval
- Skip type checking
- Ignore errors

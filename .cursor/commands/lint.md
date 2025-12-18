---
name: lint
description: "Lint code for style, errors, and best practices compliance"
category: quality-assurance
complexity: basic
mcp-servers: []
personas: []
---

# /sc:lint - Code Linting

## Triggers
- Code style validation requests
- Linter error checking needs
- Pre-commit validation requirements
- Code quality enforcement

## Usage
```
/sc:lint [target] [--fix] [--format] [--strict]
```

## Behavioral Flow
1. **Analyze**: Run linter on target files
2. **Detect**: Identify linting errors and warnings
3. **Report**: Present findings with locations
4. **Fix**: Apply automatic fixes (if --fix)
5. **Validate**: Verify fixes are correct

Key behaviors:
- Automatic linter detection (ESLint, Prettier, etc.)
- Error categorization and prioritization
- Automatic fix application
- Code style enforcement
- Configuration validation

## Tool Coordination
- **Bash**: Execute linting commands
- **Read**: Check linting configuration
- **Grep**: Find linting errors
- **Write**: Apply fixes
- **Read Lints**: Get linter diagnostics

## Key Patterns
- **Lint Execution**: Run linter → detect errors → report
- **Auto Fix**: Identify fixable → apply → verify
- **Style Enforcement**: Check style → enforce → validate
- **Error Reporting**: Categorize → prioritize → present

## Examples

### Lint All Files
```
/sc:lint
# Runs linter on entire project
# Reports all errors and warnings
```

### Auto-Fix Linting Errors
```
/sc:lint --fix
# Automatically fixes fixable errors
# Reports remaining issues
```

### Lint Specific Directory
```
/sc:lint apps/web-app/src
# Lints only specified directory
# Focused error reporting
```

### Strict Linting
```
/sc:lint --strict
# Enforces strict rules
# Treats warnings as errors
```

## Boundaries

**Will:**
- Run linter and report errors
- Apply automatic fixes
- Enforce code style
- Validate linting configuration

**Will Not:**
- Modify code logic (only style)
- Change functionality
- Ignore linting rules
- Skip validation steps

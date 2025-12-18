---
name: fix
description: "Identify and fix bugs, errors, and issues in code"
category: debugging
complexity: intermediate
mcp-servers: []
personas: []
---

# /sc:fix - Bug Fixing and Issue Resolution

## Triggers
- Bug reports and error messages
- Test failures and debugging needs
- Runtime error resolution requests
- Linter and type errors fixing

## Usage
```
/sc:fix [target] [--error "error message"] [--type runtime|linter|type|test]
```

## Behavioral Flow
1. **Identify**: Understand the error or bug
2. **Locate**: Find the source of the issue
3. **Analyze**: Understand root cause and context
4. **Fix**: Apply appropriate fix
5. **Validate**: Verify fix works and doesn't break other things

Key behaviors:
- Error message analysis and interpretation
- Root cause identification
- Context-aware fixing
- Test validation after fixes
- Prevention of regressions

## Tool Coordination
- **Read**: Examine code with errors
- **Grep**: Find error patterns and related code
- **Read Lints**: Check linter errors
- **Write**: Apply fixes
- **Bash**: Run tests to validate fixes
- **Codebase Search**: Understand dependencies

## Key Patterns
- **Error Analysis**: Read error → understand context → identify cause
- **Fix Application**: Identify fix → apply → validate
- **Regression Prevention**: Fix → test → verify no side effects
- **Issue Resolution**: Error → analysis → fix → validation

## Examples

### Fix Runtime Error
```
/sc:fix --error "Cannot read property 'map' of undefined"
# Analyzes error message
# Finds location of error
# Applies fix with proper null checking
```

### Fix Type Errors
```
/sc:fix src/components --type type
# Finds TypeScript errors
# Fixes type issues
# Validates type correctness
```

### Fix Linter Errors
```
/sc:fix src/utils --type linter
# Identifies linter violations
# Applies fixes according to linting rules
# Ensures code style compliance
```

### Fix Test Failures
```
/sc:fix tests/user.test.ts --type test
# Analyzes failing tests
# Identifies cause of failure
# Fixes code or tests appropriately
```

## Boundaries

**Will:**
- Fix bugs and errors in code
- Resolve linter and type errors
- Apply appropriate fixes based on error analysis
- Validate fixes with tests

**Will Not:**
- Fix errors without understanding the cause
- Make changes that break existing functionality
- Fix errors in external dependencies
- Apply fixes without user approval (unless explicitly requested)

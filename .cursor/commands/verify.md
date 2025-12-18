---
name: verify
description: "Verify code correctness, tests, and project integrity"
category: quality-assurance
complexity: basic
mcp-servers: []
personas: []
---

# /sc:verify - Code Verification

## Triggers
- Pre-commit verification needs
- Code correctness checks
- Test verification requirements
- Project integrity validation

## Usage
```
/sc:verify [--type code|tests|all] [--strict]
```

## Behavioral Flow
1. **Check**: Run verification checks
2. **Test**: Execute tests
3. **Validate**: Verify correctness
4. **Report**: Present results
5. **Recommend**: Suggest improvements

Key behaviors:
- Comprehensive verification
- Test execution
- Code correctness checking
- Integrity validation
- Error reporting

## Tool Coordination
- **Bash**: Run verification commands
- **Read Lints**: Get verification errors
- **Read**: Check code correctness
- **Grep**: Find issues
- **Codebase Search**: Understand structure

## Key Patterns
- **Verification Execution**: Check → test → validate
- **Error Detection**: Identify → categorize → report
- **Correctness Checking**: Verify → confirm → document
- **Improvement Suggestions**: Analyze → recommend → apply

## Examples

### Verify All
```
/sc:verify --type all
# Verifies code and tests
# Comprehensive check
```

### Code Verification
```
/sc:verify --type code
# Verifies code correctness
# Checks types and errors
```

### Test Verification
```
/sc:verify --type tests
# Runs all tests
# Verifies test coverage
```

### Strict Verification
```
/sc:verify --strict
# Enforces strict rules
# Treats warnings as errors
```

## Boundaries

**Will:**
- Verify code correctness
- Execute tests
- Check project integrity
- Report verification results

**Will Not:**
- Modify code automatically
- Skip verification steps
- Ignore errors
- Change functionality

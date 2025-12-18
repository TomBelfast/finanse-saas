---
name: validate
description: "Validate code, configuration, and project setup"
category: quality-assurance
complexity: basic
mcp-servers: []
personas: []
---

# /sc:validate - Project Validation

## Triggers
- Pre-commit validation needs
- Configuration validation requirements
- Project setup verification
- Code validation before deployment

## Usage
```
/sc:validate [--type code|config|setup|all] [--strict]
```

## Behavioral Flow
1. **Identify**: Determine what to validate
2. **Check**: Run validation checks
3. **Verify**: Confirm compliance
4. **Report**: Present validation results
5. **Suggest**: Provide fix recommendations

Key behaviors:
- Comprehensive validation
- Configuration checking
- Code quality verification
- Setup validation
- Error reporting

## Tool Coordination
- **Read**: Check configurations
- **Bash**: Run validation commands
- **Read Lints**: Get validation errors
- **Grep**: Find validation issues
- **Codebase Search**: Understand structure

## Key Patterns
- **Validation Execution**: Check → verify → report
- **Error Detection**: Identify → categorize → suggest
- **Compliance Checking**: Validate → confirm → document
- **Fix Suggestions**: Find → recommend → apply

## Examples

### Validate All
```
/sc:validate --type all
# Validates code, config, and setup
# Comprehensive check
```

### Code Validation
```
/sc:validate --type code
# Validates code quality
# Checks types and linting
```

### Configuration Validation
```
/sc:validate --type config
# Validates configuration files
# Checks environment variables
```

### Strict Validation
```
/sc:validate --strict
# Enforces strict rules
# Treats warnings as errors
```

## Boundaries

**Will:**
- Validate code and configuration
- Check project setup
- Report validation errors
- Suggest fixes

**Will Not:**
- Modify code automatically
- Skip validation steps
- Ignore errors
- Change configuration

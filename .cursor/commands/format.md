---
name: format
description: "Format code according to project style guidelines"
category: code-improvement
complexity: basic
mcp-servers: []
personas: []
---

# /sc:format - Code Formatting

## Triggers
- Code formatting requests
- Style consistency needs
- Pre-commit formatting requirements
- Code beautification needs

## Usage
```
/sc:format [target] [--check] [--write]
```

## Behavioral Flow
1. **Detect**: Identify formatter (Prettier, etc.)
2. **Analyze**: Check formatting inconsistencies
3. **Format**: Apply formatting rules
4. **Validate**: Verify formatting is correct
5. **Report**: Show what was changed

Key behaviors:
- Automatic formatter detection
- Consistent code style application
- Formatting rule enforcement
- Change reporting
- Configuration validation

## Tool Coordination
- **Bash**: Execute formatting commands
- **Read**: Check formatting configuration
- **Write**: Apply formatting changes
- **Grep**: Find formatting issues
- **Read**: Verify formatted code

## Key Patterns
- **Format Detection**: Find formatter → check config → format
- **Style Application**: Read rules → apply → validate
- **Change Reporting**: Track changes → report → confirm
- **Consistency Check**: Compare → identify → fix

## Examples

### Format All Files
```
/sc:format
# Formats entire project
# Applies consistent style
```

### Check Formatting (No Changes)
```
/sc:format --check
# Checks formatting without changing files
# Reports inconsistencies
```

### Format Specific Files
```
/sc:format apps/web-app/src/components
# Formats only specified directory
```

### Write Formatted Code
```
/sc:format --write
# Formats and saves changes
# Updates files with formatted code
```

## Boundaries

**Will:**
- Format code according to style rules
- Apply consistent formatting
- Check formatting compliance
- Report formatting changes

**Will Not:**
- Change code logic
- Modify functionality
- Ignore formatting rules
- Skip validation

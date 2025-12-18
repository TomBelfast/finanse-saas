---
name: replace
description: "Find and replace patterns across codebase"
category: utility
complexity: basic
mcp-servers: []
personas: []
---

# /sc:replace - Find and Replace

## Triggers
- Pattern replacement needs
- Refactoring across multiple files
- Code standardization requirements
- Bulk code updates

## Usage
```
/sc:replace [pattern] [replacement] [--files pattern] [--dry-run] [--regex]
```

## Behavioral Flow
1. **Search**: Find all occurrences of pattern
2. **Analyze**: Understand context of each match
3. **Verify**: Confirm replacements are safe
4. **Replace**: Apply replacements
5. **Validate**: Verify changes are correct

Key behaviors:
- Safe pattern replacement
- Context-aware replacements
- Multi-file updates
- Validation of changes
- Backup creation

## Tool Coordination
- **Grep**: Find pattern occurrences
- **Read**: Analyze context
- **Write**: Apply replacements
- **Codebase Search**: Understand usage
- **Bash**: Execute replacement commands

## Key Patterns
- **Pattern Matching**: Find → analyze → replace
- **Context Analysis**: Understand → verify → apply
- **Safe Replacement**: Check → backup → replace
- **Validation**: Verify → test → confirm

## Examples

### Simple Replacement
```
/sc:replace "oldFunction" "newFunction"
# Replaces all occurrences
# Updates function names
```

### Regex Replacement
```
/sc:replace "import.*from 'firebase'" "import.*from '@clerk/clerk-react'" --regex
# Uses regex pattern
# Replaces import statements
```

### File-Specific Replacement
```
/sc:replace "Component" "NewComponent" --files *.tsx
# Replaces only in .tsx files
# Focused replacement
```

### Dry Run
```
/sc:replace "old" "new" --dry-run
# Shows what would be replaced
# Does not modify files
```

## Boundaries

**Will:**
- Replace patterns safely
- Update multiple files
- Validate replacements
- Create backups

**Will Not:**
- Replace without verification
- Skip context analysis
- Modify without approval
- Break code functionality

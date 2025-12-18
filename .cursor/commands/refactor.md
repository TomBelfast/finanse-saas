---
name: refactor
description: "Refactor code to improve structure, readability, and maintainability without changing functionality"
category: code-improvement
complexity: intermediate
mcp-servers: []
personas: []
---

# /sc:refactor - Code Refactoring

## Triggers
- Code structure improvement requests
- Code smell identification and remediation
- Maintainability enhancement needs
- Performance optimization through refactoring
- Technical debt reduction requirements

## Usage
```
/sc:refactor [target] [--focus structure|performance|readability|patterns] [--dry-run]
```

## Behavioral Flow
1. **Analyze**: Examine code structure, patterns, and dependencies
2. **Identify**: Find refactoring opportunities and code smells
3. **Plan**: Create refactoring strategy with risk assessment
4. **Refactor**: Apply refactoring techniques systematically
5. **Validate**: Ensure functionality is preserved after refactoring

Key behaviors:
- Pattern recognition and application of design patterns
- Code smell detection (long methods, duplicate code, etc.)
- Incremental refactoring with validation at each step
- Preservation of existing functionality
- Documentation of refactoring changes

## Tool Coordination
- **Read**: Analyze source code structure and dependencies
- **Grep**: Find code patterns and duplicates
- **Write**: Apply refactoring changes
- **Bash**: Run tests to validate refactoring
- **Codebase Search**: Understand code relationships

## Key Patterns
- **Code Analysis**: Read code → identify issues → plan refactoring
- **Pattern Application**: Identify pattern → apply → validate
- **Incremental Refactoring**: Small changes → test → repeat
- **Functionality Preservation**: Refactor → test → verify behavior

## Examples

### Refactor Component Structure
```
/sc:refactor src/components/UserProfile
# Analyzes component structure
# Identifies refactoring opportunities
# Applies improvements (extract hooks, split components, etc.)
```

### Focus on Performance
```
/sc:refactor src/utils/dataProcessing --focus performance
# Identifies performance bottlenecks
# Applies performance optimizations
# Validates improvements
```

### Dry Run (Preview Changes)
```
/sc:refactor src/services/apiClient --dry-run
# Shows what would be refactored
# Provides preview of changes
# Does not modify files
```

### Improve Readability
```
/sc:refactor src/hooks/useUserData --focus readability
# Improves variable names
# Simplifies complex logic
# Adds comments and documentation
```

## Boundaries

**Will:**
- Improve code structure and organization
- Apply design patterns and best practices
- Reduce code duplication and complexity
- Enhance readability and maintainability

**Will Not:**
- Change functionality or behavior
- Remove features or break existing APIs
- Refactor without user approval (unless explicitly requested)
- Modify external dependencies

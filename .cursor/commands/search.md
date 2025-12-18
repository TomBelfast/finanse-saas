---
name: search
description: "Search codebase for patterns, functions, and references"
category: utility
complexity: basic
mcp-servers: []
personas: []
---

# /sc:search - Codebase Search

## Triggers
- Code pattern search needs
- Function location finding
- Reference tracking requirements
- Code exploration needs

## Usage
```
/sc:search [query] [--type function|variable|import|all] [--files pattern]
```

## Behavioral Flow
1. **Parse**: Understand search query
2. **Search**: Execute search across codebase
3. **Filter**: Apply type and file filters
4. **Rank**: Prioritize results by relevance
5. **Present**: Show results with context

Key behaviors:
- Semantic code search
- Pattern matching
- Reference tracking
- Context-aware results
- Multi-file search

## Tool Coordination
- **Grep**: Pattern-based search
- **Codebase Search**: Semantic search
- **Read**: Provide context for results
- **Glob**: Filter by file patterns

## Key Patterns
- **Query Parsing**: Parse → understand → search
- **Pattern Matching**: Search → match → rank
- **Context Extraction**: Find → extract → present
- **Result Ranking**: Score → sort → display

## Examples

### Search for Function
```
/sc:search getUserDetails
# Finds all occurrences of getUserDetails
# Shows function definitions and calls
```

### Search by Type
```
/sc:search apiClient --type import
# Finds all imports of apiClient
# Shows where it's used
```

### Search in Specific Files
```
/sc:search subscription --files *.tsx
# Searches only in .tsx files
# Focused results
```

### Comprehensive Search
```
/sc:search auth --type all
# Searches functions, variables, imports
# Comprehensive results
```

## Boundaries

**Will:**
- Search codebase effectively
- Find patterns and references
- Provide context for results
- Rank results by relevance

**Will Not:**
- Modify code
- Search external dependencies in detail
- Search binary files
- Skip validation

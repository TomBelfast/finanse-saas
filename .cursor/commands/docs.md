---
name: docs
description: "Generate and update documentation for code, APIs, and project components"
category: documentation
complexity: basic
mcp-servers: []
personas: []
---

# /sc:docs - Documentation Generation

## Triggers
- Documentation generation requests for code or APIs
- Documentation update needs after code changes
- API documentation creation requirements
- README and guide generation needs

## Usage
```
/sc:docs [target] [--type api|code|readme|guide] [--format markdown|html]
```

## Behavioral Flow
1. **Analyze**: Examine code structure, comments, and types
2. **Extract**: Gather information from code and comments
3. **Generate**: Create documentation based on analysis
4. **Format**: Structure documentation appropriately
5. **Update**: Save or update documentation files

Key behaviors:
- Automatic extraction of code comments and JSDoc
- API endpoint documentation from route definitions
- Type and interface documentation from TypeScript
- README generation from project structure
- Cross-referencing and linking

## Tool Coordination
- **Read**: Analyze source code and existing documentation
- **Grep**: Find comments, types, and API definitions
- **Write**: Generate documentation files
- **Glob**: Discover code files and structure
- **Codebase Search**: Understand relationships and dependencies

## Key Patterns
- **Code Analysis**: Read code → extract information → generate docs
- **API Documentation**: Find routes → extract schemas → document endpoints
- **Type Documentation**: Analyze types → document interfaces → generate reference
- **Structure Documentation**: Scan project → understand structure → document

## Examples

### Generate API Documentation
```
/sc:docs src/api --type api
# Analyzes API routes and endpoints
# Generates comprehensive API documentation
# Includes request/response schemas
```

### Code Documentation
```
/sc:docs src/components/Button --type code
# Extracts JSDoc comments
# Documents component props and usage
# Generates component documentation
```

### README Generation
```
/sc:docs --type readme
# Analyzes project structure
# Generates comprehensive README
# Includes setup, usage, and examples
```

### Update Existing Docs
```
/sc:docs src/utils --type code
# Updates documentation for changed code
# Maintains existing documentation structure
# Adds new information
```

## Boundaries

**Will:**
- Generate documentation from code analysis
- Extract information from comments and types
- Create well-structured documentation files
- Update existing documentation

**Will Not:**
- Modify source code (only reads and documents)
- Delete existing documentation (only updates)
- Generate documentation for external dependencies
- Create documentation without code context

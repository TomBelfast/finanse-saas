---
name: generate
description: "Generate code, components, and boilerplate"
category: code-generation
complexity: intermediate
mcp-servers: []
personas: []
---

# /sc:generate - Code Generation

## Triggers
- Component generation needs
- Boilerplate code creation
- File structure generation
- Template-based code creation

## Usage
```
/sc:generate [type] [name] [--template template-name] [--path path]
```

## Behavioral Flow
1. **Identify**: Determine what to generate
2. **Template**: Select or create template
3. **Generate**: Create code structure
4. **Customize**: Apply project-specific patterns
5. **Validate**: Verify generated code

Key behaviors:
- Template-based generation
- Project pattern recognition
- Code structure creation
- Automatic imports and exports
- Validation of generated code

## Tool Coordination
- **Read**: Analyze existing code patterns
- **Write**: Generate new files
- **Grep**: Find similar patterns
- **Codebase Search**: Understand project structure
- **Glob**: Discover templates

## Key Patterns
- **Pattern Recognition**: Analyze → identify → generate
- **Template Application**: Select → customize → create
- **Structure Generation**: Plan → create → validate
- **Code Customization**: Generate → adapt → verify

## Examples

### Generate Component
```
/sc:generate component Button
# Creates React component
# Adds to appropriate directory
# Includes tests and styles
```

### Generate API Route
```
/sc:generate route /api/users
# Creates API route handler
# Adds to routing structure
# Includes validation
```

### Generate Hook
```
/sc:generate hook useAuth
# Creates custom React hook
# Adds to hooks directory
# Includes TypeScript types
```

### Generate with Template
```
/sc:generate component Modal --template antd
# Generates component using Ant Design template
# Includes Ant Design patterns
```

## Boundaries

**Will:**
- Generate code from templates
- Create file structures
- Apply project patterns
- Validate generated code

**Will Not:**
- Overwrite existing files without warning
- Generate code without templates
- Create incomplete structures
- Skip validation

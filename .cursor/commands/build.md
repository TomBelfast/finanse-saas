---
name: build
description: "Build project for production or development with optimization and validation"
category: build
complexity: basic
mcp-servers: []
personas: []
---

# /sc:build - Project Build

## Triggers
- Production build requests
- Development build needs
- Build optimization requirements
- Build validation and verification

## Usage
```
/sc:build [--env production|development] [--optimize] [--validate] [--clean]
```

## Behavioral Flow
1. **Prepare**: Check dependencies and configuration
2. **Clean**: Remove old build artifacts (if --clean)
3. **Build**: Execute build process
4. **Optimize**: Apply optimizations (if --optimize)
5. **Validate**: Verify build output (if --validate)

Key behaviors:
- Automatic environment detection
- Build optimization for production
- Build artifact validation
- Error detection and reporting
- Build time optimization

## Tool Coordination
- **Bash**: Execute build commands (pnpm, npm, yarn)
- **Read**: Check build configuration
- **Glob**: Discover build output files
- **Write**: Generate build artifacts
- **Grep**: Find build errors

## Key Patterns
- **Build Execution**: Configure → build → validate
- **Optimization**: Analyze → optimize → verify
- **Validation**: Build → check → report
- **Error Handling**: Detect → report → suggest fixes

## Examples

### Production Build
```
/sc:build --env production
# Creates optimized production build
# Applies minification and tree-shaking
# Validates output
```

### Development Build
```
/sc:build --env development
# Creates development build
# Includes source maps
# Faster build time
```

### Clean Build
```
/sc:build --clean
# Removes old build artifacts
# Creates fresh build
```

### Optimized Build
```
/sc:build --env production --optimize
# Maximum optimization
# Code splitting
# Asset optimization
```

## Boundaries

**Will:**
- Execute build commands
- Optimize build output
- Validate build artifacts
- Report build errors

**Will Not:**
- Modify source code
- Change build configuration without approval
- Delete source files
- Install dependencies (use /sc:install)

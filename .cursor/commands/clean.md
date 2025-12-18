---
name: clean
description: "Clean build artifacts, cache, and temporary files"
category: maintenance
complexity: basic
mcp-servers: []
personas: []
---

# /sc:clean - Project Cleanup

## Triggers
- Build artifact cleanup needs
- Cache clearing requirements
- Temporary file removal
- Project cleanup before fresh build

## Usage
```
/sc:clean [--build] [--cache] [--node-modules] [--all]
```

## Behavioral Flow
1. **Identify**: Find files and directories to clean
2. **Verify**: Confirm safe to delete
3. **Backup**: Create backup if needed
4. **Clean**: Remove identified files
5. **Report**: Show what was cleaned

Key behaviors:
- Safe cleanup with verification
- Selective cleaning options
- Backup creation for important files
- Cleanup reporting
- Cache invalidation

## Tool Coordination
- **Glob**: Find files to clean
- **Bash**: Execute cleanup commands
- **Read**: Check what to clean
- **Grep**: Find temporary files
- **Write**: Create backup if needed

## Key Patterns
- **File Discovery**: Find → verify → clean
- **Safe Cleanup**: Check → backup → remove
- **Selective Cleaning**: Identify → filter → clean
- **Reporting**: Track → report → confirm

## Examples

### Clean Build Artifacts
```
/sc:clean --build
# Removes build directories
# Cleans compiled files
```

### Clear Cache
```
/sc:clean --cache
# Clears all caches
# Removes temporary files
```

### Full Cleanup
```
/sc:clean --all
# Removes build, cache, and temp files
# Complete project cleanup
```

### Clean Node Modules
```
/sc:clean --node-modules
# Removes node_modules
# Use before fresh install
```

## Boundaries

**Will:**
- Remove build artifacts
- Clear caches
- Clean temporary files
- Report cleanup actions

**Will Not:**
- Delete source files
- Remove configuration files
- Delete important data
- Clean without verification

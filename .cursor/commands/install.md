---
name: install
description: "Install project dependencies and packages"
category: configuration
complexity: basic
mcp-servers: []
personas: []
---

# /sc:install - Dependency Installation

## Triggers
- Dependency installation needs
- Package addition requirements
- Fresh install after clone
- Dependency update installation

## Usage
```
/sc:install [package] [--dev] [--peer] [--update]
```

## Behavioral Flow
1. **Analyze**: Check package.json and lock files
2. **Detect**: Identify package manager (pnpm, npm, yarn)
3. **Install**: Execute installation command
4. **Verify**: Check installation success
5. **Report**: Show installed packages

Key behaviors:
- Automatic package manager detection
- Dependency resolution
- Installation verification
- Lock file updates
- Error handling

## Tool Coordination
- **Read**: Check package.json
- **Bash**: Execute install commands
- **Grep**: Find dependency issues
- **Read**: Verify installation

## Key Patterns
- **Package Detection**: Find manager → check config → install
- **Dependency Resolution**: Analyze → resolve → install
- **Installation Verification**: Install → verify → report
- **Error Handling**: Detect → report → suggest fixes

## Examples

### Install All Dependencies
```
/sc:install
# Installs all dependencies from package.json
# Uses detected package manager
```

### Install Specific Package
```
/sc:install lodash
# Installs lodash package
# Adds to dependencies
```

### Install Dev Dependency
```
/sc:install @types/node --dev
# Installs as dev dependency
# Adds to devDependencies
```

### Update and Install
```
/sc:install --update
# Updates lock file
# Installs latest compatible versions
```

## Boundaries

**Will:**
- Install dependencies
- Update lock files
- Verify installations
- Report installation status

**Will Not:**
- Modify package.json without approval
- Remove existing dependencies
- Change package versions arbitrarily
- Install system packages

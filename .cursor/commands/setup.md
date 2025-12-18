---
name: setup
description: "Project setup, configuration, and environment preparation"
category: configuration
complexity: basic
mcp-servers: []
personas: []
---

# /sc:setup - Project Setup and Configuration

## Triggers
- New project setup requests
- Environment configuration needs
- Dependency installation requirements
- Development environment preparation

## Usage
```
/sc:setup [--env development|production|test] [--dependencies] [--config]
```

## Behavioral Flow
1. **Analyze**: Examine project structure and requirements
2. **Identify**: Find missing configurations and dependencies
3. **Configure**: Set up environment files and settings
4. **Install**: Install required dependencies
5. **Validate**: Verify setup is correct and complete

Key behaviors:
- Automatic detection of project type and requirements
- Environment file creation with proper values
- Dependency installation and verification
- Configuration file setup
- Setup validation and testing

## Tool Coordination
- **Read**: Analyze project files and package.json
- **Glob**: Discover project structure
- **Write**: Create configuration files
- **Bash**: Run installation commands
- **Grep**: Find existing configurations

## Key Patterns
- **Requirement Analysis**: Read project → identify needs → plan setup
- **Configuration Creation**: Template → values → save files
- **Dependency Management**: Analyze → install → verify
- **Setup Validation**: Check files → test → confirm

## Examples

### Full Project Setup
```
/sc:setup
# Analyzes project structure
# Creates .env files
# Installs dependencies
# Validates setup
```

### Development Environment
```
/sc:setup --env development
# Sets up development environment
# Creates .env.local with dev values
# Configures development tools
```

### Install Dependencies Only
```
/sc:setup --dependencies
# Installs all project dependencies
# Verifies installation
# Updates lock files
```

### Configuration Only
```
/sc:setup --config
# Creates configuration files
# Sets up environment variables
# Configures project settings
```

## Boundaries

**Will:**
- Create configuration files and environment setup
- Install project dependencies
- Set up development environment
- Validate setup completeness

**Will Not:**
- Modify existing configurations without backup
- Install system-level dependencies
- Change system settings
- Overwrite existing important files without warning

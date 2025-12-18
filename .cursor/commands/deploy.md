---
name: deploy
description: "Deployment preparation, validation, and execution"
category: deployment
complexity: advanced
mcp-servers: []
personas: []
---

# /sc:deploy - Deployment Management

## Triggers
- Deployment preparation requests
- Production build and validation needs
- Deployment configuration requirements
- Release preparation and validation

## Usage
```
/sc:deploy [--env staging|production] [--validate] [--build] [--dry-run]
```

## Behavioral Flow
1. **Prepare**: Check code quality and readiness
2. **Build**: Create production builds
3. **Validate**: Verify builds and configurations
4. **Configure**: Set up deployment settings
5. **Deploy**: Execute deployment (if not dry-run)

Key behaviors:
- Pre-deployment validation (tests, linting, types)
- Production build generation
- Environment configuration verification
- Deployment checklist validation
- Safe deployment practices

## Tool Coordination
- **Read**: Check deployment configs and build files
- **Bash**: Run build and deployment commands
- **Grep**: Find deployment configurations
- **Write**: Update deployment configs if needed
- **Glob**: Discover deployment files

## Key Patterns
- **Pre-Deployment Check**: Validate → test → verify
- **Build Process**: Configure → build → validate
- **Deployment Execution**: Prepare → deploy → verify
- **Rollback Planning**: Monitor → detect issues → rollback if needed

## Examples

### Deployment Validation
```
/sc:deploy --validate
# Runs tests and checks
# Validates build configuration
# Checks deployment readiness
```

### Production Build
```
/sc:deploy --env production --build
# Creates production build
# Optimizes assets
# Validates build output
```

### Dry Run Deployment
```
/sc:deploy --env staging --dry-run
# Simulates deployment process
# Shows what would be deployed
# Does not actually deploy
```

### Full Deployment
```
/sc:deploy --env production
# Validates everything
# Builds production version
# Executes deployment
```

## Boundaries

**Will:**
- Prepare and validate deployments
- Create production builds
- Verify deployment configurations
- Execute deployments with proper validation

**Will Not:**
- Deploy without validation (unless explicitly requested)
- Skip safety checks
- Modify production configurations without approval
- Deploy to production without staging validation

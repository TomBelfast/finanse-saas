---
name: index
description: "Generate comprehensive project documentation index and structure overview"
category: documentation
complexity: basic
mcp-servers: []
personas: []
---

# /sc:index - Project Documentation Index Generator

## Triggers
- Project documentation generation requests
- Documentation structure overview needs
- Quick reference creation for new developers
- Project navigation and structure documentation

## Usage
```
/sc:index
/sc/index
```

## Behavioral Flow
1. **Discover**: Scan project structure and identify documentation files
2. **Categorize**: Organize documentation by type (setup, architecture, API, etc.)
3. **Index**: Create comprehensive index with links and descriptions
4. **Update**: Update PROJECT_INDEX.md with current structure
5. **Report**: Present organized documentation overview

Key behaviors:
- Automatic discovery of documentation files in `docs/` directory
- Categorization by documentation type and purpose
- Generation of navigation-friendly index structure
- Links to all relevant documentation files
- Status tracking for documentation completeness

## Tool Coordination
- **Glob**: Discover documentation files in project
- **Read**: Read existing documentation to understand structure
- **Write**: Generate and update PROJECT_INDEX.md
- **Grep**: Find references and cross-links in documentation

## Key Patterns
- **Documentation Discovery**: Scan `docs/` → categorize → index
- **Structure Analysis**: Read existing docs → understand organization → update index
- **Link Generation**: File paths → markdown links → organized index
- **Status Tracking**: Documentation completeness → status indicators

## Examples

### Generate Full Documentation Index
```
/sc:index
# Scans all documentation and generates comprehensive index
# Updates docs/PROJECT_INDEX.md with current structure
```

### Update Documentation Index
```
/sc/index
# Re-scans documentation and updates index
# Adds new documentation files if found
```

## Output Structure

The command generates/updates `docs/PROJECT_INDEX.md` with:

- **Quick Reference**: Development servers, API endpoints, common commands
- **Documentation Categories**:
  - Quick Start & Setup
  - Architecture & Design
  - API Documentation
  - Components & UI
  - Backend Modules
  - Authentication & Security
  - Database & Data Models
  - Development Tools
  - Troubleshooting Guides
- **Navigation Guide**: For new developers, backend developers, frontend developers
- **Status Indicators**: ✅ Complete, 📝 In Progress, ⚠️ Needs Update

## Boundaries

**Will:**
- Scan and index all documentation files in the project
- Generate comprehensive navigation structure
- Update PROJECT_INDEX.md with current documentation state
- Create links and organize by category

**Will Not:**
- Modify existing documentation content (only index)
- Create new documentation files (only indexes existing)
- Delete or reorganize documentation files

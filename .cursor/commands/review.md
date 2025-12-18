---
name: review
description: "Code review and quality assessment with detailed feedback and recommendations"
category: quality-assurance
complexity: basic
mcp-servers: []
personas: []
---

# /sc:review - Code Review

## Triggers
- Code review requests for pull requests or changes
- Quality assessment needs before merging
- Best practices compliance checking
- Security and performance review requirements

## Usage
```
/sc:review [target] [--focus security|performance|best-practices|all] [--format detailed|summary]
```

## Behavioral Flow
1. **Examine**: Read and understand the code changes
2. **Analyze**: Check for issues, bugs, and improvements
3. **Evaluate**: Assess code quality, security, and performance
4. **Document**: Create detailed review with findings
5. **Recommend**: Provide actionable feedback and suggestions

Key behaviors:
- Comprehensive code analysis across multiple dimensions
- Security vulnerability detection
- Performance issue identification
- Best practices compliance checking
- Constructive feedback with examples

## Tool Coordination
- **Read**: Examine code files and changes
- **Grep**: Find patterns and potential issues
- **Codebase Search**: Understand context and dependencies
- **Write**: Generate review report
- **Glob**: Discover related files and dependencies

## Key Patterns
- **Code Examination**: Read changes → understand context → analyze
- **Issue Detection**: Pattern matching → issue identification → categorization
- **Review Generation**: Findings → recommendations → formatted report
- **Feedback Delivery**: Issues → examples → actionable suggestions

## Examples

### Review Recent Changes
```
/sc:review
# Reviews recent code changes
# Provides comprehensive feedback
# Highlights issues and improvements
```

### Security-Focused Review
```
/sc:review src/auth --focus security
# Deep security analysis
# Identifies vulnerabilities
# Provides security recommendations
```

### Performance Review
```
/sc:review src/components/Dashboard --focus performance
# Analyzes performance implications
# Identifies bottlenecks
# Suggests optimizations
```

### Summary Format
```
/sc:review src/utils --format summary
# Provides concise review summary
# Highlights key issues only
# Quick overview format
```

## Boundaries

**Will:**
- Provide detailed code review with findings
- Identify bugs, security issues, and improvements
- Offer constructive feedback and suggestions
- Check compliance with best practices

**Will Not:**
- Make changes to code (only reviews)
- Approve or reject changes (only provides feedback)
- Review external dependencies in detail
- Modify code without explicit request

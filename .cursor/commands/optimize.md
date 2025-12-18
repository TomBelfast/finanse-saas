---
name: optimize
description: "Optimize code, bundle size, and performance"
category: performance
complexity: intermediate
mcp-servers: []
personas: []
---

# /sc:optimize - Code Optimization

## Triggers
- Performance optimization needs
- Bundle size reduction requirements
- Code optimization requests
- Performance bottleneck resolution

## Usage
```
/sc:optimize [target] [--focus bundle|performance|code] [--analyze]
```

## Behavioral Flow
1. **Analyze**: Examine code and bundle
2. **Identify**: Find optimization opportunities
3. **Plan**: Create optimization strategy
4. **Optimize**: Apply optimizations
5. **Validate**: Verify improvements

Key behaviors:
- Bundle analysis
- Performance profiling
- Code optimization suggestions
- Size reduction techniques
- Performance measurement

## Tool Coordination
- **Read**: Analyze code structure
- **Bash**: Run optimization tools
- **Grep**: Find optimization targets
- **Codebase Search**: Understand dependencies
- **Write**: Apply optimizations

## Key Patterns
- **Analysis**: Examine → identify → plan
- **Optimization**: Apply → measure → verify
- **Bundle Optimization**: Analyze → reduce → validate
- **Performance Tuning**: Profile → optimize → test

## Examples

### Optimize Bundle Size
```
/sc:optimize --focus bundle
# Analyzes bundle
# Identifies large dependencies
# Suggests code splitting
```

### Performance Optimization
```
/sc:optimize apps/web-app/src --focus performance
# Profiles performance
# Identifies bottlenecks
# Applies optimizations
```

### Code Optimization
```
/sc:optimize src/utils --focus code
# Optimizes code structure
# Reduces complexity
# Improves efficiency
```

### Analysis Only
```
/sc:optimize --analyze
# Analyzes without making changes
# Provides optimization report
```

## Boundaries

**Will:**
- Optimize code and bundles
- Improve performance
- Reduce bundle size
- Provide optimization reports

**Will Not:**
- Change functionality
- Break existing features
- Optimize without analysis
- Skip validation

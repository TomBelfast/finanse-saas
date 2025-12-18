---
name: test
description: "Run tests, generate test cases, and validate code functionality"
category: testing
complexity: basic
mcp-servers: []
personas: []
---

# /sc:test - Testing and Test Generation

## Triggers
- Test execution requests for specific components or modules
- Test case generation needs for new features
- Test coverage analysis and validation
- Integration and unit test requirements

## Usage
```
/sc:test [target] [--type unit|integration|e2e] [--generate] [--coverage]
```

## Behavioral Flow
1. **Discover**: Identify test files and test frameworks in project
2. **Analyze**: Understand code structure and dependencies
3. **Execute**: Run existing tests or generate new test cases
4. **Validate**: Check test coverage and results
5. **Report**: Present test results and coverage metrics

Key behaviors:
- Automatic test framework detection (Jest, Vitest, Mocha, etc.)
- Test case generation based on code analysis
- Test execution with proper environment setup
- Coverage analysis and reporting
- Test result interpretation and recommendations

## Tool Coordination
- **Read**: Analyze source code and existing tests
- **Grep**: Find test files and test patterns
- **Bash**: Execute test commands (npm, pnpm, yarn)
- **Write**: Generate test files and test cases
- **Glob**: Discover test files in project structure

## Key Patterns
- **Test Discovery**: Find test files → identify framework → execute
- **Test Generation**: Analyze code → generate test cases → create test files
- **Coverage Analysis**: Run tests → collect coverage → report metrics
- **Test Validation**: Execute tests → interpret results → provide feedback

## Examples

### Run All Tests
```
/sc:test
# Discovers and runs all tests in the project
# Uses appropriate test runner (pnpm test, npm test, etc.)
```

### Generate Tests for Component
```
/sc:test src/components/Button --generate
# Analyzes Button component
# Generates comprehensive test cases
# Creates test file with proper setup
```

### Check Test Coverage
```
/sc:test --coverage
# Runs tests with coverage collection
# Generates coverage report
# Identifies untested code areas
```

### Run Specific Test Type
```
/sc:test --type integration
# Runs only integration tests
# Filters test files by type
```

## Boundaries

**Will:**
- Execute existing tests using project's test framework
- Generate test cases based on code analysis
- Provide test coverage reports and metrics
- Identify test gaps and suggest improvements

**Will Not:**
- Modify source code to make it testable (without explicit request)
- Delete or modify existing tests (only generates new ones)
- Install test dependencies (assumes they exist)

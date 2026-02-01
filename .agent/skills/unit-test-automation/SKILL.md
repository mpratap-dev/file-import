---
name: unit-test-automation
description: Autonomously creates and verifies unit tests with 100% diff coverage.
---

# Unit Test Automation Skill

## Goal
To automate an 8-step unit testing cycle ensuring high quality and coverage without regressing source logic.

## Instructions

1. **Detect Changes**: Run `git diff -U0` to isolate modified lines for minimal token usage.
2. **Identify Files**: Map identified changes to their respective source files.
3. **Verify Tests**: Search for existing test files (e.g., `*.test.ts`, `*.spec.ts`, or `__tests__` folder).
4. **Generate/Update**: Create new test files or update existing suites based on the findings.
5. **Lint/TypeScript**: Execute `npx tsc` or the project linter and fix errors within the test files only.
6. **Iterative Test Execution**:
    - Run the test runner (e.g., `npm test` or `jest`).
    - If failures occur, analyze the stack trace and fix test files only.
    - **Constraint**: Never modify source/feature files to make tests pass.
7. **Coverage Analysis**: Execute your coverage tool to generate an XML/JSON report.
8. **Verify Thresholds**:
    - Use `diff-cover` to verify that modified lines have 100% coverage.
    - Confirm global project coverage is at least 90%.

## Constraints
- **Source Integrity**: Only files matching test patterns (e.g., `*.test.ts`) can be modified during Step 6.
- **Thresholds**: Task must fail if Diff Coverage is < 100% or Total Coverage is < 90%.
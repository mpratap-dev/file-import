---
name: unit-test-automation
description: Autonomously creates and verifies unit tests, focusing on critical business logic and high-risk areas.
---

# Unit Test Automation Skill

## Goal
To automate an 8-step unit testing cycle ensuring high quality and coverage without regressing source logic.

## Instructions

1. **Detect Changes**: Run `git diff -U0` to isolate modified lines for minimal token usage.
2. **Identify Files**: Map identified changes to their respective source files.
3. **Verify Location**: Check for a `__tests__` directory in the same directory as the source file.
4. **Generate/Update**:
    - **Directory**: Ensure a `__tests__` directory exists at the same level as the source file. Create it if missing.
    - **Test File**: Create or update the test file *inside* this `__tests__` directory.
5. **Lint/TypeScript**: Execute `npx tsc` or the project linter and fix errors within the test files only.
6. **Iterative Test Execution**:
    - Run the test runner (e.g., `npm test` or `jest`).
    - If failures occur, analyze the stack trace and fix test files only.
    - **Constraint**: Never modify source/feature files to make tests pass.
7. **Coverage Analysis**: Execute your coverage tool to generate an XML/JSON report.
8. **Verify Thresholds**:
    - **Diff Coverage**: Ensure critical business logic, security, and high-risk areas in modified lines are covered.
    - Confirm code coverage for the changes in the current feature branch is at least 90%.

## Constraints
- **Source Integrity**: Only files matching test patterns (e.g., `*.test.ts`, `*.test.tsx`) can be modified during Step 6.
- **Thresholds**: Task must fail if critical business logic is untested or if the code coverage for the changes in the current feature branch is < 90%.
- **Comments**: Avoid useless comments. Add comments only where you need to explain *why* something is written, not *what* is going on. The code should be self-explanatory.
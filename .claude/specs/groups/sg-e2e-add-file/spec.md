---
id: sg-e2e-add-file
title: "E2E Test: Add Generated File"
type: task-spec
status: approved
date: 2026-01-25
owner: orchestrator
scope: Minimal E2E test spec for file creation
dependencies: []
contracts: []
implementation_status: not_started
---

# E2E Test: Add Generated File

## Context

This is a minimal spec for E2E orchestration testing. The orchestrator dispatches jobs to Claude Code, which executes specs to produce PRs. This spec validates the full pipeline works by creating a simple TypeScript file.

## Goals / Non-goals

**Goals**:
- Create a generated TypeScript file in the repository root
- Open a PR with the changes
- Validate the orchestrator → Claude Code → PR pipeline

**Non-goals**:
- Complex logic or validation
- Multiple file operations
- External service integration

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | Create `generated-timestamp.ts` file | Must Have |
| R2 | File contains valid TypeScript exports | Must Have |
| R3 | Open PR to branch `sg-e2e-add-file/implement` | Must Have |

## Task List

- [ ] Create file `generated-timestamp.ts` with TypeScript content
- [ ] Git add and commit with message "feat: add generated file for E2E test"
- [ ] Push to branch `sg-e2e-add-file/implement`
- [ ] Open PR to main with title "E2E Test: Add generated file"

## Implementation Details

Create a new file named `generated-timestamp.ts` in the repository root:

```typescript
// Auto-generated file for E2E testing
export const E2E_TEST_MARKER = 'e2e-add-file-test';
export const GENERATED_AT = new Date().toISOString();
```

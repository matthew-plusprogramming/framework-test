---
id: sg-e2e-undo-file
title: "E2E Test: Remove Generated File"
type: task-spec
status: approved
date: 2026-01-25
owner: orchestrator
scope: Minimal E2E test spec for file removal
dependencies: []
contracts: []
implementation_status: not_started
---

# E2E Test: Remove Generated File

## Context

This is a minimal spec for E2E orchestration testing. It validates the orchestrator can execute specs that remove files. This is the counterpart to `sg-e2e-add-file`.

## Goals / Non-goals

**Goals**:
- Remove the generated TypeScript file from the repository
- Open a PR with the changes
- Validate file deletion through the orchestrator pipeline

**Non-goals**:
- Complex logic or validation
- Multiple file operations
- External service integration

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | Remove `generated-timestamp.ts` if it exists | Must Have |
| R2 | Create marker file if nothing to remove | Should Have |
| R3 | Open PR to branch `sg-e2e-undo-file/implement` | Must Have |

## Task List

- [ ] Check if `generated-timestamp.ts` exists
- [ ] Delete the file (or create `.e2e-cleanup-marker` if file doesn't exist)
- [ ] Git add and commit with message "feat: remove generated file for E2E test"
- [ ] Push to branch `sg-e2e-undo-file/implement`
- [ ] Open PR to main with title "E2E Test: Remove generated file"

## Implementation Details

1. Check if `generated-timestamp.ts` exists in repository root
2. If it exists, delete it
3. If it doesn't exist, create `.e2e-cleanup-marker` so there's a change to commit
4. Commit and push to open a PR

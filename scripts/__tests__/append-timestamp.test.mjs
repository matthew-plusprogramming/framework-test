/**
 * Unit tests for append-timestamp.mjs
 *
 * Tests: as-001-append-timestamp
 *
 * Run with: node --test scripts/__tests__/append-timestamp.test.mjs
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { appendTimestamp } from '../append-timestamp.mjs';

/** ISO 8601 regex — matches e.g. 2026-02-15T12:00:00.000Z */
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe('appendTimestamp - as-001-append-timestamp', () => {
  let tmpDir;
  let filePath;

  beforeEach(() => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    tmpDir = join(tmpdir(), `smoke-test-${id}`);
    mkdirSync(tmpDir, { recursive: true });
    filePath = join(tmpDir, 'SMOKE_TEST.md');
  });

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch { /* ignore */ }
  });

  // AC1: When SMOKE_TEST.md exists, a new line with an ISO timestamp is appended
  it('should append a timestamp line to an existing file (as-001 AC1)', () => {
    // Arrange
    writeFileSync(filePath, '# Smoke Test Log\n', 'utf-8');

    // Act
    const result = appendTimestamp(filePath);

    // Assert
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    assert.equal(lines.length, 2, 'Should have header + 1 timestamp line');
    assert.match(lines[1], ISO_8601_REGEX, 'Second line should be ISO timestamp');
    assert.equal(result.created, false, 'Should not report file as created');
  });

  // AC2: When SMOKE_TEST.md does not exist, it is created with header then timestamp
  it('should create file with header when it does not exist (as-001 AC2)', () => {
    // Arrange — file does not exist
    assert.ok(!existsSync(filePath), 'File should not exist before test');

    // Act
    const result = appendTimestamp(filePath);

    // Assert
    assert.ok(existsSync(filePath), 'File should exist after call');
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    assert.equal(lines[0], '# Smoke Test Log', 'First line should be the header');
    assert.match(lines[1], ISO_8601_REGEX, 'Second line should be ISO timestamp');
    assert.equal(result.created, true, 'Should report file as created');
  });

  // AC3: The timestamp is a valid ISO 8601 string
  it('should produce a valid ISO 8601 timestamp (as-001 AC3)', () => {
    // Arrange
    writeFileSync(filePath, '# Smoke Test Log\n', 'utf-8');
    const fixedDate = new Date('2026-02-15T12:30:45.123Z');

    // Act
    const result = appendTimestamp(filePath, fixedDate);

    // Assert
    assert.equal(result.timestamp, '2026-02-15T12:30:45.123Z');
    assert.match(result.timestamp, ISO_8601_REGEX);
    // Verify it round-trips through Date parsing
    assert.equal(new Date(result.timestamp).toISOString(), result.timestamp);
  });

  // AC4: Existing content in SMOKE_TEST.md is preserved (not overwritten)
  it('should preserve existing content when appending (as-001 AC4)', () => {
    // Arrange
    const existingContent = '# Smoke Test Log\n2026-01-01T00:00:00.000Z\n2026-01-02T00:00:00.000Z\n';
    writeFileSync(filePath, existingContent, 'utf-8');

    // Act
    appendTimestamp(filePath);

    // Assert
    const content = readFileSync(filePath, 'utf-8');
    assert.ok(content.startsWith(existingContent), 'Original content should be preserved at the start');
    const lines = content.split('\n').filter(Boolean);
    assert.equal(lines.length, 4, 'Should have header + 2 existing timestamps + 1 new timestamp');
    assert.equal(lines[0], '# Smoke Test Log');
    assert.equal(lines[1], '2026-01-01T00:00:00.000Z');
    assert.equal(lines[2], '2026-01-02T00:00:00.000Z');
    assert.match(lines[3], ISO_8601_REGEX, 'New timestamp should be appended at end');
  });

  // Edge case: multiple appends accumulate
  it('should accumulate multiple timestamps on successive calls (as-001 AC1+AC4)', () => {
    // Arrange
    writeFileSync(filePath, '# Smoke Test Log\n', 'utf-8');

    // Act
    appendTimestamp(filePath, new Date('2026-02-15T01:00:00.000Z'));
    appendTimestamp(filePath, new Date('2026-02-15T02:00:00.000Z'));
    appendTimestamp(filePath, new Date('2026-02-15T03:00:00.000Z'));

    // Assert
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    assert.equal(lines.length, 4, 'Should have header + 3 timestamps');
    assert.equal(lines[1], '2026-02-15T01:00:00.000Z');
    assert.equal(lines[2], '2026-02-15T02:00:00.000Z');
    assert.equal(lines[3], '2026-02-15T03:00:00.000Z');
  });
});

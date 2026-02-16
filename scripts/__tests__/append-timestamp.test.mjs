/**
 * Unit tests for append-timestamp.mjs
 *
 * Tests: as-001-append-timestamp (sg-smoke-test-e2e)
 *
 * Run with: node --test scripts/__tests__/append-timestamp.test.mjs
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { appendTimestamp } from '../append-timestamp.mjs';

describe('appendTimestamp - as-001: Append ISO Timestamp', () => {
  let testDir;
  let filePath;

  beforeEach(() => {
    // Arrange - create a unique temp directory per test
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    testDir = join(tmpdir(), `smoke-test-${id}`);
    mkdirSync(testDir, { recursive: true });
    filePath = join(testDir, 'SMOKE_TEST.md');
  });

  afterEach(() => {
    // Cleanup
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch { /* ignore */ }
  });

  describe('AC1: appends ISO 8601 timestamp line', () => {
    it('should append a line with an ISO 8601 timestamp (as-001 AC1)', () => {
      // Arrange
      const fixedDate = new Date('2026-02-15T12:00:00Z');
      writeFileSync(filePath, '# Smoke Test Log\n\n', 'utf-8');

      // Act
      appendTimestamp(filePath, fixedDate);

      // Assert
      const content = readFileSync(filePath, 'utf-8');
      assert.ok(content.includes('- 2026-02-15T12:00:00Z'), `Expected timestamp line, got:\n${content}`);
    });

    it('should produce a valid ISO 8601 timestamp format (as-001 AC1)', () => {
      // Arrange
      writeFileSync(filePath, '# Smoke Test Log\n\n', 'utf-8');

      // Act
      appendTimestamp(filePath);

      // Assert
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      // Match pattern: - YYYY-MM-DDTHH:MM:SSZ
      assert.match(lastLine, /^- \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, `Timestamp line should match ISO 8601 format, got: ${lastLine}`);
    });
  });

  describe('AC2: creates file with header when it does not exist', () => {
    it('should create SMOKE_TEST.md with header if it does not exist (as-001 AC2)', () => {
      // Arrange - file does not exist
      assert.ok(!existsSync(filePath), 'File should not exist before test');
      const fixedDate = new Date('2026-02-15T12:00:00Z');

      // Act
      appendTimestamp(filePath, fixedDate);

      // Assert
      assert.ok(existsSync(filePath), 'File should be created');
      const content = readFileSync(filePath, 'utf-8');
      assert.ok(content.startsWith('# Smoke Test Log\n\n'), `File should start with header, got:\n${content}`);
      assert.ok(content.includes('- 2026-02-15T12:00:00Z'), `File should contain timestamp, got:\n${content}`);
    });
  });

  describe('AC3: preserves existing content', () => {
    it('should preserve existing content when appending (as-001 AC3)', () => {
      // Arrange
      const existingContent = '# Smoke Test Log\n\n- 2026-02-14T10:00:00Z\n';
      writeFileSync(filePath, existingContent, 'utf-8');
      const fixedDate = new Date('2026-02-15T12:00:00Z');

      // Act
      appendTimestamp(filePath, fixedDate);

      // Assert
      const content = readFileSync(filePath, 'utf-8');
      assert.ok(content.startsWith('# Smoke Test Log\n\n'), 'Header should be preserved');
      assert.ok(content.includes('- 2026-02-14T10:00:00Z'), 'Existing timestamp should be preserved');
      assert.ok(content.includes('- 2026-02-15T12:00:00Z'), 'New timestamp should be appended');
    });

    it('should append multiple timestamps in order (as-001 AC3)', () => {
      // Arrange
      writeFileSync(filePath, '# Smoke Test Log\n\n', 'utf-8');
      const date1 = new Date('2026-02-15T10:00:00Z');
      const date2 = new Date('2026-02-15T11:00:00Z');
      const date3 = new Date('2026-02-15T12:00:00Z');

      // Act
      appendTimestamp(filePath, date1);
      appendTimestamp(filePath, date2);
      appendTimestamp(filePath, date3);

      // Assert
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.trim().split('\n');
      const timestampLines = lines.filter((l) => l.startsWith('- '));
      assert.equal(timestampLines.length, 3, `Expected 3 timestamp lines, got ${timestampLines.length}`);
      assert.equal(timestampLines[0], '- 2026-02-15T10:00:00Z');
      assert.equal(timestampLines[1], '- 2026-02-15T11:00:00Z');
      assert.equal(timestampLines[2], '- 2026-02-15T12:00:00Z');
    });
  });
});

/**
 * Tests for append-smoke-timestamp.mjs
 *
 * Validates: as-001-append-timestamp acceptance criteria
 *   AC1: SMOKE_TEST.md contains a new line with an ISO 8601 timestamp
 *   AC2: File is created with header if it does not exist
 *   AC3: Script is runnable as standalone Node.js script
 *
 * Run with: node --test tests/append-smoke-timestamp.test.mjs
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { appendTimestamp } from '../scripts/append-smoke-timestamp.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = resolve(__dirname, '..', 'scripts', 'append-smoke-timestamp.mjs');

describe('appendTimestamp - as-001: Append ISO Timestamp', () => {
  let tempDir;
  let filePath;

  beforeEach(() => {
    // Arrange - Create unique temp directory for each test
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    tempDir = join(tmpdir(), `smoke-test-${timestamp}-${randomSuffix}`);
    mkdirSync(tempDir, { recursive: true });
    filePath = join(tempDir, 'SMOKE_TEST.md');
  });

  afterEach(() => {
    // Cleanup
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch { /* ignore */ }
  });

  describe('AC1: Appends ISO timestamp line to existing file', () => {
    it('should append ISO timestamp line to existing SMOKE_TEST.md (as-001 AC1)', () => {
      // Arrange
      writeFileSync(filePath, '# Smoke Test Log\n\n', 'utf-8');
      const fixedDate = new Date('2026-02-15T12:00:00Z');

      // Act
      appendTimestamp(filePath, fixedDate);

      // Assert
      const content = readFileSync(filePath, 'utf-8');
      assert.ok(content.includes('- 2026-02-15T12:00:00Z'), 'Should contain timestamp line');
    });

    it('should append timestamp in ISO 8601 format (as-001 AC1)', () => {
      // Arrange
      writeFileSync(filePath, '# Smoke Test Log\n\n', 'utf-8');

      // Act
      appendTimestamp(filePath);

      // Assert
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter((l) => l.startsWith('- '));
      assert.equal(lines.length, 1, 'Should have exactly one timestamp line');

      const timestampStr = lines[0].replace('- ', '');
      assert.match(timestampStr, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'Should match ISO 8601 format');
    });

    it('should preserve existing content when appending (as-001 AC1)', () => {
      // Arrange
      const existing = '# Smoke Test Log\n\n- 2026-02-14T10:00:00Z\n';
      writeFileSync(filePath, existing, 'utf-8');
      const fixedDate = new Date('2026-02-15T12:00:00Z');

      // Act
      appendTimestamp(filePath, fixedDate);

      // Assert
      const content = readFileSync(filePath, 'utf-8');
      assert.ok(content.includes('- 2026-02-14T10:00:00Z'), 'Should preserve existing timestamp');
      assert.ok(content.includes('- 2026-02-15T12:00:00Z'), 'Should contain new timestamp');
    });
  });

  describe('AC2: Creates file with header when it does not exist', () => {
    it('should create file with header when it does not exist (as-001 AC2)', () => {
      // Arrange - file does not exist
      assert.ok(!existsSync(filePath), 'File should not exist before test');
      const fixedDate = new Date('2026-02-15T12:00:00Z');

      // Act
      appendTimestamp(filePath, fixedDate);

      // Assert
      assert.ok(existsSync(filePath), 'File should be created');
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      assert.equal(lines[0], '# Smoke Test Log', 'First line should be the header');
      assert.ok(content.includes('- 2026-02-15T12:00:00Z'), 'Should contain timestamp');
    });
  });

  describe('AC3: Runnable as standalone script', () => {
    it('should be runnable with node and accept target path argument (as-001 AC3)', () => {
      // Arrange - file does not exist
      assert.ok(!existsSync(filePath), 'File should not exist before test');

      // Act
      execFileSync('node', [SCRIPT_PATH, filePath], { encoding: 'utf-8' });

      // Assert
      assert.ok(existsSync(filePath), 'File should be created by script');
      const content = readFileSync(filePath, 'utf-8');
      assert.ok(content.startsWith('# Smoke Test Log'), 'Should start with header');
      const timestampLines = content.split('\n').filter((l) => l.startsWith('- '));
      assert.equal(timestampLines.length, 1, 'Should have one timestamp line');
      assert.match(
        timestampLines[0].replace('- ', ''),
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
        'Timestamp should be ISO 8601 format',
      );
    });
  });
});

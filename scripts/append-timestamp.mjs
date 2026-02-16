#!/usr/bin/env node

/**
 * Append an ISO 8601 timestamp to SMOKE_TEST.md.
 *
 * - If SMOKE_TEST.md does not exist, creates it with a header first.
 * - Appends a line `- <ISO timestamp>` to the file.
 *
 * Implements: as-001-append-timestamp (sg-smoke-test-e2e)
 */

import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const HEADER = '# Smoke Test Log\n\n';

/**
 * Append an ISO timestamp line to the given file path.
 * Creates the file with a header if it does not exist.
 *
 * @param {string} filePath - Absolute path to SMOKE_TEST.md
 * @param {Date} [now] - Optional date for testing; defaults to new Date()
 */
export function appendTimestamp(filePath, now = new Date()) {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, HEADER, 'utf-8');
  }

  const timestamp = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
  appendFileSync(filePath, `- ${timestamp}\n`, 'utf-8');
}

// CLI entry point
const isDirectRun = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isDirectRun) {
  const root = process.env.REPO_ROOT || process.cwd();
  const filePath = join(root, 'SMOKE_TEST.md');
  appendTimestamp(filePath);
  console.log(`Timestamp appended to ${filePath}`);
}

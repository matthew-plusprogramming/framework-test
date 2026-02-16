#!/usr/bin/env node

/**
 * Appends the current ISO 8601 timestamp to SMOKE_TEST.md.
 * Creates the file with a header if it does not exist.
 *
 * Usage: node scripts/append-smoke-timestamp.mjs [target-path]
 *   target-path: optional path to SMOKE_TEST.md (defaults to SMOKE_TEST.md in cwd)
 */

import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';

const HEADER = '# Smoke Test Log\n';

/**
 * Append an ISO timestamp line to the given file path.
 * If the file does not exist, creates it with a header first.
 *
 * @param {string} filePath - absolute or relative path to SMOKE_TEST.md
 * @param {Date} [now] - optional Date to use (for testing); defaults to new Date()
 */
export function appendTimestamp(filePath, now) {
  const timestamp = (now || new Date()).toISOString().replace(/\.\d{3}Z$/, 'Z');

  if (!existsSync(filePath)) {
    writeFileSync(filePath, HEADER + '\n', 'utf-8');
  }

  appendFileSync(filePath, `- ${timestamp}\n`, 'utf-8');
}

// CLI entry point
const isMainModule = process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.url.replace('file://', ''));
if (isMainModule) {
  const target = process.argv[2] || resolve(process.cwd(), 'SMOKE_TEST.md');
  appendTimestamp(target);
}

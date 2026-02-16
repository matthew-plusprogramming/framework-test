#!/usr/bin/env node

/**
 * Appends an ISO 8601 timestamp line to a target file.
 * Creates the file with a "# Smoke Test Log" header if it does not exist.
 *
 * Usage: node scripts/append-timestamp.mjs [filePath]
 *   Defaults to SMOKE_TEST.md in the repository root.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const HEADER = '# Smoke Test Log';

/**
 * Appends a timestamp line to the given file path.
 * If the file does not exist, creates it with a header first.
 *
 * @param {string} filePath - Absolute or relative path to the target file
 * @param {Date} [now] - Optional date to use (for testing); defaults to new Date()
 * @returns {{ created: boolean, timestamp: string }} Result metadata
 */
export function appendTimestamp(filePath, now) {
  const timestamp = (now || new Date()).toISOString();
  let created = false;

  let content;
  if (existsSync(filePath)) {
    content = readFileSync(filePath, 'utf-8');
  } else {
    content = HEADER + '\n';
    created = true;
  }

  content += timestamp + '\n';
  writeFileSync(filePath, content, 'utf-8');

  return { created, timestamp };
}

// CLI entrypoint
const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const target = process.argv[2] || resolve(process.argv[1], '../../SMOKE_TEST.md');
  const { created, timestamp } = appendTimestamp(target);
  if (created) {
    console.log(`Created ${target} with header`);
  }
  console.log(`Appended timestamp: ${timestamp}`);
}

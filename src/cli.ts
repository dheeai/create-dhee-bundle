#!/usr/bin/env node
/**
 * Thin argv wrapper around scaffoldBundle. Supports:
 *   npm create dhee-bundle <name> [--id <bundleId>] [--display "Name"]
 *     [--summary "..."] [--dir <path>] [--force]
 */
import { scaffoldBundle, type ScaffoldBundleOptions } from './index.js';

interface ParsedArgs {
  positionals: string[];
  flags: Record<string, string | boolean>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
    } else {
      positionals.push(a);
    }
  }
  return { positionals, flags };
}

const USAGE = `create-dhee-bundle — scaffold a dhee-bundle-* package

Usage:
  npm create dhee-bundle <name> [options]

Arguments:
  <name>            Package name (e.g. dhee-bundle-infographics, @acme/dhee-bundle-x)

Options:
  --id <bundleId>   Bundle id (default: derived from name)
  --display <name>  Human display name
  --summary <text>  One-line summary
  --dir <path>      Target directory (default: ./<short-name>)
  --force           Write into a non-empty directory
  -h, --help        Show this help
`;

export function main(argv: string[]): number {
  const { positionals, flags } = parseArgs(argv);
  if (flags['help'] || flags['h'] || positionals.length === 0) {
    process.stdout.write(USAGE);
    return positionals.length === 0 && !flags['help'] && !flags['h'] ? 1 : 0;
  }

  const opts: ScaffoldBundleOptions = { name: positionals[0]! };
  if (typeof flags['id'] === 'string') opts.bundleId = flags['id'];
  if (typeof flags['display'] === 'string') opts.displayName = flags['display'];
  if (typeof flags['summary'] === 'string') opts.summary = flags['summary'];
  if (typeof flags['dir'] === 'string') opts.targetDir = flags['dir'];
  if (flags['force']) opts.force = true;

  try {
    const result = scaffoldBundle(opts);
    process.stdout.write(`\n✓ Scaffolded ${result.vars.name} (bundle id: ${result.vars.bundleId})\n`);
    process.stdout.write(`  → ${result.targetDir}\n`);
    for (const f of result.files) process.stdout.write(`    ${f}\n`);
    process.stdout.write(`\nReference it as:\n  npm:${result.vars.name}#${result.vars.bundleId}\n`);
    return 0;
  } catch (err) {
    process.stderr.write(`\n✗ ${err instanceof Error ? err.message : String(err)}\n`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main(process.argv.slice(2)));
}

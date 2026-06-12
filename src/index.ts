/**
 * create-dhee-bundle — scaffolds a new `dhee-bundle-*` package: a pure-data
 * pipeline package (package.json + bundles/<id>/{bundle.json,prompts,schemas,inputs}).
 *
 * scaffoldBundle is a pure function (writes into a target dir) so it can be
 * unit-tested without spawning a process. cli.ts is the argv wrapper.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import {
  briefInput,
  bundleJson,
  license,
  packageJson,
  planSchema,
  promptOutline,
  promptPlan,
  readme,
  shortName,
  type BundleTemplateVars,
} from './templates.js';

export interface ScaffoldBundleOptions {
  /** npm package name. Must match the dhee-bundle-* convention. */
  name: string;
  /** Bundle id. Default derived from name (snake_case of short name). */
  bundleId?: string;
  /** Human display name. Default derived. */
  displayName?: string;
  /** One-line summary. */
  summary?: string;
  /** Directory to create the package in. Default <cwd>/<short name>. */
  targetDir?: string;
  /** Allow writing into a non-empty directory. Default false. */
  force?: boolean;
}

export interface ScaffoldBundleResult {
  targetDir: string;
  files: string[];
  vars: BundleTemplateVars;
}

const NAME_RE = /^(@[^/]+\/)?dhee-bundle(-[a-z0-9-]+)?$/;
const ID_RE = /^[a-z][a-z0-9_]*$/;

export function scaffoldBundle(opts: ScaffoldBundleOptions): ScaffoldBundleResult {
  const name = opts.name.trim();
  if (!NAME_RE.test(name)) {
    throw new Error(
      `Invalid package name "${name}". Must match the dhee-bundle-* convention, e.g. "dhee-bundle-infographics" or "@acme/dhee-bundle-x".`,
    );
  }

  const seg = shortName(name);
  const bundleId = (opts.bundleId ?? seg.replace(/-/g, '_')).trim();
  if (!ID_RE.test(bundleId)) {
    throw new Error(`Invalid bundle id "${bundleId}". Use a lowercase snake_case id, e.g. "infographics".`);
  }

  const vars: BundleTemplateVars = {
    name,
    bundleId,
    displayName: opts.displayName ?? titleCase(seg),
    summary: opts.summary ?? `Dhee pipeline bundle (${bundleId}).`,
  };

  const targetDir = resolve(opts.targetDir ?? join(process.cwd(), seg));
  if (existsSync(targetDir) && readdirSync(targetDir).length > 0 && !opts.force) {
    throw new Error(`Target directory ${targetDir} is not empty. Pass force:true (or --force) to write anyway.`);
  }

  const b = `bundles/${bundleId}`;
  const files: Record<string, string> = {
    'package.json': packageJson(vars),
    'README.md': readme(vars),
    'LICENSE': license(),
    [`${b}/bundle.json`]: bundleJson(vars),
    [`${b}/inputs/brief.md`]: briefInput(vars),
    [`${b}/prompts/outline.md`]: promptOutline(vars),
    [`${b}/prompts/plan.md`]: promptPlan(vars),
    [`${b}/schemas/plan.schema.json`]: planSchema(),
  };

  const written: string[] = [];
  for (const [rel, content] of Object.entries(files)) {
    const abs = join(targetDir, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
    written.push(rel);
  }

  return { targetDir, files: written.sort(), vars };
}

function titleCase(s: string): string {
  return s
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

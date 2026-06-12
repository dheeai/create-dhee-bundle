/**
 * File-content builders for the create-dhee-bundle scaffolder. A bundle
 * package is pure data (no build step): a package.json declaring the
 * `dhee-bundle` keyword + a `dhee.bundles` directory, and one bundle dir
 * (bundle.json + prompts/ + schemas/).
 */

export interface BundleTemplateVars {
  /** npm package name (e.g. "dhee-bundle-infographics" or "@acme/dhee-bundle-x"). */
  name: string;
  /** Bundle id (the `id` field + directory name). */
  bundleId: string;
  /** Human display name. */
  displayName: string;
  /** One-line summary. */
  summary: string;
}

export function packageJson(v: BundleTemplateVars): string {
  const pkg = {
    name: v.name,
    version: '0.1.0',
    description: v.summary,
    type: 'module',
    license: 'MIT',
    keywords: ['dhee-bundle'],
    dhee: { bundles: './bundles' },
    files: ['bundles', 'LICENSE', 'README.md'],
    engines: { node: '>=20.0.0' },
  };
  return JSON.stringify(pkg, null, 2) + '\n';
}

/** A minimal, valid, GPU-free starter DAG (two LLM text stages). */
export function bundleJson(v: BundleTemplateVars): string {
  const bundle = {
    id: v.bundleId,
    version: '0.1.0',
    license: 'MIT',
    displayName: v.displayName,
    summary: v.summary,
    description: `${v.summary} Scaffolded by create-dhee-bundle — extend the nodes array to build out your pipeline.`,
    engineCompat: '>=0.1.0',
    dependencies: {
      runners: { 'llm.generate': '>=0.1.0' },
    },
    inputs: [
      { id: 'brief_input', kind: 'file', path: 'inputs/brief.md', required: true },
    ],
    goal: 'plan',
    nodes: [
      {
        id: 'outline',
        displayName: 'Outline',
        kind: 'stage',
        inputs: [],
        outputs: { format: 'md', pattern: 'plans/outline.md' },
        runner: {
          tool: 'llm.generate',
          config: { promptTemplate: 'prompts/outline.md', tier: 'medium', outputFormat: 'markdown', temperature: 0.7 },
        },
        displayCapability: 'outline.prose',
      },
      {
        id: 'plan',
        displayName: 'Plan',
        kind: 'stage',
        inputs: [{ from: 'outline', usage: 'context' }],
        outputs: { format: 'json', pattern: 'plans/plan.json' },
        runner: {
          tool: 'llm.generate',
          config: {
            promptTemplate: 'prompts/plan.md',
            outputSchema: 'schemas/plan.schema.json',
            tier: 'medium',
            outputFormat: 'json',
            temperature: 0.5,
          },
        },
        displayCapability: 'plan.json',
      },
    ],
  };
  return JSON.stringify(bundle, null, 2) + '\n';
}

export function promptOutline(v: BundleTemplateVars): string {
  return `# ${v.displayName} — Outline

You are planning "${v.displayName}".

## Brief

{{brief_input}}

## Task

Write a clear outline for the piece described in the brief. Keep it concise
and structured. (Edit this prompt to fit your pipeline.)
`;
}

export function promptPlan(v: BundleTemplateVars): string {
  return `# ${v.displayName} — Plan

Turn the outline into a structured JSON plan that conforms to the schema.

## Outline

{{outline}}

## Output

Return ONLY JSON matching the provided schema.
`;
}

export function planSchema(): string {
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['title', 'segments'],
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      segments: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'text'],
          additionalProperties: false,
          properties: {
            id: { type: 'string' },
            text: { type: 'string' },
          },
        },
      },
    },
  };
  return JSON.stringify(schema, null, 2) + '\n';
}

export function briefInput(v: BundleTemplateVars): string {
  return `# Brief

Describe what you want "${v.displayName}" to produce. This file is the
bundle's \`brief_input\`. Replace it per project.
`;
}

export function license(): string {
  return `MIT License

Copyright (c) <year> <author>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction. THE SOFTWARE IS PROVIDED "AS IS".
`;
}

export function readme(v: BundleTemplateVars): string {
  return `# ${v.name}

> ${v.summary}

A [Dhee](https://github.com/dheeai) **bundle** (pipeline) providing the
bundle id \`${v.bundleId}\`. Discovered by the engine via the
\`dhee-bundle-*\` npm convention; referenced as:

\`\`\`
npm:${v.name}${'#'}${v.bundleId}
\`\`\`

## Layout

\`\`\`
bundles/${v.bundleId}/
  bundle.json     # the DAG (id, goal, nodes, dependencies)
  inputs/         # default bundle inputs
  prompts/        # LLM prompt templates referenced by nodes
  schemas/        # JSON schemas for json-output nodes
\`\`\`

## Extend

Add nodes to \`bundle.json\` → \`nodes[]\`. Each node names a \`runner.tool\`;
declare every tool you use in \`dependencies.runners\`, and (for non-built-in
runners) add an install hint in \`dependencies.runnerPackages\`.
`;
}

/** Last path segment of a package name, without scope or dhee-bundle- prefix. */
export function shortName(name: string): string {
  const unscoped = name.includes('/') ? name.slice(name.indexOf('/') + 1) : name;
  return unscoped.replace(/^dhee-bundle-?/, '') || 'bundle';
}

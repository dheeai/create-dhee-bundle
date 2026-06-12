# create-dhee-bundle

Scaffold a new **dhee-bundle-** package — a pipeline (DAG) for the [Dhee](https://github.com/dheeai) engine (`dhee-core`).

```sh
npm create dhee-bundle my-pipeline
# → dhee-bundle-my-pipeline/
```

## What it generates

A ready-to-use bundle package:

- `package.json` with the `dhee-bundle` keyword guard and the `dhee.bundles` entry point.
- `bundles/<id>/bundle.json` — a starter DAG (nodes, inputs, goal, runner dependencies).
- `bundles/<id>/prompts/` + `schemas/` + `inputs/` scaffolding for LLM stages.

## Options

```
npm create dhee-bundle <name> [--id <bundleId>]
```

- `--id <bundleId>` — the bundle id projects reference (defaults from the name).

## How discovery works

`dhee-core` finds your bundle by **name** (`dhee-bundle-*`), the **`dhee-bundle` keyword**, and the **`dhee.bundles`** entry (a single bundle dir or a dir of bundle dirs). Projects bind it via `npm:<pkg>#<bundleId>` or by dropping it in a user bundles dir. Bundles declare the runners they need under `dependencies.runners` / `dependencies.runnerPackages`.

## License

Apache-2.0

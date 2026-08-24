# Deployment — HTTPBin

- [Deployment — HTTPBin](#deployment--httpbin)
    - [Deployment Summary](#deployment-summary)
    - [Deploy Pipeline](#deploy-pipeline)
        - [Migration from Bamboo](#migration-from-bamboo)
        - [Rollback](#rollback)
    - [CI/CD](#cicd)
        - [CI build (ci.yml)](#ci-build-ciyml)
    - [Environment Variables and Secrets](#environment-variables-and-secrets)
    - [Infrastructure Dependencies](#infrastructure-dependencies)

## Deployment Summary

| Parameter                  | Value                                            |
| -------------------------- | ------------------------------------------------ |
| **Live URL**               | <https://httpbin.agrd.dev>                       |
| **Cloudflare Worker**      | `httpbin` (route `httpbin.agrd.dev/*`)           |
| **Deploy**                 | `deploy.yml` — `wrangler deploy` on master push  |
| **Public mirror**          | `AdguardTeam/HttpBin`                            |
| **Runner label**           | `team-extensions`                                |
| **Slack channel**          | `#adguard-extension-vcs`                         |

## Deploy Pipeline

Every push to `master` triggers **`deploy.yml`**, which:

1. Lints, tests, and builds the worker in Docker (`--target build-output`)
   and uploads `dist/` as a build artifact.
2. Fetches the Cloudflare credentials from Vault (`ci-secrets/ext-httpbin`)
   via GitHub OIDC.
3. Deploys the artifact with `wrangler deploy --route "httpbin.agrd.dev/*"`,
   using the wrangler version pinned in `package.json` (`devDependencies`).
4. Posts a Slack notification to `#adguard-extension-vcs` (success or
   failure).

The deploys are serialized via a workflow-level concurrency group, so two
master pushes never race the wrangler deploy.

### Migration from Bamboo

The old Bamboo `HTTPBIN` plan (`npm install` → `lint` → `test` → `build` →
`wrangler deploy`, master-only, failure webhook to jirahub) is replaced by:

- `deploy.yml` — the same pipeline on pushes to `master`; the Slack
  notification replaces the jirahub failure webhook.
- `ci.yml` — lint/test/build validation for pull requests (Bamboo ran no
  stages on non-master branches; PRs are now validated instead).
- `mirror.yml` — mirrors `master` to the public repo on every push.

There is no versioning/release pipeline: the worker is deployed continuously
from `master`, exactly as the Bamboo plan did.

### Rollback

To roll back, revert the offending commit on `master` (or reset `master` to a
known-good commit) and push — the deploy workflow will publish that state.
Alternatively, run the deploy manually from a known-good commit:

```bash
npm ci
npm run build
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... \
    npx wrangler deploy --route "httpbin.agrd.dev/*"
```

## CI/CD

| Workflow     | Trigger         | What it does                                   |
| ------------ | --------------- | ---------------------------------------------- |
| `ci.yml`     | pull_request    | Lints, tests, and builds (no deploy)           |
| `deploy.yml` | push to master  | Lints, tests, builds, deploys, notifies Slack  |
| `mirror.yml` | push to master  | Mirrors code to the public repo                |

### CI build (ci.yml)

Runs on every pull request. It validates only — it never deploys:

1. Checks out the code.
2. Lints, tests, and builds inside Docker (`--target test-output`). Untrusted
   pull-request builds use a separate BuildKit cache scope from trusted master
   builds so one PR can't poison the cache another build reads.

Deployment is intentionally **not** part of CI — the live worker is updated
only from `master` (see [Deploy Pipeline](#deploy-pipeline)).

## Environment Variables and Secrets

| Name                    | Scope                            | Description           |
| ----------------------- | -------------------------------- | --------------------- |
| `cloudflare_api_token`  | Vault (`ci-secrets/ext-httpbin`) | Wrangler deploy token |
| `cloudflare_account_id` | Vault (`ci-secrets/ext-httpbin`) | Cloudflare account ID |

Cloudflare credentials live in Vault, not as GitHub repository secrets. A
`fetch-cloudflare-secrets` job authenticates to Vault via GitHub OIDC (JWT,
role `ext-httpbin`) and passes the values as the `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` env vars to the `wrangler deploy` step.

The Vault endpoint itself is configured through a repository/organization
variable:

| Variable    | Scope             | Description                           |
| ----------- | ----------------- | ------------------------------------- |
| `VAULT_URL` | repo/org variable | Base URL of the Vault server for OIDC |

**Rotation:** to rotate the Cloudflare credentials, update the values under
`ci-secrets/ext-httpbin` in Vault — no GitHub-side change is needed, the next
deploy run picks them up automatically.

## Infrastructure Dependencies

| Dependency                                  | Purpose                                      |
| ------------------------------------------- | -------------------------------------------- |
| Cloudflare Workers (`httpbin`)              | Serves the worker at httpbin.agrd.dev        |
| Vault (`ci-secrets/ext-httpbin`)            | Stores the Cloudflare deploy credentials     |
| `AdguardTeam/HttpBin`                       | Public mirror of this repo                   |
| `AdGuardSoftwareLimited/actions`            | Shared workflows (mirror, Slack notify)      |
| `team-extensions` runner                    | Self-hosted GitHub Actions runner            |

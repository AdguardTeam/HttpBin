# syntax=docker/dockerfile:1
# Multi-stage Dockerfile for ext-httpbin
# Dependencies are cached until package.json / package-lock.json change.
# Each stage can be built independently via --target.

FROM adguard/node-ssh:22.22--0 AS base
SHELL ["/bin/bash", "-lc"]

WORKDIR /app

# npm cache directory — set once here, no need for npm config set in every RUN
ENV npm_config_cache=/npm-cache

# ============================================================================
# Stage: deps
# Cached until package.json / package-lock.json change
# ============================================================================
FROM base AS deps

COPY package.json package-lock.json ./

# --ignore-scripts: no lifecycle scripts are needed in CI (platform binaries
# for esbuild / workerd come from optionalDependencies)
RUN --mount=type=cache,target=/npm-cache,id=ext-httpbin-npm \
    npm ci \
        --ignore-scripts \
        --prefer-offline

# ============================================================================
# Stage: source
# Full source copy — parent for all lint/test/build stages
# ============================================================================
FROM deps AS source

COPY . /app

# ============================================================================
# Stage: test-output
# Lints, runs tests, and builds the worker. The build output produced here
# (/app/dist) is reused by build-output, so the build runs exactly once per
# pipeline. Used as the CI validation target: `docker build
# --target test-output .` fails if any step fails.
# ============================================================================
FROM source AS test-output

RUN npm run lint && \
    npm run test && \
    npm run build

# ============================================================================
# Stage: build-output
# Exports the already-built worker from test-output (no rebuild). The deploy
# workflow targets this via `--target build-output --output ./dist`.
# ============================================================================
FROM scratch AS build-output
COPY --from=test-output /app/dist /

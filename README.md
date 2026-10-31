# agentcron

**Schedule LLM-powered automation jobs.** Define jobs in a YAML file — each gathers some
context (GitHub activity, a URL, static text), summarizes or transforms it with an LLM,
and delivers the result to your console, a file, or a webhook. Run them on a cron schedule
and let them do your daily busywork.

[![CI](https://github.com/niklasmarderx/agentcron/actions/workflows/ci.yml/badge.svg)](https://github.com/niklasmarderx/agentcron/actions/workflows/ci.yml)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg)](#license)

## Why

Cron runs commands; agentcron runs *understanding*. A line in cron can fetch your GitHub
feed, but agentcron can fetch it and hand you a one-paragraph morning digest. It is the
glue between "I have data somewhere" and "tell me what matters" — on a schedule, hands-off.

## Install

```sh
npm install -g agentcron    # or: git clone … && npm install && npm run build
```

## Quick start

```sh
agentcron init                 # writes a sample agentcron.yaml
agentcron list                 # list configured jobs
agentcron run daily-github-digest   # run one job now
agentcron start                # run all scheduled jobs (cron) in the foreground
```

## Configuration

```yaml
jobs:
  - name: daily-github-digest
    schedule: "7 8 * * *"        # standard cron; omit for manual-only
    sources:
      - type: github             # public repo activity for a user
        user: niklasmarderx
    prompt: |
      Summarize today's activity into a short morning digest.
    outputs:
      - type: console
      - type: file
        path: ./digests/{{date}}.md
```

**Sources:** `github` (user's repos, sorted by last push), `http` (fetch a URL's text),
`static` (literal text). **Outputs:** `console`, `file` (with `{{date}}` / `{{job}}`
placeholders), `webhook` (POSTs `{text, job, date}`).

## LLM backend

Without an API key, agentcron uses a deterministic **stub** so everything runs offline.
To use a real model:

```sh
export ANTHROPIC_API_KEY=sk-ant-...
export ANTHROPIC_MODEL=claude-opus-5-5     # optional; override for a gateway's model
export ANTHROPIC_BASE_URL=https://…        # optional; point at a proxy/gateway
```

`ANTHROPIC_MODEL` and `ANTHROPIC_BASE_URL` let agentcron run against a corporate LLM
gateway as easily as the public API.

## Roadmap

- More sources (RSS, IMAP, calendar, Linear/Jira) and outputs (Slack, email).
- Tool-calling jobs (let the model fetch what it needs).
- A daemon mode with a small status dashboard.

## License

Licensed under either of [Apache License, Version 2.0](LICENSE-APACHE) or
[MIT license](LICENSE-MIT) at your option.

# Internal AI Repository Intelligence

This directory is the fast-reference layer for Hlabi orchestrator agents.

## Purpose

Keep a compact, machine-readable inventory of repositories available on the `HloniHypnotiseMe` GitHub profile that may be useful to the Lifestyle Hub. Agents should consult this registry before proposing a new dependency, worker, service, or integration.

## Files

- `repo-registry.md` — categorized fork reconnaissance and intended capability map.
- `orchestrator-routing.md` — routing rules for selecting repositories/tools by task.

## Operating rules

1. Prefer existing Hlabi adapters and provider-neutral boundaries over direct coupling.
2. Treat forked repositories as source/reference material first; do not copy large codebases into Hlabi without an explicit implementation decision and license review.
3. Prefer service/worker deployment for heavyweight systems; keep the Hlabi API thin.
4. Verify repository health, license, security posture, current APIs, and deployment requirements before production adoption.
5. Never place credentials, tokens, private keys, or provider secrets in this directory.
6. C6 repositories remain separate from Hlabi. This registry may reference them as related internal systems, but does not merge their branding or source into Hlabi.
7. Security/offensive tooling is reference-only unless a clearly authorized defensive use case exists.

## Source

The inventory is a GitHub fork search snapshot for `user:HloniHypnotiseMe fork:true`, captured 2026-09-17. Names can overlap across search pages; duplicates are intentionally normalized in the registry.

---
description: Format, stage (all or the given paths), and commit with a generated message
argument-hint: "[paths to stage]"
model: haiku
allowed-tools: Bash(pnpm format:*), Bash(git add:*), Bash(git diff:*), Bash(git commit:*)
---

Formatting and staging (already done before this prompt):
!`pnpm format >/dev/null && git add -A -- $ARGUMENTS && echo "OK: formatted and staged"`

Staged files:
!`git diff --staged --stat`

Staged diff (may be truncated):
!`git diff --staged -U1 | head -c 20000`

If nothing is staged or formatting failed above, say so and stop.

Otherwise write a Conventional Commits message matching this repo's style, e.g.
`feat(api): implement create and assign label to todo functionality` or
`fix(fe): keep delete label dialog open when deletion fails`. Scopes: fe, be, api, e2e, deploy.
Subject imperative, ≤72 chars; add a short bullet body only if it adds information.

Then run `git commit -m "<subject>" [-m "<body>"]` once. Do not run any other commands. Reply with
only the commit hash and subject.

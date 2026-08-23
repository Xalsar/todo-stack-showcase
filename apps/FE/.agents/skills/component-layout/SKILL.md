---
name: component-layout
description: Organize FE code by separating presentational from stateful components. Use when creating, moving, splitting, or refactoring components in apps/FE. Triggers on "dumb vs smart", "containers", "components folder", "providers folder", "feature folder", "split component".
---

This project organizes frontend components into three top-level folders under `apps/FE/`.
Separate presentational (dumb) components from stateful ones, and keep context providers
separate. This is project-specific to `apps/FE` — do not apply this structure to projects
that don't use it.

## Three top-level folders

- `apps/FE/components/` — **dumb / presentational**. Stateless, no hooks, no data fetching.
  Only renders props. Base primitives live in `apps/FE/components/ui/` (button, field, item,
  empty, skeleton, …). The majority of components in the project must be dumb.
- `apps/FE/containers/` — **stateful**. Owns state and behavior: hooks, SWR queries/mutations,
  react-hook-form, etc.
- `apps/FE/providers/` — React context providers (e.g. theme provider).

## Imports

- Dumb components: `@/components/...`
- Stateful components: `@/containers/...`
- Providers: `@/providers/...`

## Feature folders (molecule pattern)

When a child component is only ever used by one container, group them together instead of
keeping flat files. Each component keeps its own child components inside its folder:

```
containers/<feature>/
  <feature>.tsx                 # container (organism)
  components/<child>.tsx        # child molecule, only used by this feature
```

Example from this repo: `containers/todos-list/todos-list.tsx` (container) with its child
`containers/todos-list/components/todo-item.tsx`.

- The parent container owns shared list/cache logic (e.g. SWR `mutate`).
- The child owns its own per-item mutation state and button feedback (e.g. `usePatchTodosIdDone`).

When importing a grouped container from a page, use the explicit path
`@/containers/<feature>/<feature>`, not just `@/containers/<feature>`.

## Splitting

Split a component into two files when it contains multiple components that only share a
common parent — give each component its own file with all its child components inside.

---
name: fe-structure-preferences
description: Frontend structure preferences for this repo. Use when creating,
  refactoring, or reviewing React components, hooks, or state management. Trigger
  on "component structure", "extract a hook", "presentational", "stateless",
  "stateful container", "refactor this component", "context provider",
  "context folder", "trigger button", or "organize context".
---

# Frontend structure preferences

## 1. Keep components mostly presentational

Prefer thin, stateless components that receive data and callbacks via props.
Push state and data-fetching into hooks. Reserve a single stateful "container"
for orchestrating a feature's hooks (e.g. `containers/todos-list/todos-list.tsx`).

## 2. One hook per feature/operation

Split mutations and features into dedicated hooks for readability (e.g.
`use-create-todo`, `use-toggle-todo`, `use-edit-todo`, `use-delete-todo`). The
container just composes them; it should not inline mutation logic.

## 3. Hooks are self-contained

Each hook calls its own data hook internally (e.g. `useGetTodos()`) instead of
accepting `data`/`mutate` as arguments. Rely on SWR's global keyed cache so
multiple hooks sharing the same key stay in sync; the fetcher still runs once.

## 4. Extract shared cross-hook state into its own hook

State used by several hooks (e.g. a set of mutating ids) lives in its own hook
(e.g. `use-mutating-todos.ts` exposing `setMutating`/`isMutating`) rather than
being declared inline in the container.

## 5. Group context providers and triggers into a `context/` subfolder

When a feature exposes a React context provider and a trigger button (the UI
that opens the thing the provider manages), keep them together in a `context/`
subfolder within the feature container. The provider and trigger are a pair —
one is useless without the other — and external consumers (app layout, page
routes) import both from the same path.

The dialog, panel, or other UI that the provider renders stays at the feature's
top level alongside `components/` and `hooks/`.

Example:

    containers/labels/
    ├── components/
    ├── context/
    │   ├── label-manager-provider.tsx
    │   ├── label-manager-provider.test.tsx
    │   └── label-manager-trigger.tsx
    ├── hooks/
    ├── label-manager.tsx        # dialog rendered by the provider
    └── label-errors.ts

Keep the split simple: only create subfolders when there is a genuinely separate
concern (context, a group of related components, etc.). The flat `components/` +
`hooks/` layout is the default — don't nest for the sake of nesting.

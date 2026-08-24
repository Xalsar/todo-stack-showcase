---
name: fe-structure-preferences
description: Frontend structure preferences for this repo. Use when creating,
  refactoring, or reviewing React components, hooks, or state management. Trigger
  on "component structure", "extract a hook", "presentational", "stateless",
  "stateful container", or "refactor this component".
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

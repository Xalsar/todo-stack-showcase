---
name: fe-structure-preferences
description: Frontend structure preferences for this repo. Use when creating,
  refactoring, or reviewing React components, hooks, or state management. Trigger
  on "component structure", "extract a hook", "presentational", "stateless",
  "stateful container", "refactor this component", "zustand store", "store folder",
  "trigger button", "modal state", or "organize store".
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

## 5. Use Zustand stores for modal/panel state instead of React Context

For modals, panels, and similar UI state that needs to be shared across components,
prefer Zustand stores over React Context. Place the store and its tightly-coupled
trigger component in a `store/` subfolder within the feature container.

Zustand stores are state containers (not just hooks), and triggers that only exist
to call store actions belong with the store. This reduces boilerplate (no provider
wrapper, no context definition file) and simplifies testing (direct state manipulation
instead of provider wrapping).

Example:

    containers/labels/
    ├── components/
    ├── store/
    │   ├── label-manager.ts           # Zustand store
    │   ├── label-manager-trigger.tsx  # trigger component
    │   ├── label-manager.test.ts
    │   └── label-manager-trigger.test.tsx
    ├── hooks/
    ├── label-manager.tsx              # dialog rendered in the page
    └── label-errors.ts

The dialog/panel component stays at the feature's top level and is rendered in the
page where it's actually used (not in the layout), keeping it co-located with its
usage context.

External consumers import the store hook from `@/containers/<feature>/store/<name>`
and the trigger from the same path.

Keep the split simple: only create subfolders when there is a genuinely separate
concern (store, a group of related components, etc.). The flat `components/` +
`hooks/` layout is the default — don't nest for the sake of nesting.

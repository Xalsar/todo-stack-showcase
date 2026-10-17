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

## 6. Avoid deeply nested conditional rendering

JSX with three or more states rendered as nested ternaries
(`a ? <A/> : b ? <B/> : c ? <C/> : <D/>`) is hard to read and hard to extend.
When a component branches on `isLoading` / `error` / `empty` / `data` (or any
similar shape), extract a thin presentational component that uses **early
returns / guard clauses** instead.

Pattern:

```tsx
// components/labels-content.tsx — stateless presenter
function LabelsContent({ isLoading, isError, labels, ...rest }: LabelsContentProps) {
  if (isLoading) return <Skeleton ... />
  if (isError) return <ErrorMessage ... />
  if (!labels?.length) return <Empty ... />
  return <LabelList labels={labels} {...rest} />
}

// label-manager.tsx — container just renders the presenter
<LabelsContent
  isLoading={isLoading}
  isError={Boolean(error)}
  labels={labels}
  {...listProps}
/>
```

Rules of thumb:

- **One binary `cond ? a : b` is fine.** The smell starts at the second `: ?` — three branches in one expression.
- **The presenter stays stateless** — no hooks, no store access, no data fetching. The container passes `isLoading` / `isError` / data + callbacks down.
- **Name the prop `isError` (boolean), not `error` (unknown)**, when the presenter only needs to know whether to render the error branch. The container does the coercion (`isError={Boolean(error)}`).
- **Don't extract just for two branches.** A plain `cond && <X/>` or single ternary is readable; reserve the extraction for three+ branches or any branch whose body is more than a one-liner.

Combine with rule 1: the extracted presenter is exactly the "thin, stateless component" the skill already prescribes — the guard-clause pattern is its default render shape.

## 7. Don't override positioning classes on primitives that already position themselves

shadcn / Base UI / Radix primitives (`Drawer`, `Dialog`, `Popover`, `Tooltip`,
`Sheet`, `DropdownMenu`, `Select`, `AlertDialog`, …) ship their own positioning
classes in their generated `components/ui/*.tsx` files. They handle `top`,
`right`, `bottom`, `left`, `inset-*`, `translate-*`, `h-*`, `max-h-*`, and
width defaults for you.

**Do not add positioning overrides on top of them unless you've read the
primitive's defaults and confirmed they conflict with your use case.**

Common mistakes and what causes them:

- `DrawerContent` already sits flush to the right edge at full height on
  desktop. Adding `sm:inset-y-2 sm:right-2` re-insets it, then `max-h-[90vh]`
  caps its height, then the flex column doesn't stretch → the drawer
  floats centered in a bounded box, leaving a visible gap at the bottom.
  Fix: pass only layout classes (`flex flex-col gap-4`); let the primitive
  position itself.
- `DialogContent` is already centered with `top-1/2 left-1/2 -translate-x-1/2
  -translate-y-1/2`. Adding more `top-*` / `translate-*` on top will fight it.
- `Popover` / `Tooltip` / `DropdownMenuContent` compute their own position
  relative to the trigger. Manually offsetting them breaks collision
  detection.

**What you may legitimately add on a positioned primitive:**

- Layout: `flex`, `grid`, `gap-*`, `p-*`, `m-*` on inner elements.
- Width / height **inside** the positioned box: `max-w-*` on a `DialogContent`
  is fine; `sm:max-w-sm` on a `DrawerContent` is fine *if* the default width
  doesn't suit.
- Borders / shadows / rounded corners on edges that don't face the viewport
  edge.
- Text alignment inside the panel.

**Rule of thumb:** if the class you'd add starts with `top-`, `right-`,
`bottom-`, `left-`, `inset-`, `translate-`, `h-screen`, `h-dvh`, `max-h-`,
or `min-h-screen`, stop and re-read the primitive's source first. If you can
achieve the layout you want without that class, do so.

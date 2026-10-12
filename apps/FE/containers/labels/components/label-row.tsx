"use client"

import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item"
import type { Label } from "@/src/lib/api/generated/model"

import { DeleteLabelDialog } from "./delete-label-dialog"
import { LabelForm } from "./label-form"

type LabelRowProps = {
  label: Label
  isRenaming: boolean
  isDeleting: boolean
  onRename: (id: string, name: string) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
}

function LabelRow({
  label,
  isRenaming,
  isDeleting,
  onRename,
  onDelete,
}: LabelRowProps) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <Item variant="outline" role="listitem">
        <ItemContent>
          <LabelForm
            initialName={label.name}
            isSubmitting={isRenaming}
            submitLabel="Save label"
            onCancel={() => setEditing(false)}
            onSubmit={async (name) => {
              const ok = await onRename(label.id, name)
              if (ok) setEditing(false)
              return ok
            }}
          />
        </ItemContent>
      </Item>
    )
  }

  return (
    <Item variant="outline" role="listitem">
      <ItemContent>
        <ItemTitle>{label.name}</ItemTitle>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isDeleting}
          onClick={() => setEditing(true)}
          className="text-muted-foreground disabled:opacity-100"
          aria-label={`Rename ${label.name}`}
        >
          <Pencil />
        </Button>
        <DeleteLabelDialog
          labelName={label.name}
          isDeleting={isDeleting}
          onConfirm={() => onDelete(label.id)}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isDeleting}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-100 dark:hover:bg-destructive/20"
            aria-label={`Delete ${label.name}`}
          >
            <Trash2 />
          </Button>
        </DeleteLabelDialog>
      </ItemActions>
    </Item>
  )
}

export { LabelRow }

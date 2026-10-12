"use client"

import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item"
import { InlineEditForm } from "@/components/inline-edit-form"
import type { Label } from "@/src/lib/api/generated/model"

import { cn } from "@/lib/utils"
import { isNameConflict } from "../label-errors"
import { DeleteLabelDialog } from "./delete-label-dialog"

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
          <InlineEditForm
            defaultValue={label.name}
            inputLabel="Edit label name"
            saveLabel="Save label"
            cancelLabel="Cancel"
            requiredMessage="Name is required"
            isSubmitting={isRenaming}
            onCancel={() => setEditing(false)}
            onSubmit={async (name) => {
              const ok = await onRename(label.id, name)
              if (ok) setEditing(false)
            }}
            mapError={(error) =>
              isNameConflict(error)
                ? "A label with this name already exists"
                : "Failed to save label"
            }
          />
        </ItemContent>
      </Item>
    )
  }

  return (
    <Item variant="outline" role="listitem">
      <ItemContent>
        <ItemTitle
          role="button"
          tabIndex={0}
          aria-disabled={isDeleting || undefined}
          onClick={() => {
            if (!isDeleting) setEditing(true)
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !isDeleting) {
              e.preventDefault()
              setEditing(true)
            }
          }}
          className={cn(
            "-mx-1 w-full cursor-pointer rounded-sm px-1 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          )}
        >
          {label.name}
        </ItemTitle>
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

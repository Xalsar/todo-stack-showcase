"use client"

import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import type { Label } from "@/src/lib/api/generated/model"

import { LabelRow } from "./label-row"

const NO_LABEL = "none"

type LabelListProps = {
  labels: Label[]
  renamingId: string | null
  deletingId: string | null
  onRename: (id: string, name: string) => Promise<boolean>
  onDelete: (id: string) => void
  selectedId?: string | null
  onSelect?: (value: string | null) => void
}

function LabelList({
  labels,
  renamingId,
  deletingId,
  onRename,
  onDelete,
  selectedId,
  onSelect,
}: LabelListProps) {
  const selectable = selectedId !== undefined

  if (!selectable) {
    return (
      <ItemGroup>
        {labels.map((label) => (
          <LabelRow
            key={label.id}
            label={label}
            isRenaming={renamingId === label.id}
            isDeleting={deletingId === label.id}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </ItemGroup>
    )
  }

  return (
    <RadioGroup
      aria-label="Label"
      className="gap-4"
      value={selectedId ?? NO_LABEL}
      onValueChange={(value) =>
        onSelect?.(value === NO_LABEL ? null : (value as string))
      }
    >
      <Item variant="outline">
        <ItemMedia variant="icon">
          <RadioGroupItem value={NO_LABEL} aria-label="No label" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-muted-foreground">No label</ItemTitle>
        </ItemContent>
      </Item>
      <Separator />
      {labels.map((label) => (
        <LabelRow
          key={label.id}
          label={label}
          isRenaming={renamingId === label.id}
          isDeleting={deletingId === label.id}
          onRename={onRename}
          onDelete={onDelete}
          value={label.id}
        />
      ))}
    </RadioGroup>
  )
}

export { LabelList }

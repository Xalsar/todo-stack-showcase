"use client"

import { ItemGroup } from "@/components/ui/item"
import type { Label } from "@/src/lib/api/generated/model"

import { LabelRow } from "./label-row"

type LabelListProps = {
  labels: Label[]
  renamingId: string | null
  deletingId: string | null
  onRename: (id: string, name: string) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
}

function LabelList({
  labels,
  renamingId,
  deletingId,
  onRename,
  onDelete,
}: LabelListProps) {
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

export { LabelList }

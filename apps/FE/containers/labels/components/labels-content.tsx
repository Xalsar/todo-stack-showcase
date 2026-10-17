"use client"

import { Tag } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import type { Label } from "@/src/lib/api/generated/model"

import { LabelList } from "./label-list"

type LabelsContentProps = {
  isLoading: boolean
  isError: boolean
  labels: Label[] | undefined
  renamingId: string | null
  deletingId: string | null
  onRename: (id: string, name: string) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
  selectedId?: string | null
  onSelect?: (id: string | null) => void
}

function LabelsContent({
  isLoading,
  isError,
  labels,
  ...listProps
}: LabelsContentProps) {
  if (isLoading) {
    return (
      <div aria-hidden className="flex flex-col gap-2">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Failed to load labels. Is the backend running?
      </p>
    )
  }

  if (!labels?.length) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Tag />
          </EmptyMedia>
          <EmptyTitle>No labels yet</EmptyTitle>
          <EmptyDescription>
            Add your first label with the field above.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return <LabelList labels={labels} {...listProps} />
}

export { LabelsContent }
export type { LabelsContentProps }

"use client"

import { Tag } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

import { useCreateLabel } from "./hooks/use-create-label"
import { useDeleteLabel } from "./hooks/use-delete-label"
import { useLabelManager } from "./hooks/use-label-manager"
import { useLabels } from "./hooks/use-labels"
import { useRenameLabel } from "./hooks/use-rename-label"
import { LabelForm } from "./components/label-form"
import { LabelList } from "./components/label-list"

function LabelManager() {
  const { open, onOpenChange } = useLabelManager()
  const { data: labels, error, isLoading } = useLabels()
  const { onCreate, isSubmitting, failed } = useCreateLabel()
  const { onRename, renamingId } = useRenameLabel()
  const { onDelete, deletingId } = useDeleteLabel()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage labels</DialogTitle>
          <DialogDescription>
            Create, rename, and delete the labels you use on your todos.
          </DialogDescription>
        </DialogHeader>

        <LabelForm
          onSubmit={onCreate}
          isSubmitting={isSubmitting}
          failed={failed}
        />

        {isLoading ? (
          <div aria-hidden className="flex flex-col gap-2">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive" role="alert">
            Failed to load labels. Is the backend running?
          </p>
        ) : !labels?.length ? (
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
        ) : (
          <LabelList
            labels={labels}
            renamingId={renamingId}
            deletingId={deletingId}
            onRename={onRename}
            onDelete={onDelete}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export { LabelManager }

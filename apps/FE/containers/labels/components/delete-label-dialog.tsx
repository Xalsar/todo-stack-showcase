"use client"

import { useState } from "react"
import { TriangleAlert } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { AffectedTodosNotice } from "./affected-todos-notice"

type DeleteLabelDialogProps = {
  labelName: string
  affectedTodos: number | undefined
  onConfirm: () => void
  open?: boolean
  onOpenChange?: React.ComponentProps<typeof AlertDialog>["onOpenChange"]
  onOpenChangeComplete?: (open: boolean) => void
  children?: React.ReactElement
}

function DeleteLabelDialog({
  labelName,
  affectedTodos,
  onConfirm,
  open,
  onOpenChange,
  onOpenChangeComplete,
  children,
}: DeleteLabelDialogProps) {
  const isControlled = open !== undefined
  // Keeps the count steady while the dialog animates closed: the caller's live
  // count can change mid-animation (e.g. an optimistic delete drops it to 0).
  const [frozenCount, setFrozenCount] = useState<number | null>(null)
  const shownCount = frozenCount ?? affectedTodos

  const freezeCount = () => setFrozenCount(affectedTodos ?? null)

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen, eventDetails) => {
        if (isOpen) setFrozenCount(null)
        else freezeCount()
        onOpenChange?.(isOpen, eventDetails)
      }}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setFrozenCount(null)
        onOpenChangeComplete?.(isOpen)
      }}
    >
      {!isControlled && children && <AlertDialogTrigger render={children} />}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete &ldquo;{labelName}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the label and can&rsquo;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {shownCount !== undefined && <AffectedTodosNotice count={shownCount} />}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              // Confirm closes via the parent's `open` prop, not onOpenChange.
              freezeCount()
              onConfirm()
            }}
            aria-label="Delete label"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { DeleteLabelDialog }

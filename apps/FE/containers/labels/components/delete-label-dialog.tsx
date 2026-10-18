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
} from "@/components/ui/alert-dialog"

import { AffectedTodosNotice } from "./affected-todos-notice"

type DeleteLabelDialogProps = {
  open: boolean
  labelName: string
  affectedTodos: number | undefined
  onConfirm: () => void
  // Cancel / Esc: the user asked to close without confirming.
  onClose: () => void
  // The close animation has finished.
  onClosed: () => void
}

function DeleteLabelDialog({
  open,
  labelName,
  affectedTodos,
  onConfirm,
  onClose,
  onClosed,
}: DeleteLabelDialogProps) {
  const [frozenCount, setFrozenCount] = useState<number | null>(null)
  const shownCount = open ? affectedTodos : (frozenCount ?? affectedTodos)

  const freezeCount = () => setFrozenCount(affectedTodos ?? null)

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) return
        freezeCount()
        onClose()
      }}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) onClosed()
      }}
    >
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

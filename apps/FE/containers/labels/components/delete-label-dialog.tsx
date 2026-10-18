"use client"

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
import { Spinner } from "@/components/ui/spinner"

import { AffectedTodosNotice } from "./affected-todos-notice"

type DeleteLabelDialogProps = {
  labelName: string
  affectedTodos: number | undefined
  isDeleting?: boolean
  onConfirm: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactElement
}

function DeleteLabelDialog({
  labelName,
  affectedTodos,
  isDeleting = false,
  onConfirm,
  open,
  onOpenChange,
  children,
}: DeleteLabelDialogProps) {
  const isControlled = open !== undefined

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
        {affectedTodos !== undefined && (
          <AffectedTodosNotice count={affectedTodos} />
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            aria-label="Delete label"
          >
            {isDeleting ? <Spinner /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { DeleteLabelDialog }

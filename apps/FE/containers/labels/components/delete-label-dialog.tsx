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

import { AffectedTodosNotice } from "./affected-todos-notice"

type DeleteLabelDialogProps = {
  labelName: string
  affectedTodos: number | undefined
  onConfirm: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
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

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
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
        {affectedTodos !== undefined && (
          <AffectedTodosNotice count={affectedTodos} />
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
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

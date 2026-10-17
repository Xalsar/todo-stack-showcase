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

type DeleteLabelDialogProps = {
  labelName: string
  isDeleting?: boolean
  onConfirm: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactElement
}

function DeleteLabelDialog({
  labelName,
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
            This removes the label from every todo that uses it and can&rsquo;t
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
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

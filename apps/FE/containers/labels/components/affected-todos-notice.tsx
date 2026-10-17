import { Info, TriangleAlert } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"

type AffectedTodosNoticeProps = {
  count: number
}

function AffectedTodosNotice({ count }: AffectedTodosNoticeProps) {
  if (count === 0) {
    return (
      <Alert className="border-info/30 bg-info/10 text-info dark:bg-info/15">
        <Info />
        <AlertDescription>
          No todos use this label, so nothing else changes.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-warning/30 bg-warning/10 text-warning dark:bg-warning/15">
      <TriangleAlert />
      <AlertDescription>
        This label is applied to {count} {count === 1 ? "todo" : "todos"}.
        Deleting it removes the label from {count === 1 ? "that todo" : "them"}.
      </AlertDescription>
    </Alert>
  )
}

export { AffectedTodosNotice }

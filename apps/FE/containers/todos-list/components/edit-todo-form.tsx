"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, X } from "lucide-react"
import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

const editTodoFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
})

type EditTodoFormValues = z.infer<typeof editTodoFormSchema>

type EditTodoFormProps = {
  initialTitle: string
  isSubmitting: boolean
  onSubmit: (title: string) => Promise<void>
  onCancel: () => void
}

function EditTodoForm({
  initialTitle,
  isSubmitting,
  onSubmit,
  onCancel,
}: EditTodoFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const form = useForm<EditTodoFormValues>({
    resolver: zodResolver(editTodoFormSchema),
    defaultValues: { title: initialTitle },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  const {
    ref: registerRef,
    onBlur: registerOnBlur,
    ...registerProps
  } = register("title")

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const ref = (el: HTMLInputElement | null) => {
    inputRef.current = el
    registerRef(el)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    registerOnBlur(e)
    if (!formRef.current?.contains(e.relatedTarget as Node | null)) onCancel()
  }

  const invalid = Boolean(errors.title)

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(async ({ title }) => onSubmit(title))}
      className="flex flex-1 items-center gap-1.5"
      noValidate
    >
      <FieldGroup className="flex-1 gap-0">
        <Field data-invalid={invalid || undefined}>
          <Input
            aria-label="Edit todo title"
            aria-invalid={invalid || undefined}
            disabled={isSubmitting}
            className="h-7"
            ref={ref}
            onBlur={handleBlur}
            {...registerProps}
          />
          <FieldError errors={[errors.title]} />
        </Field>
      </FieldGroup>
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        disabled={isSubmitting}
        aria-label="Save todo"
      >
        {isSubmitting ? <Spinner /> : <Check />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onCancel}
        disabled={isSubmitting}
        aria-label="Cancel editing"
        className="text-muted-foreground"
      >
        <X />
      </Button>
    </form>
  )
}

export { EditTodoForm }

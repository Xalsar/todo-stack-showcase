"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"

const addTodoFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
})

type AddTodoFormValues = z.infer<typeof addTodoFormSchema>

type AddTodoFormProps = {
  onSubmit: (title: string) => Promise<boolean>
  isSubmitting: boolean
  failed: boolean
}

function AddTodoForm({ onSubmit, isSubmitting, failed }: AddTodoFormProps) {
  const form = useForm<AddTodoFormValues>({
    resolver: zodResolver(addTodoFormSchema),
    defaultValues: { title: "" },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  const invalid = Boolean(errors.title)

  return (
    <form
      onSubmit={handleSubmit(async ({ title }) => {
        const created = await onSubmit(title)
        if (created) reset()
      })}
      noValidate
    >
      <FieldGroup>
        <Field data-invalid={invalid || undefined}>
          <FieldLabel htmlFor="add-todo-title" className="sr-only">
            New todo
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="add-todo-title"
              placeholder="Add a todo…"
              autoComplete="off"
              aria-invalid={invalid || undefined}
              disabled={isSubmitting}
              {...register("title")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : <Plus />}
                <span className="sr-only">Add todo</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[errors.title]} />
        </Field>

        {failed ? (
          <p className="text-sm text-destructive" role="alert">
            Failed to create todo. Is the backend running?
          </p>
        ) : null}
      </FieldGroup>
    </form>
  )
}

export { AddTodoForm }

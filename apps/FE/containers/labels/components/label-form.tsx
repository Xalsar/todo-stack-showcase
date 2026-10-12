"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useId } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { isNameConflict } from "../label-errors"

const labelFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
})

type LabelFormValues = z.infer<typeof labelFormSchema>

type LabelFormProps = {
  onSubmit: (name: string) => Promise<boolean>
  isSubmitting?: boolean
  failed?: boolean
}

function LabelForm({
  onSubmit,
  isSubmitting = false,
  failed = false,
}: LabelFormProps) {
  const fieldId = useId()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<LabelFormValues>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: { name: "" },
  })

  const invalid = Boolean(errors.name)

  return (
    <form
      onSubmit={handleSubmit(async ({ name }) => {
        try {
          const ok = await onSubmit(name)
          if (ok) reset({ name: "" })
        } catch (error) {
          setError("name", {
            message: isNameConflict(error)
              ? "A label with this name already exists"
              : "Failed to save label",
          })
        }
      })}
      noValidate
    >
      <FieldGroup>
        <Field data-invalid={invalid || undefined}>
          <FieldLabel htmlFor={fieldId}>New label</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id={fieldId}
              autoComplete="off"
              aria-invalid={invalid || undefined}
              disabled={isSubmitting}
              {...register("name")}
            />
            <Button
              type="submit"
              size="icon-sm"
              disabled={isSubmitting}
              aria-label="Add label"
            >
              {isSubmitting ? <Spinner /> : <Plus />}
            </Button>
          </div>
          <FieldError errors={[errors.name]} />
        </Field>
        {failed ? (
          <p className="text-sm text-destructive" role="alert">
            Failed to save label. Is the backend running?
          </p>
        ) : null}
      </FieldGroup>
    </form>
  )
}

export { LabelForm }

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { useEffect, useId, useRef } from "react"
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
  initialName?: string
  inputLabel?: string
  submitLabel?: string
  onCancel?: () => void
}

function LabelForm({
  onSubmit,
  isSubmitting = false,
  failed = false,
  initialName = "",
  inputLabel = "New label",
  submitLabel = "Add label",
  onCancel,
}: LabelFormProps) {
  const fieldId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<LabelFormValues>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: { name: initialName },
  })

  const { ref: registerRef, ...registerProps } = register("name")

  useEffect(() => {
    if (initialName) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [initialName])

  const ref = (element: HTMLInputElement | null) => {
    inputRef.current = element
    registerRef(element)
  }

  const invalid = Boolean(errors.name)

  return (
    <form
      onSubmit={handleSubmit(async ({ name }) => {
        try {
          const ok = await onSubmit(name)
          if (ok && !initialName) reset({ name: "" })
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
          <FieldLabel htmlFor={fieldId}>{inputLabel}</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id={fieldId}
              autoComplete="off"
              aria-invalid={invalid || undefined}
              disabled={isSubmitting}
              ref={ref}
              {...registerProps}
            />
            <Button
              type="submit"
              size="icon-sm"
              disabled={isSubmitting}
              aria-label={submitLabel}
            >
              {isSubmitting ? <Spinner /> : <Plus />}
            </Button>
            {onCancel ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onCancel}
                disabled={isSubmitting}
                aria-label="Cancel"
              >
                <X />
              </Button>
            ) : null}
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

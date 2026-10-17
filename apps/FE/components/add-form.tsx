"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useId } from "react"
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

type AddFormProps = {
  label: string
  placeholder: string
  submitLabel: string
  requiredMessage: string
  failureMessage: string
  onSubmit: (value: string) => Promise<boolean>
  isSubmitting: boolean
  failed: boolean
  mapError?: (error: unknown) => string | undefined
}

function AddForm({
  label,
  placeholder,
  submitLabel,
  requiredMessage,
  failureMessage,
  onSubmit,
  isSubmitting,
  failed,
  mapError,
}: AddFormProps) {
  const fieldId = useId()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<{ value: string }>({
    resolver: zodResolver(
      z.object({ value: z.string().trim().min(1, requiredMessage) })
    ),
    defaultValues: { value: "" },
  })

  const invalid = Boolean(errors.value)

  return (
    <form
      onSubmit={handleSubmit(async ({ value }) => {
        try {
          const ok = await onSubmit(value)
          if (ok) reset()
        } catch (error) {
          const message = mapError?.(error)
          if (message) setError("value", { message })
        }
      })}
      noValidate
    >
      <FieldGroup>
        <Field data-invalid={invalid || undefined} className="mt-2">
          <FieldLabel htmlFor={fieldId} className="sr-only">
            {label}
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id={fieldId}
              placeholder={placeholder}
              autoComplete="off"
              aria-invalid={invalid || undefined}
              disabled={isSubmitting}
              {...register("value")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : <Plus />}
                <span className="sr-only">{submitLabel}</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[errors.value]} />
        </Field>

        {failed ? (
          <p className="text-sm text-destructive" role="alert">
            {failureMessage}
          </p>
        ) : null}
      </FieldGroup>
    </form>
  )
}

export { AddForm }

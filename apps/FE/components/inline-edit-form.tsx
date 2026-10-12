"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, X } from "lucide-react"
import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

type InlineEditFormProps = {
  defaultValue: string
  inputLabel: string
  saveLabel: string
  cancelLabel: string
  requiredMessage: string
  isSubmitting: boolean
  onSubmit: (value: string) => Promise<void>
  onCancel: () => void
  mapError?: (error: unknown) => string | undefined
}

function InlineEditForm({
  defaultValue,
  inputLabel,
  saveLabel,
  cancelLabel,
  requiredMessage,
  isSubmitting,
  onSubmit,
  onCancel,
  mapError,
}: InlineEditFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{ value: string }>({
    resolver: zodResolver(
      z.object({ value: z.string().trim().min(1, requiredMessage) })
    ),
    defaultValues: { value: defaultValue },
  })

  const {
    ref: registerRef,
    onBlur: registerOnBlur,
    ...registerProps
  } = register("value")

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

  const invalid = Boolean(errors.value)

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(async ({ value }) => {
        try {
          await onSubmit(value)
        } catch (error) {
          const message = mapError?.(error)
          if (message) setError("value", { message })
        }
      })}
      className="flex flex-1 items-center gap-1.5"
      noValidate
    >
      <FieldGroup className="flex-1 gap-0">
        <Field data-invalid={invalid || undefined}>
          <Input
            aria-label={inputLabel}
            aria-invalid={invalid || undefined}
            disabled={isSubmitting}
            className="h-7"
            ref={ref}
            onBlur={handleBlur}
            {...registerProps}
          />
          <FieldError errors={[errors.value]} />
        </Field>
      </FieldGroup>
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        disabled={isSubmitting}
        aria-label={saveLabel}
      >
        {isSubmitting ? <Spinner /> : <Check />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onCancel}
        disabled={isSubmitting}
        aria-label={cancelLabel}
        className="text-muted-foreground"
      >
        <X />
      </Button>
    </form>
  )
}

export { InlineEditForm }

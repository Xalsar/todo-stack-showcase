"use client"

import { zodResolver } from "@hookform/resolvers/zod"
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

const signUpFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type SignUpFormValues = z.infer<typeof signUpFormSchema>

type SignUpFormProps = {
  onSubmit: (values: SignUpFormValues) => Promise<boolean>
  isSubmitting: boolean
  error: string | null
}

function SignUpForm({ onSubmit, isSubmitting, error }: SignUpFormProps) {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="sign-up-name">Name</FieldLabel>
          <Input
            id="sign-up-name"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.name) || undefined}
            disabled={isSubmitting}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
          <Input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email) || undefined}
            disabled={isSubmitting}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
          <Input
            id="sign-up-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password) || undefined}
            disabled={isSubmitting}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null}
          Sign up
        </Button>
      </FieldGroup>
    </form>
  )
}

export { SignUpForm }

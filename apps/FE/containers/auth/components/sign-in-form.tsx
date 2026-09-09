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

const signInFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type SignInFormValues = z.infer<typeof signInFormSchema>

type SignInFormProps = {
  onSubmit: (values: SignInFormValues) => Promise<boolean>
  isSubmitting: boolean
  error: string | null
}

function SignInForm({ onSubmit, isSubmitting, error }: SignInFormProps) {
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { email: "", password: "" },
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
          <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
          <Input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email) || undefined}
            disabled={isSubmitting}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
          <Input
            id="sign-in-password"
            type="password"
            autoComplete="current-password"
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
          Sign in
        </Button>
      </FieldGroup>
    </form>
  )
}

export { SignInForm }

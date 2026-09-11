"use client"

import { LogOut } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/src/lib/auth-client"
import { useSignOut } from "@/containers/auth/hooks/use-sign-out"

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase()
}

function UserMenu() {
  const { data } = authClient.useSession()
  const { onSignOut, isSigningOut } = useSignOut()

  if (!data?.user) {
    return null
  }

  const email = data.user.email ?? "…"
  const name = data.user.name?.trim()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Open user menu"
          />
        }
      >
        <Avatar className="size-7">
          <AvatarFallback className="bg-muted text-xs">
            {initials(name || email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-max min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{email}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isSigningOut}
          onClick={onSignOut}
        >
          {isSigningOut ? <Spinner /> : <LogOut />}
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserMenu }

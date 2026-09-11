import type { NextFunction, Request, Response } from "express"

import { auth } from "../lib/auth.js"

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    })

    if (!session?.user?.id) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    req.userId = session.user.id
    next()
  } catch {
    res.status(500).json({ error: "Failed to resolve session" })
  }
}

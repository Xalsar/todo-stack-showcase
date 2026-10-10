import type { NextFunction, Request, Response } from "express"
import { beforeEach, describe, expect, it, vi } from "vitest"

const getSessionMock = vi.hoisted(() => vi.fn())

vi.mock("../lib/auth.js", () => ({
  auth: { api: { getSession: getSessionMock } },
}))

import { requireAuth } from "./requireAuth.js"

function createRes() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  }
  res.status.mockReturnValue(res)
  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
  }
}

function createReq(): Request {
  return { headers: {} } as unknown as Request
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("requireAuth", () => {
  it("sets req.userId and calls next for a valid session", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "user-1" } })
    const req = createReq()
    const res = createRes()
    const next = vi.fn() as unknown as NextFunction

    await requireAuth(req, res, next)

    expect(req.userId).toBe("user-1")
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })

  it("forwards the request headers to getSession", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "user-1" } })
    const headers = { cookie: "session=abc" }
    const req = { headers } as unknown as Request

    await requireAuth(req, createRes(), vi.fn() as unknown as NextFunction)

    expect(getSessionMock).toHaveBeenCalledWith({ headers })
  })

  it("responds 401 when there is no session", async () => {
    getSessionMock.mockResolvedValue(null)
    const req = createReq()
    const res = createRes()
    const next = vi.fn() as unknown as NextFunction

    await requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" })
    expect(next).not.toHaveBeenCalled()
  })

  it("responds 401 when the session has no user", async () => {
    getSessionMock.mockResolvedValue({ user: undefined })
    const res = createRes()
    const next = vi.fn() as unknown as NextFunction

    await requireAuth(createReq(), res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it("responds 500 when session resolution throws", async () => {
    getSessionMock.mockRejectedValue(new Error("boom"))
    const res = createRes()
    const next = vi.fn() as unknown as NextFunction

    await requireAuth(createReq(), res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to resolve session",
    })
    expect(next).not.toHaveBeenCalled()
  })
})

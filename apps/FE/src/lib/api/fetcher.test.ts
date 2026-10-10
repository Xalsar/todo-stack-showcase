import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "./fetcher"

const fetchMock = vi.fn()

async function loadFetcher() {
  vi.resetModules()
  return import("./fetcher")
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  })
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.clearAllMocks()
  delete process.env.NEXT_PUBLIC_API_BASE_URL
})

describe("ApiError", () => {
  it("exposes status, body, name and a descriptive message", () => {
    const error = new ApiError(404, "Not found")

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe("ApiError")
    expect(error.status).toBe(404)
    expect(error.body).toBe("Not found")
    expect(error.message).toBe("API error 404: Not found")
  })
})

describe("todoFetch", () => {
  it("prefixes the request with the configured base URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.test")
    const { todoFetch } = await loadFetcher()
    fetchMock.mockResolvedValue(jsonResponse([]))

    await todoFetch("/todos")

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/todos",
      expect.any(Object)
    )
  })

  it("falls back to localhost:4000 when no base URL is set", async () => {
    const { todoFetch } = await loadFetcher()
    fetchMock.mockResolvedValue(jsonResponse([]))

    await todoFetch("/todos")

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/todos",
      expect.any(Object)
    )
  })

  it("sends credentials and JSON content type", async () => {
    const { todoFetch } = await loadFetcher()
    fetchMock.mockResolvedValue(jsonResponse([]))

    await todoFetch("/todos")

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
    )
  })

  it("merges caller-provided headers", async () => {
    const { todoFetch } = await loadFetcher()
    fetchMock.mockResolvedValue(jsonResponse([]))

    await todoFetch("/todos", { headers: { Authorization: "Bearer token" } })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
      })
    )
  })

  it("passes through method and body options", async () => {
    const { todoFetch } = await loadFetcher()
    fetchMock.mockResolvedValue(jsonResponse({ id: "1" }))

    await todoFetch("/todos", {
      method: "POST",
      body: JSON.stringify({ title: "Buy milk" }),
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Buy milk" }),
      })
    )
  })

  it("returns the parsed JSON body", async () => {
    const { todoFetch } = await loadFetcher()
    fetchMock.mockResolvedValue(jsonResponse({ id: "1", title: "Buy milk" }))

    await expect(todoFetch("/todos/1")).resolves.toEqual({
      id: "1",
      title: "Buy milk",
    })
  })

  it("returns undefined for a 204 response", async () => {
    const { todoFetch } = await loadFetcher()
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(todoFetch("/todos/1")).resolves.toBeUndefined()
  })

  it("throws an ApiError with the status and body on failure", async () => {
    const { todoFetch, ApiError: LoadedApiError } = await loadFetcher()
    fetchMock.mockImplementation(() =>
      Promise.resolve(new Response("Todo not found", { status: 404 }))
    )

    await expect(todoFetch("/todos/1")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      body: "Todo not found",
    })
    await expect(todoFetch("/todos/1")).rejects.toBeInstanceOf(LoadedApiError)
  })
})

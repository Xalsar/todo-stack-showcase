import {
  expect,
  request as playwrightRequest,
  test as base,
} from "@playwright/test"
import type { APIRequestContext } from "@playwright/test"

import { API_URL } from "./env"
import { storageState } from "./storage"

type ApiFixtures = {
  asA: APIRequestContext
  asB: APIRequestContext
}

export const test = base.extend<ApiFixtures>({
  asA: async ({}, use) => {
    const context = await playwrightRequest.newContext({
      baseURL: API_URL,
      storageState: storageState("userA"),
    })
    await use(context)
    await context.dispose()
  },
  asB: async ({}, use) => {
    const context = await playwrightRequest.newContext({
      baseURL: API_URL,
      storageState: storageState("userB"),
    })
    await use(context)
    await context.dispose()
  },
})

export { expect }

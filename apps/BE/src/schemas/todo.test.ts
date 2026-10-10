import { describe, expect, it } from "vitest"

import {
  CreateTodoSchema,
  SetTodoDoneSchema,
  TodoIdParamsSchema,
  TodoSchema,
  UpdateTodoLabelSchema,
  UpdateTodoTitleSchema,
} from "./todo.js"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"
const VALID_DATETIME = "2024-01-01T00:00:00.000Z"

describe("TodoSchema", () => {
  const valid = {
    id: VALID_UUID,
    title: "Write tests",
    done: false,
    labelId: null,
    userId: "user-1",
    createdAt: VALID_DATETIME,
    updatedAt: VALID_DATETIME,
  }

  it("accepts a well-formed todo", () => {
    expect(TodoSchema.safeParse(valid).success).toBe(true)
  })

  it("accepts a nullable labelId set to a uuid", () => {
    expect(
      TodoSchema.safeParse({ ...valid, labelId: VALID_UUID }).success
    ).toBe(true)
  })

  it("rejects a non-uuid id", () => {
    expect(TodoSchema.safeParse({ ...valid, id: "nope" }).success).toBe(false)
  })

  it("rejects a non-datetime createdAt", () => {
    expect(
      TodoSchema.safeParse({ ...valid, createdAt: "yesterday" }).success
    ).toBe(false)
  })

  it("rejects a missing title", () => {
    const { title: _title, ...withoutTitle } = valid
    expect(TodoSchema.safeParse(withoutTitle).success).toBe(false)
  })
})

describe("CreateTodoSchema", () => {
  it("accepts a non-empty title", () => {
    expect(CreateTodoSchema.safeParse({ title: "Buy milk" }).success).toBe(true)
  })

  it("rejects an empty title", () => {
    expect(CreateTodoSchema.safeParse({ title: "" }).success).toBe(false)
  })

  it("rejects a non-string title", () => {
    expect(CreateTodoSchema.safeParse({ title: 42 }).success).toBe(false)
  })

  it("rejects a missing title", () => {
    expect(CreateTodoSchema.safeParse({}).success).toBe(false)
  })
})

describe("SetTodoDoneSchema", () => {
  it("accepts a boolean", () => {
    expect(SetTodoDoneSchema.safeParse({ done: true }).success).toBe(true)
    expect(SetTodoDoneSchema.safeParse({ done: false }).success).toBe(true)
  })

  it("rejects a stringified boolean", () => {
    expect(SetTodoDoneSchema.safeParse({ done: "true" }).success).toBe(false)
  })

  it("rejects a missing done", () => {
    expect(SetTodoDoneSchema.safeParse({}).success).toBe(false)
  })
})

describe("UpdateTodoTitleSchema", () => {
  it("accepts a non-empty title", () => {
    expect(UpdateTodoTitleSchema.safeParse({ title: "Renamed" }).success).toBe(
      true
    )
  })

  it("rejects an empty title", () => {
    expect(UpdateTodoTitleSchema.safeParse({ title: "" }).success).toBe(false)
  })
})

describe("UpdateTodoLabelSchema", () => {
  it("accepts null to clear the label", () => {
    expect(UpdateTodoLabelSchema.safeParse({ labelId: null }).success).toBe(
      true
    )
  })

  it("accepts a uuid label id", () => {
    expect(
      UpdateTodoLabelSchema.safeParse({ labelId: VALID_UUID }).success
    ).toBe(true)
  })

  it("rejects a non-uuid label id", () => {
    expect(UpdateTodoLabelSchema.safeParse({ labelId: "abc" }).success).toBe(
      false
    )
  })

  it("rejects a missing labelId", () => {
    expect(UpdateTodoLabelSchema.safeParse({}).success).toBe(false)
  })
})

describe("TodoIdParamsSchema", () => {
  it("accepts a uuid", () => {
    expect(TodoIdParamsSchema.safeParse({ id: VALID_UUID }).success).toBe(true)
  })

  it("rejects a non-uuid id", () => {
    expect(TodoIdParamsSchema.safeParse({ id: "123" }).success).toBe(false)
  })
})

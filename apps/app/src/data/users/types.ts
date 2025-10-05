import type { SelectUser } from "@nct/db"

export type CreateUserInput = Omit<SelectUser, "id">
export type UpdateUserInput = Partial<Omit<SelectUser, "id">>

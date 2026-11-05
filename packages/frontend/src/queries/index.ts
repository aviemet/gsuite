import { UseQueryResult } from "@tanstack/react-query"

export type QueryError = Error

export type QueryResult<TData> = UseQueryResult<TData, QueryError>

export * from "./company"
export * from "./directory"
export * from "./templates"
export * from "./userSettings"
export * from "./workspace"


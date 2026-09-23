import { UseQueryResult } from "@tanstack/react-query"

export type QueryError = Error

export type QueryResult<TData> = UseQueryResult<TData, QueryError>

export * from "./templates"

// src/client/hooks.ts
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { createCrudClient } from "./crudClient";

const defaultClient = createCrudClient("/api");

export function useCrudQuery<T = any>(model: string, action: string, queryParams?: Record<string, any>, options?: UseQueryOptions<T>) {
    return useQuery<T>({
        queryKey: [model, action, queryParams],
        queryFn: () => defaultClient.request<T>(model, action, "GET", undefined, queryParams),
        ...options,
    });
}

export function useCrudMutation<T = any, V = any>(model: string, action: string, method: "POST" | "PUT" | "DELETE" = "POST", options?: UseMutationOptions<T, Error, V>) {
    return useMutation<T, Error, V>({
        mutationFn: (variables: V) => defaultClient.request<T>(model, action, method, variables),
        ...options,
    });
}

// src/client/crudClient.ts


export function createCrudClient(baseUrl = "/api") {

    async function request<T = any>(
        model: string,
        action: string,
        method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
        data?: any,
        query?: Record<string, any>
    ): Promise<T> {

        let url = `${baseUrl}/${model}/${action}`;

        if (query && method === "GET") {

            const params = new URLSearchParams();

            for (const k of Object.keys(query)) {

                const v = query[k];
                if (v !== undefined && v !== null) params.set(k, String(v));
            }

            const qs = params.toString();
            if (qs) url += `?${qs}`;
        }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: method === "GET" ? undefined : JSON.stringify(data),
        });

        const text = await res.text();
        let payload: any;
        try {
            payload = text ? JSON.parse(text) : undefined;
        } catch (e) {
            // cases where response is not valid JSON
            payload = { error: text || "Invalid JSON response" };
        }

        if (!res.ok) {
            throw new Error(payload?.error ?? "Request failed");
        }

        return payload as T;
    }

    return { request };
}

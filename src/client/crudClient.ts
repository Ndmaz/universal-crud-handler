// src/client/crudClient.ts
export function createCrudClient(baseUrl = "/api") {
    //the model, action and method and data and query is given
    //the model and action are mandatory and if method isnt specified it will default to  "GET"
    //the data and query are optional for passing params
    // the request type is generic and it could be defined in the use case and the function will promise that
    async function request<T = any>(
        model: string,
        action: string,
        method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
        data?: any,
        query?: Record<string, any>
    ): Promise<T> {
        //the url to request is the base url the model/action
        let url = `${baseUrl}/${model}/${action}`;
//if there is a query and the method is GET it will do the as the following
        if (query && method === "GET") {
            ////params are provided by the URLSearchParams class
            const params = new URLSearchParams();
            //
            for (const k of Object.keys(query)) {
                //for each keys in query the data will be in v
                //if its not undefined or null, it will set the params as key and value
                const v = query[k];
                if (v !== undefined && v !== null) params.set(k, String(v));
            }
            //the params turned into string and if there is one, it will add it to the url as the params
            const qs = params.toString();
            if (qs) url += `?${qs}`;
        }
//fetching the url, the method is set header is defalt to json and body is set if the method isnt GET
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: method === "GET" ? undefined : JSON.stringify(data),
        });
//extracting the response text and returning the payload if text is true by parsing or retutn undefined
        const text = await res.text();
        const payload = text ? JSON.parse(text) : undefined;
//side effect
        if (!res.ok) {
            throw new Error(payload?.error ?? "Request failed");
        }
        //final return
        return payload as T;
    }

    return { request };
}

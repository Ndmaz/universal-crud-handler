import { dispatch } from "./dispatcher";
import { errorResponse, successResponse } from "./response";
import { CreateCrudHandlerOptions } from "./types";

export function createCrudHandler(
  options: CreateCrudHandlerOptions
) {
  return async function handler(
    req: any,
    params: { model: string; action: string }
  ) {
    try {
      const result = await dispatch(
        options,
        req,
        params
      );

      return successResponse(result);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

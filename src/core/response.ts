import { NextResponse } from "next/server";
import { CrudError } from "./errors";

export function successResponse(data: unknown) {
  return NextResponse.json(data, { status: 200 });
}

export function errorResponse(error: unknown) {
  if (error instanceof CrudError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500 }
  );
}

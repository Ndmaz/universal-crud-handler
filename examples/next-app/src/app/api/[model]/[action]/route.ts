import { createCrudHandler } from "@universal-crud/next";
import { NextRequest } from "next/server";
import { crudRegistry } from "@/lib/crud/registry";

const handler = createCrudHandler({ registry: crudRegistry });

type RouteContext = {
  params: Promise<{ model: string; action: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return handler(req, await context.params);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return handler(req, await context.params);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return handler(req, await context.params);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return handler(req, await context.params);
}

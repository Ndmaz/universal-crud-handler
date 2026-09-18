import { createCrudHandler } from "@universal-crud/next";
import { crudRegistry } from "@/lib/crud/registry";

const handler = createCrudHandler({ registry: crudRegistry });

export async function GET(req: Request, context: { params: Promise<{ model: string; action: string }> }) {
  return handler(req, await context.params);
}

export async function POST(req: Request, context: { params: Promise<{ model: string; action: string }> }) {
  return handler(req, await context.params);
}

export async function PUT(req: Request, context: { params: Promise<{ model: string; action: string }> }) {
  return handler(req, await context.params);
}

export async function DELETE(req: Request, context: { params: Promise<{ model: string; action: string }> }) {
  return handler(req, await context.params);
}

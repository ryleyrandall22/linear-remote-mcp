import type { LinearClient } from "@linear/sdk";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { ZodRawShape, ZodTypeAny, z } from "zod";

export function tool<Args extends undefined | ZodRawShape = undefined>({
  name,
  description,
  params = {},
  execute,
}: {
  name: string;
  description: string;
  params?: Args;
  execute: (
    client: LinearClient,
    args: Args extends ZodRawShape
      ? z.objectOutputType<Args, ZodTypeAny>
      : undefined,
  ) => CallToolResult | Promise<CallToolResult>;
}) {
  return { name, description, params, execute };
}

export type Tool = ReturnType<typeof tool>;

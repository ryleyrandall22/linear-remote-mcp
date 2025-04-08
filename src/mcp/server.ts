import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import type { MCPProps, MCPState } from "../types";

export class LinearMCP extends McpAgent<CloudflareEnv, MCPState, MCPProps> {
  server = new McpServer({ name: "Linear MCP", version: "1.0.0" });

  async init() {
    this.server.tool("whoami", "Get the current user", {}, async () => {
      return {
        content: [{ type: "text", text: JSON.stringify(this.props) }],
      };
    });
  }
}

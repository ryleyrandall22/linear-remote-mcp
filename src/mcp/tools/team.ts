import { z } from "zod";
import { type Tool, tool } from "~/mcp/utils";

const TeamSchema = z.object({
  id: z.string(),
  key: z.string().nullish(),
  name: z.string().nullish(),
  issueCount: z.number().nullish(),
  private: z.boolean().nullish(),
});

export const TEAM_TOOLS: Tool[] = [
  tool({
    name: "get_team_by_id",
    description: "Get a team by its ID",
    params: { id: z.string() },
    execute: async (client, args) => {
      const team = await client.team(args.id);
      return { content: [{ type: "text", text: JSON.stringify(team) }] };
    },
  }),
  tool({
    name: "list_teams",
    description: "List all teams",
    execute: async (client) => {
      const teams = await client.teams();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(z.array(TeamSchema).parse(teams.nodes)),
          },
        ],
      };
    },
  }),
];

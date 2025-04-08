import { z } from "zod";
import { type Tool, tool } from "~/mcp/utils";

const IssueSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  labelIds: z.array(z.string()).nullish(),
  number: z.number().nullish(),
  priority: z.number().nullish(),
  priorityLabel: z.string().nullish(),
  slaType: z.string().nullish(),
  title: z.string(),
  description: z.string().nullish(),
  branchName: z.string().nullish(),
  url: z.string().nullish(),
  _projectMilestone: z.object({ id: z.string() }).nullish(),
  _creator: z.object({ id: z.string() }).nullish(),
  _cycle: z.object({ id: z.string() }).nullish(),
  _parent: z.object({ id: z.string() }).nullish(),
  _state: z.object({ id: z.string() }).nullish(),
  _team: z.object({ id: z.string() }),
  _assignee: z.object({ id: z.string() }).nullish(),
});

const IssueMutationSchema = IssueSchema.pick({
  title: true,
  description: true,
  _assignee: true,
  _cycle: true,
  _parent: true,
  _projectMilestone: true,
  _team: true,
});

export const ISSUE_TOOLS: Tool[] = [
  tool({
    name: "get_issue_by_id",
    description: "Get an issue by its ID",
    params: { id: z.string() },
    execute: async (client, args) => {
      const issue = await client.issue(args.id);
      return { content: [{ type: "text", text: JSON.stringify(issue) }] };
    },
  }),
  tool({
    name: "list_issues",
    description: "List all issues",
    execute: async (client) => {
      const issues = await client.issues();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(z.array(IssueSchema).parse(issues.nodes)),
          },
        ],
      };
    },
  }),
  tool({
    name: "search_issue",
    description: "Search issues given a query string",
    params: { query: z.string() },
    execute: async (client, args) => {
      const issues = await client.searchIssues(args.query);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(z.array(IssueSchema).parse(issues.nodes)),
          },
        ],
      };
    },
  }),
  tool({
    name: "create_issue",
    description: "Create an issue",
    params: IssueMutationSchema.shape,
    execute: async (client, args) => {
      const issue = await client.createIssue({
        title: args.title,
        description: args.description,
        assigneeId: args._assignee?.id,
        cycleId: args._cycle?.id,
        parentId: args._parent?.id,
        projectMilestoneId: args._projectMilestone?.id,
        teamId: args._team.id,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(IssueSchema.parse(issue.issue)),
          },
        ],
      };
    },
  }),
  tool({
    name: "update_issue",
    description: "Update an issue",
    params: IssueMutationSchema.partial().extend({ id: z.string() }).shape,
    execute: async (client, args) => {
      const { id, ...rest } = args;
      const issue = await client.updateIssue(id, rest);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(IssueSchema.parse(issue.issue)),
          },
        ],
      };
    },
  }),
];

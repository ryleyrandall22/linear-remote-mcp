import { z } from "zod";
import {
  DateComparatorSchema,
  IdComparatorSchema,
  StringComparatorSchema,
  type Tool,
  tool,
} from "~/mcp/utils";

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
  _projectMilestone: z
    .object({ id: z.string() })
    .nullish()
    .describe("The project milestone of the issue"),
  _creator: z
    .object({ id: z.string() })
    .nullish()
    .describe("The creator of the issue"),
  _cycle: z
    .object({ id: z.string() })
    .nullish()
    .describe("The cycle of the issue"),
  _parent: z
    .object({ id: z.string() })
    .nullish()
    .describe("The parent of the issue"),
  _state: z
    .object({ id: z.string() })
    .nullish()
    .describe("The workflowID of the issue"),
  _team: z.object({ id: z.string() }).describe("The team of the issue"),
  _assignee: z
    .object({ id: z.string() })
    .nullish()
    .describe("The assignee of the issue"),
});

const IssueMutationSchema = IssueSchema.pick({
  title: true,
  description: true,
}).extend({
  teamId: z.string(),
  assigneeId: z.string().optional(),
  cycleId: z.string().optional(),
  parentId: z.string().optional(),
  projectMilestoneId: z.string().optional(),
  stateId: z.string().optional(),
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
    params: {
      assignee: z
        .object({ id: IdComparatorSchema })
        .optional()
        .describe("Search by assignee"),
      state: z
        .object({ id: IdComparatorSchema })
        .optional()
        .describe(
          "Search by state ID, if needed, call a tool to get all the states first",
        ),
      dueDate: DateComparatorSchema.optional().describe("Search by due date"),
    },
    execute: async (client, args) => {
      const issues = await client.issues({
        filter: {
          assignee: args.assignee,
          state: args.state,
          dueDate: args.dueDate,
        },
      });
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
        assigneeId: args.assigneeId,
        cycleId: args.cycleId,
        parentId: args.parentId,
        projectMilestoneId: args.projectMilestoneId,
        teamId: args.teamId,
        stateId: args.stateId,
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
            text: JSON.stringify(issue.success),
          },
        ],
      };
    },
  }),
];

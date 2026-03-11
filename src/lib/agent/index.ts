import OpenAI from "openai";
import type {
  InquiryInput,
  AgentResult,
  InquiryCategory,
  EscalationSummary,
  KnowledgeSearchResult,
} from "@/types";
import {
  findInvestorByEmail,
  findClientByName,
  getAllClients,
  getKnowledgeByCategory,
  findDuplicateInquiry,
} from "@/lib/supabase";
import { searchKnowledge } from "@/lib/pinecone";
import { SYSTEM_PROMPT, formatChannelInstructions } from "./prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─── Tool Definitions ─────────────────────────────────────────────────────────

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "verify_investor",
      description:
        "Verify if an investor exists in the IFT system by email or name. Returns investor details if found.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string", description: "Investor email address" },
          name: { type: "string", description: "Investor full name (optional)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_client_info",
      description:
        "Get details about a specific IFT client/sponsor including their rules for distributions, tax documents, and redemptions.",
      parameters: {
        type: "object",
        properties: {
          client_name: {
            type: "string",
            description:
              "Client/sponsor name (e.g., 'Phoenix American Hospitality', 'Rastegar')",
          },
        },
        required: ["client_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_all_clients",
      description: "List all IFT clients/sponsors with their basic information.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_knowledge_base",
      description:
        "Search the IFT knowledge base (Pinecone vector DB) for relevant information about investor questions.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query based on the investor's question",
          },
          category: {
            type: "string",
            description: "Inquiry category to filter results",
            enum: [
              "distributions",
              "tax_documents",
              "account_activation",
              "banking_changes",
              "accreditation",
              "investment_status",
              "redemption_request",
              "technical_portal_help",
              "other_unknown",
            ],
          },
          client_id: {
            type: "string",
            description: "Client UUID to search client-specific knowledge",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_structured_knowledge",
      description:
        "Get knowledge entries directly from the Supabase database for a specific category and client.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Inquiry category",
          },
          client_id: {
            type: "string",
            description: "Client UUID (optional, omit for general knowledge)",
          },
        },
        required: ["category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_duplicate",
      description:
        "Check if this inquiry is a duplicate of a recent inquiry from the same investor.",
      parameters: {
        type: "object",
        properties: {
          investor_email: {
            type: "string",
            description: "Investor email address",
          },
          category: {
            type: "string",
            description: "Inquiry category",
          },
        },
        required: ["investor_email", "category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "submit_final_response",
      description:
        "Submit the final agent decision: either a resolved response to the investor or an escalation summary for the human team.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["resolved", "escalated", "needs_verification", "duplicate"],
            description: "Final status of the inquiry",
          },
          category: {
            type: "string",
            description: "Classified inquiry category",
            enum: [
              "distributions",
              "tax_documents",
              "account_activation",
              "banking_changes",
              "accreditation",
              "investment_status",
              "redemption_request",
              "technical_portal_help",
              "other_unknown",
            ],
          },
          response: {
            type: "string",
            description:
              "The response to send to the investor (if status is resolved or needs_verification or duplicate)",
          },
          escalation_summary: {
            type: "object",
            description:
              "Structured summary for the human team (if status is escalated)",
            properties: {
              investor_name: { type: "string" },
              investor_email: { type: "string" },
              client: { type: "string" },
              deal: { type: "string" },
              channel: { type: "string" },
              category: { type: "string" },
              original_text: { type: "string" },
              information_found: { type: "string" },
              information_gaps: { type: "string" },
              proposed_response: { type: "string" },
              priority: {
                type: "string",
                enum: ["low", "medium", "high"],
              },
            },
          },
          confidence_score: {
            type: "number",
            description:
              "Confidence level (0-1) in the response accuracy. Use >0.8 for resolved, <0.6 for escalated.",
          },
          investor_verified: {
            type: "boolean",
            description: "Whether the investor was confirmed in the system",
          },
          client_identified: {
            type: "string",
            description: "Client name if identified",
          },
          deal_identified: {
            type: "string",
            description: "Deal name if identified",
          },
          duplicate_inquiry_id: {
            type: "string",
            description: "ID of the original inquiry if this is a duplicate",
          },
        },
        required: ["status", "category", "confidence_score", "investor_verified"],
      },
    },
  },
];

// ─── Tool Execution ───────────────────────────────────────────────────────────

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  inquiry: InquiryInput
): Promise<string> {
  try {
    switch (name) {
      case "verify_investor": {
        const email = (input.email as string) ?? inquiry.investor_email;
        if (!email) return JSON.stringify({ found: false, reason: "No email provided" });
        const investor = await findInvestorByEmail(email);
        if (!investor)
          return JSON.stringify({
            found: false,
            email,
            message: "Investor not found in system",
          });
        return JSON.stringify({
          found: true,
          id: investor.id,
          name: investor.name,
          email: investor.email,
          deal_ids: investor.deal_ids,
          accredited: investor.accredited,
          kyc_status: investor.kyc_status,
        });
      }

      case "get_client_info": {
        const clientName = input.client_name as string;
        const client = await findClientByName(clientName);
        if (!client)
          return JSON.stringify({
            found: false,
            message: `Client '${clientName}' not found`,
          });
        return JSON.stringify({ found: true, ...client });
      }

      case "list_all_clients": {
        const clients = await getAllClients();
        return JSON.stringify(
          clients.map((c) => ({
            id: c.id,
            name: c.name,
            tax_document_type: c.tax_document_type,
            distribution_schedule: c.distribution_schedule,
            reinvestment_policy: c.reinvestment_policy,
            sponsor_contact: c.sponsor_contact,
          }))
        );
      }

      case "search_knowledge_base": {
        const results: KnowledgeSearchResult[] = await searchKnowledge(
          input.query as string,
          {
            category: input.category as string | undefined,
            clientId: input.client_id as string | undefined,
            topK: 5,
          }
        );
        return JSON.stringify(results);
      }

      case "get_structured_knowledge": {
        const entries = await getKnowledgeByCategory(
          input.category as string,
          input.client_id as string | undefined
        );
        return JSON.stringify(entries);
      }

      case "check_duplicate": {
        const duplicate = await findDuplicateInquiry(
          input.investor_email as string,
          input.category as string
        );
        if (!duplicate) return JSON.stringify({ is_duplicate: false });
        return JSON.stringify({
          is_duplicate: true,
          original_inquiry_id: duplicate.id,
          original_created_at: duplicate.created_at,
          original_status: duplicate.status,
        });
      }

      case "submit_final_response":
        return JSON.stringify({ acknowledged: true, ...input });

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    console.error(`[agent] tool ${name} error:`, err);
    return JSON.stringify({ error: String(err) });
  }
}

// ─── Main Agent Function ──────────────────────────────────────────────────────

export async function processInquiry(
  inquiry: InquiryInput
): Promise<AgentResult> {
  const startTime = Date.now();

  const userMessage = `
INVESTOR INQUIRY
================
Channel: ${inquiry.channel}
From: ${inquiry.investor_name ?? "Unknown"} <${inquiry.investor_email ?? "unknown@email.com"}>
${inquiry.subject ? `Subject: ${inquiry.subject}` : ""}
${inquiry.deal_hint ? `Deal (hint): ${inquiry.deal_hint}` : ""}
${inquiry.client_hint ? `Client (hint): ${inquiry.client_hint}` : ""}

Message:
${inquiry.text}

---
${formatChannelInstructions(inquiry.channel)}

Process this inquiry step by step:
1. Classify the inquiry category
2. Check for duplicates (if email provided)
3. Verify the investor (if email provided)
4. Identify the client and deal
5. Search the knowledge base
6. Apply client-specific rules
7. Decide: resolve or escalate
8. Call submit_final_response with your decision
`.trim();

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  let finalResult: AgentResult | null = null;
  const maxIterations = 10;
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 8192,
      tools,
      tool_choice: "auto",
      messages,
    });

    const message = response.choices[0].message;
    messages.push(message);

    if (response.choices[0].finish_reason === "stop") break;

    if (response.choices[0].finish_reason !== "tool_calls") break;

    const toolCalls = message.tool_calls ?? [];

    for (const toolCall of toolCalls) {
      let input: Record<string, unknown> = {};
      try {
        input = JSON.parse(toolCall.function.arguments);
      } catch {
        // ignore parse error
      }

      const result = await executeTool(toolCall.function.name, input, inquiry);

      if (toolCall.function.name === "submit_final_response") {
        try {
          const parsed = JSON.parse(result);
          finalResult = {
            status: parsed.status,
            category: parsed.category as InquiryCategory,
            response: parsed.response,
            escalation_summary: parsed.escalation_summary as EscalationSummary,
            confidence_score: parsed.confidence_score ?? 0.5,
            investor_verified: parsed.investor_verified ?? false,
            client_identified: parsed.client_identified,
            deal_identified: parsed.deal_identified,
            duplicate_inquiry_id: parsed.duplicate_inquiry_id,
          };
        } catch {
          console.error("[agent] Failed to parse submit_final_response");
        }
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }

    if (finalResult) break;
  }

  const processingTime = Date.now() - startTime;
  console.info(
    `[agent] Processed in ${processingTime}ms, ${iterations} iterations`
  );

  if (!finalResult) {
    finalResult = {
      status: "escalated",
      category: "other_unknown",
      escalation_summary: {
        channel: inquiry.channel,
        category: "other_unknown",
        original_text: inquiry.text,
        information_found: "Agent did not complete processing",
        information_gaps: "Unknown – agent processing error",
        priority: "medium",
        investor_email: inquiry.investor_email,
        investor_name: inquiry.investor_name,
      },
      confidence_score: 0,
      investor_verified: false,
    };
  }

  return finalResult;
}

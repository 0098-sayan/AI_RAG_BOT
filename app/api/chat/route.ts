import {
  streamText,
  UIMessage,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
  tool,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { searchDocuments } from "../../../lib/search";

const tools = {
  searchKnowledgeBase: tool({
    description: "Search the knowledge base for relevant documents.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("The search query to find relevant documents."),
    }),
    execute: async ({ query }) => {
      try {
        const results = await searchDocuments(query, 3, 0.5);
        if (results.length === 0) {
          return "No relevant documents found in the knowledge base.";
        }
        const formattedResults = results
          .map((r, i) => {
            `[${i + 1}]{r.content}`;
          })
          .join("\n\n");
        return formattedResults;
      } catch (error) {
        console.error("Error occurred while searching documents:", error);
        return "Error searching the knowledge base";
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Get messages from the frontend
    const { messages }: { messages: ChatMessage[] } = await req.json();

    // Convert UI messages to model messages
    const modelMessages = await convertToModelMessages(messages);

    // Generate streaming response
    const result = streamText({
      model: google("gemini-3.6-flash"),
      messages: modelMessages,
      onError: ({ error }) => {
        console.error("Gemini streaming error:", error);
      },
      tools,
      system: `You are a helpful assistant with access to a knowledge base. 
          When users ask questions, search the knowledge base for relevant information.
          Always search before answering if the question might relate to uploaded documents.
          Base your answers on the search results when available. Give concise answers that correctly answer what the user is asking for. Do not flood them with all the information from the search results.`,
      stopWhen: stepCountIs(2),
    });

    // Convert model stream to UI message stream
    const stream = toUIMessageStream({
      stream: result.stream,
    });

    // Return streaming response
    return createUIMessageStreamResponse({
      stream,
    });
  } catch (error) {
    console.error("Error occurred while processing the request:", error);

    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}

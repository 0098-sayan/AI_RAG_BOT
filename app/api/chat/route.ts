import {
  streamText,
  UIMessage,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";

import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Get messages from the frontend
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Convert UI messages to model messages
    const modelMessages = await convertToModelMessages(messages);

    // Generate streaming response
    const result = streamText({
      model: google("gemini-3.6-flash"),
      messages: modelMessages,
      onError: ({ error }) => {
        console.error("Gemini streaming error:", error);
      },
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

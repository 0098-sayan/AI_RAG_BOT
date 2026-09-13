import { embed, embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export async function generateEmbedding(text: string) {
  const input = text.replace("\n", " ");
  const { embedding } = await embed({
    model: createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    }).embedding("gemini-embedding-001"),
    value: input,
    providerOptions: {
      google: {
        outputDimensionality: 1536,
      },
    },
  });
  return embedding;
}

export async function generateembeddings(texts: string[]) {
  const inputs = texts.map((text) => text.replace("\n", " "));
  const { embeddings } = await embedMany({
    model: createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    }).embedding("gemini-embedding-001"),
    values: inputs,
  });
  return embeddings;
}

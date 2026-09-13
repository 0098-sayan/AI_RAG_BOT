"use server";

import { PDFParse } from "pdf-parse";
import { db } from "@/lib/db-config";
import { documents } from "@/lib/db-schema";
import { generateembeddings } from "@/lib/embeddings";
import { chunkContent } from "@/lib/chunking";

export async function processPdfFile(fromData: FormData) {
  try {
    const file = fromData.get("file") as File;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const parser = new PDFParse({ data: buffer });
    let data;

    try {
      data = await parser.getText();
    } finally {
      await parser.destroy();
    }

    if (!data.text || data.text.trim().length === 0) {
      return {
        success: false,
        error: "PDF file is empty or contains no text.",
      };
    }

    const chunks = await chunkContent(data.text);
    const embeddings = await generateembeddings(chunks);
    const records = chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddings[index],
    }));

    await db.insert(documents).values(records);
    return {
      success: true,
      message: `Created ${records.length} searchable chunks.`,
    };
  } catch (error) {
    console.error("Error processing PDF file:", error);
    return {
      success: false,
      error: "Failed to process PDF file.",
    };
  }
}

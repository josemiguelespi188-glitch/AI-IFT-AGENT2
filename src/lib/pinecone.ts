import { Pinecone } from "@pinecone-database/pinecone";
import type { KnowledgeSearchResult } from "@/types";

let pineconeClient: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

const INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? "ift-knowledge-base";

// Simple embedding using text hash (replace with real embeddings in production)
// In production, use OpenAI embeddings or Anthropic's embedding model
async function generateEmbedding(text: string): Promise<number[]> {
  // Fallback: sparse vector representation using character codes
  // For production, replace with: await openai.embeddings.create({ model: "text-embedding-3-small", input: text })
  const vector = new Array(1536).fill(0);
  const normalized = text.toLowerCase().slice(0, 1000);
  for (let i = 0; i < normalized.length; i++) {
    const idx = normalized.charCodeAt(i) % 1536;
    vector[idx] += 1 / normalized.length;
  }
  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? vector.map((v) => v / magnitude) : vector;
}

export async function upsertKnowledge(entry: {
  id: string;
  question: string;
  answer: string;
  category: string;
  clientId?: string;
  source: string;
}): Promise<void> {
  try {
    const pc = getPineconeClient();
    const index = pc.Index(INDEX_NAME);
    const embedding = await generateEmbedding(
      `${entry.question} ${entry.answer}`
    );

    await index.upsert([
      {
        id: entry.id,
        values: embedding,
        metadata: {
          question: entry.question,
          answer: entry.answer,
          category: entry.category,
          client_id: entry.clientId ?? "general",
          source: entry.source,
        },
      },
    ]);
  } catch (err) {
    console.error("[pinecone] upsertKnowledge error:", err);
  }
}

export async function searchKnowledge(
  query: string,
  options: {
    category?: string;
    clientId?: string;
    topK?: number;
  } = {}
): Promise<KnowledgeSearchResult[]> {
  try {
    const pc = getPineconeClient();
    const index = pc.Index(INDEX_NAME);
    const embedding = await generateEmbedding(query);

    const filter: Record<string, unknown> = {};
    if (options.category) filter.category = options.category;
    if (options.clientId) {
      filter.$or = [
        { client_id: options.clientId },
        { client_id: "general" },
      ];
    }

    const results = await index.query({
      vector: embedding,
      topK: options.topK ?? 5,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      includeMetadata: true,
    });

    return (results.matches ?? []).map((match) => ({
      id: match.id,
      score: match.score ?? 0,
      question: String(match.metadata?.question ?? ""),
      answer: String(match.metadata?.answer ?? ""),
      category: String(match.metadata?.category ?? ""),
      client_id: match.metadata?.client_id
        ? String(match.metadata.client_id)
        : undefined,
      source: String(match.metadata?.source ?? "general"),
    }));
  } catch (err) {
    console.error("[pinecone] searchKnowledge error:", err);
    return [];
  }
}

export async function deleteKnowledgeEntry(id: string): Promise<void> {
  try {
    const pc = getPineconeClient();
    const index = pc.Index(INDEX_NAME);
    await index.deleteOne(id);
  } catch (err) {
    console.error("[pinecone] deleteKnowledgeEntry error:", err);
  }
}

// Seed Pinecone with initial knowledge (run once)
export async function seedPineconeFromSupabase(
  entries: Array<{
    id: string;
    question: string;
    answer: string;
    category: string;
    clientId?: string;
    source: string;
  }>
): Promise<{ seeded: number; errors: number }> {
  let seeded = 0;
  let errors = 0;

  for (const entry of entries) {
    try {
      await upsertKnowledge(entry);
      seeded++;
    } catch {
      errors++;
    }
  }

  return { seeded, errors };
}

import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import type { KnowledgeSearchResult } from "@/types";

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openaiClient.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

// ── Legacy QA knowledge ───────────────────────────────────────────────────────

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

// ── KB structured knowledge (area/folder/entry, chunked) ─────────────────────

const KB_CHUNK_SIZE = 1400; // chars per chunk
const KB_CHUNK_OVERLAP = 150;

function chunkText(text: string): string[] {
  if (text.length <= KB_CHUNK_SIZE) return [text.trim()].filter(Boolean);
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const chunk = text.slice(start, start + KB_CHUNK_SIZE).trim();
    if (chunk) chunks.push(chunk);
    start += KB_CHUNK_SIZE - KB_CHUNK_OVERLAP;
  }
  return chunks;
}

/**
 * Vectorize a KB entry as overlapping chunks, upsert all to Pinecone.
 * Returns the list of vector IDs created (needed for future deletion).
 */
export async function upsertKBEntry(entry: {
  entryId: string;
  text: string;
  area: string;
  folder: string;
  title: string;
}): Promise<string[]> {
  const pc = getPineconeClient();
  const index = pc.Index(INDEX_NAME);
  const chunks = chunkText(entry.text);
  const chunkIds: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkId = `kb-${entry.entryId}-chunk-${i}`;
    const embedding = await generateEmbedding(chunks[i]);

    await index.upsert([
      {
        id: chunkId,
        values: embedding,
        metadata: {
          record_type: "kb_chunk",
          entry_id: entry.entryId,
          area: entry.area,
          folder: entry.folder,
          title: entry.title,
          content_preview: chunks[i].slice(0, 512),
          chunk_index: i,
          total_chunks: chunks.length,
        },
      },
    ]);

    chunkIds.push(chunkId);
  }

  return chunkIds;
}

/**
 * Delete a set of KB chunk vectors from Pinecone by their IDs.
 */
export async function deleteKBChunks(chunkIds: string[]): Promise<void> {
  if (chunkIds.length === 0) return;
  const pc = getPineconeClient();
  const index = pc.Index(INDEX_NAME);
  await index.deleteMany(chunkIds);
}

export interface KBSearchResult {
  entryId: string;
  title: string;
  area: string;
  folder: string;
  contentPreview: string;
  score: number;
  chunkIndex: number;
}

/**
 * Semantic search over KB chunks. Filters by area/folder if provided.
 * De-duplicates by entryId, keeping the highest-scoring chunk per entry.
 */
export async function searchKBEntries(
  query: string,
  options: { area?: string; folder?: string; topK?: number } = {}
): Promise<KBSearchResult[]> {
  const pc = getPineconeClient();
  const index = pc.Index(INDEX_NAME);
  const embedding = await generateEmbedding(query);

  const filter: Record<string, unknown> = { record_type: "kb_chunk" };
  if (options.area) filter.area = options.area;
  if (options.folder) filter.folder = options.folder;

  const rawTopK = (options.topK ?? 5) * 3; // over-fetch to allow de-dup
  const results = await index.query({
    vector: embedding,
    topK: rawTopK,
    filter,
    includeMetadata: true,
  });

  // Keep best score per entryId
  const seen = new Map<string, KBSearchResult>();
  for (const match of results.matches ?? []) {
    const entryId = String(match.metadata?.entry_id ?? match.id);
    const score = match.score ?? 0;
    if (!seen.has(entryId) || seen.get(entryId)!.score < score) {
      seen.set(entryId, {
        entryId,
        title: String(match.metadata?.title ?? ""),
        area: String(match.metadata?.area ?? ""),
        folder: String(match.metadata?.folder ?? ""),
        contentPreview: String(match.metadata?.content_preview ?? ""),
        score,
        chunkIndex: Number(match.metadata?.chunk_index ?? 0),
      });
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, options.topK ?? 5);
}

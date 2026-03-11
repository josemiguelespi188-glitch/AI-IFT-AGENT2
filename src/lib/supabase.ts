import { createClient } from "@supabase/supabase-js";
import type {
  Investor,
  Client,
  Deal,
  Inquiry,
  KnowledgeEntry,
  ApprovedResponse,
} from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client (browser-safe)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client (uses service role if available, else anon)
export function createServerClient() {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey;
  return createClient(supabaseUrl, key);
}

// ─── Investor Queries ─────────────────────────────────────────────────────────

export async function findInvestorByEmail(email: string): Promise<Investor | null> {
  const db = createServerClient();
  const { data } = await db
    .from("investors")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();
  return data as Investor | null;
}

export async function findInvestorByName(name: string): Promise<Investor[]> {
  const db = createServerClient();
  const { data } = await db
    .from("investors")
    .select("*")
    .ilike("name", `%${name}%`)
    .limit(5);
  return (data as Investor[]) ?? [];
}

// ─── Client Queries ───────────────────────────────────────────────────────────

export async function getAllClients(): Promise<Client[]> {
  const db = createServerClient();
  const { data } = await db.from("clients").select("*").order("name");
  return (data as Client[]) ?? [];
}

export async function findClientByName(name: string): Promise<Client | null> {
  const db = createServerClient();
  const { data } = await db
    .from("clients")
    .select("*")
    .ilike("name", `%${name}%`)
    .single();
  return data as Client | null;
}

export async function getClientById(id: string): Promise<Client | null> {
  const db = createServerClient();
  const { data } = await db.from("clients").select("*").eq("id", id).single();
  return data as Client | null;
}

// ─── Deal Queries ─────────────────────────────────────────────────────────────

export async function getDealsByClient(clientId: string): Promise<Deal[]> {
  const db = createServerClient();
  const { data } = await db
    .from("deals")
    .select("*")
    .eq("client_id", clientId)
    .eq("status", "active");
  return (data as Deal[]) ?? [];
}

export async function findDealByName(name: string): Promise<Deal | null> {
  const db = createServerClient();
  const { data } = await db
    .from("deals")
    .select("*, clients(*)")
    .ilike("name", `%${name}%`)
    .single();
  return data as Deal | null;
}

// ─── Inquiry Queries ──────────────────────────────────────────────────────────

export async function createInquiry(
  inquiry: Omit<Inquiry, "id" | "created_at">
): Promise<Inquiry | null> {
  const db = createServerClient();
  const { data, error } = await db
    .from("inquiries")
    .insert(inquiry)
    .select()
    .single();
  if (error) console.error("[supabase] createInquiry error:", error);
  return data as Inquiry | null;
}

export async function updateInquiry(
  id: string,
  updates: Partial<Inquiry>
): Promise<Inquiry | null> {
  const db = createServerClient();
  const { data, error } = await db
    .from("inquiries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) console.error("[supabase] updateInquiry error:", error);
  return data as Inquiry | null;
}

export async function getInquiries(limit = 50): Promise<Inquiry[]> {
  const db = createServerClient();
  const { data } = await db
    .from("inquiries")
    .select("*, investors(name, email), clients(name), deals(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Inquiry[]) ?? [];
}

export async function getInquiryById(id: string): Promise<Inquiry | null> {
  const db = createServerClient();
  const { data } = await db
    .from("inquiries")
    .select("*, investors(*), clients(*), deals(*)")
    .eq("id", id)
    .single();
  return data as Inquiry | null;
}

// Detect duplicates: same investor + similar text within 24h
export async function findDuplicateInquiry(
  investorEmail: string,
  category: string
): Promise<Inquiry | null> {
  const db = createServerClient();
  const twentyFourHoursAgo = new Date(Date.now() - 86400000).toISOString();
  const { data } = await db
    .from("inquiries")
    .select("*")
    .eq("investor_email", investorEmail)
    .eq("category", category)
    .gte("created_at", twentyFourHoursAgo)
    .neq("status", "duplicate")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data as Inquiry | null;
}

// ─── Knowledge Base Queries ───────────────────────────────────────────────────

export async function getKnowledgeByCategory(
  category: string,
  clientId?: string
): Promise<KnowledgeEntry[]> {
  const db = createServerClient();
  let query = db
    .from("knowledge_base")
    .select("*")
    .eq("category", category)
    .order("updated_at", { ascending: false });

  if (clientId) {
    query = query.or(`client_id.eq.${clientId},client_id.is.null`);
  } else {
    query = query.is("client_id", null);
  }

  const { data } = await query.limit(10);
  return (data as KnowledgeEntry[]) ?? [];
}

export async function addApprovedResponse(
  response: Omit<ApprovedResponse, "id" | "approved_at">
): Promise<void> {
  const db = createServerClient();

  // Add to approved_responses table
  await db.from("approved_responses").insert(response);

  // Also add to knowledge_base for future searches
  await db.from("knowledge_base").insert({
    client_id: response.client_id,
    category: response.category,
    question: response.question,
    answer: response.answer,
    source: "approved_response",
    approved_by: response.approved_by,
  });
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getInquiryStats() {
  const db = createServerClient();
  const { data } = await db
    .from("inquiries")
    .select("status, category, channel, created_at");

  if (!data) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    total: data.length,
    pending: data.filter((i) => i.status === "pending").length,
    processing: data.filter((i) => i.status === "processing").length,
    resolved: data.filter((i) => i.status === "resolved").length,
    escalated: data.filter((i) => i.status === "escalated").length,
    today: data.filter((i) => new Date(i.created_at) >= today).length,
    byCategory: data.reduce(
      (acc, i) => {
        acc[i.category] = (acc[i.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byChannel: data.reduce(
      (acc, i) => {
        acc[i.channel] = (acc[i.channel] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}

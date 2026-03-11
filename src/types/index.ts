// ─── Enums ───────────────────────────────────────────────────────────────────

export type InquiryCategory =
  | "distributions"
  | "tax_documents"
  | "account_activation"
  | "banking_changes"
  | "accreditation"
  | "investment_status"
  | "redemption_request"
  | "technical_portal_help"
  | "other_unknown";

export type InquiryChannel = "portal" | "email" | "zendesk" | "phone";

export type InquiryStatus =
  | "pending"
  | "processing"
  | "resolved"
  | "escalated"
  | "needs_verification"
  | "duplicate";

export type TaxDocumentType = "1099-DIV" | "K-1" | "1099-INT" | "1099-B" | "other";

// ─── Database Models ──────────────────────────────────────────────────────────

export interface Investor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  deal_ids: string[];
  accredited: boolean;
  kyc_status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  portal_url?: string;
  sponsor_contact: string;
  sponsor_email?: string;
  tax_document_type: TaxDocumentType;
  distribution_schedule: string;
  reinvestment_policy: boolean;
  redemption_rules: string;
  notes?: string;
  created_at: string;
}

export interface Deal {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  status: "active" | "closed" | "pending";
  investment_type: string;
  regulation_type?: "reg_d_506b" | "reg_d_506c" | "reg_a" | "reg_cf";
  minimum_investment?: number;
  created_at: string;
}

export interface Inquiry {
  id: string;
  investor_id?: string;
  investor_email?: string;
  investor_name?: string;
  client_id?: string;
  deal_id?: string;
  channel: InquiryChannel;
  category: InquiryCategory;
  original_text: string;
  subject?: string;
  status: InquiryStatus;
  ai_response?: string;
  escalation_summary?: EscalationSummary;
  duplicate_of?: string;
  confidence_score?: number;
  processing_time_ms?: number;
  created_at: string;
  resolved_at?: string;
}

export interface KnowledgeEntry {
  id: string;
  client_id?: string;
  category: InquiryCategory;
  question: string;
  answer: string;
  source: "general" | "client_specific" | "approved_response";
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovedResponse {
  id: string;
  inquiry_id: string;
  client_id?: string;
  deal_id?: string;
  category: InquiryCategory;
  question: string;
  answer: string;
  approved_by: string;
  approved_at: string;
}

// ─── Agent Types ──────────────────────────────────────────────────────────────

export interface InquiryInput {
  text: string;
  channel: InquiryChannel;
  investor_email?: string;
  investor_name?: string;
  subject?: string;
  deal_hint?: string;
  client_hint?: string;
}

export interface EscalationSummary {
  investor_name?: string;
  investor_email?: string;
  client?: string;
  deal?: string;
  channel: InquiryChannel;
  category: InquiryCategory;
  original_text: string;
  information_found: string;
  information_gaps: string;
  proposed_response?: string;
  priority: "low" | "medium" | "high";
}

export interface AgentResult {
  status: "resolved" | "escalated" | "needs_verification" | "duplicate";
  category: InquiryCategory;
  response?: string;
  escalation_summary?: EscalationSummary;
  confidence_score: number;
  investor_verified: boolean;
  client_identified?: string;
  deal_identified?: string;
  duplicate_inquiry_id?: string;
  thinking?: string;
}

export interface KnowledgeSearchResult {
  id: string;
  score: number;
  question: string;
  answer: string;
  category: string;
  client_id?: string;
  source: string;
}

// ─── Team & Documents Types ───────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  responsibilities: string[];
  email: string;
  color: string;
  created_at: string;
}

export interface DocFolder {
  id: string;
  name: string;
  department: string;
  document_count: number;
}

export interface Document {
  id: string;
  name: string;
  folder_id: string;
  folder_name: string;
  department: string;
  size: number;
  type: string;
  uploaded_at: string;
  uploaded_by?: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ProcessInquiryRequest extends InquiryInput {}

export interface ProcessInquiryResponse {
  inquiry_id: string;
  result: AgentResult;
}

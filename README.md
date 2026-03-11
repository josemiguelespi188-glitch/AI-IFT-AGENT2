# IFT AI Investor Relations Agent

> **Industry FinTech (IFT)** – AI-powered investor relations agent for the **Axiskey** platform.

Automatically handles investor inquiries from multiple channels (portal, email, Zendesk) using **Claude Opus 4.6**, **Supabase**, and **Pinecone**.

---

## Architecture

```
Investor Inquiry (portal / email / zendesk)
         │
         ▼
   Next.js API Route (/api/agent)
         │
         ▼
   Claude Opus 4.6 Agent (Tool Use + Adaptive Thinking)
   ├── verify_investor       → Supabase investors table
   ├── get_client_info       → Supabase clients table
   ├── search_knowledge_base → Pinecone vector search
   ├── get_structured_knowledge → Supabase knowledge_base
   ├── check_duplicate       → Supabase inquiries table
   └── submit_final_response → stores result in Supabase
         │
         ▼
   Response to Investor  OR  Escalation to Human Team
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| AI Agent | Anthropic Claude Opus 4.6 (adaptive thinking + tool use) |
| Database | Supabase (PostgreSQL) |
| Vector Search | Pinecone |
| Deployment | Vercel |

---

## Features

- **Multi-channel support**: Portal, email, Zendesk, phone
- **Automatic classification**: 9 inquiry categories
- **Investor verification**: Match against registered investors
- **Client-specific rules**: Phoenix American Hospitality, Rastegar, and more
- **Vector knowledge search**: Pinecone-powered semantic search
- **Smart escalation**: Structured handoff summaries for the human team
- **Duplicate detection**: Prevents repeat responses within 24h
- **Continuous learning**: Approved responses fed back into the knowledge base
- **Channel-formatted responses**: Different tone/format per channel

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/josemiguelespi188-glitch/AI-IFT-AGENT2.git
cd AI-IFT-AGENT2
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required:
- `ANTHROPIC_API_KEY` – Get from [console.anthropic.com](https://console.anthropic.com)
- `NEXT_PUBLIC_SUPABASE_URL` – Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key (for server-side)
- `PINECONE_API_KEY` – Your Pinecone API key
- `PINECONE_INDEX_NAME` – Default: `ift-knowledge-base`

### 3. Initialize Supabase

Run the migration in your Supabase SQL editor:

```sql
-- Copy and run: supabase/migrations/001_initial_schema.sql
```

### 4. Create Pinecone Index

In your Pinecone console, create an index named `ift-knowledge-base` with:
- Dimensions: `1536`
- Metric: `cosine`

Then seed it from Supabase:

```bash
curl -X PUT http://localhost:3000/api/knowledge
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Reference

### `POST /api/agent`
Process an investor inquiry.

```json
{
  "text": "When will I receive my K-1 for Rastegar?",
  "channel": "email",
  "investor_email": "john@example.com",
  "investor_name": "John Smith",
  "subject": "K-1 Tax Document Question",
  "client_hint": "Rastegar"
}
```

### `GET /api/inquiries`
List inquiries. Add `?stats=true` for aggregate stats.

### `GET /api/knowledge`
List knowledge base entries.

### `POST /api/knowledge`
Add a knowledge entry (syncs to Pinecone).

### `PUT /api/knowledge`
Seed Pinecone from all Supabase knowledge entries.

---

## Inquiry Categories

| Category | Description |
|----------|-------------|
| `distributions` | Payment amounts, timing, schedules |
| `tax_documents` | 1099-DIV, K-1 availability |
| `account_activation` | Portal setup, KYC, ID verification |
| `banking_changes` | Bank account updates |
| `accreditation` | Accredited investor verification |
| `investment_status` | Portfolio updates, deal status |
| `redemption_request` | Exit/withdrawal requests |
| `technical_portal_help` | Login issues, portal navigation |
| `other_unknown` | Uncategorized |

---

## Deploy to Vercel

```bash
vercel
```

Set environment variables in Vercel dashboard under **Settings → Environment Variables**.

---

## Security Notes

- The agent **never** confirms banking changes without verified identity
- The agent **never** approves accreditation or redemptions without system verification
- Regulation D/A/CF information is only shared in general educational terms
- Investor data is never shared between different investors
- All sensitive actions are escalated to the human team

---

*Industry FinTech – Transforming private capital through standardized operations and cutting-edge fintech technology.*

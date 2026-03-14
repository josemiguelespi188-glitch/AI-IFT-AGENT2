"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type EntryType = "note" | "qa";

interface KBEntry {
  id: string;
  folderId: string;
  folderName: string;
  areaId: string;
  areaName: string;
  title: string;
  type: EntryType;
  content: string;
  question: string;
  answer: string;
  chunkIds: string[];
  synced: boolean;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

interface SearchResult {
  entryId: string;
  title: string;
  area: string;
  folder: string;
  contentPreview: string;
  score: number;
}

export interface ActiveKBFolder {
  folderId: string;
  folderName: string;
}

interface Props {
  folder: ActiveKBFolder;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function KnowledgeBaseView({ folder }: Props) {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "new" | "upload">("view");
  const [newType, setNewType] = useState<EntryType>("note");

  // Edit / new form state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editType, setEditType] = useState<EntryType>("note");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadText, setUploadText] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);

  const selected = entries.find((e) => e.id === selectedId) ?? null;

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/kb/entries?folderId=${folder.folderId}`);
    const json = await res.json();
    if (json.data) setEntries(json.data);
    setLoading(false);
  }, [folder.folderId]);

  useEffect(() => {
    fetchEntries();
    setSelectedId(null);
    setMode("view");
    setSearchQuery("");
    setSearchResults(null);
  }, [fetchEntries]);

  // ── New entry ──────────────────────────────────────────────────────────────

  const openNew = (type: EntryType) => {
    setNewType(type);
    setEditTitle("");
    setEditContent("");
    setEditQuestion("");
    setEditAnswer("");
    setEditType(type);
    setSelectedId(null);
    setMode("new");
  };

  // ── Edit existing ──────────────────────────────────────────────────────────

  const openEdit = (entry: KBEntry) => {
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditQuestion(entry.question);
    setEditAnswer(entry.answer);
    setEditType(entry.type);
    setSelectedId(entry.id);
    setMode("edit");
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      if (mode === "new") {
        const res = await fetch("/api/kb/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folderId: folder.folderId,
            folderName: folder.folderName,
            title: editTitle,
            type: editType,
            content: editContent,
            question: editQuestion,
            answer: editAnswer,
          }),
        });
        const json = await res.json();
        if (json.data) {
          setEntries((prev) => [json.data, ...prev]);
          setSelectedId(json.data.id);
          setMode("view");
        }
      } else if (mode === "edit" && selectedId) {
        const res = await fetch("/api/kb/entries", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedId,
            title: editTitle,
            content: editContent,
            question: editQuestion,
            answer: editAnswer,
          }),
        });
        const json = await res.json();
        if (json.data) {
          setEntries((prev) => prev.map((e) => (e.id === selectedId ? json.data : e)));
          setMode("view");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch("/api/kb/entries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setMode("view");
    }
    setDeleting(null);
  };

  // ── Upload ─────────────────────────────────────────────────────────────────

  const openUpload = () => {
    setUploadFile(null);
    setUploadText("");
    setUploadTitle("");
    setUploadError(null);
    setSelectedId(null);
    setMode("upload" as EntryType & "upload");
  };

  const processFile = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/kb/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) { setUploadError(json.error ?? "Upload failed"); return; }
      setUploadFile(file);
      setUploadText(json.text);
      setUploadTitle(file.name.replace(/\.[^.]+$/, ""));
    } catch {
      setUploadError("Failed to process file");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleVectorizeUpload = async () => {
    if (!uploadText.trim() || !uploadTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/kb/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: folder.folderId,
          folderName: folder.folderName,
          title: uploadTitle,
          type: "note",
          content: uploadText,
          question: "",
          answer: "",
        }),
      });
      const json = await res.json();
      if (json.data) {
        setEntries((prev) => [json.data, ...prev]);
        setSelectedId(json.data.id);
        setMode("view");
        setUploadFile(null);
        setUploadText("");
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Search ─────────────────────────────────────────────────────────────────

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch("/api/kb/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          folder: folder.folderName,
          topK: 5,
        }),
      });
      const json = await res.json();
      setSearchResults(json.data ?? []);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const isFormValid =
    editTitle.trim() &&
    (editType === "note"
      ? editContent.trim()
      : editQuestion.trim() && editAnswer.trim());

  const displayEntries = searchResults
    ? entries.filter((e) => searchResults.some((r) => r.entryId === e.id))
    : entries;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full bg-hub-bg animate-fade-in overflow-hidden">
      {/* ── LEFT — Entry list ─────────────────────────────────────── */}
      <div
        className={`flex flex-col border-r border-hub-border transition-all ${
          (mode !== "view" && mode !== "upload") || selectedId ? "w-80 flex-shrink-0" : "flex-1 max-w-lg"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-hub-border bg-hub-card">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-hub-muted mb-2">
            <FolderOpenIcon />
            <span className="text-hub-text font-medium">{folder.folderName}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-hub-text font-bold text-base truncate max-w-[180px]">
                {folder.folderName}
              </h1>
              <p className="text-hub-muted text-xs mt-0.5">
                {entries.length} {entries.length === 1 ? "entry" : "entries"} vectorized in Pinecone
              </p>
            </div>

            {/* New entry buttons */}
            <div className="flex gap-1.5">
              <button
                onClick={() => openNew("note")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-bg border border-hub-border text-hub-muted text-xs hover:text-hub-text hover:border-hub-text transition-colors"
              >
                <DocIcon />
                Note
              </button>
              <button
                onClick={() => openNew("qa")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-bg border border-hub-border text-hub-muted text-xs hover:text-hub-text hover:border-hub-text transition-colors"
              >
                <QAIcon />
                Q&amp;A
              </button>
              <button
                onClick={openUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-accent text-hub-sidebar text-xs font-semibold hover:bg-hub-accent-dark transition-colors"
              >
                <UploadIcon />
                Upload
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-3 flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-hub-muted">
                <SearchIcon />
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                  if (e.key === "Escape") clearSearch();
                }}
                placeholder="Semantic search..."
                className="w-full bg-hub-bg border border-hub-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-hub-text placeholder-hub-muted focus:outline-none focus:border-hub-accent"
              />
            </div>
            {searchResults !== null ? (
              <button
                onClick={clearSearch}
                className="px-2.5 py-1.5 rounded-lg border border-hub-border text-hub-muted text-xs hover:text-hub-text transition-colors"
              >
                Clear
              </button>
            ) : (
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searching}
                className="px-3 py-1.5 rounded-lg bg-hub-accent text-hub-sidebar text-xs font-semibold disabled:opacity-40 hover:bg-hub-accent-dark transition-colors"
              >
                {searching ? "..." : "Search"}
              </button>
            )}
          </div>

          {searchResults !== null && (
            <p className="text-hub-muted text-[10px] mt-1.5">
              {searchResults.length} semantic match{searchResults.length !== 1 ? "es" : ""} —{" "}
              <span className="text-hub-accent font-semibold">Pinecone</span>
            </p>
          )}
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center h-24 text-hub-muted text-xs">
              Loading...
            </div>
          ) : displayEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-hub-muted gap-2">
              <span className="opacity-30"><EmptyIcon /></span>
              <p className="text-xs">
                {searchResults !== null ? "No matches found" : "No entries yet — add one above"}
              </p>
            </div>
          ) : (
            displayEntries.map((entry) => {
              const isActive = selectedId === entry.id;
              const searchScore = searchResults?.find((r) => r.entryId === entry.id)?.score;
              return (
                <div
                  key={entry.id}
                  className={`group relative rounded-xl border transition-all ${
                    isActive
                      ? "border-hub-accent bg-hub-accent/5"
                      : "border-hub-border bg-hub-card hover:border-hub-accent/40"
                  }`}
                >
                  <button
                    className="w-full text-left p-3"
                    onClick={() => {
                      setSelectedId(entry.id);
                      setMode("view");
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-hub-text text-xs font-semibold leading-snug flex-1 line-clamp-2">
                        {entry.title}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <TypeBadge type={entry.type} />
                        <SyncBadge synced={entry.synced} chunks={entry.chunk_count} />
                      </div>
                    </div>
                    {searchScore !== undefined && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] text-hub-accent font-semibold">
                          {Math.round(searchScore * 100)}% match
                        </span>
                      </div>
                    )}
                    <p className="text-hub-muted text-[10px]">
                      {relativeTime(entry.updated_at)}
                    </p>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(entry.id);
                    }}
                    disabled={deleting === entry.id}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded text-hub-muted hover:text-red-500 transition-all"
                  >
                    {deleting === entry.id ? (
                      <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin block" />
                    ) : (
                      <TrashIcon />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT — Detail / Editor / Upload ─────────────────────── */}
      {(mode === "upload" || mode === "new" || (selectedId && mode !== "view") || (selectedId && mode === "view")) ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {mode === "upload" ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Upload top bar */}
              <div className="px-6 py-4 border-b border-hub-border bg-hub-card flex items-center justify-between flex-shrink-0">
                <h2 className="text-hub-text font-semibold text-sm">Upload Document</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-hub-bg border border-hub-border text-hub-muted text-xs">
                    <VectorIcon />
                    <span>PDF · TXT · MD → Pinecone</span>
                  </div>
                  <button
                    onClick={() => { setMode("view"); setUploadFile(null); setUploadText(""); }}
                    className="px-3 py-1.5 rounded-lg border border-hub-border text-hub-muted text-xs hover:text-hub-text transition-colors"
                  >
                    Cancel
                  </button>
                  {uploadText && (
                    <button
                      onClick={handleVectorizeUpload}
                      disabled={!uploadTitle.trim() || saving}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-hub-accent text-hub-sidebar text-xs font-semibold disabled:opacity-40 hover:bg-hub-accent-dark transition-colors"
                    >
                      {saving ? (
                        <>
                          <span className="w-3 h-3 border-2 border-hub-sidebar/30 border-t-hub-sidebar rounded-full animate-spin" />
                          Vectorizing...
                        </>
                      ) : (
                        <>
                          <VectorIcon />
                          Save &amp; Vectorize
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 p-6 max-w-3xl space-y-5">
                {/* Drop zone */}
                {!uploadFile && !uploading && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all ${
                      dragOver
                        ? "border-hub-accent bg-hub-accent/5"
                        : "border-hub-border hover:border-hub-accent/50 hover:bg-hub-bg"
                    }`}
                  >
                    <span className="text-hub-muted opacity-50"><UploadCloudIcon /></span>
                    <div className="text-center">
                      <p className="text-hub-text text-sm font-medium">Drop a file here or click to browse</p>
                      <p className="text-hub-muted text-xs mt-1">Supports PDF, TXT, MD — max 10 MB</p>
                    </div>
                    <p className="text-hub-muted text-[10px]">
                      Text will be extracted, chunked, and vectorized into the{" "}
                      <span className="text-hub-accent font-semibold">{folder.folderName}</span> namespace in Pinecone
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {uploading && (
                  <div className="flex items-center justify-center gap-3 py-12 text-hub-muted text-sm">
                    <span className="w-5 h-5 border-2 border-hub-accent/30 border-t-hub-accent rounded-full animate-spin" />
                    Extracting text...
                  </div>
                )}

                {uploadError && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    {uploadError}
                  </div>
                )}

                {uploadFile && uploadText && (
                  <>
                    {/* File info */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-hub-bg border border-hub-border">
                      <span className="text-hub-accent"><DocIcon /></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-hub-text text-xs font-semibold truncate">{uploadFile.name}</p>
                        <p className="text-hub-muted text-[10px]">
                          {(uploadFile.size / 1024).toFixed(1)} KB · {uploadText.length.toLocaleString()} chars · ~{Math.ceil(uploadText.length / 1400)} Pinecone chunks
                        </p>
                      </div>
                      <button
                        onClick={() => { setUploadFile(null); setUploadText(""); setUploadTitle(""); }}
                        className="text-hub-muted hover:text-red-500 text-xs px-2 py-1 rounded transition-colors"
                      >
                        ×
                      </button>
                    </div>

                    {/* Editable title */}
                    <div>
                      <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-1.5">
                        Entry Title
                      </label>
                      <input
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className="w-full bg-hub-bg border border-hub-border rounded-xl px-4 py-2.5 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent"
                        placeholder="Title for this document..."
                      />
                    </div>

                    {/* Extracted text preview */}
                    <div>
                      <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-1.5">
                        Extracted Text Preview
                      </label>
                      <textarea
                        value={uploadText}
                        onChange={(e) => setUploadText(e.target.value)}
                        rows={12}
                        className="w-full bg-hub-bg border border-hub-border rounded-xl px-4 py-3 text-hub-text text-xs placeholder-hub-muted focus:outline-none focus:border-hub-accent resize-none leading-relaxed font-mono"
                      />
                      <p className="text-hub-muted text-[10px] mt-1">You can edit the text before vectorizing</p>
                    </div>
                  </>
                )}

                {/* Pinecone namespace info */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-hub-bg border border-hub-border">
                  <span className="text-hub-accent mt-0.5 flex-shrink-0"><InfoIcon /></span>
                  <div className="text-xs text-hub-muted space-y-0.5">
                    <p className="font-semibold text-hub-text">Folder → Pinecone namespace</p>
                    <p>
                      This document will be vectorized into the{" "}
                      <span className="font-mono text-hub-text">{folder.folderId}</span> namespace
                      in Pinecone, keeping it isolated from other folders.
                    </p>
                    <p className="mt-1">The AI agent queries only the relevant folder&apos;s namespace when answering questions about that topic area.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : mode === "view" && selected ? (
            <ViewPanel
              entry={selected}
              onEdit={() => openEdit(selected)}
              onDelete={() => handleDelete(selected.id)}
              deleting={deleting === selected.id}
            />
          ) : (
            <EditorPanel
              mode={mode as "edit" | "new"}
              type={mode === "new" ? newType : editType}
              title={editTitle}
              content={editContent}
              question={editQuestion}
              answer={editAnswer}
              onTypeChange={setEditType}
              onTitle={setEditTitle}
              onContent={setEditContent}
              onQuestion={setEditQuestion}
              onAnswer={setEditAnswer}
              onSave={handleSave}
              onCancel={() => {
                if (mode === "new") {
                  setMode("view");
                  setSelectedId(null);
                } else {
                  setMode("view");
                }
              }}
              saving={saving}
              valid={!!isFormValid}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-hub-muted">
          <div className="text-center">
            <div className="flex justify-center mb-3 opacity-20"><EmptyPanelIcon /></div>
            <p className="text-sm font-medium">Select an entry to view</p>
            <p className="text-xs mt-1 max-w-xs">
              Or create a new Note or Q&amp;A — it will be automatically vectorized and stored in Pinecone
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ViewPanel({
  entry,
  onEdit,
  onDelete,
  deleting,
}: {
  entry: KBEntry;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-hub-border bg-hub-card flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <TypeBadge type={entry.type} />
          <SyncBadge synced={entry.synced} chunks={entry.chunk_count} />
          <span className="text-hub-muted text-xs">{relativeTime(entry.updated_at)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hub-border text-hub-muted text-xs hover:text-hub-text hover:border-hub-text transition-colors"
          >
            <PencilIcon />
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <TrashIcon />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-3xl">
        <h2 className="text-hub-text text-xl font-bold mb-4">{entry.title}</h2>

        {entry.type === "qa" ? (
          <div className="space-y-4">
            <div>
              <p className="text-hub-muted text-xs font-semibold uppercase tracking-wider mb-2">Question</p>
              <div className="bg-hub-bg rounded-xl p-4 text-hub-text text-sm leading-relaxed whitespace-pre-wrap border border-hub-border">
                {entry.question}
              </div>
            </div>
            <div>
              <p className="text-hub-muted text-xs font-semibold uppercase tracking-wider mb-2">Answer</p>
              <div className="bg-hub-bg rounded-xl p-4 text-hub-text text-sm leading-relaxed whitespace-pre-wrap border border-hub-border">
                {entry.answer}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-hub-muted text-xs font-semibold uppercase tracking-wider mb-2">Content</p>
            <div className="bg-hub-bg rounded-xl p-4 text-hub-text text-sm leading-relaxed whitespace-pre-wrap border border-hub-border">
              {entry.content}
            </div>
          </div>
        )}

        {/* Pinecone info */}
        <div className="mt-6 p-4 rounded-xl bg-hub-bg border border-hub-border">
          <div className="flex items-center gap-2 mb-2">
            <VectorIcon />
            <p className="text-hub-text text-xs font-semibold">Pinecone Vector Store</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <Stat label="Chunks" value={entry.chunk_count.toString()} />
            <Stat label="Status" value={entry.synced ? "Synced" : "Not synced"} green={entry.synced} />
            <Stat label="Model" value="text-embedding-3-small" />
          </div>
          {entry.chunkIds.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {entry.chunkIds.map((id, i) => (
                <span key={i} className="text-[10px] bg-hub-card border border-hub-border px-2 py-0.5 rounded font-mono text-hub-muted">
                  chunk-{i}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditorPanel({
  mode,
  type,
  title,
  content,
  question,
  answer,
  onTypeChange,
  onTitle,
  onContent,
  onQuestion,
  onAnswer,
  onSave,
  onCancel,
  saving,
  valid,
}: {
  mode: "new" | "edit";
  type: EntryType;
  title: string;
  content: string;
  question: string;
  answer: string;
  onTypeChange: (t: EntryType) => void;
  onTitle: (v: string) => void;
  onContent: (v: string) => void;
  onQuestion: (v: string) => void;
  onAnswer: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  valid: boolean;
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-hub-border bg-hub-card flex items-center justify-between flex-shrink-0">
        <h2 className="text-hub-text font-semibold text-sm">
          {mode === "new" ? "New Entry" : "Edit Entry"}
        </h2>
        <div className="flex items-center gap-2">
          {/* Pinecone indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-hub-bg border border-hub-border text-hub-muted text-xs">
            <VectorIcon />
            <span>Saves to Pinecone on submit</span>
          </div>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-hub-border text-hub-muted text-xs hover:text-hub-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!valid || saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-hub-accent text-hub-sidebar text-xs font-semibold disabled:opacity-40 hover:bg-hub-accent-dark transition-colors"
          >
            {saving ? (
              <>
                <span className="w-3 h-3 border-2 border-hub-sidebar/30 border-t-hub-sidebar rounded-full animate-spin" />
                Vectorizing...
              </>
            ) : (
              <>
                <VectorIcon />
                Save &amp; Vectorize
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 p-6 max-w-3xl space-y-5">
        {/* Type selector — only on new */}
        {mode === "new" && (
          <div className="flex gap-2">
            {(["note", "qa"] as EntryType[]).map((t) => (
              <button
                key={t}
                onClick={() => onTypeChange(t)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                  type === t
                    ? "border-hub-accent bg-hub-accent/10 text-hub-accent-dark"
                    : "border-hub-border text-hub-muted hover:text-hub-text"
                }`}
              >
                {t === "note" ? <DocIcon /> : <QAIcon />}
                {t === "note" ? "Note" : "Q&A Pair"}
              </button>
            ))}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-1.5">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => onTitle(e.target.value)}
            placeholder={type === "qa" ? "e.g. Waterfall structure explained" : "e.g. Capital Call SOP"}
            className="w-full bg-hub-bg border border-hub-border rounded-xl px-4 py-2.5 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent"
          />
        </div>

        {/* Content fields based on type */}
        {type === "note" ? (
          <div>
            <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => onContent(e.target.value)}
              placeholder="Write or paste the knowledge content here. The full text will be chunked and vectorized in Pinecone for semantic retrieval..."
              rows={14}
              className="w-full bg-hub-bg border border-hub-border rounded-xl px-4 py-3 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent resize-none leading-relaxed"
            />
            <p className="text-hub-muted text-[10px] mt-1">
              {content.length} characters · ~{Math.ceil(content.length / 1400)} chunk{Math.ceil(content.length / 1400) !== 1 ? "s" : ""} in Pinecone
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-1.5">
                Question
              </label>
              <textarea
                value={question}
                onChange={(e) => onQuestion(e.target.value)}
                placeholder="What is the investor asking? e.g. What is the waterfall structure in Fund III?"
                rows={3}
                className="w-full bg-hub-bg border border-hub-border rounded-xl px-4 py-3 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent resize-none"
              />
            </div>
            <div>
              <label className="text-hub-muted text-xs font-semibold uppercase tracking-wider block mb-1.5">
                Answer
              </label>
              <textarea
                value={answer}
                onChange={(e) => onAnswer(e.target.value)}
                placeholder="Write the approved answer. Be specific and accurate — this will be retrieved by the AI agent when responding to similar questions..."
                rows={10}
                className="w-full bg-hub-bg border border-hub-border rounded-xl px-4 py-3 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent resize-none leading-relaxed"
              />
              <p className="text-hub-muted text-[10px] mt-1">
                {(question + " " + answer).length} characters · ~{Math.ceil((question + answer).length / 1400)} chunk{Math.ceil((question + answer).length / 1400) !== 1 ? "s" : ""} in Pinecone
              </p>
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-hub-bg border border-hub-border">
          <span className="text-hub-accent mt-0.5 flex-shrink-0"><InfoIcon /></span>
          <div className="text-xs text-hub-muted space-y-0.5">
            <p className="font-semibold text-hub-text">How vectorization works</p>
            <p>The content is split into overlapping 1,400-character chunks, each embedded with <span className="font-mono text-hub-text">text-embedding-3-small</span> and stored in Pinecone with metadata: area, folder, title, entry ID.</p>
            <p className="mt-1">When the AI agent answers a question, it runs a semantic search against these vectors — filtered by area and folder — and injects the best-matching chunks into its context.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small components ──────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: EntryType }) {
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
        type === "qa"
          ? "bg-blue-100 text-blue-700"
          : "bg-purple-100 text-purple-700"
      }`}
    >
      {type === "qa" ? <QAIcon /> : <DocIcon />}
      {type === "qa" ? "Q&A" : "Note"}
    </span>
  );
}

function SyncBadge({ synced, chunks }: { synced: boolean; chunks: number }) {
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
        synced
          ? "bg-green-100 text-green-700"
          : "bg-hub-bg text-hub-muted border border-hub-border"
      }`}
    >
      <VectorIcon />
      {synced ? `${chunks} chunk${chunks !== 1 ? "s" : ""}` : "Not synced"}
    </span>
  );
}

function Stat({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div>
      <p className="text-hub-muted text-[10px] uppercase tracking-wider">{label}</p>
      <p className={`text-xs font-semibold mt-0.5 ${green ? "text-green-600" : "text-hub-text"}`}>
        {value}
      </p>
    </div>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Icons ─────────────────────────────────────────────────────────────────────


function FolderOpenIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function QAIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function VectorIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  );
}

function EmptyPanelIcon() {
  return (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function UploadCloudIcon() {
  return (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

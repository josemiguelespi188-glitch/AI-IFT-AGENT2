"use client";

import { useEffect, useState } from "react";
import type { Document, DocFolder } from "@/types";
import UploadDocumentModal from "./UploadDocumentModal";

interface Props {
  folder: { folderId: string; department: string };
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fileIcon(type: string) {
  if (type.includes("pdf")) return { icon: "📄", label: "PDF" };
  if (type.includes("word") || type.includes("document")) return { icon: "📝", label: "DOC" };
  if (type.includes("sheet") || type.includes("excel")) return { icon: "📊", label: "XLS" };
  if (type.includes("image")) return { icon: "🖼️", label: "IMG" };
  if (type.includes("video")) return { icon: "🎬", label: "VID" };
  if (type.includes("text")) return { icon: "📃", label: "TXT" };
  return { icon: "📎", label: "FILE" };
}

export default function DocumentsView({ folder }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentFolder, setCurrentFolder] = useState<DocFolder | null>(null);
  const [allFolders, setAllFolders] = useState<DocFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [docsRes, foldersRes] = await Promise.all([
      fetch(`/api/documents?folder_id=${folder.folderId}`),
      fetch("/api/documents?type=folders"),
    ]);
    const docsJson = await docsRes.json();
    const foldersJson = await foldersRes.json();
    if (docsJson.data) setDocuments(docsJson.data);
    if (foldersJson.data) {
      setAllFolders(foldersJson.data);
      setCurrentFolder(foldersJson.data.find((f: DocFolder) => f.id === folder.folderId) ?? null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder.folderId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-hub-muted text-sm mb-1">
            <span>{folder.department}</span>
            <span>/</span>
            <span className="text-hub-text">{currentFolder?.name ?? "..."}</span>
          </div>
          <h1 className="text-hub-text text-2xl font-bold">
            {currentFolder?.name ?? "Documents"}
          </h1>
          <p className="text-hub-muted text-sm mt-1">
            {documents.length} {documents.length === 1 ? "document" : "documents"}
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-hub-accent text-hub-sidebar rounded-lg font-semibold text-sm hover:bg-green-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Document
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hub-muted"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full bg-hub-card border border-hub-border rounded-xl pl-10 pr-4 py-3 text-hub-text text-sm placeholder-hub-muted focus:outline-none focus:border-hub-accent"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-hub-card rounded-xl h-14 animate-pulse border border-hub-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-hub-card rounded-2xl flex items-center justify-center mb-4 border border-hub-border">
            <svg className="w-8 h-8 text-hub-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-hub-muted text-sm mb-4">
            {search ? "No documents match your search." : "No documents yet. Upload your first document!"}
          </p>
          {!search && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-hub-accent text-hub-sidebar rounded-lg font-semibold text-sm hover:bg-green-300 transition-colors"
            >
              Upload Document
            </button>
          )}
        </div>
      ) : (
        <div className="bg-hub-card border border-hub-border rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-hub-border">
            <span className="text-hub-muted text-xs font-semibold uppercase tracking-wide w-10">Type</span>
            <span className="text-hub-muted text-xs font-semibold uppercase tracking-wide">Name</span>
            <span className="text-hub-muted text-xs font-semibold uppercase tracking-wide text-right w-16">Size</span>
            <span className="text-hub-muted text-xs font-semibold uppercase tracking-wide text-right w-28">Uploaded</span>
            <span className="w-8" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-hub-border">
            {filtered.map((doc) => {
              const { icon, label } = fileIcon(doc.type);
              return (
                <div
                  key={doc.id}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center hover:bg-hub-hover transition-colors"
                >
                  <div className="flex items-center justify-center w-10">
                    <span className="text-xl">{icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-hub-text text-sm font-medium truncate">{doc.name}</p>
                    <span className="text-hub-muted text-[10px] font-semibold">{label}</span>
                  </div>
                  <span className="text-hub-muted text-xs text-right w-16">{formatBytes(doc.size)}</span>
                  <span className="text-hub-muted text-xs text-right w-28">{formatDate(doc.uploaded_at)}</span>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="w-8 flex items-center justify-center text-hub-muted hover:text-hub-red transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showUpload && (
        <UploadDocumentModal
          folders={allFolders}
          defaultFolderId={folder.folderId}
          onClose={() => setShowUpload(false)}
          onUploaded={fetchData}
        />
      )}
    </div>
  );
}

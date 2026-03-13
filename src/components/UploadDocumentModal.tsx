"use client";

import { useState } from "react";
import type { DocFolder } from "@/types";

interface Props {
  folders: DocFolder[];
  defaultFolderId?: string;
  onClose: () => void;
  onUploaded: () => void;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function UploadDocumentModal({
  folders,
  defaultFolderId,
  onClose,
  onUploaded,
}: Props) {
  const [folderId, setFolderId] = useState(defaultFolderId ?? folders[0]?.id ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setFiles((prev) => [...prev, ...Array.from(newFiles)]);
  };

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const readAsText = (file: File): Promise<string | null> =>
    new Promise((resolve) => {
      // Only attempt text extraction for text-based MIME types
      const isText =
        file.type.startsWith("text/") ||
        file.type === "application/json" ||
        file.type === "application/xml" ||
        file.name.match(/\.(txt|md|csv|json|xml|yaml|yml|log|ts|tsx|js|jsx|py|java|cs|go|rs|sql)$/i);
      if (!isText) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    });

  const handleUpload = async () => {
    if (files.length === 0 || !folderId) return;
    setUploading(true);
    for (const file of files) {
      const content = await readAsText(file);
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          folder_id: folderId,
          size: file.size,
          type: file.type || "application/octet-stream",
          content: content ?? undefined,
        }),
      });
    }
    setUploading(false);
    onUploaded();
    onClose();
  };

  const fileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("sheet") || type.includes("excel")) return "📊";
    if (type.includes("image")) return "🖼️";
    return "📎";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-hub-card border border-hub-border rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-hub-border">
          <h2 className="text-hub-text font-semibold text-base">Upload Documents</h2>
          <button onClick={onClose} className="text-hub-muted hover:text-hub-text transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Folder selector */}
          <div>
            <label className="text-hub-muted text-xs font-semibold uppercase tracking-wide">
              Destination Folder
            </label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="mt-1 w-full bg-hub-bg border border-hub-border rounded-lg px-3 py-2 text-hub-text text-sm focus:outline-none focus:border-hub-accent"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.department} / {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragOver
                ? "border-hub-accent bg-hub-accent/5"
                : "border-hub-border hover:border-hub-accent/50 hover:bg-hub-hover"
            }`}
          >
            <div className="w-10 h-10 bg-hub-bg border border-hub-border rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-hub-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-hub-text text-sm font-medium mb-1">Drop files here</p>
            <p className="text-hub-muted text-xs mb-3">or click to browse</p>
            <label className="cursor-pointer bg-hub-bg border border-hub-border text-hub-text text-xs px-4 py-2 rounded-lg hover:bg-hub-hover transition-colors">
              Browse Files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </label>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-hub-bg border border-hub-border rounded-lg px-3 py-2"
                >
                  <span className="text-lg">{fileIcon(file.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-hub-text text-xs font-medium truncate">{file.name}</p>
                    <p className="text-hub-muted text-[10px]">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-hub-muted hover:text-hub-red transition-colors flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-hub-border text-hub-muted hover:text-hub-text hover:bg-hub-hover transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading || !folderId}
              className="flex-1 px-4 py-2 rounded-lg bg-hub-accent text-hub-sidebar-active-text font-semibold hover:bg-hub-accent-dark transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading
                ? "Uploading..."
                : `Upload${files.length > 0 ? ` (${files.length})` : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { X, Loader2, Upload, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

const DOC_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "visa", label: "Visa" },
  { value: "ticket", label: "Flight/Train Ticket" },
  { value: "insurance", label: "Travel Insurance" },
  { value: "id_proof", label: "ID Proof" },
  { value: "other", label: "Other" },
];

const MAX_SIZE_MB = 5;
const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp,.heic";

interface Traveller { id: string; full_name: string }

interface Props {
  travellers: Traveller[];
  onClose: () => void;
  onUploaded: () => void;
}

export default function DocumentUpload({ travellers, onClose, onUploaded }: Props) {
  const { user } = useUserStore();
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("passport");
  const [travellerId, setTravellerId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) { setError("Select a file."); return; }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_SIZE_MB} MB.`);
      return;
    }
    if (!title.trim()) { setError("Give the document a title."); return; }
    setError("");
    setUploading(true);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const docId = crypto.randomUUID();
    const storagePath = `${user.id}/${docId}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("user-documents")
      .upload(storagePath, file, { cacheControl: "3600", upsert: false });

    if (uploadErr) {
      setUploading(false);
      setError(uploadErr.message);
      return;
    }

    const { error: insertErr } = await supabase.from("user_documents").insert({
      id: docId,
      user_id: user.id,
      traveller_id: travellerId || null,
      doc_type: docType,
      title: title.trim(),
      storage_path: storagePath,
      file_size_bytes: file.size,
      mime_type: file.type || null,
    });

    setUploading(false);

    if (insertErr) {
      // Clean up orphan
      await supabase.storage.from("user-documents").remove([storagePath]);
      setError(insertErr.message);
      return;
    }

    onUploaded();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tat-charcoal/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-soft-lg max-w-md w-full max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-tat-charcoal/8">
          <h2 className="font-display text-lg font-medium text-tat-charcoal">Upload a document</h2>
          <button onClick={onClose} aria-label="Close" className="h-8 w-8 rounded-full bg-tat-charcoal/5 hover:bg-tat-charcoal/10 flex items-center justify-center text-tat-charcoal/60">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={upload} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-tat-charcoal/65 mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Passport — Akash"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-tat-charcoal/15 bg-tat-paper text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-tat-charcoal/65 mb-1.5">Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-tat-charcoal/15 bg-tat-paper text-sm text-tat-charcoal focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
              >
                {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-tat-charcoal/65 mb-1.5">Traveller (optional)</label>
              <select
                value={travellerId}
                onChange={(e) => setTravellerId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-tat-charcoal/15 bg-tat-paper text-sm text-tat-charcoal focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
              >
                <option value="">Unassigned</option>
                {travellers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-tat-charcoal/65 mb-1.5">File *</label>
            <label className="block border-2 border-dashed border-tat-charcoal/15 hover:border-tat-gold rounded-xl p-5 cursor-pointer transition-colors bg-tat-paper/40">
              <input
                type="file"
                accept={ACCEPTED}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
              {file ? (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-tat-gold shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-tat-charcoal truncate">{file.name}</p>
                    <p className="text-[11px] text-tat-charcoal/50">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-6 w-6 text-tat-charcoal/35 mx-auto mb-2" />
                  <p className="text-sm font-medium text-tat-charcoal/70">Click to select file</p>
                  <p className="text-[11px] text-tat-charcoal/45 mt-0.5">PDF, JPG, PNG, HEIC · max {MAX_SIZE_MB} MB</p>
                </div>
              )}
            </label>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full flex items-center justify-center gap-2 bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload securely
          </button>

          <p className="text-center text-[10px] text-tat-charcoal/40">
            Files are encrypted at rest. Only you can access them.
          </p>
        </form>
      </div>
    </div>
  );
}

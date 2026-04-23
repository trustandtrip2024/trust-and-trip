"use client";

import { useEffect, useState } from "react";
import {
  UserPlus, Pencil, Trash2, Loader2, FileText, Upload, Download, User as UserIcon,
  ShieldCheck, AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";
import TravellerForm, { type Traveller } from "@/components/dashboard/TravellerForm";
import DocumentUpload from "@/components/dashboard/DocumentUpload";

interface DbTraveller extends Traveller {
  id: string;
  created_at: string;
}

interface DbDocument {
  id: string;
  traveller_id: string | null;
  booking_id: string | null;
  doc_type: string;
  title: string;
  storage_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
}

const DOC_TYPE_LABEL: Record<string, string> = {
  passport: "Passport", visa: "Visa", ticket: "Ticket",
  insurance: "Insurance", id_proof: "ID Proof", other: "Other",
};

export default function TravellersPage() {
  const { user } = useUserStore();
  const [travellers, setTravellers] = useState<DbTraveller[]>([]);
  const [documents, setDocuments] = useState<DbDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DbTraveller | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleting, setDeleting] = useState<string>("");
  const [downloading, setDownloading] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function load() {
    const [tRes, dRes] = await Promise.all([
      supabase.from("user_travellers").select("*").order("created_at", { ascending: true }),
      supabase.from("user_documents").select("*").order("created_at", { ascending: false }),
    ]);
    setTravellers(tRes.data ?? []);
    setDocuments(dRes.data ?? []);
    setLoading(false);
  }

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (t: DbTraveller) => { setEditing(t); setFormOpen(true); };

  const deleteTraveller = async (id: string) => {
    if (!confirm("Remove this traveller? Linked documents will be kept but unassigned.")) return;
    setDeleting(id);
    await supabase.from("user_travellers").delete().eq("id", id);
    setTravellers((prev) => prev.filter((t) => t.id !== id));
    setDeleting("");
  };

  const downloadDoc = async (doc: DbDocument) => {
    setDownloading(doc.id);
    const { data, error } = await supabase.storage
      .from("user-documents")
      .createSignedUrl(doc.storage_path, 60);
    setDownloading("");
    if (error || !data?.signedUrl) {
      alert("Couldn't generate download link. Try again.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const deleteDoc = async (doc: DbDocument) => {
    if (!confirm("Delete this document permanently?")) return;
    setDeleting(doc.id);
    await supabase.storage.from("user-documents").remove([doc.storage_path]);
    await supabase.from("user_documents").delete().eq("id", doc.id);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    setDeleting("");
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Dashboard</p>
        <h1 className="font-display text-2xl font-medium text-ink">Travellers & Documents</h1>
        <p className="text-sm text-ink/55 mt-1">Save co-travellers and secure important papers — reuse in bookings.</p>
      </div>

      {/* Security banner */}
      <div className="bg-green-50/60 border border-green-100 rounded-2xl px-4 py-3 flex items-start gap-3 mb-6">
        <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <div className="text-xs text-ink/70 leading-relaxed">
          <p><strong>Your vault is private.</strong> Documents are encrypted at rest. Only you can view or download them via 60-second signed links.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-ink/30" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* ─── Travellers ─── */}
          <section>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-display text-lg font-medium text-ink">Saved travellers</h2>
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-1.5 bg-ink hover:bg-gold text-cream hover:text-ink px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add traveller
              </button>
            </div>

            {travellers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-ink/8 p-8 text-center">
                <UserIcon className="h-10 w-10 text-ink/20 mx-auto mb-3" />
                <p className="font-medium text-ink">No travellers saved yet</p>
                <p className="text-sm text-ink/50 mt-1 mb-4">Save family, friends or yourself to auto-fill bookings.</p>
                <button
                  onClick={openAdd}
                  className="inline-flex items-center gap-1.5 bg-gold text-ink px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gold/90 transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  Add your first traveller
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {travellers.map((t) => {
                  const age = t.dob ? Math.floor((Date.now() - new Date(t.dob).getTime()) / (365.25 * 24 * 3600 * 1000)) : null;
                  const passportExpiring = t.passport_expiry && new Date(t.passport_expiry).getTime() - Date.now() < 180 * 24 * 3600 * 1000;
                  return (
                    <div key={t.id} className="bg-white rounded-2xl border border-ink/8 p-4 hover:shadow-soft transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-ink">{t.full_name.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">{t.full_name}</p>
                            <p className="text-[11px] text-ink/55 capitalize">
                              {t.relation}{age !== null && ` · ${age}y`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(t)}
                            aria-label="Edit"
                            className="h-7 w-7 rounded-lg hover:bg-ink/5 text-ink/45 hover:text-ink flex items-center justify-center"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTraveller(t.id)}
                            disabled={deleting === t.id}
                            aria-label="Delete"
                            className="h-7 w-7 rounded-lg hover:bg-red-50 text-ink/45 hover:text-red-500 flex items-center justify-center"
                          >
                            {deleting === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {t.passport_number && (
                        <div className="mt-3 pt-3 border-t border-ink/8 flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-[11px] text-ink/50 font-mono truncate">
                            Passport: {t.passport_number}
                          </p>
                          {passportExpiring && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Expiring soon
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ─── Documents ─── */}
          <section>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-display text-lg font-medium text-ink">Document vault</h2>
              <button
                onClick={() => setUploadOpen(true)}
                className="inline-flex items-center gap-1.5 bg-ink hover:bg-gold text-cream hover:text-ink px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-ink/8 p-8 text-center">
                <FileText className="h-10 w-10 text-ink/20 mx-auto mb-3" />
                <p className="font-medium text-ink">Nothing uploaded yet</p>
                <p className="text-sm text-ink/50 mt-1 mb-4">Store passports, visas, tickets. Reuse across bookings.</p>
                <button
                  onClick={() => setUploadOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-gold text-ink px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gold/90 transition-all"
                >
                  <Upload className="h-4 w-4" />
                  Upload first document
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-ink/8 divide-y divide-ink/8 overflow-hidden">
                {documents.map((d) => {
                  const traveller = travellers.find((t) => t.id === d.traveller_id);
                  return (
                    <div key={d.id} className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-sand/40 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-ink/55" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink truncate">{d.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink/45 flex-wrap">
                          <span className="bg-ink/5 px-1.5 py-0.5 rounded-full">{DOC_TYPE_LABEL[d.doc_type] ?? d.doc_type}</span>
                          {traveller && <span>· {traveller.full_name}</span>}
                          {d.file_size_bytes && <span>· {(d.file_size_bytes / 1024).toFixed(0)} KB</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => downloadDoc(d)}
                          disabled={downloading === d.id}
                          aria-label="Download"
                          className="h-8 w-8 rounded-lg hover:bg-ink/5 text-ink/55 hover:text-ink flex items-center justify-center"
                        >
                          {downloading === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => deleteDoc(d)}
                          disabled={deleting === d.id}
                          aria-label="Delete"
                          className="h-8 w-8 rounded-lg hover:bg-red-50 text-ink/45 hover:text-red-500 flex items-center justify-center"
                        >
                          {deleting === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Modals */}
      {formOpen && (
        <TravellerForm
          existing={editing}
          onClose={() => setFormOpen(false)}
          onSaved={(t) => {
            setFormOpen(false);
            load();
          }}
        />
      )}
      {uploadOpen && (
        <DocumentUpload
          travellers={travellers.map((t) => ({ id: t.id, full_name: t.full_name }))}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => {
            setUploadOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

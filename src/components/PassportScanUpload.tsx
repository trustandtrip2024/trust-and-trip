"use client";

import { useState } from "react";
import { Loader2, FileText, Check, X } from "lucide-react";

interface ExtractedFields {
  surname: string;
  givenName: string;
  passportNo: string;
  nationality: string;
  dob: string;
  sex: string;
  placeOfBirth: string;
  placeOfIssue: string;
  issueDate: string;
  expiryDate: string;
  confidence: number;
}

interface Props {
  /** Called when extraction returns. Use it to pre-fill traveller form. */
  onExtracted?: (fields: ExtractedFields) => void;
}

const MAX_BYTES = 10 * 1024 * 1024;

export default function PassportScanUpload({ onExtracted }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<ExtractedFields | null>(null);

  async function onFile(file: File) {
    setError(null);
    setFields(null);
    if (file.size > MAX_BYTES) {
      setError("File too large (max 10MB).");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/dashboard/passport-extract", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setFields(data.fields as ExtractedFields);
      onExtracted?.(data.fields);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-card border border-tat-charcoal/10 p-5 md:p-6">
      <p className="tt-eyebrow">Passport scan · auto-fill</p>
      <h3 className="mt-2 font-display text-h3 text-tat-charcoal">
        Drop your passport image, we&rsquo;ll fill the form.
      </h3>
      <p className="mt-1 text-meta text-tat-slate">
        We don&rsquo;t store the image — only the extracted fields. Stay sharp on what you upload.
      </p>

      <label
        className={`mt-5 flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed cursor-pointer transition px-5 py-8 ${
          busy
            ? "border-tat-orange/40 bg-tat-orange/5"
            : "border-tat-charcoal/20 hover:border-tat-orange/40 hover:bg-tat-paper/40"
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
        />
        {busy ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-tat-orange" />
            <p className="text-meta text-tat-charcoal">Reading the photo page…</p>
          </>
        ) : (
          <>
            <FileText className="h-6 w-6 text-tat-charcoal/60" />
            <p className="text-meta text-tat-charcoal">Click to upload (or drag &amp; drop)</p>
            <p className="text-[11px] text-tat-slate">JPG / PNG / WEBP · max 10MB</p>
          </>
        )}
      </label>

      {error && (
        <p className="mt-3 text-meta text-rose-600 inline-flex items-center gap-1.5">
          <X className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      {fields && (
        <div className="mt-5 rounded-card border border-emerald-200 bg-emerald-50/40 p-4">
          <p className="text-meta text-emerald-700 inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" /> Extracted (confidence {(fields.confidence * 100).toFixed(0)}%)
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-meta">
            <Row label="Given name" value={fields.givenName} />
            <Row label="Surname"    value={fields.surname} />
            <Row label="Passport"   value={fields.passportNo} />
            <Row label="Nationality" value={fields.nationality} />
            <Row label="Date of birth" value={fields.dob} />
            <Row label="Sex"        value={fields.sex} />
            <Row label="Issue date" value={fields.issueDate} />
            <Row label="Expiry"     value={fields.expiryDate} />
          </dl>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-tag uppercase text-tat-slate">{label}</dt>
      <dd className="text-tat-charcoal">{value || "—"}</dd>
    </div>
  );
}

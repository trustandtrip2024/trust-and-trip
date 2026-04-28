interface Props {
  data: Record<string, unknown> | Record<string, unknown>[];
  /** Per-request CSP nonce — required when strict-dynamic CSP is in place. */
  nonce?: string;
}

export default function JsonLd({ data, nonce }: Props) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

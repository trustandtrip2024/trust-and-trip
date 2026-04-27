// Server-side Web Push helper.
//
// Sends a payload to one Supabase push_subscriptions row using the standard
// VAPID + AES-128-GCM encryption flow. Implements the bare minimum from
// RFC 8291 (Voluntary Application Server Identification for Web Push) so
// we don't pull in the bulky `web-push` npm package on the edge.
//
// Failure modes:
//   - 410 / 404 from the push service → endpoint dead, ops should delete row
//   - any other error → swallow + log; don't block the caller
//
// Required env:
//   VAPID_SUBJECT             "mailto:hello@trustandtrip.com"
//   VAPID_PUBLIC_KEY          base64-url public key (87 chars, P-256)
//   VAPID_PRIVATE_KEY         base64-url private key (43 chars)
//
// Generate keys once with:
//   npx web-push generate-vapid-keys

import crypto from "crypto";

interface Subscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface SendResult {
  ok: boolean;
  status?: number;
  error?: string;
  expired?: boolean;
}

const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:hello@trustandtrip.com";
const VAPID_PUB = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIV = process.env.VAPID_PRIVATE_KEY ?? "";

function b64UrlDecode(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}
function b64UrlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildVapidJwt(audience: string): string {
  const header = b64UrlEncode(Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64UrlEncode(
    Buffer.from(
      JSON.stringify({
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + 12 * 3600,
        sub: VAPID_SUBJECT,
      })
    )
  );
  const signing = `${header}.${payload}`;

  // Reconstruct the EC private key from the raw 32-byte VAPID private key
  // using a JWK import — Node's crypto.createPrivateKey supports it.
  const priv = crypto.createPrivateKey({
    key: {
      kty: "EC",
      crv: "P-256",
      d: VAPID_PRIV,
      x: VAPID_PUB.slice(0, 43),
      y: VAPID_PUB.slice(43),
    },
    format: "jwk",
  });

  const sig = crypto.sign(null, Buffer.from(signing), {
    key: priv,
    dsaEncoding: "ieee-p1363",
  });
  return `${signing}.${b64UrlEncode(sig)}`;
}

/**
 * Send a push notification. Payload is JSON-stringified and shown by the
 * service worker as a notification.
 *
 * Returns { ok, expired } — caller should delete the row from
 * push_subscriptions when expired=true.
 */
export async function sendPush(
  sub: Subscription,
  payload: { title: string; body: string; url?: string; tag?: string }
): Promise<SendResult> {
  if (!VAPID_PUB || !VAPID_PRIV) return { ok: false, error: "VAPID not configured" };

  const url = new URL(sub.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const data = Buffer.from(JSON.stringify(payload), "utf8");

  // ── Encrypt the payload (RFC 8188 aes128gcm scheme) ────────────────────
  const salt = crypto.randomBytes(16);
  const localKey = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const localPubRaw = localKey.publicKey.export({ format: "der", type: "spki" });
  // The last 65 bytes are the uncompressed P-256 public key.
  const localPub = localPubRaw.subarray(localPubRaw.length - 65);

  const clientPubBuf = b64UrlDecode(sub.p256dh);
  const authSecret = b64UrlDecode(sub.auth);

  const clientPubKey = crypto.createPublicKey({
    key: Buffer.concat([
      Buffer.from("3059301306072a8648ce3d020106082a8648ce3d030107034200", "hex"),
      clientPubBuf,
    ]),
    format: "der",
    type: "spki",
  });

  const sharedSecret = crypto.diffieHellman({
    privateKey: localKey.privateKey,
    publicKey: clientPubKey,
  });

  const prkKey = hkdfSync(authSecret, sharedSecret, Buffer.concat([
    Buffer.from("WebPush: info\0"),
    clientPubBuf,
    localPub,
  ]), 32);

  const cek = hkdfSync(salt, prkKey, Buffer.from("Content-Encoding: aes128gcm\0"), 16);
  const nonce = hkdfSync(salt, prkKey, Buffer.from("Content-Encoding: nonce\0"), 12);

  // Pad to 1 byte: padding delimiter \x02
  const plaintext = Buffer.concat([data, Buffer.from([0x02])]);
  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);

  // Build the aes128gcm framing: salt(16) | rs(4) | idlen(1) | keyid(idlen) | ciphertext
  const rs = Buffer.alloc(4);
  rs.writeUInt32BE(4096, 0);
  const idlen = Buffer.from([localPub.length]);
  const body = Buffer.concat([salt, rs, idlen, localPub, encrypted]);

  const jwt = buildVapidJwt(audience);

  try {
    const res = await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        TTL: "86400",
        Authorization: `vapid t=${jwt}, k=${VAPID_PUB}`,
      },
      body,
    });
    const expired = res.status === 404 || res.status === 410;
    return { ok: res.ok, status: res.status, expired };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

function hkdfSync(salt: Buffer, ikm: Buffer, info: Buffer, length: number): Buffer {
  const prk = crypto.createHmac("sha256", salt).update(ikm).digest();
  const t1 = crypto.createHmac("sha256", prk).update(Buffer.concat([info, Buffer.from([0x01])])).digest();
  return t1.subarray(0, length);
}

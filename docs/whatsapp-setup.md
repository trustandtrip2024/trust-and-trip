# WhatsApp Cloud API setup checklist

What you do in browsers / dashboards. The code side is already wired — see
`src/app/api/whatsapp/route.ts` (webhook with HMAC verify),
`src/app/api/wa/click/route.ts` (click tracker), `scripts/wa-test.mjs`
(smoke test).

When all 4 envs are set and the webhook is verified in Meta, the route
auto-replies, captures leads, and pushes them to Bitrix24 + Meta CAPI.

---

## 1. Create the Meta app

1. Open https://developers.facebook.com/apps and click **Create app**.
2. Type: **Business**.
3. Inside the app, click **Add product** → **WhatsApp** → **Set up**.
4. Pick or assign a WhatsApp Business Account (WABA).
5. Add or pick a phone number under **WhatsApp → API setup**.
6. From the same page, copy:
   - **Phone number ID** (numeric, NOT the phone number itself) →
     `WHATSAPP_PHONE_ID`.
   - **Access token** (temporary 24-hour token works for smoke test;
     replace with the permanent one in step 3 below) →
     `WHATSAPP_ACCESS_TOKEN`.
7. Add YOUR own phone in the **Allowed list** (test mode rule).

## 2. Pick a webhook verify token

Any random string. Generate locally:

```bash
openssl rand -hex 16
```

Copy the value → use as `WHATSAPP_VERIFY_TOKEN`.

## 3. Get the App Secret

1. App dashboard → **App settings → Basic**.
2. Click **Show** next to **App Secret** → copy → use as
   `WHATSAPP_APP_SECRET`. Required because the webhook now verifies the
   `X-Hub-Signature-256` header on every POST.

## 4. (Production) Generate a permanent System User token

The 24-hour temporary token is fine for the smoke test; replace before
launch:

1. https://business.facebook.com → **Business Settings → Users → System
   Users** → **Add**.
2. Role: **Admin**.
3. Click the new system user → **Add Assets** → assign your WABA.
4. **Generate New Token** → app = your Meta app.
5. Scopes: `whatsapp_business_messaging` + `whatsapp_business_management`.
6. **Token expiration**: Never.
7. Copy → replace `WHATSAPP_ACCESS_TOKEN` in Vercel.

## 5. Add the 4 envs in Vercel

```bash
vercel env add WHATSAPP_PHONE_ID
vercel env add WHATSAPP_ACCESS_TOKEN
vercel env add WHATSAPP_VERIFY_TOKEN
vercel env add WHATSAPP_APP_SECRET
```

For each, pick **Production, Preview, Development** so all envs match.

Pull down locally:

```bash
vercel env pull .env.local --environment=production
```

## 6. Configure the webhook in Meta

1. App dashboard → **WhatsApp → Configuration → Webhook**.
2. **Callback URL**: `https://www.trustandtrip.com/api/whatsapp`.
3. **Verify token**: paste the same value you set as
   `WHATSAPP_VERIFY_TOKEN`.
4. Click **Verify and save**. Meta will hit the GET handler with the
   challenge — should return 200 + the challenge string.
5. **Webhook fields**: subscribe to `messages`.

## 7. Smoke test

```bash
npm run wa:test -- 91XXXXXXXXXX     # your own phone
```

Pass = `RESULT: WhatsApp API working.`

Fail traces:
- `Phone-ID metadata FAIL 401` → token expired or invalid.
- `Phone-ID metadata FAIL 100` → wrong PHONE_ID.
- `Send test message FAIL 131030` → recipient not in Allowed list (test mode → add the number in Meta dashboard).
- `Send test message FAIL 131047` → outside the 24-hour conversation window; production needs an approved template.

## 8. Validate the webhook signature

Inbound POSTs without a valid `X-Hub-Signature-256` are rejected with
401. To verify locally:

```bash
curl -X POST https://www.trustandtrip.com/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{}'
# → 401 invalid signature  (expected)
```

Once Meta is configured, real webhook deliveries from
`webhook.facebook.com` carry the signature and are processed.

## 9. Production readiness

After all 4 envs set + webhook verified:

```bash
curl -sL "https://www.trustandtrip.com/api/health/launch?key=$ADMIN_SECRET" | jq '.live.whatsapp, .env.whatsapp'
```

Expected:

```json
{ "status": "ok" }
{ "status": "ok" }
```

Both must report `ok` before WhatsApp is considered launch-ready.

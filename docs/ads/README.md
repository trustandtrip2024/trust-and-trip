# Ads — campaign launch kit

Pre-built copy + URL templates for launching paid traffic across the 5 LPs.

## Files

- `creative-templates.json` — campaign-by-campaign copy: 5 headlines × 5 primary texts × 3 CTA buttons × 3 WhatsApp prefill messages per LP. Use verbatim or as a starting point.

## Tracking — UTM convention

Every ad URL must include the full UTM block. Without it, `/admin/attribution` and `/admin/attribution/creatives` can't tell which ad converted.

```
?utm_source={meta|google}
&utm_medium={cpc|paid_social}
&utm_campaign={lp-name}_{audience}_{date}    e.g. maldives_couples_2026q2
&utm_content={ad-id-or-creative-name}        e.g. ad_overwater_villa_v3
&utm_term={keyword}                          (Google Search only)
```

The `utm_content` slot is where Meta puts the ad-id automatically when you use `{{ad.id}}`. Always set it — that's how the creative leaderboard ranks ads.

## Click-to-WhatsApp ads

Two ways to wire WhatsApp ads:

1. **Native Click-to-WhatsApp (Meta Ads Manager)** — set the WhatsApp number on the ad. Meta opens wa.me directly with the prefill message you supply. **No tracking on our side.** Use only if you trust Meta's WhatsApp click metric.

2. **Tracked redirect (recommended)** — point the ad's destination URL at our tracker. Captures UTM, runs A/B variant rotation, fires CAPI Contact, then 302s to wa.me:

   ```
   https://trustandtrip.com/api/wa/click
     ?src=ad_<lp>_<variant>
     &dest=Maldives
     &msg=<prefilled message>
     &utm_source=meta
     &utm_medium=paid_social
     &utm_campaign=<campaign>
     &utm_content={{ad.id}}
   ```

   `?msg=` is optional — if omitted, the route rotates 3 message variants (A/B/C) and logs which converted via `wa_variant` column. Run for 7 days, see `/admin/attribution/creatives` to find the winner.

## Funnel each ad fires

| Step | What fires |
|------|-----------|
| User sees ad | Meta charges per impression |
| User clicks LP link | LP loads. Pixel `PageView` fires. CAPI mirror via `/api/capi/track`. |
| User submits form | Pixel `Lead` + CAPI `Lead` deduped via `event_id`. Lead row → Supabase + Bitrix + Slack/TG alert (if tier A). Itinerary engine fires + email + WA. |
| User clicks WhatsApp | Tracked redirect → CAPI `Contact` + lead row (whatsapp_click) + 302 to wa.me. |
| User opens Razorpay | CAPI `InitiateCheckout`. Bitrix Deal opens. |
| Payment verifies | CAPI `Purchase`. Bitrix Deal → Won. Booking confirm email. |

## Daily ops checklist (during ad burn)

- [ ] **Morning** — open `/admin/attribution?window=1`. Note tier-A% per UTM source. Pause anything < 5%.
- [ ] **Morning** — open `/admin/attribution/creatives?window=1&min=5`. Scale top-3 creative spend +50%, pause bottom-3.
- [ ] **Morning** — open Meta Events Manager. Confirm Lead + Purchase events show "Server" + "Browser" sources collapsed (= dedup working).
- [ ] **Throughout day** — Slack #leads channel: respond to tier-A pings within 5 min. Each lost SLA = lost optimizer signal.
- [ ] **Evening** — `npm run check:lp`. If any LP regressed past LCP 2.5s budget, fix before morning bid hike.
- [ ] **Evening** — Bitrix tasks dashboard: any tier-A Tasks past their 5-min deadline? Reassign + nudge.

## Channel budget split (suggestion)

| % | Channel | Why |
|---|---------|-----|
| 50 | Meta click-to-WhatsApp | Lowest CPL for India travel. WA prefill increases response rate. |
| 25 | Google Search (intent keywords) | High-intent. Use for Maldives/Bali/Char Dham/Spiti where existing SEO landing pages also rank. |
| 15 | Meta retargeting + LAL | Recovers bounced visitors via CAPI `ViewContent` audiences. |
| 5  | YouTube Shorts | Cheap awareness reach. Drives bottom-funnel via retargeting. |
| 5  | Influencer / creators referral | Already have `/refer` + creator-attribution. Track via `?ref=CRTR-...`. |

## Creative fast-iteration loop

1. Launch all 5 headlines × 5 primary texts × 3 CTAs as ad-set with **dynamic creative** in Meta.
2. Run for 48-72 hours at low budget.
3. Open `/admin/attribution/creatives?window=3&min=5` — copy the winning headline/text combos to a new "scaled" ad-set.
4. Pause loser creatives, scale winners 3-5×.
5. Repeat weekly.

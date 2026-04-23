# Rollback playbook

If production breaks, pick the **fastest** option that matches the severity.

---

## Severity 0 — site is down / broken for all users

**Action: Vercel instant rollback (30 seconds, zero git).**

### Option A — Vercel dashboard (easiest)
1. Open https://vercel.com → project `trust-and-trip` → **Deployments** tab.
2. Find the last green deployment (marked "Production" with a ✓).
3. Click the `⋯` menu on that row → **Promote to Production**.
4. Confirm. Site flips back in ~10 seconds.

### Option B — Vercel CLI
```bash
npm i -g vercel          # one-time install
vercel login
vercel rollback          # prompts you to pick a previous deployment
```

**Why this first:** does not touch git. No risk of deleting work. Immediate. The broken commit stays in git history — you fix forward on the next deploy.

---

## Severity 1 — bad commit pushed to main, need to revert cleanly in git

**Action: `git revert` (does not erase history, safe for shared branch).**

```bash
git fetch origin
git log --oneline -10              # find the bad commit hash
git revert <bad-commit-hash>       # creates a new "Revert X" commit
git push origin main               # Vercel auto-deploys the fixed main
```

If multiple consecutive bad commits:
```bash
git revert <oldest-bad>^..<newest-bad>
```

---

## Severity 2 — local branch is a mess, need to get back to last known-good state

**Action: hard reset to a tag (only safe on local/feature branches, NEVER on main unless you understand the consequences).**

```bash
git fetch --tags
git tag                            # list known-good tags
git reset --hard v1.1-homepage-v2  # or whichever tag is stable
```

If you already pushed garbage and must rewrite history (ask first — destructive):
```bash
git push --force-with-lease origin main
```

---

## Known-good git tags

| Tag | Commit | Date | Description |
|---|---|---|---|
| `v1.0-stable` | `6a6db99` | 2026-04-22 | Last stable before Homepage V2 + dashboard overhaul |
| `v1.1-homepage-v2` | `ce56fd2` | 2026-04-23 | Homepage V2 live — video hero, trust row, how-it-works, final CTA, dashboard error boundary |

**Add a new tag whenever you ship a milestone you'd be OK rolling back to:**
```bash
git tag -a vX.Y-description -m "Short description of state"
git push origin vX.Y-description
```

---

## Prevention (cheaper than rollback)

1. **Every deploy on Vercel is a preview first.** Push to any branch → Vercel builds a `*.vercel.app` preview URL. Click it, test, then merge to main.
2. **`npx tsc --noEmit` + `npm run build` locally** before `git push`. Catches 90% of prod breaks.
3. **Feature-flag risky changes.** Gate new UI behind an env var; flip live without a redeploy.
4. **Branch protection on main (GitHub settings):** require PR + at least 1 passing check before merge. Blocks accidental direct pushes.

---

## Deployment cheat sheet

```bash
# Normal flow (auto-deploys to prod):
git commit -m "..." && git push origin main

# Preview deploy (manual URL, no prod impact):
git checkout -b feature/xyz
git commit ... && git push origin feature/xyz
# → Vercel comments preview URL on the push

# Promote preview to prod:
vercel promote <deployment-url> --scope=trust-and-trip

# List recent deployments:
vercel ls
```

---

## If Supabase / Sanity / Razorpay / Redis breaks

Not a frontend rollback — these are managed services. Triage separately:

- **Supabase down:** check https://status.supabase.com. Leads/bookings fail silently (the `safe()` wrappers keep the UI alive).
- **Sanity down:** cached content serves from Redis for up to 10 min. After that, pages render blank — users see the static fallback data in `src/lib/data.ts`.
- **Razorpay down:** `/api/payment/create-order` returns 500. Users see a clear error on the package page. No money lost.
- **Redis down:** everything keeps working, just slower (direct Sanity CDN hits on each request, no rate limit).

No code change needed — systems degrade gracefully.

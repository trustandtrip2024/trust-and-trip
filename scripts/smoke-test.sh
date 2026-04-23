#!/usr/bin/env bash
# Trust and Trip — comprehensive smoke test
# Usage: ./scripts/smoke-test.sh [BASE_URL]
# Default BASE_URL: https://www.trustandtrip.com

set -u
BASE="${1:-https://www.trustandtrip.com}"
PASS=0
FAIL=0
WARN=0
FAILURES=()

say() { printf "%-60s %s\n" "$1" "$2"; }

expect_status() {
  local label="$1"; local url="$2"; local expected="$3"
  local actual=$(curl -sL -o /dev/null -w "%{http_code}" -A "smoke-test/1.0" "$url")
  if [ "$actual" = "$expected" ]; then
    say "$label" "✓ $actual"
    PASS=$((PASS+1))
  else
    say "$label" "✗ got $actual, expected $expected"
    FAIL=$((FAIL+1))
    FAILURES+=("$label: $url → $actual (expected $expected)")
  fi
}

expect_contains() {
  local label="$1"; local url="$2"; local needle="$3"
  local body=$(curl -sL -A "smoke-test/1.0" "$url")
  if echo "$body" | grep -q "$needle"; then
    say "$label" "✓ found"
    PASS=$((PASS+1))
  else
    say "$label" "✗ missing: $needle"
    FAIL=$((FAIL+1))
    FAILURES+=("$label: $url missing '$needle'")
  fi
}

post_json() {
  local label="$1"; local url="$2"; local payload="$3"; local expected="$4"
  local actual=$(curl -sL -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$payload" "$url")
  if [ "$actual" = "$expected" ]; then
    say "$label" "✓ $actual"
    PASS=$((PASS+1))
  else
    say "$label" "✗ got $actual, expected $expected"
    FAIL=$((FAIL+1))
    FAILURES+=("$label: $url POST → $actual (expected $expected)")
  fi
}

echo "═══ Trust and Trip smoke test ═══"
echo "Target: $BASE"
echo ""

echo "── A. Public pages (GET 200) ──"
for path in "/" "/packages" "/destinations" "/experiences" "/offers" "/plan" "/build-trip" "/blog" "/about" "/contact" "/customize-trip" "/my-booking" "/login" "/refer" "/wishlist" "/privacy-policy" "/terms-and-conditions" "/cancellation-policy"; do
  expect_status "GET $path" "$BASE$path" "200"
done

echo ""
echo "── B. Dynamic routes (sample) ──"
expect_status "GET /packages/bali-6n7d-honeymoon" "$BASE/packages/bali-6n7d-honeymoon" "200"
expect_status "GET /destinations/bali" "$BASE/destinations/bali" "200"
expect_status "GET /experiences/honeymoon" "$BASE/experiences/honeymoon" "200"
expect_status "GET /blog (list)" "$BASE/blog" "200"

echo ""
echo "── C. Infra & SEO ──"
expect_status "GET /robots.txt" "$BASE/robots.txt" "200"
expect_status "GET /sitemap.xml" "$BASE/sitemap.xml" "200"
expect_status "GET /manifest.webmanifest" "$BASE/manifest.webmanifest" "200"
expect_status "GET /favicon.ico" "$BASE/favicon.ico" "200"
expect_contains "Sitemap has entries" "$BASE/sitemap.xml" "<urlset"
expect_contains "Robots allows" "$BASE/robots.txt" "Allow"
expect_contains "Homepage has JSON-LD" "$BASE/" "TravelAgency"

echo ""
echo "── D. 404 handling ──"
expect_status "GET /this-does-not-exist" "$BASE/this-does-not-exist" "404"

echo ""
echo "── E. Admin (basic-auth protected → 401) ──"
expect_status "GET /admin/leads" "$BASE/admin/leads" "401"
expect_status "GET /api/admin/reviews" "$BASE/api/admin/reviews" "401"

echo ""
echo "── F. API: GET (unauthenticated) ──"
expect_status "GET /api/user/bookings (no token)" "$BASE/api/user/bookings" "401"
expect_status "GET /api/user/points (no token)" "$BASE/api/user/points" "401"
expect_status "GET /api/user/bookings/fake-id (no token)" "$BASE/api/user/bookings/fake-id" "401"
expect_status "GET /api/booking-status (no id)" "$BASE/api/booking-status" "400"

echo ""
echo "── G. API: POST contract ──"
post_json "POST /api/leads (empty)" "$BASE/api/leads" '{}' "400"
post_json "POST /api/leads (contact)" "$BASE/api/leads" '{"name":"Smoke","email":"smoke@test.tt","phone":"+910000000000","message":"smoke","source":"contact_form"}' "200"
post_json "POST /api/leads (intent)" "$BASE/api/leads" '{"source":"book_now_click","name":"","phone":"","message":"smoke intent"}' "200"
post_json "POST /api/leads (newsletter)" "$BASE/api/leads" '{"source":"newsletter","email":"nl@test.tt","name":"Newsletter","phone":""}' "200"
post_json "POST /api/reviews (missing fields)" "$BASE/api/reviews" '{}' "400"
post_json "POST /api/newsletter (empty)" "$BASE/api/newsletter" '{}' "400"
post_json "POST /api/payment/create-order (empty)" "$BASE/api/payment/create-order" '{}' "400"
post_json "POST /api/payment/create-cart-order (no auth)" "$BASE/api/payment/create-cart-order" '{}' "401"
post_json "POST /api/payment/verify (bad sig)" "$BASE/api/payment/verify" '{"razorpay_order_id":"x","razorpay_payment_id":"x","razorpay_signature":"bad"}' "400"
post_json "POST /api/chat (empty)" "$BASE/api/chat" '{}' "400"
expect_status "GET /api/search?q=bali" "$BASE/api/search?q=bali" "200"
# /api/whatsapp POST handles webhook payloads — silently 200 for malformed (Meta-recommended)
post_json "POST /api/whatsapp (empty payload)" "$BASE/api/whatsapp" '{}' "200"

echo ""
echo "── H. Cron (requires CRON_SECRET) ──"
expect_status "GET /api/cron/price-drops (no auth)" "$BASE/api/cron/price-drops" "401"

echo ""
echo "── Summary ──"
echo "PASS: $PASS | FAIL: $FAIL | WARN: $WARN"
if [ ${#FAILURES[@]} -gt 0 ]; then
  echo ""
  echo "Failures:"
  for f in "${FAILURES[@]}"; do
    echo "  - $f"
  done
  exit 1
fi

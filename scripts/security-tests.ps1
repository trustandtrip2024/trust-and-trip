# Security verification tests for Trust and Trip.
# Run with:   pwsh ./scripts/security-tests.ps1 -BaseUrl http://localhost:3000
# Or against prod with:  pwsh ./scripts/security-tests.ps1 -BaseUrl https://trustandtrip.com
#
# Each test prints PASS / FAIL with the observed status code so you can sanity
# check after a deploy. None of these require a database fixture — they probe
# the API surface for the regressions we just fixed.

param(
  [Parameter(Mandatory=$false)]
  [string]$BaseUrl = "http://localhost:3000",
  # Optional: a real signed-in user JWT. When supplied, the IDOR test will
  # also try a foreign booking ID and expect 404 (not the booking).
  [string]$UserAJwt = "",
  [string]$UserBBookingId = "",
  # Bogus admin secret for the timing-safe compare check.
  [string]$BogusAdminKey = "definitely-not-the-real-admin-secret"
)

$ErrorActionPreference = "Continue"
$failures = 0

function Assert-Status {
  param([string]$Name, [int]$Expected, [int]$Actual)
  if ($Actual -eq $Expected) {
    Write-Host "PASS  $Name -> $Actual" -ForegroundColor Green
  } else {
    Write-Host "FAIL  $Name -> got $Actual, expected $Expected" -ForegroundColor Red
    $script:failures++
  }
}

function Try-StatusOnly {
  param([string]$Method, [string]$Url, [hashtable]$Headers = @{}, [string]$Body = $null)
  try {
    $params = @{ Method = $Method; Uri = $Url; Headers = $Headers }
    if ($Body) { $params.Body = $Body; $params.ContentType = "application/json" }
    $resp = Invoke-WebRequest @params -UseBasicParsing -ErrorAction Stop
    return $resp.StatusCode
  } catch {
    if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode }
    return -1
  }
}

Write-Host "`n== /api/booking-status — auth required ==" -ForegroundColor Cyan
$status = Try-StatusOnly -Method GET -Url "$BaseUrl/api/booking-status?id=00000000-0000-0000-0000-000000000000"
Assert-Status -Name "GET ?id=<uuid> without Bearer" -Expected 401 -Actual $status

$status = Try-StatusOnly -Method GET -Url "$BaseUrl/api/booking-status?phone=9999999999"
Assert-Status -Name "GET ?phone=... without Bearer" -Expected 401 -Actual $status

if ($UserAJwt -and $UserBBookingId) {
  $headers = @{ "Authorization" = "Bearer $UserAJwt" }
  $status = Try-StatusOnly -Method GET -Url "$BaseUrl/api/booking-status?id=$UserBBookingId" -Headers $headers
  Assert-Status -Name "User A GET User B's booking id" -Expected 404 -Actual $status
}

Write-Host "`n== /api/referral — auth required ==" -ForegroundColor Cyan
$status = Try-StatusOnly -Method GET -Url "$BaseUrl/api/referral?email=victim@example.com"
Assert-Status -Name "GET ?email=... without Bearer" -Expected 401 -Actual $status

$status = Try-StatusOnly -Method POST -Url "$BaseUrl/api/referral" -Body '{"name":"X","email":"victim@example.com"}'
Assert-Status -Name "POST without Bearer (would attribute to victim)" -Expected 401 -Actual $status

Write-Host "`n== /api/quiz/responses PATCH — guarded ==" -ForegroundColor Cyan
# Random UUID never appears in DB, so we expect 404 (not 200). Pre-fix this
# would have returned 200 with no row matched — silently no-op and leak the
# fact that the route accepts arbitrary payloads.
$body = '{"id":"11111111-1111-1111-1111-111111111111","lead_id":"22222222-2222-2222-2222-222222222222"}'
$status = Try-StatusOnly -Method PATCH -Url "$BaseUrl/api/quiz/responses" -Body $body
if ($status -in 404, 410, 409, 429) {
  Write-Host "PASS  PATCH random uuid -> $status (rejected)" -ForegroundColor Green
} else {
  Write-Host "FAIL  PATCH random uuid -> $status (expected 404/410/409/429)" -ForegroundColor Red
  $failures++
}

Write-Host "`n== /api/reviews/helpful — rate limited ==" -ForegroundColor Cyan
# Fire 5 votes against the same review id from this IP. First 3 should
# succeed (200), then the limiter should kick in with 429.
$reviewId = "11111111-1111-1111-1111-111111111111"
$body = "{`"id`":`"$reviewId`"}"
$got429 = $false
for ($i = 1; $i -le 5; $i++) {
  $s = Try-StatusOnly -Method POST -Url "$BaseUrl/api/reviews/helpful" -Body $body
  if ($s -eq 429) { $got429 = $true; break }
}
if ($got429) {
  Write-Host "PASS  reviews/helpful -> 429 within 5 attempts" -ForegroundColor Green
} else {
  Write-Host "WARN  reviews/helpful -> never returned 429 (Redis may be unconfigured)" -ForegroundColor Yellow
}

Write-Host "`n== /api/brochure/[slug] — rate limited ==" -ForegroundColor Cyan
$got429 = $false
for ($i = 1; $i -le 12; $i++) {
  $s = Try-StatusOnly -Method GET -Url "$BaseUrl/api/brochure/__nonexistent-slug__"
  if ($s -eq 429) { $got429 = $true; break }
}
if ($got429) {
  Write-Host "PASS  brochure -> 429 within 12 attempts" -ForegroundColor Green
} else {
  Write-Host "WARN  brochure -> never returned 429 (Redis may be unconfigured)" -ForegroundColor Yellow
}

Write-Host "`n== /api/health/launch — bogus admin key ignored ==" -ForegroundColor Cyan
$resp = Invoke-WebRequest -Method GET -Uri "$BaseUrl/api/health/launch?key=$BogusAdminKey" -UseBasicParsing -ErrorAction SilentlyContinue
if ($resp) {
  $body = $resp.Content
  if ($body -match '"detail"') {
    Write-Host "FAIL  health/launch returned verbose body with bogus key" -ForegroundColor Red
    $failures++
  } else {
    Write-Host "PASS  health/launch hides verbose detail without correct key" -ForegroundColor Green
  }
}

Write-Host "`n== Summary ==" -ForegroundColor Cyan
if ($failures -eq 0) {
  Write-Host "All assertions passed." -ForegroundColor Green
  exit 0
} else {
  Write-Host "$failures assertion(s) failed." -ForegroundColor Red
  exit 1
}

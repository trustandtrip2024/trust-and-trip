# test-website-lead.ps1
# End-to-end test: submit a realistic lead to your website API, then verify
# it landed in Bitrix24. This mimics a user filling out the contact form.
#
# PREREQUISITE: dev server must be running:
#   npm run dev      (on localhost:3000)
#
# Run in a SECOND PowerShell window (leave the npm run dev one alone):
#   powershell -ExecutionPolicy Bypass -File .\test-website-lead.ps1
#
# Optional: test against production instead of localhost:
#   $env:TEST_BASE_URL = "https://trustandtrip.in"
#   powershell -ExecutionPolicy Bypass -File .\test-website-lead.ps1

$ErrorActionPreference = 'Stop'

$baseUrl = if ($env:TEST_BASE_URL) { $env:TEST_BASE_URL.TrimEnd('/') } else { 'http://localhost:3000' }
Write-Host "Submitting to: $baseUrl/api/leads`n" -ForegroundColor Cyan

# Read Bitrix webhook for the verification step
$envFile = Join-Path $PSScriptRoot '.env.local'
$line = Get-Content $envFile | ? { $_ -match '^\s*BITRIX24_WEBHOOK_URL=' } | Select-Object -First 1
$webhook = (($line -replace '^\s*BITRIX24_WEBHOOK_URL=', '').Trim('"').Trim("'").Trim()).TrimEnd('/') + '/'

# --- 1. Build a realistic payload mimicking the contact form ---------------
$stamp = Get-Date -Format 'HH:mm'
$today = Get-Date
$payload = @{
  name           = "Website Test $stamp"
  email          = "website.test@trustandtrip.in"
  phone          = "+919999900042"
  message        = "This is an automated end-to-end test from test-website-lead.ps1. " +
                   "It verifies the Website -> /api/leads -> Supabase -> Bitrix24 path is fully operational. " +
                   "Safe to delete this lead."
  destination    = "Goa"
  package_title  = "Goa Beach Family - 4 Nights"
  package_slug   = "goa-beach-family-4n"
  travel_type    = "Family"
  travel_date    = $today.AddDays(30).ToString('yyyy-MM-dd')
  num_travellers = "2A + 2C"
  budget         = "1,00,000 - 1,50,000"
  source         = "contact_form"
  page_url       = "$baseUrl/contact"
  utm_source     = "e2e-test"
  utm_medium     = "script"
  utm_campaign   = "bitrix-verify"
}

Write-Host "--- Step 1: POST to /api/leads ---" -ForegroundColor White
try {
  $r = Invoke-RestMethod -Uri "$baseUrl/api/leads" `
      -Method Post -ContentType 'application/json' `
      -Body ($payload | ConvertTo-Json -Depth 10 -Compress) -TimeoutSec 20
  if ($r.success) {
    Write-Host "  [OK] Website accepted the lead: $($r | ConvertTo-Json -Compress)" -ForegroundColor Green
  } else {
    Write-Host "  [FAIL] Website returned: $($r | ConvertTo-Json -Compress)" -ForegroundColor Yellow
    exit 1
  }
} catch {
  $status = $null; $body = $null
  if ($_.Exception.Response) {
    $status = [int]$_.Exception.Response.StatusCode
    try {
      $s = $_.Exception.Response.GetResponseStream()
      $sr = New-Object IO.StreamReader($s)
      $body = $sr.ReadToEnd()
    } catch {}
  }
  if ($status) {
    Write-Host "  [FAIL] $baseUrl/api/leads responded with HTTP $status`n" -ForegroundColor Red
    if ($body) {
      Write-Host "  --- Response body (full) ---" -ForegroundColor Yellow
      # Pretty-print if it's JSON
      try {
        $parsed = $body | ConvertFrom-Json -ErrorAction Stop
        $parsed | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor DarkYellow
      } catch {
        Write-Host $body -ForegroundColor DarkYellow
      }
      Write-Host "  --- end body ---`n" -ForegroundColor Yellow
    } else {
      Write-Host "  (empty body - the route crashed before writing a response)" -ForegroundColor Yellow
      Write-Host "  Check 'npm run dev' terminal for red stack trace." -ForegroundColor Yellow
    }
  } else {
    Write-Host "  [FAIL] Could not reach $baseUrl - is 'npm run dev' running?" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
  }
  exit 1
}

# --- 2. Wait for fire-and-forget Bitrix24 push to complete ------------------
Write-Host "`n--- Step 2: Wait 3 seconds for fire-and-forget CRM push ---" -ForegroundColor White
Start-Sleep -Seconds 3

# --- 3. Query Bitrix24 for the most recent lead -----------------------------
Write-Host "`n--- Step 3: Query Bitrix24 for the lead ---" -ForegroundColor White
try {
  $list = Invoke-RestMethod -Uri "${webhook}crm.lead.list.json" `
      -Method Post -ContentType 'application/json' `
      -Body (@{
        order  = @{ ID = 'DESC' }
        filter = @{ 'EMAIL' = $payload.email }
        select = @('ID','TITLE','STATUS_ID','SOURCE_ID','SOURCE_DESCRIPTION','DATE_CREATE',
                   'UF_CRM_DESTINATION','UF_CRM_TRAVEL_START','UF_CRM_NUM_TRAVELLERS',
                   'UF_CRM_PACKAGE_SLUG','UF_CRM_UTM_SOURCE','UF_CRM_UTM_CAMPAIGN')
      } | ConvertTo-Json -Depth 10 -Compress) -TimeoutSec 20

  if ($list.result -and $list.result.Count -gt 0) {
    $lead = $list.result[0]
    Write-Host "  [OK] Lead found in Bitrix24:`n" -ForegroundColor Green
    '  {0,-24} : {1}' -f 'Lead ID', $lead.ID                       | Write-Host
    '  {0,-24} : {1}' -f 'Title', $lead.TITLE                      | Write-Host
    '  {0,-24} : {1}' -f 'Status', $lead.STATUS_ID                 | Write-Host
    '  {0,-24} : {1}' -f 'Source ID', $lead.SOURCE_ID              | Write-Host
    '  {0,-24} : {1}' -f 'Source description', $lead.SOURCE_DESCRIPTION | Write-Host
    '  {0,-24} : {1}' -f 'Created at', $lead.DATE_CREATE           | Write-Host
    '  {0,-24} : {1}' -f 'UF Destination', $lead.UF_CRM_DESTINATION | Write-Host
    '  {0,-24} : {1}' -f 'UF Travel Start', $lead.UF_CRM_TRAVEL_START | Write-Host
    '  {0,-24} : {1}' -f 'UF Num Travellers', $lead.UF_CRM_NUM_TRAVELLERS | Write-Host
    '  {0,-24} : {1}' -f 'UF Package Slug', $lead.UF_CRM_PACKAGE_SLUG | Write-Host
    '  {0,-24} : {1}' -f 'UF UTM Source', $lead.UF_CRM_UTM_SOURCE  | Write-Host
    '  {0,-24} : {1}' -f 'UF UTM Campaign', $lead.UF_CRM_UTM_CAMPAIGN | Write-Host

    $host_ = ([uri]$webhook).Host
    Write-Host "`n  Open in Bitrix24: https://$host_/crm/lead/details/$($lead.ID)/" -ForegroundColor Cyan

    Write-Host "`n[SUCCESS] End-to-end verified: Website form -> Supabase -> Bitrix24 -> all custom fields stored.`n" -ForegroundColor Green
  } else {
    Write-Host "  [FAIL] No lead with email '$($payload.email)' found in Bitrix24." -ForegroundColor Yellow
    Write-Host "         This usually means the /api/leads route didn't call pushLead(), or the webhook URL in .env.local is wrong." -ForegroundColor Yellow
    Write-Host "         Check your terminal running 'npm run dev' for any 'Bitrix24 pushLead error' messages.`n" -ForegroundColor Yellow
  }
} catch {
  Write-Host "  [FAIL] Could not query Bitrix24: $($_.Exception.Message)" -ForegroundColor Red
}

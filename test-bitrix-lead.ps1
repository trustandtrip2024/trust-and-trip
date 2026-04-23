# test-bitrix-lead.ps1
# Creates a realistic test Lead in Bitrix24 exercising EVERY custom field.
# Safe to re-run — each call creates a fresh lead you can delete afterwards.
#
# Usage from trust-and-trip folder:
#   powershell -ExecutionPolicy Bypass -File .\test-bitrix-lead.ps1

$ErrorActionPreference = 'Stop'

# --- 1. Read webhook URL from .env.local ------------------------------------
$envFile = Join-Path $PSScriptRoot '.env.local'
$line = Get-Content $envFile | Where-Object { $_ -match '^\s*BITRIX24_WEBHOOK_URL=' } | Select-Object -First 1
if (-not $line) { Write-Host "ERROR: BITRIX24_WEBHOOK_URL not set in .env.local" -ForegroundColor Red; exit 1 }
$url = (($line -replace '^\s*BITRIX24_WEBHOOK_URL=', '').Trim('"').Trim("'").Trim()).TrimEnd('/') + '/'
Write-Host "-> Using: $url`n" -ForegroundColor DarkGray

# --- 2. Build a realistic travel enquiry ------------------------------------
$stamp = Get-Date -Format 'HH:mm'
$today = Get-Date
$startDate = $today.AddDays(14).ToString('yyyy-MM-dd')
$endDate   = $today.AddDays(21).ToString('yyyy-MM-dd')

$payload = @{
  fields = @{
    TITLE              = "TEST - Akash Sharma - Goa - 7N - Family (2A+2C) [$stamp]"
    NAME               = "Akash"
    LAST_NAME          = "Sharma (test)"
    STATUS_ID          = "NEW"
    OPENED             = "Y"
    ASSIGNED_BY_ID     = 1
    SOURCE_ID          = "WEB"
    SOURCE_DESCRIPTION = "TEST lead - posted by test-bitrix-lead.ps1 at $stamp"
    PHONE              = @(@{ VALUE="+919999900001"; VALUE_TYPE="WORK" })
    EMAIL              = @(@{ VALUE="akash.test@trustandtrip.in"; VALUE_TYPE="WORK" })
    COMMENTS           = "Automated test lead. If you see this with all custom fields populated, the Next.js -> Bitrix24 integration is fully operational. Safe to delete."
    # Custom travel fields
    UF_CRM_DESTINATION      = "Goa"
    UF_CRM_TRAVEL_START     = $startDate
    UF_CRM_TRAVEL_END       = $endDate
    UF_CRM_NIGHTS           = 7
    UF_CRM_TRAVEL_TYPE      = "Family"
    UF_CRM_NUM_TRAVELLERS   = "2 adults + 2 children"
    UF_CRM_BUDGET           = 120000
    UF_CRM_PACKAGE_SLUG     = "goa-beach-family-7n"
    UF_CRM_PAGE_URL         = "https://trustandtrip.in/packages/goa-beach-family-7n"
    UF_CRM_UTM_SOURCE       = "meta"
    UF_CRM_UTM_MEDIUM       = "paid-social"
    UF_CRM_UTM_CAMPAIGN     = "summer-2026-goa"
  }
  params = @{ REGISTER_SONET_EVENT = "Y" }
}

# --- 3. POST to Bitrix24 ----------------------------------------------------
Write-Host "Creating test lead..." -ForegroundColor Cyan
try {
  $r = Invoke-RestMethod -Uri "${url}crm.lead.add.json" `
      -Method Post -ContentType 'application/json' `
      -Body ($payload | ConvertTo-Json -Depth 10 -Compress) -TimeoutSec 20

  $leadId = $r.result
  $portalHost = ([uri]$url).Host

  Write-Host "`nSUCCESS - Lead created" -ForegroundColor Green
  Write-Host "  Lead ID : $leadId"
  Write-Host "  Open in Bitrix24: https://$portalHost/crm/lead/details/$leadId/"

  # --- 4. Fetch it back to verify the custom fields landed ---------------
  Write-Host "`nVerifying custom-field values were stored..." -ForegroundColor Cyan
  $g = Invoke-RestMethod -Uri "${url}crm.lead.get.json?id=$leadId" -Method Get -TimeoutSec 20

  $fields = @(
    'TITLE','SOURCE_ID','STATUS_ID','ASSIGNED_BY_ID',
    'UF_CRM_DESTINATION','UF_CRM_TRAVEL_START','UF_CRM_TRAVEL_END','UF_CRM_NIGHTS',
    'UF_CRM_TRAVEL_TYPE','UF_CRM_NUM_TRAVELLERS','UF_CRM_BUDGET','UF_CRM_PACKAGE_SLUG',
    'UF_CRM_PAGE_URL','UF_CRM_UTM_SOURCE','UF_CRM_UTM_MEDIUM','UF_CRM_UTM_CAMPAIGN'
  )
  foreach ($f in $fields) {
    $v = $g.result.$f
    if ($null -eq $v -or $v -eq '') { $v = '(empty)' }
    '{0,-28} : {1}' -f $f, $v | Write-Host
  }

  Write-Host "`nIf every UF_CRM_* line above shows your test value, the integration is 100% live." -ForegroundColor Green
  Write-Host "Open the lead: https://$portalHost/crm/lead/details/$leadId/`n"
}
catch {
  $msg = $_.Exception.Message
  try {
    $s = $_.Exception.Response.GetResponseStream()
    if ($s) { $j = (New-Object IO.StreamReader($s)).ReadToEnd() | ConvertFrom-Json; if ($j.error_description) { $msg = $j.error_description } }
  } catch {}
  Write-Host "`nFAILED - $msg" -ForegroundColor Red
  exit 1
}

# setup-bitrix-fields.ps1
# One-shot: creates 12 Lead fields + 6 Deal fields + 5 custom Sources in Bitrix24.
# Idempotent — safe to re-run.
#
# From your trust-and-trip folder:
#   powershell -ExecutionPolicy Bypass -File .\setup-bitrix-fields.ps1

$ErrorActionPreference = 'Continue'

# --- Read webhook URL from .env.local ---------------------------------------
$envFile = Join-Path $PSScriptRoot '.env.local'
$url = $null
if (Test-Path $envFile) {
  $line = Get-Content $envFile | Where-Object { $_ -match '^\s*BITRIX24_WEBHOOK_URL=' } | Select-Object -First 1
  if ($line) { $url = ($line -replace '^\s*BITRIX24_WEBHOOK_URL=', '').Trim('"').Trim("'").Trim() }
}
if ([string]::IsNullOrWhiteSpace($url)) {
  Write-Host "ERROR: BITRIX24_WEBHOOK_URL not found in .env.local" -ForegroundColor Red
  exit 1
}
$url = $url.TrimEnd('/') + '/'
Write-Host "Using webhook: $url`n"

# --- Call helper ------------------------------------------------------------
function Invoke-B24 {
  param([string]$Method, [hashtable]$Body)
  try {
    $json = $Body | ConvertTo-Json -Depth 10 -Compress
    # Suppress response from function output stream — we only care about success/failure here
    $null = Invoke-RestMethod -Uri "$url$Method.json" -Method Post -ContentType 'application/json' -Body $json -TimeoutSec 20
    return @{ ok = $true }
  } catch {
    $msg = $_.Exception.Message
    try {
      $s = $_.Exception.Response.GetResponseStream()
      if ($s) {
        $r = (New-Object IO.StreamReader($s)).ReadToEnd() | ConvertFrom-Json
        if ($r.error_description) { $msg = $r.error_description } elseif ($r.error) { $msg = $r.error }
      }
    } catch {}
    return @{ ok = $false; err = $msg }
  }
}

function Report {
  param([string]$Label, [hashtable]$Res)
  if ($Res.ok) {
    Write-Host ("  [OK]   {0}" -f $Label) -ForegroundColor Green
  } elseif ($Res.err -match 'exists|Duplicate|DUPLICATE|assigned') {
    Write-Host ("  [skip] {0} (already exists)" -f $Label) -ForegroundColor DarkGray
  } else {
    Write-Host ("  [FAIL] {0} :: {1}" -f $Label, $Res.err) -ForegroundColor Yellow
  }
}

function Add-Field {
  param([string]$Entity, [string]$Name, [string]$Type, [string]$Label)
  $b = @{ fields = @{
    FIELD_NAME        = $Name
    USER_TYPE_ID      = $Type
    XML_ID            = ($Name -replace '^UF_CRM_', '')
    MULTIPLE          = 'N'
    MANDATORY         = 'N'
    SHOW_FILTER       = 'Y'
    SHOW_IN_LIST      = 'Y'
    EDIT_IN_LIST      = 'Y'
    EDIT_FORM_LABEL   = @{ en = $Label }
    LIST_COLUMN_LABEL = @{ en = $Label }
    LIST_FILTER_LABEL = @{ en = $Label }
  }}
  Report ("{0}: {1} ({2})" -f $Entity.ToUpper(), $Name, $Label) (Invoke-B24 "crm.$Entity.userfield.add" $b)
}

function Add-Source {
  param([string]$StatusId, [string]$Name)
  $b = @{ fields = @{ ENTITY_ID='SOURCE'; STATUS_ID=$StatusId; NAME=$Name } }
  Report ("SOURCE: {0} ({1})" -f $Name, $StatusId) (Invoke-B24 'crm.status.add' $b)
}

# --- LEAD fields ------------------------------------------------------------
Write-Host '=== Lead custom fields ===' -ForegroundColor Cyan
Add-Field lead 'UF_CRM_DESTINATION'    'string'  'Destination'
Add-Field lead 'UF_CRM_TRAVEL_START'   'date'    'Travel Start Date'
Add-Field lead 'UF_CRM_TRAVEL_END'     'date'    'Travel End Date'
Add-Field lead 'UF_CRM_NIGHTS'         'integer' 'Nights'
Add-Field lead 'UF_CRM_TRAVEL_TYPE'    'string'  'Travel Type'
Add-Field lead 'UF_CRM_NUM_TRAVELLERS' 'string'  'Pax (Adults+Children)'
Add-Field lead 'UF_CRM_BUDGET'         'double'  'Budget (Rs.)'
Add-Field lead 'UF_CRM_PACKAGE_SLUG'   'string'  'Package Slug'
Add-Field lead 'UF_CRM_PAGE_URL'       'string'  'Page URL'
Add-Field lead 'UF_CRM_UTM_SOURCE'     'string'  'UTM Source'
Add-Field lead 'UF_CRM_UTM_MEDIUM'     'string'  'UTM Medium'
Add-Field lead 'UF_CRM_UTM_CAMPAIGN'   'string'  'UTM Campaign'

# --- DEAL fields ------------------------------------------------------------
Write-Host "`n=== Deal custom fields ===" -ForegroundColor Cyan
Add-Field deal 'UF_CRM_DESTINATION'    'string'  'Destination'
Add-Field deal 'UF_CRM_TRAVEL_START'   'date'    'Travel Start Date'
Add-Field deal 'UF_CRM_TRAVEL_END'     'date'    'Travel End Date'
Add-Field deal 'UF_CRM_NIGHTS'         'integer' 'Nights'
Add-Field deal 'UF_CRM_NUM_TRAVELLERS' 'string'  'Pax'
Add-Field deal 'UF_CRM_PACKAGE_SLUG'   'string'  'Package Slug'

# --- Sources ---------------------------------------------------------------
Write-Host "`n=== Lead Sources ===" -ForegroundColor Cyan
Add-Source 'INSTAGRAM_DM' 'Instagram DM'
Add-Source 'WHATSAPP'     'WhatsApp'
Add-Source 'META_ADS'     'Meta Ads'
Add-Source 'CREATOR_FORM' 'Creator Form'
Add-Source 'REFERRAL'     'Referral'

# --- Verification ----------------------------------------------------------
Write-Host "`n=== Final Lead UF_CRM_* codes ===" -ForegroundColor Cyan
$r = Invoke-B24 'crm.lead.userfield.list' @{ order = @{ SORT = 'ASC' }; filter = @{} }
if ($r.ok -ne $false) {
  # Invoke-RestMethod already returned the parsed object; get it via the original call
  try {
    $list = Invoke-RestMethod -Uri "$($url)crm.lead.userfield.list.json" -Method Post -ContentType 'application/json' -Body '{"order":{"SORT":"ASC"},"filter":{}}' -TimeoutSec 20
    foreach ($f in $list.result) {
      if ($f.FIELD_NAME -like 'UF_CRM_*') {
        '  {0,-32} [{1,-10}]' -f $f.FIELD_NAME, $f.USER_TYPE_ID | Write-Host
      }
    }
  } catch { Write-Host "  (list failed: $_)" -ForegroundColor Yellow }
}

Write-Host "`n=== Final Deal UF_CRM_* codes ===" -ForegroundColor Cyan
try {
  $list = Invoke-RestMethod -Uri "$($url)crm.deal.userfield.list.json" -Method Post -ContentType 'application/json' -Body '{"order":{"SORT":"ASC"},"filter":{}}' -TimeoutSec 20
  foreach ($f in $list.result) {
    if ($f.FIELD_NAME -like 'UF_CRM_*') {
      '  {0,-32} [{1,-10}]' -f $f.FIELD_NAME, $f.USER_TYPE_ID | Write-Host
    }
  }
} catch { Write-Host "  (list failed: $_)" -ForegroundColor Yellow }

Write-Host "`nDone. Paste the output back to Claude.`n" -ForegroundColor Green

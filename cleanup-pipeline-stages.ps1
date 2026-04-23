# cleanup-pipeline-stages.ps1
# Deletes the Bitrix24 auto-created default stages from the 4 new pipelines,
# leaving only your travel-specific flow.
#
# SAFE: only touches pipelines 8, 10, 12, 14 (the new ones). Does NOT touch
# pipeline 2 (Operations - has live deals). Does NOT touch pipeline 0 (Sales).
#
# Idempotent. Before deleting a stage it verifies:
#   - Stage ID is in a known "safe to delete" list
#   - Stage has no deals in it (uses crm.deal.list count)
#
# Run:
#   powershell -ExecutionPolicy Bypass -File .\cleanup-pipeline-stages.ps1

$ErrorActionPreference = 'Continue'
$envFile = Join-Path $PSScriptRoot '.env.local'
$line = Get-Content $envFile | ? { $_ -match '^\s*BITRIX24_WEBHOOK_URL=' } | Select-Object -First 1
$url = (($line -replace '^\s*BITRIX24_WEBHOOK_URL=', '').Trim('"').Trim("'").Trim()).TrimEnd('/') + '/'

function B24 {
  param([string]$m, $b = @{})
  try {
    $json = $b | ConvertTo-Json -Depth 10 -Compress
    $r = Invoke-RestMethod -Uri "${url}${m}.json" -Method Post -ContentType 'application/json' -Body $json -TimeoutSec 20
    return @{ ok=$true; data=$r }
  } catch {
    $msg = $_.Exception.Message
    try { $s = $_.Exception.Response.GetResponseStream(); if ($s) { $j = (New-Object IO.StreamReader($s)).ReadToEnd() | ConvertFrom-Json; if ($j.error_description) { $msg = $j.error_description } } } catch {}
    return @{ ok=$false; err=$msg }
  }
}

# For each pipeline, list of STATUS_IDs we want to KEEP.
# Everything else (that matches safe patterns) gets deleted.
$keep = @{
  8 = @(          # Corporate & Group Bookings
    'C8:NEW_ENQUIRY', 'C8:QUALIFIED', 'C8:PROPOSAL_SENT',
    'C8:NEGOTIATION', 'C8:CONTRACT_SIGNED',
    'C8:WON', 'C8:LOSE'        # Bitrix-managed terminal stages (renamed earlier)
  )
  10 = @(         # Destination Weddings & MICE
    'C10:ENQUIRY', 'C10:SITE_VISIT', 'C10:DESIGN', 'C10:PROPOSAL_SENT',
    'C10:CONTRACT___ADVANCE', 'C10:PLANNING',
    'C10:WON', 'C10:LOSE'
  )
  12 = @(         # Chardham & Religious Yatra
    'C12:REGISTRATION', 'C12:DOCS', 'C12:BATCH_ASSIGNED',
    'C12:PAYMENT_CONFIRMED', 'C12:DEPARTED',
    'C12:WON', 'C12:LOSE'
  )
  14 = @(         # Adventure & Experiences
    'C14:ENQUIRY', 'C14:CONFIRMED', 'C14:PAYMENT_RECEIVED', 'C14:VOUCHER_SENT',
    'C14:WON', 'C14:APOLOGY'     # Adventure's "No-show / Cancel" is on APOLOGY
  )
}

# Only allow deleting stages whose STATUS_ID suffix is in this safe set.
# Default Bitrix24 generates these; also "LOST" from my earlier failed-creation attempts.
$safeSuffixes = @(
  'NEW','PREPARATION','PREPAYMENT_INVOICE','EXECUTING','FINAL_INVOICE',
  'APOLOGY','LOST'
)

foreach ($catId in $keep.Keys) {
  Write-Host ("`n== Pipeline $catId ==") -ForegroundColor Cyan
  $entityId = "DEAL_STAGE_$catId"
  $sl = B24 'crm.status.list' @{ filter=@{ ENTITY_ID=$entityId }; order=@{ SORT='ASC' } }
  if (-not $sl.ok) { Write-Host "  Could not list: $($sl.err)" -ForegroundColor Yellow; continue }

  $keepSet = $keep[$catId]
  foreach ($s in $sl.data.result) {
    if ($keepSet -contains $s.STATUS_ID) {
      Write-Host ("  keep   {0,-25} {1}" -f $s.NAME, $s.STATUS_ID) -ForegroundColor Green
      continue
    }

    # Derive suffix after the colon
    $suffix = $s.STATUS_ID -replace '^C\d+:', ''
    if (-not ($safeSuffixes -contains $suffix)) {
      Write-Host ("  ??     {0,-25} {1}  (NOT in safe-delete list, leaving alone)" -f $s.NAME, $s.STATUS_ID) -ForegroundColor Yellow
      continue
    }

    # Safety check - don't delete a stage with deals in it
    $stageId = $s.STATUS_ID
    $count = B24 'crm.deal.list' @{ filter=@{ STAGE_ID=$stageId; CATEGORY_ID=$catId }; select=@('ID') }
    $hasDeals = $count.ok -and $count.data.result -and $count.data.result.Count -gt 0
    if ($hasDeals) {
      Write-Host ("  skip   {0,-25} {1}  (has deals, leaving alone)" -f $s.NAME, $s.STATUS_ID) -ForegroundColor Yellow
      continue
    }

    # Safe to delete
    $del = B24 'crm.status.delete' @{ id=$s.ID }
    if ($del.ok) {
      Write-Host ("  DEL    {0,-25} {1}" -f $s.NAME, $s.STATUS_ID) -ForegroundColor DarkRed
    } else {
      Write-Host ("  FAIL   {0,-25} {1}  :: {2}" -f $s.NAME, $s.STATUS_ID, $del.err) -ForegroundColor Yellow
    }
  }
}

# Final verification
Write-Host "`n=== Final pipeline structure ===" -ForegroundColor Green
foreach ($catId in $keep.Keys) {
  $meta = B24 'crm.dealcategory.get' @{ id=$catId }
  $name = if ($meta.ok) { $meta.data.result.NAME } else { "Pipeline $catId" }
  Write-Host ("`n$name (CAT=$catId)") -ForegroundColor White
  $sl = B24 'crm.status.list' @{ filter=@{ ENTITY_ID="DEAL_STAGE_$catId" }; order=@{ SORT='ASC' } }
  if ($sl.ok) {
    foreach ($s in $sl.data.result) {
      $sem = if ($s.SEMANTICS) { "[$($s.SEMANTICS)]" } else { "[P]" }
      ('  {0,-25} {1}  {2}' -f $s.NAME, $sem, $s.STATUS_ID) | Write-Host
    }
  }
}

Write-Host "`nDone." -ForegroundColor Green

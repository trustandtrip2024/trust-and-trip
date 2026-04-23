# setup-bitrix-foundation.ps1
# Trust and Trip — Bitrix24 foundation setup (departments, users, deal pipelines).
#
# Idempotent. Safe to re-run.
# Run from the trust-and-trip folder:
#   powershell -ExecutionPolicy Bypass -File .\setup-bitrix-foundation.ps1

$ErrorActionPreference = 'Continue'

# --- 1. Resolve webhook URL -------------------------------------------------
$envFile = Join-Path $PSScriptRoot '.env.local'
$line = Get-Content $envFile | ? { $_ -match '^\s*BITRIX24_WEBHOOK_URL=' } | Select-Object -First 1
if (-not $line) { Write-Host "ERROR: BITRIX24_WEBHOOK_URL missing in .env.local" -ForegroundColor Red; exit 1 }
$url = (($line -replace '^\s*BITRIX24_WEBHOOK_URL=', '').Trim('"').Trim("'").Trim()).TrimEnd('/') + '/'
Write-Host "-> $url`n" -ForegroundColor DarkGray

# --- 2. Helpers -------------------------------------------------------------
function B24 {
  param([string]$Method, $Body = @{})
  try {
    $json = $Body | ConvertTo-Json -Depth 10 -Compress
    $r = Invoke-RestMethod -Uri "${url}${Method}.json" -Method Post -ContentType 'application/json' -Body $json -TimeoutSec 25
    return @{ ok = $true; data = $r }
  } catch {
    $msg = $_.Exception.Message
    try {
      $s = $_.Exception.Response.GetResponseStream()
      if ($s) { $j = (New-Object IO.StreamReader($s)).ReadToEnd() | ConvertFrom-Json; if ($j.error_description) { $msg = $j.error_description } }
    } catch {}
    return @{ ok = $false; err = $msg }
  }
}
function Report([string]$label, $res) {
  if ($res.ok) { Write-Host ("  [OK]   " + $label) -ForegroundColor Green; return $res.data.result }
  elseif ($res.err -match 'exists|Duplicate|DUPLICATE|ALREADY_EXISTS|assigned') { Write-Host ("  [skip] " + $label + " (already exists)") -ForegroundColor DarkGray; return $null }
  else { Write-Host ("  [FAIL] " + $label + " :: " + $res.err) -ForegroundColor Yellow; return $null }
}

# ============================================================================
#  STEP A - DEPARTMENTS
# ============================================================================
Write-Host "== A) Department tree ==" -ForegroundColor Cyan

# Find existing root dept (every Bitrix24 has one)
$rootDept = $null
$deptList = B24 'department.get' @{}
if ($deptList.ok) {
  $rootDept = $deptList.data.result | ? { -not $_.PARENT } | Select-Object -First 1
  if (-not $rootDept) { $rootDept = $deptList.data.result | Select-Object -First 1 }
}
$rootId = if ($rootDept) { $rootDept.ID } else { 1 }
Write-Host "  Root dept ID: $rootId`n" -ForegroundColor DarkGray

# Desired departments
$depts = @(
  @{ NAME='Sales & Enquiries';    SORT=100 },
  @{ NAME='Operations & Ops';     SORT=200 },
  @{ NAME='Finance & Accounts';   SORT=300 },
  @{ NAME='Marketing & Content';  SORT=400 },
  @{ NAME='Customer Support';     SORT=500 },
  @{ NAME='Management';           SORT=600 }
)

$deptIdByName = @{}
# Seed with existing names so re-runs skip cleanly
if ($deptList.ok) { foreach ($d in $deptList.data.result) { $deptIdByName[$d.NAME] = $d.ID } }

foreach ($d in $depts) {
  if ($deptIdByName.ContainsKey($d.NAME)) {
    Write-Host ("  [skip] Dept " + $d.NAME + " (id=" + $deptIdByName[$d.NAME] + ")") -ForegroundColor DarkGray
    continue
  }
  $res = B24 'department.add' @{ NAME=$d.NAME; SORT=$d.SORT; PARENT=$rootId }
  $id = Report ("Dept " + $d.NAME) $res
  if ($id) { $deptIdByName[$d.NAME] = $id }
}

# ============================================================================
#  STEP B - EXISTING USERS (listed only, NOT modified)
# ============================================================================
Write-Host "`n== B) Existing users - mapping to departments ==" -ForegroundColor Cyan
Write-Host "  We DO NOT create dummy users or modify existing accounts." -ForegroundColor DarkGray
Write-Host "  Below is a snapshot of your current team so you can assign them" -ForegroundColor DarkGray
Write-Host "  to the new departments via Bitrix24 Employees page.`n" -ForegroundColor DarkGray

$ul = B24 'user.get' @{ ADMIN_MODE='true'; FILTER=@{ ACTIVE='Y' } }
if ($ul.ok) {
  foreach ($u in $ul.data.result | Sort-Object ID) {
    $deptIds = @($u.UF_DEPARTMENT)
    $deptNames = @()
    foreach ($did in $deptIds) {
      $match = $deptIdByName.GetEnumerator() | ? { $_.Value -eq $did } | Select-Object -First 1
      if ($match) { $deptNames += $match.Key }
    }
    $deptStr = if ($deptNames.Count) { $deptNames -join ', ' } else { '(none)' }
    '  {0,-5} {1,-24} {2,-30} dept: {3}' -f $u.ID, ($u.NAME + ' ' + $u.LAST_NAME), $u.EMAIL, $deptStr | Write-Host
  }
}
Write-Host "`n  -> Assign users to new departments via: Bitrix24 -> Employees -> Company Structure." -ForegroundColor DarkGray

# ============================================================================
#  STEP C - DEAL PIPELINES (a.k.a. CATEGORIES) & STAGES
# ============================================================================
Write-Host "`n== C) Deal pipelines ==" -ForegroundColor Cyan

$pipelines = @(
  @{
    NAME   = 'Corporate & Group Bookings'
    SORT   = 300
    STAGES = @(
      @{ NAME='New Enquiry';           SORT=10;  COLOR='#00B0E8'; SEMANTICS='P' },
      @{ NAME='Qualified';             SORT=20;  COLOR='#47E4C2'; SEMANTICS='P' },
      @{ NAME='Proposal Sent';         SORT=30;  COLOR='#38C4D9'; SEMANTICS='P' },
      @{ NAME='Negotiation';           SORT=40;  COLOR='#7BD500'; SEMANTICS='P' },
      @{ NAME='Contract Signed';       SORT=50;  COLOR='#56D4E0'; SEMANTICS='P' },
      @{ NAME='Operated (Won)';        SORT=60;  COLOR='#7BD500'; SEMANTICS='S' },
      @{ NAME='Lost';                  SORT=70;  COLOR='#FF5752'; SEMANTICS='F' }
    )
  },
  @{
    NAME   = 'Destination Weddings & MICE'
    SORT   = 400
    STAGES = @(
      @{ NAME='Enquiry';               SORT=10;  COLOR='#00B0E8'; SEMANTICS='P' },
      @{ NAME='Site Visit Scheduled';  SORT=20;  COLOR='#47E4C2'; SEMANTICS='P' },
      @{ NAME='Design & Mood Board';   SORT=30;  COLOR='#38C4D9'; SEMANTICS='P' },
      @{ NAME='Proposal Sent';         SORT=40;  COLOR='#56D4E0'; SEMANTICS='P' },
      @{ NAME='Contract & Advance';    SORT=50;  COLOR='#E89B06'; SEMANTICS='P' },
      @{ NAME='Planning & Vendors';    SORT=60;  COLOR='#7BD500'; SEMANTICS='P' },
      @{ NAME='Executed (Won)';        SORT=70;  COLOR='#7BD500'; SEMANTICS='S' },
      @{ NAME='Lost';                  SORT=80;  COLOR='#FF5752'; SEMANTICS='F' }
    )
  },
  @{
    NAME   = 'Chardham & Religious Yatra'
    SORT   = 500
    STAGES = @(
      @{ NAME='Registration';          SORT=10;  COLOR='#00B0E8'; SEMANTICS='P' },
      @{ NAME='Documents Collected';   SORT=20;  COLOR='#47E4C2'; SEMANTICS='P' },
      @{ NAME='Batch Assigned';        SORT=30;  COLOR='#38C4D9'; SEMANTICS='P' },
      @{ NAME='Payment Confirmed';     SORT=40;  COLOR='#56D4E0'; SEMANTICS='P' },
      @{ NAME='Departed';              SORT=50;  COLOR='#7BD500'; SEMANTICS='P' },
      @{ NAME='Returned (Won)';        SORT=60;  COLOR='#7BD500'; SEMANTICS='S' },
      @{ NAME='Cancelled';             SORT=70;  COLOR='#FF5752'; SEMANTICS='F' }
    )
  },
  @{
    NAME   = 'Adventure & Experiences'
    SORT   = 600
    STAGES = @(
      @{ NAME='Enquiry';               SORT=10;  COLOR='#00B0E8'; SEMANTICS='P' },
      @{ NAME='Confirmed';             SORT=20;  COLOR='#47E4C2'; SEMANTICS='P' },
      @{ NAME='Payment Received';      SORT=30;  COLOR='#56D4E0'; SEMANTICS='P' },
      @{ NAME='Voucher Sent';          SORT=40;  COLOR='#7BD500'; SEMANTICS='P' },
      @{ NAME='Completed (Won)';       SORT=50;  COLOR='#7BD500'; SEMANTICS='S' },
      @{ NAME='No-show / Cancel';      SORT=60;  COLOR='#FF5752'; SEMANTICS='F' }
    )
  }
)

# List existing pipelines
$existingCats = B24 'crm.dealcategory.list' @{ order=@{ SORT='ASC' } }
$existingCatIds = @{}
if ($existingCats.ok) { foreach ($c in $existingCats.data.result) { $existingCatIds[$c.NAME] = $c.ID } }

foreach ($p in $pipelines) {
  if ($existingCatIds.ContainsKey($p.NAME)) {
    $catId = $existingCatIds[$p.NAME]
    Write-Host ("  [skip] Pipeline '" + $p.NAME + "' (id=" + $catId + ") - verifying stages") -ForegroundColor DarkGray
  } else {
    $res = B24 'crm.dealcategory.add' @{ fields=@{ NAME=$p.NAME; SORT=$p.SORT; IS_LOCKED='N' } }
    $catId = Report ("Pipeline '" + $p.NAME + "'") $res
    if (-not $catId) { continue }
  }

  # Add stages. Stage IDs must be unique per pipeline - we use "C{catId}:STAGE_SHORT".
  $entityId = "DEAL_STAGE_$catId"
  $existingStages = B24 'crm.status.list' @{ filter=@{ ENTITY_ID=$entityId } }
  $existingStageNames = @()
  if ($existingStages.ok) { $existingStageNames = @($existingStages.data.result | Select-Object -ExpandProperty NAME) }

  foreach ($s in $p.STAGES) {
    if ($existingStageNames -contains $s.NAME) {
      Write-Host ("    [skip] Stage " + $s.NAME) -ForegroundColor DarkGray
      continue
    }
    # Build a STATUS_ID - Bitrix24 normalizes this (prefixed with C{catId}:)
    $shortId = ($s.NAME -replace '[^A-Za-z0-9]', '_').ToUpper()
    if ($shortId.Length -gt 30) { $shortId = $shortId.Substring(0, 30) }
    $statusId = "C${catId}:$shortId"
    $res = B24 'crm.status.add' @{ fields=@{
      ENTITY_ID = $entityId
      STATUS_ID = $statusId
      NAME      = $s.NAME
      SORT      = $s.SORT
      COLOR     = $s.COLOR
      SEMANTICS = $s.SEMANTICS
    }}
    Report ("    Stage " + $s.NAME) $res | Out-Null
  }
}

# ============================================================================
#  STEP D - VERIFY
# ============================================================================
Write-Host "`n== D) Verification ==" -ForegroundColor Cyan

Write-Host "`nDepartments:" -ForegroundColor DarkGray
$dl = B24 'department.get' @{}
if ($dl.ok) { foreach ($d in $dl.data.result | Sort-Object SORT) { '  {0,-6} {1}' -f $d.ID, $d.NAME | Write-Host } }

Write-Host "`nPipelines:" -ForegroundColor DarkGray
$cl = B24 'crm.dealcategory.list' @{ order=@{ SORT='ASC' } }
if ($cl.ok) { foreach ($c in $cl.data.result) { '  {0,-4} {1}' -f $c.ID, $c.NAME | Write-Host } }

Write-Host "`nDone. Open Bitrix24 - Deals dropdown should now include the 4 new pipelines." -ForegroundColor Green
Write-Host "Next: run setup-bitrix-automations.ps1 once you approve this output.`n"

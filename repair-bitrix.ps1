# repair-bitrix.ps1
# Fix the 4 issues the earlier scripts hit:
#   A) Rename auto-created WON/LOSE stages on the 4 new pipelines
#   B) Add missing progress stages with short STATUS_IDs
#   C) Add SPA custom fields with correct UF_CRM_{typeId}_ naming
#   D) (Optional) delete the 6 duplicate departments so only your original
#      TAT / Sales / Operations / Accounts / Marketing / Creators structure remains
#
# Idempotent. Safe to re-run.
#
#   powershell -ExecutionPolicy Bypass -File .\repair-bitrix.ps1
#
# To SKIP the department cleanup (keeps both sets of departments), set:
#   $env:KEEP_DEPARTMENTS = "1"

$ErrorActionPreference = 'Continue'

# --- Resolve webhook URL ----------------------------------------------------
$envFile = Join-Path $PSScriptRoot '.env.local'
$line = Get-Content $envFile | ? { $_ -match '^\s*BITRIX24_WEBHOOK_URL=' } | Select-Object -First 1
$url = (($line -replace '^\s*BITRIX24_WEBHOOK_URL=', '').Trim('"').Trim("'").Trim()).TrimEnd('/') + '/'
Write-Host "-> $url`n" -ForegroundColor DarkGray

function B24 {
  param([string]$m, $b = @{})
  try {
    $null = $b
    $json = $b | ConvertTo-Json -Depth 10 -Compress
    $r = Invoke-RestMethod -Uri "${url}${m}.json" -Method Post -ContentType 'application/json' -Body $json -TimeoutSec 25
    return @{ ok = $true; data = $r }
  } catch {
    $msg = $_.Exception.Message
    try { $s = $_.Exception.Response.GetResponseStream(); if ($s) { $j = (New-Object IO.StreamReader($s)).ReadToEnd() | ConvertFrom-Json; if ($j.error_description) { $msg = $j.error_description } } } catch {}
    return @{ ok = $false; err = $msg }
  }
}
function Rep([string]$label, $res) {
  if ($res.ok) { Write-Host ("  [OK]   " + $label) -ForegroundColor Green }
  elseif ($res.err -match 'exists|Duplicate|DUPLICATE|assigned') { Write-Host ("  [skip] " + $label + " (already OK)") -ForegroundColor DarkGray }
  else { Write-Host ("  [FAIL] " + $label + " :: " + $res.err) -ForegroundColor Yellow }
}

# ============================================================================
#  A + B — FIX PIPELINE STAGES (rename WON/LOSE, add missing progress stages)
# ============================================================================
Write-Host "== A+B) Repairing pipeline stages ==" -ForegroundColor Cyan

$pipelines = @(
  @{
    Name      = 'Corporate & Group Bookings'
    WonName   = 'Operated (Won)'
    LostName  = 'Lost'
    Progress  = @(
      @{ Id='NEW_ENQ';     Name='New Enquiry';      Sort=10; Color='#00B0E8' }
      @{ Id='QUALIFIED';   Name='Qualified';        Sort=20; Color='#47E4C2' }
      @{ Id='PROPOSAL';    Name='Proposal Sent';    Sort=30; Color='#38C4D9' }
      @{ Id='NEGOTIATION'; Name='Negotiation';      Sort=40; Color='#7BD500' }
      @{ Id='CONTRACT';    Name='Contract Signed';  Sort=50; Color='#56D4E0' }
    )
  },
  @{
    Name      = 'Destination Weddings & MICE'
    WonName   = 'Executed (Won)'
    LostName  = 'Lost'
    Progress  = @(
      @{ Id='ENQUIRY';     Name='Enquiry';              Sort=10; Color='#00B0E8' }
      @{ Id='SITE_VISIT';  Name='Site Visit Scheduled'; Sort=20; Color='#47E4C2' }
      @{ Id='DESIGN';      Name='Design & Mood Board';  Sort=30; Color='#38C4D9' }
      @{ Id='PROPOSAL';    Name='Proposal Sent';        Sort=40; Color='#56D4E0' }
      @{ Id='ADVANCE';     Name='Contract & Advance';   Sort=50; Color='#E89B06' }
      @{ Id='PLANNING';    Name='Planning & Vendors';   Sort=60; Color='#7BD500' }
    )
  },
  @{
    Name      = 'Chardham & Religious Yatra'
    WonName   = 'Returned (Won)'
    LostName  = 'Cancelled'
    Progress  = @(
      @{ Id='REGN';        Name='Registration';         Sort=10; Color='#00B0E8' }
      @{ Id='DOCS';        Name='Documents Collected';  Sort=20; Color='#47E4C2' }
      @{ Id='BATCH';       Name='Batch Assigned';       Sort=30; Color='#38C4D9' }
      @{ Id='PAID';        Name='Payment Confirmed';    Sort=40; Color='#56D4E0' }
      @{ Id='DEPARTED';    Name='Departed';             Sort=50; Color='#7BD500' }
    )
  },
  @{
    Name      = 'Adventure & Experiences'
    WonName   = 'Completed (Won)'
    LostName  = 'No-show / Cancel'
    Progress  = @(
      @{ Id='ENQUIRY';     Name='Enquiry';         Sort=10; Color='#00B0E8' }
      @{ Id='CONFIRMED';   Name='Confirmed';       Sort=20; Color='#47E4C2' }
      @{ Id='PAID';        Name='Payment Received';Sort=30; Color='#56D4E0' }
      @{ Id='VOUCHER';     Name='Voucher Sent';    Sort=40; Color='#7BD500' }
    )
  }
)

$cats = B24 'crm.dealcategory.list' @{}
$catIdByName = @{}
if ($cats.ok) { foreach ($c in $cats.data.result) { $catIdByName[$c.NAME] = $c.ID } }

foreach ($p in $pipelines) {
  if (-not $catIdByName.ContainsKey($p.Name)) {
    Write-Host ("  [skip] Pipeline '" + $p.Name + "' not found") -ForegroundColor DarkGray
    continue
  }
  $catId = $catIdByName[$p.Name]
  $entityId = "DEAL_STAGE_$catId"

  Write-Host ("`nPipeline: " + $p.Name + " (CAT=$catId)") -ForegroundColor White

  # List existing stages
  $sl = B24 'crm.status.list' @{ filter=@{ ENTITY_ID=$entityId }; order=@{ SORT='ASC' } }
  if (-not $sl.ok) { Write-Host "  Could not list stages: $($sl.err)" -ForegroundColor Yellow; continue }

  $existingByStatusId = @{}
  $wonStage = $null; $loseStage = $null
  foreach ($s in $sl.data.result) {
    $existingByStatusId[$s.STATUS_ID] = $s
    if ($s.SEMANTICS -eq 'S') { $wonStage = $s }
    if ($s.SEMANTICS -eq 'F') { $loseStage = $s }
  }

  # A) Rename WON/LOSE
  if ($wonStage) {
    $cur = $wonStage.NAME
    if ($cur -ne $p.WonName) {
      $res = B24 'crm.status.update' @{ id=$wonStage.ID; fields=@{ NAME=$p.WonName } }
      Rep ("  Rename WON '" + $cur + "' -> '" + $p.WonName + "'") $res
    } else {
      Write-Host ("  [skip] WON already named '" + $cur + "'") -ForegroundColor DarkGray
    }
  }
  if ($loseStage) {
    $cur = $loseStage.NAME
    if ($cur -ne $p.LostName) {
      $res = B24 'crm.status.update' @{ id=$loseStage.ID; fields=@{ NAME=$p.LostName } }
      Rep ("  Rename LOSE '" + $cur + "' -> '" + $p.LostName + "'") $res
    } else {
      Write-Host ("  [skip] LOSE already named '" + $cur + "'") -ForegroundColor DarkGray
    }
  }

  # B) Add missing progress stages with short STATUS_IDs
  foreach ($s in $p.Progress) {
    $fullId = "C${catId}:$($s.Id)"
    if ($existingByStatusId.ContainsKey($fullId)) {
      Write-Host ("  [skip] Stage " + $s.Name + " (exists)") -ForegroundColor DarkGray
      continue
    }
    # Also check by name (some may exist with different IDs from earlier partial runs)
    $existingByName = $sl.data.result | ? { $_.NAME -eq $s.Name } | Select-Object -First 1
    if ($existingByName) {
      Write-Host ("  [skip] Stage " + $s.Name + " (exists with different ID)") -ForegroundColor DarkGray
      continue
    }
    $res = B24 'crm.status.add' @{ fields=@{
      ENTITY_ID = $entityId
      STATUS_ID = $fullId
      NAME      = $s.Name
      SORT      = $s.Sort
      COLOR     = $s.Color
      SEMANTICS = 'P'
    }}
    Rep ("  Stage " + $s.Name + " (" + $fullId + ")") $res
  }
}

# ============================================================================
#  C — SPA custom fields with CORRECT field-name format
# ============================================================================
Write-Host "`n== C) SPA custom fields (with UF_CRM_{typeId}_... names) ==" -ForegroundColor Cyan

# Find SPA typeIds by title
$types = B24 'crm.type.list' @{}
$spaIdByTitle = @{}
if ($types.ok -and $types.data.result.types) {
  foreach ($t in $types.data.result.types) { $spaIdByTitle[$t.title] = $t.entityTypeId }
}

function Add-SpaField([int]$EntityTypeId, [string]$ShortName, [string]$T, [string]$Label) {
  if (-not $EntityTypeId) { return }
  # Field name must start with UF_CRM_{typeId}_ for Smart Processes
  $fieldName = "UF_CRM_${EntityTypeId}_${ShortName}"
  $b = @{ moduleId='crm'; field = @{
    entityId          = "CRM_$EntityTypeId"
    fieldName         = $fieldName
    userTypeId        = $T
    editFormLabel     = @{ en=$Label }
    listColumnLabel   = @{ en=$Label }
    listFilterLabel   = @{ en=$Label }
    multiple          = 'N'
    mandatory         = 'N'
    showFilter        = 'Y'
    showInList        = 'Y'
  }}
  $res = B24 'userfieldconfig.add' $b
  Rep ("  " + $fieldName + " (" + $Label + ")") $res
}

$vendorTid    = $spaIdByTitle['Vendors']
$itinTid      = $spaIdByTitle['Itinerary Drafts']
$complaintTid = $spaIdByTitle['Complaints']

Write-Host "`nVendors (entityTypeId=$vendorTid):" -ForegroundColor White
Add-SpaField $vendorTid 'CATEGORY'     'string' 'Category (Hotel / Transport / Activity / Guide)'
Add-SpaField $vendorTid 'CITY'         'string' 'City / Region'
Add-SpaField $vendorTid 'RATING'       'double' 'Rating (1-5)'
Add-SpaField $vendorTid 'COMMISSION'   'double' 'Commission %'
Add-SpaField $vendorTid 'GSTIN'        'string' 'GSTIN'
Add-SpaField $vendorTid 'CONTACT'      'string' 'Primary Contact Person'
Add-SpaField $vendorTid 'PHONE'        'string' 'Primary Phone'
Add-SpaField $vendorTid 'EMAIL'        'string' 'Primary Email'
Add-SpaField $vendorTid 'EXPIRY'       'date'   'Contract Expiry'
Add-SpaField $vendorTid 'NOTES'        'string' 'Notes'

Write-Host "`nItinerary Drafts (entityTypeId=$itinTid):" -ForegroundColor White
Add-SpaField $itinTid 'DEST'          'string'  'Destination'
Add-SpaField $itinTid 'DAYS'          'integer' 'Number of Days'
Add-SpaField $itinTid 'PAX'           'integer' 'Pax'
Add-SpaField $itinTid 'PKG_TYPE'      'string'  'GIT / FIT'
Add-SpaField $itinTid 'BUDGET'        'double'  'Budget (Rs.)'
Add-SpaField $itinTid 'STATUS'        'string'  'Draft / Sent / Approved / Rejected'
Add-SpaField $itinTid 'LINKED_DEAL'   'string'  'Linked Deal ID'
Add-SpaField $itinTid 'DOC_URL'       'string'  'Google Doc URL'

Write-Host "`nComplaints (entityTypeId=$complaintTid):" -ForegroundColor White
Add-SpaField $complaintTid 'SEVERITY'     'string'   'Severity (Low / Medium / High / Critical)'
Add-SpaField $complaintTid 'CHANNEL'      'string'   'Reported Via (Call / Email / WhatsApp / Social)'
Add-SpaField $complaintTid 'CATEGORY'     'string'   'Category (Hotel / Transport / Activity / Refund)'
Add-SpaField $complaintTid 'LINKED_DEAL'  'string'   'Linked Deal ID'
Add-SpaField $complaintTid 'REFUND'       'double'   'Refund / Compensation (Rs.)'
Add-SpaField $complaintTid 'RESOLUTION'   'string'   'Resolution Summary'
Add-SpaField $complaintTid 'SLA_DUE'      'datetime' 'SLA Due By'

# ============================================================================
#  D — Delete duplicate departments (optional)
# ============================================================================
if ($env:KEEP_DEPARTMENTS -ne "1") {
  Write-Host "`n== D) Removing duplicate departments ==" -ForegroundColor Cyan
  Write-Host "  To SKIP this, re-run with:  `$env:KEEP_DEPARTMENTS = '1'`n" -ForegroundColor DarkGray

  $dupes = @('Sales & Enquiries','Operations & Ops','Finance & Accounts','Marketing & Content','Customer Support','Management')
  $dl = B24 'department.get' @{}
  if ($dl.ok) {
    foreach ($name in $dupes) {
      $match = $dl.data.result | ? { $_.NAME -eq $name } | Select-Object -First 1
      if ($match) {
        # Check if any users assigned
        $users = B24 'user.get' @{ FILTER=@{ UF_DEPARTMENT=$match.ID } }
        $hasUsers = $users.ok -and $users.data.result -and $users.data.result.Count -gt 0
        if ($hasUsers) {
          Write-Host ("  [skip] " + $name + " (has users assigned - manual cleanup needed)") -ForegroundColor Yellow
        } else {
          $res = B24 'department.delete' @{ ID=$match.ID }
          Rep ("  Deleted duplicate: " + $name) $res
        }
      } else {
        Write-Host ("  [skip] " + $name + " (not found)") -ForegroundColor DarkGray
      }
    }
  }
}

# ============================================================================
#  VERIFY
# ============================================================================
Write-Host "`n=== Final verification ===" -ForegroundColor Green

Write-Host "`nPipelines & stages:" -ForegroundColor Cyan
$cats2 = B24 'crm.dealcategory.list' @{ order=@{ SORT='ASC' } }
if ($cats2.ok) {
  foreach ($c in $cats2.data.result) {
    '  Pipeline {0,-4} {1}' -f $c.ID, $c.NAME | Write-Host
    $sl2 = B24 'crm.status.list' @{ filter=@{ ENTITY_ID="DEAL_STAGE_$($c.ID)" }; order=@{ SORT='ASC' } }
    if ($sl2.ok) {
      foreach ($s in $sl2.data.result) {
        $sem = if ($s.SEMANTICS) { "[$($s.SEMANTICS)]" } else { "[P]" }
        '      {0,-22} {1} {2}' -f $s.NAME, $sem, $s.STATUS_ID | Write-Host
      }
    }
  }
}

Write-Host "`nSmart Processes & their fields:" -ForegroundColor Cyan
$tl = B24 'crm.type.list' @{}
if ($tl.ok) {
  foreach ($t in $tl.data.result.types) {
    if ($t.title -in 'Vendors','Itinerary Drafts','Complaints') {
      '  SPA {0,-3} {1}' -f $t.entityTypeId, $t.title | Write-Host
      $fl = B24 'userfieldconfig.list' @{ moduleId='crm'; filter=@{ entityId="CRM_$($t.entityTypeId)" } }
      if ($fl.ok -and $fl.data.result) {
        foreach ($f in $fl.data.result) {
          '      {0,-32} [{1}]' -f $f.fieldName, $f.userTypeId | Write-Host
        }
      }
    }
  }
}

Write-Host "`nDepartments:" -ForegroundColor Cyan
$dl2 = B24 'department.get' @{}
if ($dl2.ok) { foreach ($d in $dl2.data.result | Sort-Object SORT) { '  {0,-5} {1}' -f $d.ID, $d.NAME | Write-Host } }

Write-Host "`nDone." -ForegroundColor Green

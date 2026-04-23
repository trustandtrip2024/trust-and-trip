# setup-bitrix-fullscale.ps1
# Trust and Trip - Full-scale Bitrix24 configuration for a travel agency.
# Run AFTER setup-bitrix-foundation.ps1. Idempotent. Safe to re-run.
#
#   powershell -ExecutionPolicy Bypass -File .\setup-bitrix-fullscale.ps1
#
# What this adds on top of the foundation (depts + 4 new deal funnels):
#   1.  Smart Processes (custom CRM entities):
#         - Vendors          (hotels, transport, activities, guides)
#         - Itinerary Drafts (day-by-day plans before customer sees)
#         - Complaints       (escalations with severity + resolution)
#   2.  Custom fields on Companies (B2B / corporate clients)
#   3.  Custom fields on Contacts  (repeat customers + loyalty)
#   4.  Travel taxonomy lists (destination regions, trip categories)
#   5.  Deal UF: which vendor supplied the booking
#
# This does NOT:
#   - Create users (you said keep existing)
#   - Enable automations (you said keep existing)
#   - Modify existing leads/deals/contacts

$ErrorActionPreference = 'Continue'

# --- Resolve webhook URL ----------------------------------------------------
$envFile = Join-Path $PSScriptRoot '.env.local'
$line = Get-Content $envFile | ? { $_ -match '^\s*BITRIX24_WEBHOOK_URL=' } | Select-Object -First 1
if (-not $line) { Write-Host "ERROR: BITRIX24_WEBHOOK_URL missing" -ForegroundColor Red; exit 1 }
$url = (($line -replace '^\s*BITRIX24_WEBHOOK_URL=', '').Trim('"').Trim("'").Trim()).TrimEnd('/') + '/'

function B24 {
  param([string]$m, $b = @{})
  try {
    $json = $b | ConvertTo-Json -Depth 10 -Compress
    $r = Invoke-RestMethod -Uri "${url}${m}.json" -Method Post -ContentType 'application/json' -Body $json -TimeoutSec 25
    return @{ ok = $true; data = $r }
  } catch {
    $msg = $_.Exception.Message
    try { $s = $_.Exception.Response.GetResponseStream(); if ($s) { $j = (New-Object IO.StreamReader($s)).ReadToEnd() | ConvertFrom-Json; if ($j.error_description) { $msg = $j.error_description } } } catch {}
    return @{ ok = $false; err = $msg }
  }
}
function Report([string]$label, $res) {
  if ($res.ok) { Write-Host ("  [OK]   " + $label) -ForegroundColor Green; return $res.data.result }
  elseif ($res.err -match 'exists|Duplicate|DUPLICATE|assigned|ALREADY') { Write-Host ("  [skip] " + $label + " (already exists)") -ForegroundColor DarkGray; return $null }
  else { Write-Host ("  [FAIL] " + $label + " :: " + $res.err) -ForegroundColor Yellow; return $null }
}

# ============================================================================
#  STEP 1 - SMART PROCESSES (custom CRM entities)
# ============================================================================
Write-Host "`n== 1) Smart Processes (custom CRM entities) ==" -ForegroundColor Cyan

# List existing types
$types = B24 'crm.type.list' @{}
$existingTypeTitles = @{}
if ($types.ok -and $types.data.result.types) {
  foreach ($t in $types.data.result.types) { $existingTypeTitles[$t.title] = $t.id }
}

function Ensure-SmartProcess([string]$Title, [string]$Code, [hashtable]$Extras) {
  if ($existingTypeTitles.ContainsKey($Title)) {
    Write-Host ("  [skip] SPA '" + $Title + "' already exists (id=" + $existingTypeTitles[$Title] + ")") -ForegroundColor DarkGray
    return $existingTypeTitles[$Title]
  }
  $body = @{ fields = @{
    title                 = $Title
    code                  = $Code
    isCategoriesEnabled   = 'Y'
    isStagesEnabled       = 'Y'
    isBeginCloseDatesEnabled = 'Y'
    isClientEnabled       = 'Y'
    isUseInUserfieldEnabled = 'Y'
    isLinkWithProductsEnabled = 'N'
    isCrmTrackingEnabled  = 'N'
  }}
  foreach ($k in $Extras.Keys) { $body.fields[$k] = $Extras[$k] }
  $res = B24 'crm.type.add' $body
  $id = Report ("SPA '" + $Title + "'") $res
  if ($id) { $existingTypeTitles[$Title] = $id.type.id }
  return $id.type.id
}

$vendorTypeId    = Ensure-SmartProcess 'Vendors'          'TNT_VENDORS'    @{}
$itinTypeId      = Ensure-SmartProcess 'Itinerary Drafts' 'TNT_ITINERARIES' @{}
$complaintTypeId = Ensure-SmartProcess 'Complaints'       'TNT_COMPLAINTS' @{}

# --- Custom fields on each SPA --------------------------------------------
function Add-SpaField([int]$TypeId, [string]$Name, [string]$T, [string]$Label) {
  if (-not $TypeId) { return }
  $b = @{ moduleId='crm'; field = @{
    entityId          = "CRM_" + $TypeId
    fieldName         = $Name
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
  Report ("    Field " + $Name + " on " + $TypeId) $res | Out-Null
}

# Vendor fields
if ($vendorTypeId) {
  Write-Host "`n  Vendor fields:" -ForegroundColor DarkGray
  Add-SpaField $vendorTypeId 'UF_CRM_VND_CATEGORY'  'string' 'Category (Hotel / Transport / Activity / Guide)'
  Add-SpaField $vendorTypeId 'UF_CRM_VND_CITY'      'string' 'City / Region'
  Add-SpaField $vendorTypeId 'UF_CRM_VND_RATING'    'double' 'Rating (1-5)'
  Add-SpaField $vendorTypeId 'UF_CRM_VND_COMMISSION' 'double' 'Commission %'
  Add-SpaField $vendorTypeId 'UF_CRM_VND_GSTIN'     'string' 'GSTIN'
  Add-SpaField $vendorTypeId 'UF_CRM_VND_CONTACT'   'string' 'Primary Contact Person'
  Add-SpaField $vendorTypeId 'UF_CRM_VND_PHONE'     'string' 'Primary Phone'
  Add-SpaField $vendorTypeId 'UF_CRM_VND_EMAIL'     'string' 'Primary Email'
  Add-SpaField $vendorTypeId 'UF_CRM_VND_CONTRACT_EXPIRY' 'date' 'Contract Expiry'
  Add-SpaField $vendorTypeId 'UF_CRM_VND_NOTES'     'string' 'Notes'
}

# Itinerary Draft fields
if ($itinTypeId) {
  Write-Host "`n  Itinerary Draft fields:" -ForegroundColor DarkGray
  Add-SpaField $itinTypeId 'UF_CRM_ITN_DESTINATION' 'string'  'Destination'
  Add-SpaField $itinTypeId 'UF_CRM_ITN_DAYS'        'integer' 'Number of Days'
  Add-SpaField $itinTypeId 'UF_CRM_ITN_PAX'         'integer' 'Pax'
  Add-SpaField $itinTypeId 'UF_CRM_ITN_PACKAGE_TYPE' 'string' 'GIT / FIT'
  Add-SpaField $itinTypeId 'UF_CRM_ITN_BUDGET'      'double'  'Budget (Rs.)'
  Add-SpaField $itinTypeId 'UF_CRM_ITN_STATUS'      'string'  'Draft / Sent / Approved / Rejected'
  Add-SpaField $itinTypeId 'UF_CRM_ITN_LINKED_DEAL' 'string'  'Linked Deal ID'
  Add-SpaField $itinTypeId 'UF_CRM_ITN_GOOGLE_DOC'  'string'  'Google Doc URL'
}

# Complaint fields
if ($complaintTypeId) {
  Write-Host "`n  Complaint fields:" -ForegroundColor DarkGray
  Add-SpaField $complaintTypeId 'UF_CRM_CPL_SEVERITY'  'string' 'Severity (Low / Medium / High / Critical)'
  Add-SpaField $complaintTypeId 'UF_CRM_CPL_CHANNEL'   'string' 'Reported Via (Call / Email / WhatsApp / Social)'
  Add-SpaField $complaintTypeId 'UF_CRM_CPL_CATEGORY'  'string' 'Category (Hotel / Transport / Activity / Refund / Service)'
  Add-SpaField $complaintTypeId 'UF_CRM_CPL_LINKED_DEAL' 'string' 'Linked Deal ID'
  Add-SpaField $complaintTypeId 'UF_CRM_CPL_REFUND'    'double' 'Refund / Compensation (Rs.)'
  Add-SpaField $complaintTypeId 'UF_CRM_CPL_RESOLUTION' 'string' 'Resolution Summary'
  Add-SpaField $complaintTypeId 'UF_CRM_CPL_SLA_DUE'   'datetime' 'SLA Due By'
}

# ============================================================================
#  STEP 2 - COMPANY custom fields (B2B corporate clients)
# ============================================================================
Write-Host "`n== 2) Company custom fields (corporate clients) ==" -ForegroundColor Cyan

function Add-CompanyField([string]$Name, [string]$T, [string]$Label) {
  $b = @{ fields = @{
    FIELD_NAME        = $Name
    USER_TYPE_ID      = $T
    XML_ID            = ($Name -replace '^UF_CRM_', '')
    MULTIPLE          = 'N'
    MANDATORY         = 'N'
    SHOW_FILTER       = 'Y'
    SHOW_IN_LIST      = 'Y'
    EDIT_IN_LIST      = 'Y'
    EDIT_FORM_LABEL   = @{ en=$Label }
    LIST_COLUMN_LABEL = @{ en=$Label }
    LIST_FILTER_LABEL = @{ en=$Label }
  }}
  $res = B24 'crm.company.userfield.add' $b
  Report ("  Company: " + $Name + " (" + $Label + ")") $res | Out-Null
}
Add-CompanyField 'UF_CRM_GSTIN'             'string'  'GSTIN'
Add-CompanyField 'UF_CRM_PAN'               'string'  'PAN'
Add-CompanyField 'UF_CRM_INDUSTRY'          'string'  'Industry'
Add-CompanyField 'UF_CRM_COMPANY_SIZE'      'string'  'Company Size'
Add-CompanyField 'UF_CRM_ANNUAL_TRAVEL_SPEND' 'double' 'Annual Travel Spend (Rs.)'
Add-CompanyField 'UF_CRM_AGREEMENT_TYPE'    'string'  'Agreement Type (Retainer / One-off / Credit)'
Add-CompanyField 'UF_CRM_CREDIT_DAYS'       'integer' 'Credit Period (Days)'
Add-CompanyField 'UF_CRM_PREFERRED_DEST'    'string'  'Preferred Destinations'

# ============================================================================
#  STEP 3 - CONTACT custom fields (repeat customers, loyalty)
# ============================================================================
Write-Host "`n== 3) Contact custom fields (repeat customers) ==" -ForegroundColor Cyan

function Add-ContactField([string]$Name, [string]$T, [string]$Label) {
  $b = @{ fields = @{
    FIELD_NAME        = $Name
    USER_TYPE_ID      = $T
    XML_ID            = ($Name -replace '^UF_CRM_', '')
    MULTIPLE          = 'N'
    MANDATORY         = 'N'
    SHOW_FILTER       = 'Y'
    SHOW_IN_LIST      = 'Y'
    EDIT_IN_LIST      = 'Y'
    EDIT_FORM_LABEL   = @{ en=$Label }
    LIST_COLUMN_LABEL = @{ en=$Label }
    LIST_FILTER_LABEL = @{ en=$Label }
  }}
  $res = B24 'crm.contact.userfield.add' $b
  Report ("  Contact: " + $Name + " (" + $Label + ")") $res | Out-Null
}
Add-ContactField 'UF_CRM_DOB'                  'date'    'Date of Birth'
Add-ContactField 'UF_CRM_ANNIVERSARY'          'date'    'Anniversary'
Add-ContactField 'UF_CRM_PASSPORT_NUMBER'      'string'  'Passport Number'
Add-ContactField 'UF_CRM_PASSPORT_EXPIRY'      'date'    'Passport Expiry'
Add-ContactField 'UF_CRM_FOOD_PREFERENCE'      'string'  'Food Preference (Veg / Non-veg / Jain / Vegan)'
Add-ContactField 'UF_CRM_TRAVEL_PREFERENCES'   'string'  'Travel Preferences'
Add-ContactField 'UF_CRM_LOYALTY_TIER'         'string'  'Loyalty Tier (Bronze / Silver / Gold / Platinum)'
Add-ContactField 'UF_CRM_LIFETIME_SPEND'       'double'  'Lifetime Spend (Rs.)'
Add-ContactField 'UF_CRM_TRIPS_COMPLETED'      'integer' 'Trips Completed'
Add-ContactField 'UF_CRM_REFERRAL_COUNT'       'integer' 'Successful Referrals'
Add-ContactField 'UF_CRM_WHATSAPP_OPTED_IN'    'boolean' 'WhatsApp Opt-in'
Add-ContactField 'UF_CRM_MARKETING_OPTED_IN'   'boolean' 'Marketing Emails Opt-in'

# ============================================================================
#  STEP 4 - DEAL custom fields (vendor reference, extras)
# ============================================================================
Write-Host "`n== 4) Additional Deal custom fields ==" -ForegroundColor Cyan

function Add-DealField([string]$Name, [string]$T, [string]$Label) {
  $b = @{ fields = @{
    FIELD_NAME        = $Name
    USER_TYPE_ID      = $T
    XML_ID            = ($Name -replace '^UF_CRM_', '')
    MULTIPLE          = 'N'
    MANDATORY         = 'N'
    SHOW_FILTER       = 'Y'
    SHOW_IN_LIST      = 'Y'
    EDIT_IN_LIST      = 'Y'
    EDIT_FORM_LABEL   = @{ en=$Label }
    LIST_COLUMN_LABEL = @{ en=$Label }
    LIST_FILTER_LABEL = @{ en=$Label }
  }}
  $res = B24 'crm.deal.userfield.add' $b
  Report ("  Deal: " + $Name + " (" + $Label + ")") $res | Out-Null
}
Add-DealField 'UF_CRM_HOTEL_VENDOR'       'string'  'Hotel Vendor'
Add-DealField 'UF_CRM_TRANSPORT_VENDOR'   'string'  'Transport Vendor'
Add-DealField 'UF_CRM_ACTIVITIES_VENDOR'  'string'  'Activities Vendor'
Add-DealField 'UF_CRM_COMMISSION_EARNED'  'double'  'Commission Earned (Rs.)'
Add-DealField 'UF_CRM_MARGIN'             'double'  'Margin (Rs.)'
Add-DealField 'UF_CRM_REFUND_AMOUNT'      'double'  'Refund Amount (Rs.)'
Add-DealField 'UF_CRM_INSURANCE_POLICY'   'string'  'Travel Insurance Policy No.'
Add-DealField 'UF_CRM_INVOICE_NUMBER'     'string'  'Invoice Number'
Add-DealField 'UF_CRM_PAYMENT_METHOD'     'string'  'Payment Method (Razorpay / Bank / Cash / UPI)'
Add-DealField 'UF_CRM_VOUCHER_SENT_ON'    'date'    'Voucher Sent On'
Add-DealField 'UF_CRM_TRIP_STATUS'        'string'  'Trip Status (Upcoming / Active / Completed / Cancelled)'
Add-DealField 'UF_CRM_FEEDBACK_SCORE'     'integer' 'Feedback NPS (0-10)'

# ============================================================================
#  STEP 5 - ADDITIONAL LEAD SOURCES (travel-specific)
# ============================================================================
Write-Host "`n== 5) Additional Lead Sources ==" -ForegroundColor Cyan

function Add-Source([string]$StatusId, [string]$Name) {
  $b = @{ fields = @{ ENTITY_ID='SOURCE'; STATUS_ID=$StatusId; NAME=$Name } }
  $res = B24 'crm.status.add' $b
  Report ("  Source: " + $Name) $res | Out-Null
}
Add-Source 'WEBSITE_FORM'     'Website Form'
Add-Source 'WALK_IN'          'Walk-in / Office'
Add-Source 'PHONE_INBOUND'    'Phone (Inbound)'
Add-Source 'GOOGLE_SEARCH'    'Google Search / SEO'
Add-Source 'REPEAT_CLIENT'    'Repeat Client'
Add-Source 'TRAVEL_AGENT'     'Travel Agent Partner'
Add-Source 'EVENT_EXPO'       'Event / Travel Expo'

# ============================================================================
#  STEP 6 - TRAVEL TAXONOMY (as a CRM status list for "trip category")
# ============================================================================
Write-Host "`n== 6) Trip Category taxonomy ==" -ForegroundColor Cyan

# Add a custom status group for Trip Category (for deal classification)
function Add-TripCategory([string]$StatusId, [string]$Name) {
  $b = @{ fields = @{ ENTITY_ID='TRIP_CATEGORY'; STATUS_ID=$StatusId; NAME=$Name } }
  $res = B24 'crm.status.add' $b
  Report ("  Trip category: " + $Name) $res | Out-Null
}
# NB: TRIP_CATEGORY may need to be registered first. If this step fails,
# the fallback is to use a regular string UF field (already added as UF_CRM_TRAVEL_TYPE).
Add-TripCategory 'HONEYMOON'      'Honeymoon'
Add-TripCategory 'FAMILY'         'Family'
Add-TripCategory 'GROUP'          'Group Tour'
Add-TripCategory 'SOLO'           'Solo'
Add-TripCategory 'BUSINESS'       'Business / MICE'
Add-TripCategory 'PILGRIMAGE'     'Pilgrimage / Religious'
Add-TripCategory 'ADVENTURE'      'Adventure'
Add-TripCategory 'LUXURY'         'Luxury'
Add-TripCategory 'BUDGET'         'Budget'
Add-TripCategory 'CORPORATE'      'Corporate Event'
Add-TripCategory 'WEDDING'        'Destination Wedding'

# ============================================================================
#  STEP 7 - SUMMARY
# ============================================================================
Write-Host "`n=== Setup complete ===" -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  * 3 Smart Processes:    Vendors, Itinerary Drafts, Complaints"
Write-Host "  * ~35 Custom fields:    Company (8) + Contact (12) + Deal (12) + extras"
Write-Host "  * 7 Additional sources: Website/Walk-in/Phone/SEO/Repeat/Agent/Expo"
Write-Host "  * 11 Trip categories"
Write-Host "`nWhat to do next in Bitrix24 UI:" -ForegroundColor Yellow
Write-Host "  1. Go to CRM -> Smart Processes -> you will see Vendors / Itinerary Drafts / Complaints"
Write-Host "     Pin them to your left sidebar for quick access."
Write-Host "  2. Employees -> Company Structure -> drag existing users into the new departments"
Write-Host "  3. Deals dropdown now shows 6 pipelines (Sales, Ops, Corporate, Wedding, Chardham, Adventure)"
Write-Host "  4. Open any Contact -> you'll see new fields for passport, anniversary, loyalty tier, etc."
Write-Host "`nPaste this output back to Claude and I'll draft the automation rules.`n"

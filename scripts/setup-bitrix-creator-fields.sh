#!/usr/bin/env bash
# Create Bitrix24 custom fields needed by the Creator program.
# Reads BITRIX24_WEBHOOK_URL from .env.local.
# Idempotent: skips fields that already exist.

set -u

URL=$(grep '^BITRIX24_WEBHOOK_URL=' .env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
[ -z "$URL" ] && { echo "BITRIX24_WEBHOOK_URL not set in .env.local"; exit 1; }
[ "${URL: -1}" != "/" ] && URL="${URL}/"

create_field() {
  local entity="$1"   # lead or deal
  local code="$2"     # UF_CRM_REF_CODE
  local label="$3"
  local type="$4"     # string | boolean | money | double

  local existing=$(curl -s "${URL}crm.${entity}.userfield.list.json" \
    | grep -oE "\"FIELD_NAME\":\"$code\"" | head -1)
  if [ -n "$existing" ]; then
    printf "  ✓ %-30s already exists\n" "$code"
    return
  fi

  local resp=$(curl -s "${URL}crm.${entity}.userfield.add.json" \
    --data-urlencode "fields[FIELD_NAME]=$code" \
    --data-urlencode "fields[USER_TYPE_ID]=$type" \
    --data-urlencode "fields[XML_ID]=$code" \
    --data-urlencode "fields[SORT]=900" \
    --data-urlencode "fields[MULTIPLE]=N" \
    --data-urlencode "fields[MANDATORY]=N" \
    --data-urlencode "fields[SHOW_FILTER]=Y" \
    --data-urlencode "fields[SHOW_IN_LIST]=Y" \
    --data-urlencode "fields[EDIT_IN_LIST]=Y" \
    --data-urlencode "fields[EDIT_FORM_LABEL][en]=$label" \
    --data-urlencode "fields[LIST_COLUMN_LABEL][en]=$label" \
    --data-urlencode "fields[LIST_FILTER_LABEL][en]=$label")
  local id=$(echo "$resp" | grep -oE '"result":[0-9]+' | head -1)
  if [ -n "$id" ]; then
    printf "  + %-30s created %s\n" "$code" "$id"
  else
    printf "  ✗ %-30s failed: %s\n" "$code" "$(echo "$resp" | head -c 200)"
  fi
}

echo "── Lead fields ──"
create_field "lead" "UF_CRM_REF_CODE" "Creator Ref Code" "string"

echo "── Deal fields ──"
create_field "deal" "UF_CRM_REF_CODE"            "Creator Ref Code"   "string"
create_field "deal" "UF_CRM_COMMISSION_AMOUNT"   "Commission (INR)"   "double"
create_field "deal" "UF_CRM_COMMISSION_PAID"     "Commission Paid"    "boolean"

echo ""
echo "Done. Reload Bitrix24 portal CRM views to see new columns."

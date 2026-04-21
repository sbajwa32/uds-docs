#!/usr/bin/env bash
# bump.sh — Auto-increment SITE version and cache-bust params in index.html
#
# Version format: SITE YYYY.MM.DD.N
#   - If today's UTC date matches, N is incremented
#   - If it's a new day, N resets to 1
# Also increments ?v=N cache-busting params on uds.css and app.js

set -euo pipefail

FILE="$(dirname "$0")/index.html"

if [[ ! -f "$FILE" ]]; then
  echo "Error: $FILE not found" >&2
  exit 1
fi

TODAY=$(date -u +"%Y.%m.%d")

CURRENT=$(sed -n 's/.*SITE \([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*\).*/\1/p' "$FILE" | head -1)

if [[ -z "$CURRENT" ]]; then
  NEW_VERSION="${TODAY}.1"
  sed -i '' "s/SITE [^<]*/SITE ${NEW_VERSION}/" "$FILE"
else
  CURRENT_DATE="${CURRENT%.*}"
  CURRENT_N="${CURRENT##*.}"

  if [[ "$CURRENT_DATE" == "$TODAY" ]]; then
    NEW_N=$((CURRENT_N + 1))
  else
    NEW_N=1
  fi
  NEW_VERSION="${TODAY}.${NEW_N}"
  sed -i '' "s/SITE ${CURRENT}/SITE ${NEW_VERSION}/" "$FILE"
fi

CSS_V=$(sed -n 's/.*uds\.css?v=\([0-9]*\).*/\1/p' "$FILE" | head -1)
if [[ -n "$CSS_V" ]]; then
  NEW_CSS_V=$((CSS_V + 1))
  sed -i '' "s/uds\.css?v=${CSS_V}/uds.css?v=${NEW_CSS_V}/" "$FILE"
fi

JS_V=$(sed -n 's/.*app\.js?v=\([0-9]*\).*/\1/p' "$FILE" | head -1)
if [[ -n "$JS_V" ]]; then
  NEW_JS_V=$((JS_V + 1))
  sed -i '' "s/app\.js?v=${JS_V}/app.js?v=${NEW_JS_V}/" "$FILE"
fi

UDS_JS_V=$(sed -n 's/.*uds\.js?v=\([0-9]*\).*/\1/p' "$FILE" | head -1)
if [[ -n "$UDS_JS_V" ]]; then
  NEW_UDS_JS_V=$((UDS_JS_V + 1))
  sed -i '' "s/uds\.js?v=${UDS_JS_V}/uds.js?v=${NEW_UDS_JS_V}/" "$FILE"
fi

echo "✓ SITE ${NEW_VERSION}"
[[ -n "${NEW_CSS_V:-}" ]]    && echo "  uds.css?v=${NEW_CSS_V}"
[[ -n "${NEW_JS_V:-}" ]]     && echo "  app.js?v=${NEW_JS_V}"
[[ -n "${NEW_UDS_JS_V:-}" ]] && echo "  uds.js?v=${NEW_UDS_JS_V}"

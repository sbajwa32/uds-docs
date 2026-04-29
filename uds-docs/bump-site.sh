#!/bin/bash
# bump-site.sh — Bumps the SITE version using the actual system date.
# Updates all 3 locations: index.html display, index.html inline script, version.txt
# Usage: bash bump-site.sh

set -e
cd "$(dirname "$0")"

TODAY=$(date '+%Y.%m.%d')
CURRENT=$(grep -o 'SITE [0-9]\{4\}\.[0-9]\{2\}\.[0-9]\{2\}\.[0-9]*' index.html | head -1 | sed 's/SITE //')
CURRENT_DATE=$(echo "$CURRENT" | sed 's/\.[^.]*$//')
CURRENT_N=$(echo "$CURRENT" | grep -o '[^.]*$')

if [ "$CURRENT_DATE" = "$TODAY" ]; then
  NEXT_N=$((CURRENT_N + 1))
else
  NEXT_N=1
fi

NEW_VERSION="${TODAY}.${NEXT_N}"

echo "Current: SITE ${CURRENT}"
echo "New:     SITE ${NEW_VERSION}"

# sed -i is portable across BSD (macOS) and GNU (Linux) when given a backup
# extension; both treat the backup arg as the suffix and a trailing empty
# string is unsupported on Linux. We use .bak then remove it.
sed -i.bak "s/SITE ${CURRENT}/SITE ${NEW_VERSION}/" index.html
sed -i.bak "s/var SITE_VERSION = '${CURRENT}'/var SITE_VERSION = '${NEW_VERSION}'/" index.html
rm -f index.html.bak

# Update version.txt
echo "${NEW_VERSION}" > version.txt

echo "Done. Now add a SITE_CHANGELOG entry for version 'SITE ${NEW_VERSION}' with date '$(date '+%Y-%m-%d')' in app.js"

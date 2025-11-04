#!/bin/bash

# Script to create a new Chrome extension zip with auto-incremented version number
# The zip name will be: chrome-extension-updated-v{version}.zip

# Find the highest existing version number
HIGHEST_VERSION=$(ls -1 chrome-extension-updated-v*.zip 2>/dev/null | \
  sed 's/.*v\([0-9]*\)\.zip/\1/' | \
  sort -n | \
  tail -1)

# If no existing zip found, start at v163 (or v1 if you prefer)
if [ -z "$HIGHEST_VERSION" ]; then
  NEXT_VERSION=163
else
  NEXT_VERSION=$((HIGHEST_VERSION + 1))
fi

ZIP_NAME="chrome-extension-updated-v${NEXT_VERSION}.zip"

echo "Creating zip: ${ZIP_NAME}"
echo "Updating manifest.json with version ${NEXT_VERSION}..."

# Backup original manifest
cp manifest.json manifest.json.bak

# Update manifest.json with new version and name
# Use a temporary file for JSON manipulation
if command -v jq &> /dev/null; then
  # If jq is available, use it for cleaner JSON manipulation
  jq --arg name "Benefit Systems" --arg version "${NEXT_VERSION}" \
    '.name = $name | .version = $version' manifest.json > manifest.json.tmp && \
    mv manifest.json.tmp manifest.json
else
  # Fallback to sed if jq is not available
  sed "s/\"name\": \"Benefit Systems.*\"/\"name\": \"Benefit Systems\"/" manifest.json > manifest.json.tmp
  sed "s/\"version\": \"[0-9.]*\"/\"version\": \"${NEXT_VERSION}\"/" manifest.json.tmp > manifest.json
  rm -f manifest.json.tmp
fi

# Create the zip file with all Chrome extension files
zip -r "$ZIP_NAME" \
  manifest.json \
  background.js \
  content.js \
  flight-details-injector*.js \
  flight-details-styles.css \
  styles.css \
  icon*.png \
  icons/ \
  lib/ \
  -x "*.DS_Store" \
  2>&1 | grep -E "(adding|updating|error)" || true

# Check if zip was created successfully
if [ -f "$ZIP_NAME" ]; then
  # Keep the updated manifest.json (don't restore backup)
  rm -f manifest.json.bak
  echo "✓ Created ${ZIP_NAME} with version ${NEXT_VERSION}"
  echo "✓ Updated manifest.json to version ${NEXT_VERSION}"
  
  # Commit and push manifest.json to GitHub
  echo "Committing and pushing version ${NEXT_VERSION} to GitHub..."
  git add manifest.json
  if git commit -m "Version ${NEXT_VERSION}: Update manifest.json" > /dev/null 2>&1; then
    if git push origin main > /dev/null 2>&1; then
      echo "✓ Pushed version ${NEXT_VERSION} to GitHub"
    else
      echo "⚠ Created zip but failed to push to GitHub (check your connection)"
    fi
  else
    echo "⚠ Created zip but no changes to commit (manifest.json may already be at version ${NEXT_VERSION})"
  fi
else
  # Restore backup if zip creation failed
  mv manifest.json.bak manifest.json
  echo "✗ Failed to create zip, manifest.json restored"
  exit 1
fi


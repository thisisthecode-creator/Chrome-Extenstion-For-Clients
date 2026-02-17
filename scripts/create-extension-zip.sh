#!/usr/bin/env bash

set -euo pipefail

# Resolve repo root (one level up from this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

MANIFEST_JSON="${ROOT_DIR}/manifest.json"
CURRENT_VERSION=$(grep -E '"version"' "${MANIFEST_JSON}" | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')
# Increment version: support "N" or "N.M" or "N.M.P"
if [[ "${CURRENT_VERSION}" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
  MAJOR="${BASH_REMATCH[1]}"
  MINOR="${BASH_REMATCH[2]}"
  PATCH="${BASH_REMATCH[3]}"
  NEW_VERSION="${MAJOR}.${MINOR}.$((PATCH + 1))"
elif [[ "${CURRENT_VERSION}" =~ ^([0-9]+)\.([0-9]+)$ ]]; then
  MAJOR="${BASH_REMATCH[1]}"
  MINOR="${BASH_REMATCH[2]}"
  NEW_VERSION="${MAJOR}.$((MINOR + 1))"
else
  # Single number (e.g. "11")
  NEW_VERSION="$((CURRENT_VERSION + 1))"
fi

# Update manifest.json with new version
if [[ "$(uname -s)" == "Darwin" ]]; then
  sed -i '' "s/\"version\": \"${CURRENT_VERSION}\"/\"version\": \"${NEW_VERSION}\"/" "${MANIFEST_JSON}"
else
  sed -i "s/\"version\": \"${CURRENT_VERSION}\"/\"version\": \"${NEW_VERSION}\"/" "${MANIFEST_JSON}"
fi

ZIP_NAME="benefit-systems-v${NEW_VERSION}.zip"

echo "Version: ${CURRENT_VERSION} -> ${NEW_VERSION}"
echo "Creating extension zip: ${ZIP_NAME}"

rm -f "${ZIP_NAME}"

# Same method as v11 that worked in Orion: zip from repo root with these exclusions
export COPYFILE_DISABLE=1
zip -r "${ZIP_NAME}" . \
  -x ".git/*" \
  -x "scripts/*" \
  -x "*.DS_Store" \
  -x "__MACOSX/*" \
  -x ".gitignore" \
  -x "*.zip"

echo "Done. Created ${ROOT_DIR}/${ZIP_NAME}"


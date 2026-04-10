#!/usr/bin/env bash
# Install i360 CLI tool
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="/usr/local/bin/i360"

echo ""
echo "  i360 Installer"
echo "  ─────────────────"
echo ""

# Check for FFmpeg
if ! command -v ffmpeg &>/dev/null; then
  echo "  FFmpeg is required but not installed."
  if command -v brew &>/dev/null; then
    echo -n "  Install via Homebrew? [Y/n] "
    read -r answer
    if [[ "$answer" != "n" && "$answer" != "N" ]]; then
      brew install ffmpeg
    else
      echo "  Skipped. Install FFmpeg manually before using i360."
    fi
  else
    echo "  Install it with: brew install ffmpeg"
    echo "  Or visit: https://ffmpeg.org/download.html"
  fi
else
  echo "  ✓ FFmpeg found: $(ffmpeg -version 2>/dev/null | head -1)"
fi

echo ""

# Make executable
chmod +x "${SCRIPT_DIR}/i360"

# Symlink
if [[ -L "$TARGET" || -f "$TARGET" ]]; then
  echo "  ${TARGET} already exists."
  echo -n "  Replace it? [Y/n] "
  read -r answer
  if [[ "$answer" == "n" || "$answer" == "N" ]]; then
    echo "  Skipped symlink. Run directly with: ${SCRIPT_DIR}/i360"
    exit 0
  fi
  sudo rm -f "$TARGET"
fi

sudo ln -s "${SCRIPT_DIR}/i360" "$TARGET"
echo "  ✓ Installed: i360 → ${SCRIPT_DIR}/i360"
echo ""
echo "  Run 'i360 help' to get started."
echo ""

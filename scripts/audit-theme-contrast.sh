#!/usr/bin/env bash
# Multi-theme accessibility audit — runs axe-core across all 6 supported
# UDS theme combinations (Base/ResMan/AnyoneHome × Light/Dark, plus
# Inhabit Light) and fails if any color-contrast / aria-allowed-attr /
# aria-required-children violations exist on a representative set of pages.
#
# Requires: a local docs server on http://localhost:4000, headless Chrome
# with CDP at port 9332, and `node` + `axe-core` + `ws` available.
#
# Phase 17: added to lock in zero contrast/aria violations across all
# themes. The Phase 16 baseline-light scan would let dark-mode and
# accent-theme regressions slip through.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
exec node --experimental-vm-modules "$HERE/lib/audit_theme_contrast.js" "$@"

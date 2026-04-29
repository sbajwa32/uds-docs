#!/bin/bash
# Cloud Agent desktop preview setup
# ==================================
# Idempotent script that prepares the VNC desktop (display :1) for visual
# review of the UDS doc site:
#
#   1. Configures Plank to auto-hide so it does not occupy screen space.
#      The init script at /usr/local/share/desktop-init.sh runs Plank in a
#      respawn loop, so we change Plank's hide-mode preference (dconf) and
#      bounce the running instance once. The supervisor restarts Plank
#      with the new preference applied; we don't try to fight the loop.
#
#   2. Waits for the local UDS doc site (port 4000) to be reachable. The
#      site is started by the "UDS doc site (local server)" terminal in
#      .cursor/environment.json. We don't start it here.
#
#   3. Launches Google Chrome on DISPLAY=:1 pointing at the doc site,
#      sized to fill the 1920x1200 VNC display. If Chrome is already
#      running on the display we leave it alone.
#
# Safe to run multiple times. Designed to be invoked from the "start"
# field of .cursor/environment.json so every fresh Cloud Agent VM is
# ready for visual review out of the box.

set -u

DISPLAY_NUM="${DISPLAY:-:1}"
export DISPLAY="${DISPLAY_NUM}"

SITE_URL="${UDS_PREVIEW_URL:-http://localhost:4000/}"
SITE_PORT="${UDS_PREVIEW_PORT:-4000}"

CHROME_PROFILE="${CHROME_PROFILE:-/tmp/chrome-profile-uds-preview}"
WINDOW_W="${UDS_PREVIEW_W:-1920}"
WINDOW_H="${UDS_PREVIEW_H:-1200}"

log() { echo "[uds-preview] $*"; }

# 1. Plank: auto-hide.
# The 0/1 here is dconf's enum for hide-mode where 0 = none, 1 = intelligent
# auto-hide. We try dconf first, fall back to gsettings if dconf isn't there.
if command -v dconf >/dev/null 2>&1; then
  dconf write /net/launchpad/plank/docks/dock1/hide-mode 1 >/dev/null 2>&1 \
    && log "Plank: hide-mode set to 1 (auto-hide) via dconf" \
    || log "Plank: dconf write failed, continuing"
elif command -v gsettings >/dev/null 2>&1; then
  gsettings set net.launchpad.plank.docks.dock1 hide-mode 'intelligent' \
    >/dev/null 2>&1 \
    && log "Plank: hide-mode set via gsettings" \
    || log "Plank: gsettings write failed, continuing"
fi

# Bounce the current Plank so it picks up the new pref. The respawn loop in
# /usr/local/share/desktop-init.sh restarts it within ~2 seconds.
pkill -x plank >/dev/null 2>&1 && log "Plank: bounced (supervisor will restart)"

# 2. Wait for the UDS doc site to be reachable (max 30s). It may not be up
# yet on a fresh VM if this script and the doc-site terminal start in
# parallel, so we poll briefly. We don't fail if it never comes up — Chrome
# will display a connection-refused page and the user can refresh.
for i in $(seq 1 30); do
  if curl -fs -o /dev/null --max-time 1 "${SITE_URL}"; then
    log "Doc site: reachable at ${SITE_URL}"
    break
  fi
  if [ "$i" -eq 30 ]; then
    log "Doc site: not reachable after 30s at ${SITE_URL} (continuing anyway)"
  fi
  sleep 1
done

# 3. Wait for the X server (Plank respawn supervisor uses the same display,
# so by the time we got here it's almost certainly up — but be defensive).
if command -v xdpyinfo >/dev/null 2>&1; then
  for i in $(seq 1 30); do
    if xdpyinfo >/dev/null 2>&1; then
      break
    fi
    if [ "$i" -eq 30 ]; then
      log "X server on ${DISPLAY_NUM}: not ready after 30s (skipping Chrome launch)"
      exit 0
    fi
    sleep 1
  done
fi

# 4. Launch Chrome only if it isn't already running on this display.
# We match by user-data-dir which is unique to this preview profile, and
# additionally constrain the comm to chrome so we don't false-positive on
# shells that happen to have this path in their command line.
chrome_running=false
for pid in $(pgrep -f "user-data-dir=${CHROME_PROFILE}" 2>/dev/null); do
  comm=$(cat "/proc/${pid}/comm" 2>/dev/null || true)
  if [ "${comm}" = "chrome" ]; then
    chrome_running=true
    break
  fi
done

if [ "${chrome_running}" = "true" ]; then
  log "Chrome: already running with preview profile, leaving it alone"
else
  if command -v google-chrome >/dev/null 2>&1; then
    log "Chrome: launching at ${SITE_URL}"
    nohup google-chrome \
      --no-sandbox \
      --no-first-run \
      --no-default-browser-check \
      --disable-features=Translate \
      --user-data-dir="${CHROME_PROFILE}" \
      --window-position=0,0 \
      --window-size="${WINDOW_W},${WINDOW_H}" \
      "${SITE_URL}" >/dev/null 2>&1 &
    disown || true
  else
    log "Chrome: google-chrome not installed (skipping)"
    exit 0
  fi
fi

# 5. Resize the window once it appears so it covers the full display
# regardless of any window-manager geometry quirks.
if command -v xdotool >/dev/null 2>&1; then
  for i in $(seq 1 20); do
    WIN=$(xdotool search --onlyvisible --name "Chrome" 2>/dev/null | head -1)
    if [ -n "${WIN}" ]; then
      xdotool windowsize "${WIN}" "${WINDOW_W}" "${WINDOW_H}" \
        windowmove "${WIN}" 0 0 \
        windowactivate "${WIN}" >/dev/null 2>&1
      log "Chrome: window ${WIN} sized to ${WINDOW_W}x${WINDOW_H} at 0,0"
      break
    fi
    sleep 0.5
  done
fi

log "Desktop preview ready."

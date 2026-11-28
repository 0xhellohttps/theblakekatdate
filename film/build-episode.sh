#!/bin/sh
# Paints the episode's layers: SVG -> PNG with headless Chrome.
cd "$(dirname "$0")" || exit 1
node layers-episode.js || exit 1
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
cd layers
while read -r name w h; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --window-size="$w,$h" --screenshot="$PWD/$name.png" "file://$PWD/$name.svg" >/dev/null 2>&1
done < render-list-episode.txt
ls ep-*.png | wc -l

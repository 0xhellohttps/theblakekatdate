#!/bin/sh
# Renders every exported SVG to a PNG beside it, using headless Chrome.
# Run after:  node tools/export-assets.js
cd "$(dirname "$0")/../assets" || exit 1
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
while read -r name w h; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --window-size="$w,$h" --screenshot="$PWD/$name.png" "file://$PWD/$name.svg" >/dev/null 2>&1
  echo "$name.png"
done < render-list.txt
# small previews for the keepsakes gallery
python3 - <<'PY'
from PIL import Image
import glob, os
os.makedirs('thumbs', exist_ok=True)
for f in glob.glob('characters/*.png'):
    im = Image.open(f); im.thumbnail((640, 640)); im.save('thumbs/' + os.path.basename(f), optimize=True)
PY

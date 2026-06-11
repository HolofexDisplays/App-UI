#!/bin/bash
# Assembles the final Holofex explainer:
#   [0-6]    official logo animation (1.5x to fit 6s)
#   [6-14]   comp scene: the holograms
#   [14-18.4] real display footage with caption
#   [18.4-69.4] comp scenes: device, casting, AI, download, upload, ease, end card
set -e

FF=${FF:-/tmp/node_modules/ffmpeg-static/ffmpeg}
DIR="$(cd "$(dirname "$0")" && pwd)"
FRAMES=${FRAMES_DIR:-/tmp/frames}
OUT=${OUT:-/tmp/holofex-explainer-v2.mp4}
TMP=/tmp/segs
FONT="$DIR/assets/Exo2.ttf"

mkdir -p "$TMP"
ENC="-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -an"

# A: intro — official wordmark animation, sped to fit 6s
$FF -y -i "$DIR/assets/footage/logo-animation.mp4" \
  -vf "setpts=PTS/1.5,fps=30,scale=1920:1080" -t 6 $ENC "$TMP/a.mp4"

# B: comp 6-14s (frames 180-419) — the holograms
$FF -y -framerate 30 -start_number 180 -i "$FRAMES/f%05d.jpg" -frames:v 240 $ENC "$TMP/b.mp4"

# C: real footage 4.3-8.7s with brand caption (pre-rendered PNG, alpha fades)
$FF -y -ss 4.3 -t 4.4 -i "$DIR/assets/footage/real-displays.mp4" \
  -loop 1 -t 4.4 -i "$DIR/assets/footage-caption.png" \
  -filter_complex "[0]fps=30[v];[1]format=rgba,fade=in:st=0:d=0.4:alpha=1,fade=out:st=3.9:d=0.5:alpha=1[cap];[v][cap]overlay" \
  $ENC "$TMP/c.mp4"

# D: comp 14-65s (frames 420-1949) — device through end card
$FF -y -framerate 30 -start_number 420 -i "$FRAMES/f%05d.jpg" -frames:v 1530 $ENC "$TMP/d.mp4"

# concat + ambient bed
printf "file '%s'\n" "$TMP/a.mp4" "$TMP/b.mp4" "$TMP/c.mp4" "$TMP/d.mp4" > "$TMP/list.txt"
$FF -y -f concat -safe 0 -i "$TMP/list.txt" -i /tmp/ambient.wav \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 160k -shortest -movflags +faststart "$OUT"

echo "wrote $OUT"

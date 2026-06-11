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

# C: real footage 4.3-8.7s with brand caption
$FF -y -ss 4.3 -t 4.4 -i "$DIR/assets/footage/real-displays.mp4" -vf "fps=30,\
drawbox=x=0:y=850:w=1920:h=230:color=black@0.45:t=fill,\
drawtext=fontfile=$FONT:text='REAL FOOTAGE — HOLOFEX DISPLAYS':fontcolor=0x00E0FF:fontsize=32:x=140:y=905:shadowcolor=black@0.7:shadowx=2:shadowy=2:alpha='if(lt(t\,0.4)\,t/0.4\,if(gt(t\,4.0)\,max(0\,(4.4-t)/0.4)\,1))',\
drawtext=fontfile=$FONT:text='Real holograms. No screens. Just light.':fontcolor=white:fontsize=58:x=140:y=955:shadowcolor=black@0.7:shadowx=2:shadowy=2:alpha='if(lt(t\,0.5)\,t/0.5\,if(gt(t\,4.0)\,max(0\,(4.4-t)/0.4)\,1))'" \
  $ENC "$TMP/c.mp4"

# D: comp 14-65s (frames 420-1949) — device through end card
$FF -y -framerate 30 -start_number 420 -i "$FRAMES/f%05d.jpg" -frames:v 1530 $ENC "$TMP/d.mp4"

# concat + ambient bed
printf "file '%s'\n" "$TMP/a.mp4" "$TMP/b.mp4" "$TMP/c.mp4" "$TMP/d.mp4" > "$TMP/list.txt"
$FF -y -f concat -safe 0 -i "$TMP/list.txt" -i /tmp/ambient.wav \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 160k -shortest -movflags +faststart "$OUT"

echo "wrote $OUT"

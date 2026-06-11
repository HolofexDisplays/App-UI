#!/bin/bash
# Assembles the Holofex web-launch explainer (~47.6s):
#   [0-4.5]     official logo animation (2x)
#   [4.5-10.5]  hook — kinetic type
#   [10.5-15.5] webapp nav: dashboard → create  (1.7x, browser frame)
#   [15.5-22.3] webapp nav: prompt → generate   (1.9x, browser frame)
#   [22.3-28.9] webapp nav: preview → cast      (1.67x, browser frame)
#   [28.9-32.6] real display footage
#   [32.6-47.6] features / web-first / end card
set -e

FF=${FF:-/tmp/node_modules/ffmpeg-static/ffmpeg}
DIR="$(cd "$(dirname "$0")" && pwd)"
FRAMES=${FRAMES_DIR:-/tmp/frames-web}
REC="$DIR/assets/footage/webapp-nav.webm"
OUT=${OUT:-/tmp/holofex-web-explainer.mp4}
TMP=/tmp/segs-web
mkdir -p "$TMP"
ENC="-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -an"

# nav footage inside the browser frame: PNG bg + sped-up screen recording
navseg () { # $1 out, $2 ss, $3 speed, $4 dur, $5 frame png
  $FF -y -ss "$2" -i "$REC" -loop 1 -i "$DIR/assets/$5" -filter_complex \
    "[0]setpts=PTS/$3,fps=30,scale=1572:884[v];[1][v]overlay=174:128:shortest=0" \
    -t "$4" $ENC "$1"
}

$FF -y -i "$DIR/assets/footage/logo-animation.mp4" \
  -vf "setpts=PTS/2,fps=30,scale=1920:1080" -t 4.5 $ENC "$TMP/a.mp4"

$FF -y -framerate 30 -i "$FRAMES/f%05d.jpg" -frames:v 180 $ENC "$TMP/b.mp4"

navseg "$TMP/c.mp4" 0    1.7    5.0 webframe-1.png
navseg "$TMP/d.mp4" 8.5  1.9118 6.8 webframe-2.png
navseg "$TMP/e.mp4" 21.5 1.6667 6.6 webframe-3.png

$FF -y -ss 4.3 -t 3.7 -i "$DIR/assets/footage/real-displays.mp4" \
  -loop 1 -t 3.7 -i "$DIR/assets/footage-caption.png" \
  -filter_complex "[0]fps=30[v];[1]format=rgba,fade=in:st=0:d=0.4:alpha=1,fade=out:st=3.2:d=0.5:alpha=1[cap];[v][cap]overlay" \
  $ENC "$TMP/f.mp4"

$FF -y -framerate 30 -start_number 180 -i "$FRAMES/f%05d.jpg" -frames:v 450 $ENC "$TMP/g.mp4"

printf "file '%s'\n" "$TMP"/{a,b,c,d,e,f,g}.mp4 > "$TMP/list.txt"
$FF -y -f concat -safe 0 -i "$TMP/list.txt" -i /tmp/ambient-web.wav \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 160k -shortest -movflags +faststart "$OUT"
echo "wrote $OUT"

"""Cuts the 85-second soundtrack for the film from the full song.

The song is 128 BPM in 4/4, so a bar is exactly 1.875 s, with bar 0 at 0.91 s.
Every cut below sits on a bar line, so the edit never leaves the beat grid:

    film 0.00 - 30.91   song   0.00 -  30.91   intro, groove, first verse      (bars 0-16)
    film 30.91 - 68.41  song 218.41 - 255.91   bridge build, breath, chorus    (bars 116-136)
    film 68.41 - 85.00  song 278.41 - 295.00   outro and the song's own ending (bars 148-)

Usage: python3 make-audio.py "/path/to/song.mp3"
"""
import subprocess, sys, os, tempfile
import numpy as np
from scipy.io import wavfile

src = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
tmp = tempfile.mkdtemp()
wav = os.path.join(tmp, 'full.wav')
subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16@48000', src, wav], check=True)
sr, y = wavfile.read(wav)
y = y.astype(np.float64)

SEGMENTS = [(0.0, 30.91), (218.41, 255.91), (278.41, 295.0)]
XF = int(0.030 * sr)          # 30 ms equal-power crossfade, tucked just before each downbeat
LEAD = int(0.012 * sr)        # ...so the downbeat's own attack plays untouched

out = None
for a, b in SEGMENTS:
    i0, i1 = int(round(a * sr)), min(int(round(b * sr)), len(y))
    if out is None:
        out = y[i0:i1].copy()
        continue
    # blend the tail of what we have with the audio that naturally precedes the incoming bar
    k = XF + LEAD
    pre = y[i0 - k:i0 - LEAD]
    t = np.linspace(0, np.pi / 2, XF)[:, None]
    seam = out[-k:-LEAD] * np.cos(t) + pre * np.sin(t)
    out = np.concatenate([out[:-k], seam, y[i0 - LEAD:i1]])

total = int(round(85.0 * sr))
out = out[:total] if len(out) >= total else np.concatenate([out, np.zeros((total - len(out), out.shape[1]))])
fade = int(0.6 * sr)
out[-fade:] *= np.linspace(1, 0, fade)[:, None]
cut = os.path.join(tmp, 'cut.wav')
wavfile.write(cut, sr, np.clip(out, -32768, 32767).astype(np.int16))
dst = os.path.join(here, 'audio', 'soundtrack-85s.m4a')
subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '256000', '-q', '127', cut, dst], check=True)
subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16@22050', '-c', '1', cut, os.path.join(tmp, 'check.wav')], check=True)
print(dst, round(len(out) / sr, 3), 's', '| check wav:', os.path.join(tmp, 'check.wav'))

"""Episode One — "The Point-Two": voices, music, sound effects and the timeline.

Speaks every line with the Mac's built-in voices, lays the scenes out to exactly
five minutes, mixes a small original score underneath, and writes:

    episode.m4a    the finished soundtrack
    episode.json   when each scene and line happens, plus a per-frame "mouth open"
                   level for each character, which the picture is animated to

Run:  python3 make-episode-audio.py
"""
import json, os, subprocess, tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
SR, FPS, TOTAL = 48000, 24, 390.0
TMP = tempfile.mkdtemp()

# who: (voices in order of preference, words per minute, pitch factor).
# The first one installed on this Mac is used. The "Premium"/"Enhanced" voices sound far more
# natural; download them in System Settings > Accessibility > Spoken Content > System Voice >
# Manage Voices, then run this script again.
import re
INSTALLED = {re.match(r'^(.*?)\s+[a-z]{2}_[A-Z]{2}', l).group(1).strip() for l in subprocess.run(['say', '-v', '?'], capture_output=True, text=True).stdout.splitlines() if re.match(r'^(.*?)\s+[a-z]{2}_[A-Z]{2}', l)}
WANT = {   # (voice, words per minute, pitch factor), best first
    # Chicken Nugget: small, quick and high, with a yip now and then
    'N': [('Zoe (Premium)', 165, 1.25), ('Karen (Premium)', 160, 1.28), ('Karen', 150, 1.32)],
    # Blake: American. This Mac's only built-in American male voices are the old robotic ones, so the
    # fallback is the natural American voice lowered into a man's register.
    'B': [('Evan (Enhanced)', 178, 1.0), ('Nathan (Enhanced)', 178, 1.0), ('Tom (Enhanced)', 178, 1.0), ('Samantha', 218, 0.80)],
    # Kat: European-accented English. Apple ships no Latvian voice; the nearest installed is an
    # Eastern-European voice reading the English lines.
    # voices on the other end of a phone call
    'F': [('Tessa', 178, 1.0)], 'C': [('Daniel', 182, 1.0)], 'S': [('Moira', 176, 1.0)],
    'K': [('Milena (Enhanced)', 168, 1.0), ('Milena', 168, 1.0), ('Samantha', 174, 1.0)],
}
CAST = {w: next((c for c in cs if c[0] in INSTALLED), cs[-1]) for w, cs in WANT.items()}
print('voices:', {w: c[0] for w, c in CAST.items()})
NAMES = {'N': 'Chicken Nugget', 'B': 'Blake', 'K': 'Kat', 'F': "Kat's friend, on the phone", 'C': "Blake's cousin, on the phone", 'S': 'On the phone'}
PHONE = {'F', 'C', 'S'}

# (who, line, pause after in seconds, optional tag)
SCRIPT = [
    ('intro', 15.0, [
        ('N', "Chicken Nugget here. Today: an athletic event of historic proportions.", 1.0),
    ]),
    ('warmup', 1.2, [
        ('N', "It is seven A M. Conditions are perfect. The distance: zero point two miles.", 0.8),
        ('B', "Okay. Big day. Did you stretch?", 0.4),
        ('K', "I stretched yesterday. It should still count.", 0.6),
        ('B', "Point two miles is no joke, Kat.", 0.4),
        ('K', "It is a little bit of a joke.", 0.6),
        ('B', "That's nearly a third of a kilometre.", 0.5),
        ('K', "Did you just convert it, to make it sound longer?", 0.7),
        ('B', "Yes.", 0.8),
        ('N', "For the record, I run this distance every time someone opens the fridge.", 0.8),
        ('K', "Why are you wearing a headband?", 0.4),
        ('B', "For the sweat.", 0.5),
        ('K', "There will be no sweat.", 0.4),
        ('B', "There might be sweat.", 0.9),
    ]),
    ('start', 0.8, [
        ('N', "Runners, take your marks. I will be supervising, from a position of authority.", 0.7),
        ('B', "On three. One, two,", 0.2),
        ('K', "Wait. Is it on three, or after three?", 0.5),
        ('B', "On three.", 0.4),
        ('K', "So we go when you say three.", 0.4),
        ('B', "Yes.", 0.4),
        ('K', "Okay. You're very serious right now, and I respect it.", 0.7),
        ('N', "Three!", 1.3, 'go'),
    ]),
    ('run', 0.6, [
        ('N', "And they're off! A blistering pace. I am walking.", 0.8),
        ('B', "Breathe in through the nose. Out through the mouth.", 0.4),
        ('K', "I'm breathing in through everything.", 1.2),
        ('N', "Zero point zero five miles. One quarter of the way. Emotions are high.", 0.7, 'm1'),
        ('K', "How far have we gone?", 0.3),
        ('B', "Point oh five.", 0.4),
        ('K', "That's it? I have lived a whole life since the start.", 0.6),
        ('B', "You're doing great. Look at your form.", 0.4),
        ('K', "I'm running in a coat, Blake.", 0.4),
        ('B', "And you look incredible.", 0.4),
        ('K', "I know.", 1.2),
        ('N', "We are now passing the nice houses. Please keep your paws inside the route.", 0.7, 'h0'),
        ('K', "Okay, wait. Look at that one. The arches. The balcony. The flowers.", 0.5),
        ('B', "That one is unreal.", 0.5),
        ('K', "And that one, with the columns, and the little fountain. Who lives like this?", 0.5),
        ('B', "People with very good taste. You would like Georgia. Big porches. Bigger trees.", 0.5),
        ('K', "Georgia.", 0.5),
        ('B', "I'm just saying. You could come see it. Maybe.", 0.6),
        ('K', "Maybe. I would need to see the porches first.", 0.7),
        ('N', "For the record, they are just friends. I have noted that she is smiling at a hedge.", 1.2),
        ('N', "Halfway. Traditionally, this is where champions are made, and snacks are discussed.", 0.7, 'm2'),
        ('K', "I was promised ice cream.", 0.4),
        ('B', "Ice cream, and warm cookies. At the finish.", 0.4),
        ('K', "Warm? How warm?", 0.3),
        ('B', "Fresh out of the oven warm.", 0.5),
        ('K', "Why didn't you lead with that?", 0.6),
        ('N', "Observe. Her pace has doubled.", 1.4),
        ('B', "Okay. This is the wall. Everyone hits the wall.", 0.4, 'm3'),
        ('K', "There's no wall. It's a hedge.", 0.4),
        ('B', "It's a metaphor.", 0.4),
        ('K', "It's a hedge, Blake.", 0.8),
        ('N', "Zero point one five. I have stopped to smell a flower. I remain in the lead.", 0.6),
        ('B', "How is the dog winning?", 0.4),
        ('K', "Chicken Nugget has never doubted anything. Ever.", 1.0),
        ('B', "I can see the finish line!", 0.3),
        ('K', "Race you.", 0.3),
        ('B', "We're already racing.", 0.3),
        ('K', "Race you faster.", 0.8),
        ('N', "And here they come. Shoulder to shoulder. A photo finish,", 0.5),
        ('N', "won, comfortably, by me.", 1.4, 'finish'),
    ]),
    ('finish', 0.8, [
        ('B', "We did it. Point two miles.", 0.5),
        ('K', "I would like it noted that I never stopped.", 0.4),
        ('B', "Noted. You were amazing.", 0.5),
        ('K', "You were very encouraging. Slightly too encouraging.", 0.8),
        ('N', "Official time: irrelevant. Official verdict: adorable. Proceed to refreshments.", 1.2),
    ]),
    ('treats', 1.6, [
        ('N', "The post-race recovery meal. Ice cream. Warm cookies. And, for the champion, a pup cup.", 0.9),
        ('K', "Okay. This was worth point two miles.", 0.4),
        ('B', "Only point two?", 0.4),
        ('K', "Fine. Point two five.", 0.9),
        ('B', "You've got a little ice cream, right there.", 0.4),
        ('K', "Where?", 0.4),
        ('B', "No, other side. I'll, there.", 0.6),
        ('K', "Smooth.", 0.4),
        ('B', "I've been training.", 1.0),
        ('K', "The cookie is still warm.", 0.4),
        ('B', "I told you. Fresh out of the oven.", 0.6),
        ('K', "You planned this whole thing around dessert, didn't you?", 0.5),
        ('B', "I planned it around you. The dessert was the bribe.", 1.0),
        ('K', "That was good. Did you rehearse that?", 0.4),
        ('B', "On the run. Around the wall.", 0.4),
        ('K', "The hedge.", 0.3),
        ('B', "The hedge.", 1.0),
        ('N', "They are sharing a spoon. I am pretending not to notice. I notice everything.", 0.9),
        ('K', "Also. What is the surprise?", 0.4),
        ('B', "I can't tell you. That is how surprises work.", 0.4),
        ('K', "One hint.", 0.3),
        ('B', "No.", 0.9),
        ('K', "Same time next week?", 0.4),
        ('B', "Point three miles?", 0.4),
        ('K', "Let's not get carried away.", 1.0),
        ('N', "And that is how two people ran not very far at all, and ended up exactly where they wanted to be.", 1.4),
    ]),
    ('driveK', 1.6, [
        ('N', "Later. The drive home. Yes, the G Wagon's back window is broken. We do not talk about the back window.", 0.9),
        ('F', "Okay, tell me everything. How was the run?", 0.4),
        ('K', "It was zero point two miles. And then ice cream, and warm cookies. He planned the whole thing.", 0.5),
        ('F', "Hold on. Is this the guy from TikTok?", 0.7),
        ('K', "Maybe.", 0.9),
        ('K', "Yes.", 0.5),
        ('F', "The meme guy! I knew it!", 0.5),
        ('K', "Stop. We are just friends.", 0.4),
        ('F', "Mm hmm.", 0.7),
        ('K', "Okay, fine. I like him. I really like him.", 0.9),
        ('N', "I heard that. I hear everything. Also, there is a draft back here.", 1.2),
    ]),
    ('driveB', 1.6, [
        ('B', "So we ran point two miles, and then I got her ice cream and warm cookies.", 0.4),
        ('C', "Point two? That's a parking lot, man. Wait. Are you calling me from the new Mercedes?", 0.5),
        ('B', "Maybe. It still smells new.", 0.5),
        ('B', "It was a race cookie date. It's a thing now.", 0.5),
        ('C', "So what is this? Are you two together?", 0.5),
        ('B', "We're just having fun right now. Seeing what may happen in the future.", 0.5),
        ('C', "But you like her.", 0.6),
        ('B', "Yeah. I like her. A lot.", 1.0),
        ('B', "Hang on. I have to make one more call.", 1.0),
        ('B', "Hey, it's Blake. Just checking in on the surprise. Is everything on track?", 0.4, 'call2'),
        ('S', "All set. She is going to love it.", 0.5),
        ('B', "Perfect. And not a word. She keeps asking.", 0.4),
        ('S', "My lips are sealed.", 1.2),
    ]),
    ('night', 2.0, [
        ('N', "Night. Two houses. Two phones. One very obvious idea.", 1.2),
        ('K', "Do you want to talk on the phone?", 0.5),
        ('B', "Do you want to talk on the phone?", 1.0),
        ('N', "They sent it at the same time. Of course they did.", 1.4),
    ]),
    ('outro', 2.5, [
        ('N', "This has been Chicken Nugget. Good night, and good cookies.", 1.0),
    ]),
]

def speak(who, text, idx):
    voice, rate, pitch = CAST[who]
    aiff, wav = os.path.join(TMP, f'{idx}.aiff'), os.path.join(TMP, f'{idx}.wav')
    j = np.random.default_rng(1000 + idx)              # nobody says every line at the same speed and pitch
    rate = int(rate * (0.94 + 0.12 * j.random())); pitch = pitch * (0.985 + 0.03 * j.random())
    subprocess.run(['say', '-v', voice, '-r', str(rate), '-o', aiff, text], check=True)
    subprocess.run(['afconvert', '-f', 'WAVE', '-d', f'LEI16@{SR}', '-c', '1', aiff, wav], check=True)
    y = wavfile.read(wav)[1].astype(np.float64) / 32768
    if abs(pitch - 1.0) > 1e-6:            # play back slightly faster or slower
        n = int(len(y) / pitch)
        y = np.interp(np.linspace(0, len(y) - 1, n), np.arange(len(y)), y)
    nz = np.where(np.abs(y) > 0.01)[0]
    y = y[max(nz[0] - 400, 0): nz[-1] + 2400] if len(nz) else y
    return y / (np.abs(y).max() + 1e-9) * 0.8

# ---------- lay the scenes out, then stretch the pauses so the whole runs exactly five minutes ----------
clips, idx = [], 0
for scene, lead, lines in SCRIPT:
    for ln in lines:
        c = speak(ln[0], ln[1], idx); idx += 1
        if ln[0] in PHONE:                 # the other end of the line: thin and a little crunchy
            bb, aa = butter(2, [380 / (SR / 2), 2900 / (SR / 2)], btype='band'); c = np.tanh(lfilter(bb, aa, c) * 3.2) * 0.62
        clips.append(c)
speech = sum(len(c) for c in clips) / SR
OUTRO_TAIL = 14.0
pauses = sum(lead for _, lead, _ in SCRIPT) + sum(ln[2] for _, _, lines in SCRIPT for ln in lines) - 15.0
k = (TOTAL - OUTRO_TAIL - 15.0 - speech) / pauses          # the intro's 15 s lead is fixed; everything else flexes
assert k > 0.45, f'script too long: speech {speech:.1f}s'
t, i, scenes, lines_out, marks = 0.0, 0, [], [], {}
for scene, lead, lines in SCRIPT:
    scenes.append({'id': scene, 'start': round(t, 3)})
    t += lead if scene == 'intro' else lead * k
    for ln in lines:
        d = len(clips[i]) / SR
        lines_out.append({'who': ln[0], 'name': NAMES[ln[0]], 'text': ln[1].replace(' A M', ' a.m.').replace('G Wagon', 'G-Wagon'), 'start': round(t, 3), 'end': round(t + d, 3), 'scene': scene})
        if len(ln) > 3: marks[ln[3]] = round(t, 3)
        t += d + ln[2] * k
        i += 1
for a, b in zip(scenes, scenes[1:] + [{'start': TOTAL}]): a['end'] = b['start']

N = int(TOTAL * SR)
voice = np.zeros(N)
mouth = {w: np.zeros(int(TOTAL * FPS) + 1) for w in CAST}
for clip, ln in zip(clips, lines_out):
    a = int(ln['start'] * SR)
    voice[a:a + len(clip)] += clip[:N - a]
    hop = SR // FPS
    for f in range(len(clip) // hop):
        e = np.sqrt(np.mean(clip[f * hop:(f + 1) * hop] ** 2))
        mouth[ln['who']][int(ln['start'] * FPS) + f] = min(1.0, e / 0.16)

# ---------- Chicken Nugget is a little dog: a quick "arf-arf" before some of her lines ----------
def yip(base):
    tt = np.arange(int(0.11 * SR)) / SR
    f = base * (1 + 0.55 * np.sin(np.pi * tt / 0.11))                    # a quick rise and fall
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph) + 0.25 * np.random.default_rng(int(base)).standard_normal(len(tt))
    return 0.34 * y * np.sin(np.pi * tt / 0.11) ** 0.6
ni = 0
for ln in lines_out:
    if ln['who'] != 'N': continue
    if ni % 3 == 0 and ln['start'] > 16:
        for j, base in enumerate((760, 900)):
            a = int((ln['start'] - 0.42 + j * 0.15) * SR); y = yip(base); voice[a:a + len(y)] += y
            mouth['N'][int((ln['start'] - 0.42 + j * 0.15) * FPS): int((ln['start'] - 0.42 + j * 0.15) * FPS) + 3] = 0.9
    ni += 1

# ---------- a small original score: plucked strings, 104 BPM ----------
BPM = 104.0; BEAT = 60 / BPM
def pluck(freq, dur, amp=1.0, bright=0.35):
    n = int(dur * SR); tt = np.arange(n) / SR
    env = np.exp(-tt * (3.2 if dur < 1.2 else 1.6)) * np.minimum(1, tt / 0.004)
    return amp * env * (np.sin(2 * np.pi * freq * tt) + bright * np.sin(4 * np.pi * freq * tt) + 0.12 * np.sin(6 * np.pi * freq * tt))
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
CHORDS = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]]      # C  Am  F  G
music = np.zeros(N)
def add(buf, y, at):
    a = int(at * SR)
    if 0 <= a < N: buf[a:a + len(y)] += y[:N - a]
def scene_of(time):
    return next(s['id'] for s in scenes if s['start'] <= time < s['end'])
rng = np.random.default_rng(7)


# ---------- sound effects ----------
fx = np.zeros(N)
def tone(freq, dur, amp, decay=6.0, vib=0.0):
    tt = np.arange(int(dur * SR)) / SR
    return amp * np.exp(-tt * decay) * np.sin(2 * np.pi * freq * tt + vib * np.sin(2 * np.pi * 28 * tt))
go, fin = marks['go'], marks['finish']
whistle_at = lines_out[[l['start'] for l in lines_out].index(go)]['end'] + 0.1
add(fx, tone(2850, 0.55, 0.22, 1.5, 2.5), whistle_at)
run_start = whistle_at + 0.5
step_t, s = run_start, 0
while step_t < fin + 1.0:                                  # footsteps: left, right
    n = int(0.07 * SR); thud = rng.standard_normal(n) * np.exp(-np.arange(n) / (0.014 * SR))
    bb, aa = butter(2, 420 / (SR / 2)); add(fx, lfilter(bb, aa, thud) * (0.5 if s % 2 else 0.4), step_t)
    step_t += 0.31; s += 1
for key in ('m1', 'm2', 'm3'):
    add(fx, tone(1568, 0.7, 0.12, 5), marks[key] - 0.35); add(fx, tone(2093, 0.9, 0.1, 4), marks[key] - 0.2)
fin_end = lines_out[[l['start'] for l in lines_out].index(fin)]['end']
for j, m in enumerate([72, 76, 79, 84, 88]): add(fx, pluck(hz(m), 1.4, 0.22, 0.5), fin_end + 0.1 + j * 0.11)
n = int(2.6 * SR); cheer = rng.standard_normal(n) * np.minimum(1, np.arange(n) / (0.3 * SR)) * np.exp(-np.arange(n) / (0.9 * SR))
bb, aa = butter(2, [900 / (SR / 2), 3500 / (SR / 2)], btype='band'); add(fx, lfilter(bb, aa, cheer) * 0.16, fin_end + 0.1)
treats = next(s for s in scenes if s['id'] == 'treats')
for tt_ in np.arange(treats['start'] + 3, treats['end'] - 2, 5.3):         # a spoon on glass, now and then
    add(fx, tone(3136 + 300 * rng.random(), 0.5, 0.05, 9), tt_ + rng.random())

# ---------- the theme song: fifteen seconds at 120 BPM, with the cast shouting their own names ----------
TB = 0.5                                   # one beat
theme = np.zeros(N)
def kick():
    tt = np.arange(int(0.25 * SR)) / SR
    return 0.9 * np.exp(-tt * 13) * np.sin(2 * np.pi * np.cumsum(110 * np.exp(-tt * 20) + 46) / SR)
def noise_hit(lo, hi, dur, decay, amp):
    n = int(dur * SR); y = rng.standard_normal(n) * np.exp(-np.arange(n) / (decay * SR))
    bb, aa = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype='band'); return lfilter(bb, aa, y) * amp
def lead(m, dur, amp=0.3):                 # a whistled melody
    tt = np.arange(int(dur * SR)) / SR; f0 = hz(m)
    env = np.minimum(1, tt / 0.02) * np.exp(-tt * 1.4) * np.minimum(1, (dur - tt) / 0.04)
    ph = 2 * np.pi * f0 * tt + 0.9 * np.sin(2 * np.pi * 6 * tt) * np.minimum(1, tt / 0.15)
    return amp * env * (np.sin(ph) + 0.18 * np.sin(2 * ph))
for j, m in enumerate([60, 64, 67, 72, 76, 79, 84]):                     # pick-up: a run up the scale
    add(theme, pluck(hz(m), 0.9, 0.34, 0.5), j * 0.25)
add(theme, noise_hit(900, 4200, 0.12, 0.03, 0.9), 1.5); add(theme, noise_hit(900, 4200, 0.12, 0.03, 0.9), 1.75)
BARS = [   # start, chords (root triad per half bar), melody as (beat, midi note)
    (2.0,  [[48, 64, 67, 72]] * 2, [(2, 76), (2.5, 79), (3, 84), (3.5, 79)]),
    (4.0,  [[53, 65, 69, 72]] * 2, [(2, 77), (2.5, 81), (3, 84), (3.5, 81)]),
    (6.0,  [[55, 67, 71, 74]] * 2, [(2.5, 83), (3, 86), (3.5, 88)]),
    (8.0,  [[48, 64, 67, 72]] * 2, [(0, 88), (0.5, 86), (1, 84), (1.5, 79), (2, 81), (2.5, 84), (3, 86), (3.5, 84)]),
    (10.0, [[57, 64, 69, 72]] * 2, [(0, 84), (0.5, 81), (1, 76), (1.5, 81), (2, 84), (3, 83), (3.5, 81)]),
    (12.0, [[53, 65, 69, 72], [55, 67, 71, 74]], [(1.5, 81), (2, 86), (2.5, 83), (3, 79), (3.5, 83)]),
]
for start, chords, mel in BARS:
    for half, ch in enumerate(chords):
        h0 = start + half * 2 * TB
        add(theme, kick(), h0); add(theme, kick(), h0 + 0.75 * TB if half else h0 + 1.5 * TB)
        add(theme, noise_hit(900, 4200, 0.12, 0.03, 0.8), h0 + TB)
        for e in range(4): add(theme, noise_hit(6000, 11000, 0.04, 0.01, 0.25), h0 + e * TB / 2)
        add(theme, pluck(hz(ch[0] - 12), 0.7, 0.55, 0.2), h0); add(theme, pluck(hz(ch[0] - 12), 0.5, 0.45, 0.2), h0 + 1.5 * TB)
        for off in (0.5, 1.5):
            for m in ch[1:]: add(theme, pluck(hz(m), 0.5, 0.15, 0.4), h0 + off * TB)
    for beat, m in mel: add(theme, lead(m, 0.42 if beat % 1 == 0.5 else 0.5), start + beat * TB)
add(theme, kick(), 14.0); add(theme, noise_hit(900, 4200, 0.2, 0.05, 0.9), 14.0); add(theme, lead(84, 1.8, 0.34), 14.0)
for m in (48, 60, 64, 67, 72): add(theme, pluck(hz(m), 2.4, 0.3, 0.4), 14.0)
CHANTS = [('B', 'Blake!', 2.0), ('K', 'And Kat!', 4.0), ('N', 'And Chicken Nugget!', 6.0), ('N', 'The Point Two!', 12.0)]
for j, (who, text, at_) in enumerate(CHANTS):
    c = speak(who, text, 900 + j); a = int(at_ * SR); voice[a:a + len(c)] += c * 1.05

# ---------- the score: a heist-caper lounge groove — swung hats, rim clicks, walking bass, electric piano, vibes ----------
SW = 2 / 3                                 # swing: the off-beat lands late
PROG = [(50, 'm'), (50, 'm'), (55, '7'), (55, '7'), (50, 'm'), (50, 'm'), (46, '7'), (45, '7')]     # Dm7 Dm7 G7 G7 Dm7 Dm7 Bb7 A7
def _t(dur): return np.arange(int(dur * SR)) / SR
def bass(m, dur, amp):
    tt = _t(dur); f0 = hz(m); return amp * np.exp(-tt * 4.5) * np.minimum(1, tt / 0.005) * (np.sin(2 * np.pi * f0 * tt) + 0.6 * np.sin(4 * np.pi * f0 * tt) + 0.25 * np.sin(6 * np.pi * f0 * tt))
def rhodes(m, dur, amp):
    tt = _t(dur); f0 = hz(m); bell = 2.2 * np.exp(-tt * 9) * np.sin(2 * np.pi * f0 * tt)
    return amp * np.exp(-tt * 2.6) * np.minimum(1, tt / 0.006) * (1 + 0.22 * np.sin(2 * np.pi * 5.2 * tt)) * np.sin(2 * np.pi * f0 * tt + bell)
def vibes(m, dur, amp):
    tt = _t(dur); f0 = hz(m); return amp * np.exp(-tt * 2.0) * (1 + 0.3 * np.sin(2 * np.pi * 5.5 * tt)) * (np.sin(2 * np.pi * f0 * tt) + 0.35 * np.exp(-tt * 10) * np.sin(8 * np.pi * f0 * tt))
def brass(m, dur, amp):
    tt = _t(dur); f0 = hz(m); y = sum(np.sin(2 * np.pi * f0 * k * tt) / k for k in range(1, 8))
    return amp * np.minimum(1, tt / 0.025) * np.minimum(1, (dur - tt) / 0.05) * y
LEVEL = {'intro': 1, 'warmup': 1, 'start': 1, 'run': 3, 'finish': 2, 'treats': 1, 'driveK': 2, 'driveB': 2, 'night': 1, 'outro': 2}
LICKS = [[74, 77, 79, 80, 79, 77, 74], [81, 77, 79, 74], [74, 72, 69, 72, 74], [77, 79, 80, 79, 74]]
bar_t, bar, last_scene = 15.0, 0, None
while bar_t < TOTAL - 2.5:
    sc = scene_of(bar_t); lvl = LEVEL[sc]; R, q = PROG[bar % 8]
    third, seventh, ninth = R + (3 if q == 'm' else 4), R + 10, R + 14
    B = lambda beats: bar_t + beats * BEAT
    for beats, off, amp in [(0, 0, .5), (SW, 0, .28), (1 + SW, 7, .38), (2, 10, .42), (3, 12, .42), (3 + SW, 10 if bar % 2 else 11, .32)]:
        add(music, bass(R - 12 + off, 0.42, amp), B(beats))
    for beat in range(4):
        add(music, noise_hit(6000, 11000, 0.05, 0.012, 0.16), B(beat)); add(music, noise_hit(6000, 11000, 0.04, 0.008, 0.1), B(beat + SW))
        if beat % 2: add(music, noise_hit(1500, 3400, 0.05, 0.008, 0.55), B(beat))                 # rim click on two and four
    if lvl >= 2:
        add(music, kick() * 0.6, B(0)); add(music, kick() * 0.45, B(2 + SW))
        for beats, fq in [(SW, 330), (1, 420), (2 + SW, 330), (3 + SW, 420)]: add(music, tone(fq, 0.16, 0.2, 24), B(beats))    # bongos
    for beats in (1 + SW, 3):
        for m in (third + 12, seventh + 12, ninth + 12): add(music, rhodes(m, 0.9, 0.1 if lvl < 3 else 0.14), B(beats))
    if bar % 4 == 2 or (sc == 'treats' and bar % 4 == 0):
        for j, m in enumerate(LICKS[(bar // 2) % 4]): add(music, vibes(m, 1.1, 0.17), B(j // 2 + (SW if j % 2 else 0)))
    if sc != last_scene or (lvl == 3 and bar % 8 == 0):                                              # brass: bap-bap
        for beats in (0, SW):
            for m in (R + 12, third + 12, seventh + 12): add(music, brass(m, 0.2, 0.07), B(beats))
    last_scene = sc; bar_t += BEAT * 4; bar += 1
bb, aa = butter(2, 5200 / (SR / 2)); music = lfilter(bb, aa, music) * 1.5

# a little room around the voices, so they sit in a space rather than a booth
ir = np.random.default_rng(3).standard_normal(int(0.22 * SR)) * np.exp(-np.arange(int(0.22 * SR)) / (0.05 * SR)); ir[:int(0.012 * SR)] = 0
from scipy.signal import fftconvolve
voice = voice + 0.07 * fftconvolve(voice, ir / np.sqrt((ir ** 2).sum()), mode='full')[:N]

# ---------- mix: the music ducks under whoever is talking ----------
hop = 480; env = np.sqrt(np.convolve(voice ** 2, np.ones(hop * 20) / (hop * 20), mode='same'))
duck = 1.0 - 0.62 * np.clip(env / 0.05, 0, 1)
duck = np.convolve(duck, np.ones(SR // 5) / (SR // 5), mode='same')
music *= 0.36 * duck
fadein, fadeout = int(0.03 * SR), int(3.5 * SR)
mix = voice * 0.95 + music + fx + theme * 0.5
mix[:fadein] *= np.linspace(0, 1, fadein); mix[-fadeout:] *= np.linspace(1, 0, fadeout)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
stereo = np.stack([mix, mix], axis=1)
wav = os.path.join(TMP, 'episode.wav')
wavfile.write(wav, SR, (np.clip(stereo, -1, 1) * 32000).astype(np.int16))
subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, os.path.join(HERE, 'episode.m4a')], check=True)

json.dump({'duration': TOTAL, 'fps': FPS, 'bpm': BPM, 'scenes': scenes, 'lines': lines_out, 'marks': marks,
           'whistle': round(whistle_at, 3), 'runStart': round(run_start, 3), 'finishEnd': round(fin_end, 3),
           'mouth': {w: [round(float(v), 2) for v in m] for w, m in mouth.items()}},
          open(os.path.join(HERE, 'episode.json'), 'w'))
print(f'speech {speech:.1f}s over {len(lines_out)} lines; pauses scaled x{k:.2f}')
for s_ in scenes: print(f"  {s_['id']:8s} {s_['start']:7.2f} - {s_['end']:7.2f}")
print('marks', marks)

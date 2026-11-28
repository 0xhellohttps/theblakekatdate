"""Episode Two — "Starting to Talk": voices, music, sound effects and the timeline.

Speaks every line with the Mac's built-in voices, lays the scenes out (under ten
minutes), mixes a small original score underneath, and writes:

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
CAST['BT'], CAST['KT'] = CAST['B'], CAST['K']          # the same two people, thinking instead of talking
NAMES = {'BT': 'Blake, thinking', 'KT': 'Kat, thinking', 'N': 'Chicken Nugget', 'B': 'Blake', 'K': 'Kat', 'F': "Kat's friend, on the phone", 'C': "Blake's cousin, on the phone", 'S': 'On the phone'}
PHONE = {'F', 'C', 'S'}

# (who, line, pause after in seconds, optional tag)
# (who, line, pause after, optional camera view). Views: la, atl (the two cities, with a pan between them),
# B (the studio), K (Kat's place), N (Chicken Nugget), split, clock, journey, doors, house, bedB, bedK.
SCRIPT = [
    ('intro', 15.0, [
        ('N', "Chicken Nugget here. Tonight: one phone call. It was supposed to be a short one.", 1.0),
    ]),
    ('ring', 1.2, [
        ('N', "Los Angeles. Sunny, even when it has no business being sunny. And high up in a tall building, across the street from the country club, a phone was about to ring.", 0.9, 'la'),
        ('N', "Atlanta. Big trees. Golf courses in every direction. And one music studio, with the lights still on.", 0.9, 'atl'),
        ('N', "At nine o'clock, it rang. I know, because it interrupted my nap.", 1.6, 'la'),
    ]),
    ('call', 0.4, [
        ('K', "Hello?", 0.5),
        ('B', "Hey. It's me. Is this a good time?", 0.4),
        ('K', "It is a perfect time. I just sat down to eat.", 0.4),
        ('B', "Same here. How was your day?", 0.5, 'split'),
        ('K', "Long. And the Swiss Demon is not talking to me right now.", 0.7),
        ('B', "The Swiss, Demon.", 0.5),
        ('K', "That is what I call him. It is accurate.", 0.6),
        ('BT', "Okay. There is a him. Stay calm. Ask like a normal person.", 0.7),
        ('B', "Can I ask what the situation is there? You don't have to tell me. I would just rather know than guess.", 0.7, 'split'),
        ('N', "She explained. It took a while. I will summarize. It is complicated, it is nearly finished, and the silence is not a loss.", 0.8),
        ('K', "So that is the whole story. You are not stepping on anything.", 0.4),
        ('B', "Okay. Thank you for telling me straight.", 0.9),
        ('B', "One more thing. And I might be overthinking it.", 0.4),
        ('K', "You? Never.", 0.5),
        ('B', "At the cookies, I noticed you have two phones. In my head, that is a red flag.", 0.6, 'split'),
        ('K', "One phone is for work. One is for my life. You are calling the second one.", 0.6),
        ('B', "Oh.", 0.6),
        ('K', "You are a major overthinker, Blake.", 0.4, 'split'),
        ('B', "I have been told.", 0.6, 'split'),
        ('N', "For the record, I have zero phones, and I am doing great.", 1.0),
        ('K', "Wait. What are you eating?", 0.4),
        ('B', "Chicken and rice. Why?", 0.4),
        ('K', "I am eating chicken and rice. Right now. Out of a bowl.", 0.4, 'split'),
        ('B', "No you're not.", 0.3, 'split'),
        ('K', "I will send you a photo.", 0.6, 'split'),
        ('N', "I would like it noted that I am also very interested in the chicken.", 1.2),
        ('N', "One hour in. Nobody has looked at a clock. I have. I am the clock.", 1.2, 'clock'),
        ('K', "Can I tell you something? It is not a small thing.", 0.5),
        ('B', "You can tell me anything.", 0.6),
        ('K', "Coming to America was not easy. It was not like the movies. There are parts of it I do not tell people.", 0.7),
        ('KT', "If I say this out loud, he is going to look at me differently.", 0.9),
        ('N', "And then she told him. All of it. From Latvia, to here. That part is hers to tell, so I covered my ears. Mostly.", 0.9, 'journey'),
        ('N', "What I can report is this. He did not interrupt. Not once.", 1.2, 'journey'),
        ('K', "So. That is me. You can say something now.", 0.8),
        ('B', "Thank you for trusting me with that.", 0.7),
        ('B', "I am not judging any of it. Not one piece. You got yourself here. That takes more than most people have.", 0.7),
        ('K', "You do not think it is too much?", 0.6),
        ('B', "I think it is the most honest thing anyone has said to me in a long time. You never have to edit yourself with me.", 1.0, 'split'),
        ('N', "Psst. Kat. Just be yourself. He is clearly fine with it.", 0.6),
        ('B', "Hold on. Who was that?", 0.4),
        ('K', "That is Chicken Nugget. She gives advice.", 0.5),
        ('B', "Well, I agree with Chicken Nugget. Just be yourself.", 0.6, 'split'),
        ('N', "Finally. Someone who listens to me.", 0.9),
        ('BT', "She is just, honest. No games. That is the most attractive thing in the world.", 1.1),
        ('B', "Can I say something a little forward?", 0.4),
        ('K', "Please.", 0.4),
        ('B', "The next person I date, I am dating to marry. I am done doing this for practice.", 0.7, 'split'),
        ('K', "Same. I am not interested in practice anymore.", 0.7, 'split'),
        ('N', "Nobody panic. They are speaking generally. Allegedly.", 1.1),
        ('B', "Since we are being honest. I was married before.", 0.5),
        ('K', "Okay. Tell me.", 0.5),
        ('B', "It ended in divorce. But I do not regret it. It was a great experience. I learned how to really show up for somebody.", 0.7),
        ('K', "I like that you do not talk badly about it.", 0.5),
        ('B', "There is nothing bad to say. It just had an ending.", 1.1),
        ('N', "Two hours in. Nobody has yawned. I have yawned eleven times.", 1.2, 'clock'),
        ('B', "There is more. I grew up a Jehovah's Witness.", 0.5),
        ('K', "Really? I have so many questions.", 0.4),
        ('B', "Go ahead.", 0.4),
        ('K', "Did you go door to door?", 0.4),
        ('B', "Every weekend. Little suit. Little bag. I knocked on a lot of doors.", 0.7, 'doors'),
        ('K', "And birthdays? Holidays?", 0.4),
        ('B', "Not growing up, no. So I am making up for it now. I take birthdays very seriously.", 0.7, 'doors'),
        ('K', "Was it hard? Being a kid like that?", 0.5, 'split'),
        ('B', "Sometimes. But it taught me to talk to anyone. And to be okay with being different.", 0.7),
        ('K', "That explains a lot about you. In a good way.", 0.7),
        ('KT', "He just tells me things. He does not make me guess.", 1.0),
        ('N', "Somewhere between Atlanta, and Los Angeles, two people stopped being careful.", 0.9, 'atl'),
        ('N', "I approve. I was not asked, but I approve.", 1.2, 'la'),
        ('K', "Do you know what time it is there?", 0.4),
        ('B', "Almost three in the morning.", 0.4),
        ('K', "Blake! We have been on the phone for three hours.", 0.5, 'split'),
        ('B', "I know. And I am still at the studio. And I have a golf tournament in the morning.", 0.5),
        ('K', "A tournament. Are you good?", 0.4),
        ('B', "I am very good.", 0.5),
        ('N', "He is. I looked it up. The man is a menace on a golf course.", 0.8),
        ('K', "Then go win it.", 0.3),
        ('B', "I intend to.", 0.5),
        ('K', "I have to be up early too. Pilates. And then I am seeing my girlfriend for coffee.", 0.6),
        ('B', "So. Friends?", 0.5, 'split'),
        ('K', "Friends.", 0.6, 'split'),
        ('N', "Friendship approved. By both parties, and by me. I am the one who counts.", 0.9),
        ('B', "Good night, Kat.", 0.5),
        ('K', "Good night, overthinker.", 1.6),
    ]),
    ('bed', 1.6, [
        ('N', "Three in the morning in Atlanta. Blake drives home. It is a very big house. There is plenty of room in it to overthink.", 1.0, 'house'),
        ('BT', "She told me the hard stuff first. Who does that?", 0.7, 'bedB'),
        ('BT', "Two phones. One is for work. I am an idiot.", 0.7, 'bedB'),
        ('BT', "Okay. Win tomorrow. Then call her.", 1.2, 'bedB'),
        ('N', "Midnight in Los Angeles. High above the golf course. Lights out.", 0.9, 'la'),
        ('KT', "He did not flinch. Not once.", 0.7, 'bedK'),
        ('KT', "Jehovah's Witness. Married. Golf. Chicken and rice. Who is this man?", 0.7, 'bedK'),
        ('KT', "Pilates in six hours. Worth it.", 1.2, 'bedK'),
        ('N', "And that is how you start talking. Good night.", 1.6, 'bedK'),
    ]),
    ('outro', 2.5, [
        ('N', "This has been Chicken Nugget. Go and call someone.", 1.0),
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
        if ln[0] in ('BT', 'KT'):          # a thought: softer, closer, with a long tail
            bb, aa = butter(2, 2600 / (SR / 2)); c = lfilter(bb, aa, c)
            tailn = int(0.5 * SR); irr = np.random.default_rng(5).standard_normal(tailn) * np.exp(-np.arange(tailn) / (0.14 * SR))
            from scipy.signal import fftconvolve as _fc
            wet = _fc(c, irr / np.sqrt((irr ** 2).sum())); dry = np.zeros(len(wet)); dry[:len(c)] = c
            c = 0.8 * dry + 0.16 * wet
        clips.append(c)
speech = sum(len(c) for c in clips) / SR
OUTRO_TAIL = 14.0
pauses = sum(lead for _, lead, _ in SCRIPT) + sum(ln[2] for _, _, lines in SCRIPT for ln in lines) - 15.0
TOTAL = min(598.0, float(int(15.0 + OUTRO_TAIL + speech + pauses * 1.05) + 1))      # as long as it needs, never over ten minutes
k = (TOTAL - OUTRO_TAIL - 15.0 - speech) / pauses          # the intro's 15 s lead is fixed; everything else flexes
assert k > 0.45, f'script too long: speech {speech:.1f}s'
t, i, scenes, lines_out, marks = 0.0, 0, [], [], {}
for scene, lead, lines in SCRIPT:
    scenes.append({'id': scene, 'start': round(t, 3)})
    t += lead if scene == 'intro' else lead * k
    for ln in lines:
        d = len(clips[i]) / SR
        lines_out.append({'who': ln[0], 'name': NAMES[ln[0]], 'text': ln[1].replace(' A M', ' a.m.').replace('G Wagon', 'G-Wagon'), 'start': round(t, 3), 'end': round(t + d, 3), 'scene': scene, 'view': ln[3] if len(ln) > 3 else None})
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
hello = next(l for l in lines_out if l['text'] == 'Hello?')
for j in range(2):                                         # the phone rings twice before she picks up
    for q in range(8): add(fx, tone(1320 if q % 2 else 1100, 0.07, 0.12, 4), hello['start'] - 2.6 + j * 1.1 + q * 0.07)
bye = next(l for l in lines_out if l['text'].startswith('Good night, overthinker'))
add(fx, tone(520, 0.25, 0.14, 12), bye['end'] + 0.5); add(fx, tone(390, 0.4, 0.14, 9), bye['end'] + 0.72)      # and hangs up

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
CHANTS = [('B', 'Blake!', 2.0), ('K', 'And Kat!', 4.0), ('N', 'And Chicken Nugget!', 6.0), ('N', 'Starting to talk!', 12.0)]
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
LEVEL = {'intro': 1, 'ring': 2, 'call': 1, 'bed': 1, 'outro': 2}
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
music *= 0.24 * duck                       # a late-night phone call: keep the band in the next room
fadein, fadeout = int(0.03 * SR), int(3.5 * SR)
mix = voice * 0.95 + music + fx + theme * 0.5
mix[:fadein] *= np.linspace(0, 1, fadein); mix[-fadeout:] *= np.linspace(1, 0, fadeout)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
stereo = np.stack([mix, mix], axis=1)
wav = os.path.join(TMP, 'episode.wav')
wavfile.write(wav, SR, (np.clip(stereo, -1, 1) * 32000).astype(np.int16))
subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '128000', '-q', '127', wav, os.path.join(HERE, 'episode.m4a')], check=True)

json.dump({'duration': TOTAL, 'fps': FPS, 'bpm': BPM, 'scenes': scenes, 'lines': lines_out, 'marks': marks,
           'mouth': {w: [round(float(v), 2) for v in m] for w, m in mouth.items()}},
          open(os.path.join(HERE, 'episode.json'), 'w'))
print(f'speech {speech:.1f}s over {len(lines_out)} lines; pauses scaled x{k:.2f}')
for s_ in scenes: print(f"  {s_['id']:8s} {s_['start']:7.2f} - {s_['end']:7.2f}")
print('marks', marks)

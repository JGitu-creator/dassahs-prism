import type { WorshipGenre } from './types';
import { normalizeChordProgression } from './chordUtils';

const NOTE_SEMITONES: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function parseChordNotes(chordSymbol: unknown): { bass: number; fifth: number; chord: number[] } {
  const cleaned = typeof chordSymbol === 'string' ? chordSymbol.trim() : '';
  const match = cleaned.match(/^([A-G][#b]?)(.*)$/);
  if (!match) {
    return {
      bass: midiToFreq(48),
      fifth: midiToFreq(55),
      chord: [midiToFreq(60), midiToFreq(64), midiToFreq(67), midiToFreq(71)],
    };
  }
  const rootName = match[1];
  const quality = match[2].toLowerCase();
  const semitone = NOTE_SEMITONES[rootName] ?? 0;

  const bassMidi = 36 + semitone;
  const fifthMidi = bassMidi + 7;
  const rootMidi = 60 + semitone;
  const isMinor = quality.startsWith('m') && !quality.startsWith('maj');
  const isMaj7 = quality.includes('maj7') || quality.includes('maj9');
  const isDom7 = (quality.includes('7') || quality.includes('9')) && !isMaj7;

  const intervals = isMinor ? [0, 3, 7] : [0, 4, 7];
  if (isMaj7) intervals.push(11);
  else if (isDom7 || (isMinor && (quality.includes('7') || quality.includes('9')))) intervals.push(10);
  if (quality.includes('9')) intervals.push(14);
  else if (quality.includes('6')) intervals.push(9);
  else intervals.push(12);

  return {
    bass: midiToFreq(bassMidi),
    fifth: midiToFreq(fifthMidi),
    chord: intervals.map((i) => midiToFreq(rootMidi + i)),
  };
}

/**
 * Multi-genre Web Audio backing synthesizer for all 5 requested genres:
 * - amapiano: Signature South African log-drum bassline + 16th-shaker + Rhodes stabs
 * - afro-gospel: Syncopated praise groove + staccato clean guitar + punchy kick
 * - hymns: Reverent 4-voice pipe organ & piano harmony (no drums)
 * - lofi: Warm detuned Rhodes 7ths + mellow swing pocket
 * - rnb: Lush neo-soul 9th keys + warm 808 sub kick + crisp rimshot
 */
export class WorshipBackingTrack {
  private ctx: AudioContext | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private step = 0;

  public start(
    genre: WorshipGenre,
    bpm: number,
    chords: unknown,
    onChordStep?: (chordIndex: number, chordName: string) => void,
  ): boolean {
    this.stop();
    if (typeof window === 'undefined') return false;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return false;

    try {
      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => {});
      }
    } catch {
      this.ctx = null;
      return false;
    }

    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * 0.22);
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const safeChords = normalizeChordProgression(chords);
    const safeBpm = Math.max(60, Math.min(128, bpm || 92));
    // 16th-note grid so Amapiano shakers & Afro-gospel syncopations feel authentic
    const sixteenthMs = (60 / safeBpm / 4) * 1000;
    this.step = 0;

    const tick = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const stepInBar = this.step % 16; // 16 sixteenth-notes per 4/4 bar
      const chordIndex = Math.floor(this.step / 16) % safeChords.length;
      const currentChord = safeChords[chordIndex];
      const parsed = parseChordNotes(currentChord);
      const stepSec = sixteenthMs / 1000;

      if (stepInBar === 0) {
        onChordStep?.(chordIndex, currentChord);
      }

      if (genre === 'amapiano') {
        // Lush Rhodes chords on step 0 and 10
        if (stepInBar === 0 || stepInBar === 10) {
          this.playRhodesChord(parsed.chord, now, stepSec * 6, 0.085);
        }
        // Signature Amapiano pitched log-drum groove!
        if (stepInBar === 0 || stepInBar === 3 || stepInBar === 6 || stepInBar === 11 || stepInBar === 14) {
          const logFreq = stepInBar === 6 || stepInBar === 14 ? parsed.fifth * 2 : parsed.bass * 2;
          this.playLogDrum(logFreq, now);
        }
        // Continuous 16th-note shaker + subtle four-on-the-floor kick
        if (stepInBar % 4 === 0) this.playKick(now, 0.18);
        this.playHiHat(now, stepInBar % 2 === 0 ? 0.032 : 0.018);
      } else if (genre === 'afro-gospel') {
        if (stepInBar === 0 || stepInBar === 6 || stepInBar === 12) {
          this.playStaccatoChord(parsed.chord, now, 0.15);
        }
        if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
          this.playBass(stepInBar === 6 ? parsed.fifth : parsed.bass, now, stepSec * 3.5, 'triangle');
        }
        if (stepInBar === 0 || stepInBar === 6 || stepInBar === 8 || stepInBar === 14) {
          this.playKick(now, 0.24);
        }
        if (stepInBar === 4 || stepInBar === 12) {
          this.playSnare(now, 0.075);
        }
        if (stepInBar % 2 === 0) this.playHiHat(now, 0.04);
      } else if (genre === 'hymns') {
        // Reverent sustained 4-part cathedral harmony (no drums)
        if (stepInBar === 0 || stepInBar === 8) {
          this.playOrganChord(parsed.chord.slice(0, 3), now, stepSec * 7.6, 0.09);
          this.playBass(stepInBar === 0 ? parsed.bass : parsed.fifth, now, stepSec * 7.2, 'sine');
        }
      } else if (genre === 'lofi') {
        if (stepInBar === 0) {
          this.playRhodesChord(parsed.chord, now, stepSec * 15.2, 0.1);
          this.playBass(parsed.bass, now, stepSec * 10, 'sine');
        }
        if (stepInBar === 0 || stepInBar === 10) this.playKick(now, 0.19);
        if (stepInBar === 4 || stepInBar === 12) this.playSnare(now + 0.015, 0.045);
        if (stepInBar % 4 === 2) this.playHiHat(now, 0.018);
      } else if (genre === 'rnb') {
        // Neo-soul 9th keys + smooth arpeggio fill + warm 808 + rimshot
        if (stepInBar === 0 || stepInBar === 9) {
          this.playRhodesChord(parsed.chord, now, stepSec * 6.5, 0.1);
        }
        if (stepInBar === 0 || stepInBar === 7 || stepInBar === 10) {
          this.play808Sub(stepInBar === 10 ? parsed.fifth : parsed.bass, now);
        }
        if (stepInBar === 4 || stepInBar === 12) {
          this.playRimshot(now);
        }
        if (stepInBar % 2 === 0) this.playHiHat(now, 0.02);
      }

      this.step += 1;
    };

    tick();
    this.timer = setInterval(tick, sixteenthMs);
    return true;
  }

  public stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.noiseBuffer = null;
  }

  private playOrganChord(freqs: number[], now: number, dur: number, level = 0.09) {
    if (!this.ctx) return;
    const perNote = level / Math.max(1, freqs.length);
    for (const freq of freqs) {
      for (const mult of [1, 2]) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * mult, now);

        const g = mult === 1 ? perNote : perNote * 0.3;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(g, now + 0.04);
        gain.gain.setValueAtTime(g, Math.max(now + 0.05, now + dur - 0.06));
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + dur + 0.03);
      }
    }
  }

  private playRhodesChord(freqs: number[], now: number, dur: number, level = 0.1) {
    if (!this.ctx) return;
    const perNote = level / Math.max(1, freqs.length);
    for (const freq of freqs) {
      for (const detune of [-4, 4]) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detune, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1050, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(perNote * 0.65, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + dur + 0.04);
      }
    }
  }

  private playStaccatoChord(freqs: number[], now: number, dur: number) {
    if (!this.ctx) return;
    const perNote = 0.095 / Math.max(1, freqs.length);
    for (const freq of freqs.slice(0, 3)) {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1450, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(perNote, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    }
  }

  private playLogDrum(freq: number, now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.55, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.055);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.27);
  }

  private play808Sub(freq: number, now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.8, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.04);

    gain.gain.setValueAtTime(0.21, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  private playRimshot(now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.035);

    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  private playBass(freq: number, now: number, dur: number, type: OscillatorType) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.13, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.03);
  }

  private playKick(now: number, level: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(125, now);
    osc.frequency.exponentialRampToValueAtTime(44, now + 0.12);

    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  private playSnare(now: number, level: number) {
    if (!this.ctx || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1750, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(now);
    src.stop(now + 0.12);
  }

  private playHiHat(now: number, level: number) {
    if (!this.ctx || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6800, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(now);
    src.stop(now + 0.05);
  }
}

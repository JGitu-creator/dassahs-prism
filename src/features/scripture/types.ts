export const CORE_TRANSLATIONS = ['ESV', 'NLT', 'AMP', 'NIV', 'NASB', 'KJV', 'MSG'] as const;

export type CoreTranslationCode = (typeof CORE_TRANSLATIONS)[number];

export type BibleProviderSource = 'esv-api' | 'youversion' | 'api-bible' | 'sandbox-fallback';

export interface BibleVersionMeta {
  code: string;
  name: string;
  shortLabel: string;
  isDefault?: boolean;
  available: boolean;
  provider: BibleProviderSource;
  youversionId?: number;
  apiBibleId?: string;
  copyright?: string;
}

export interface ScriptureVerse {
  number: number;
  text: string;
}

export interface BiblePassageResult {
  reference: string;
  usfm: string;
  requestedTranslation: string;
  activeTranslation: string;
  verses: ScriptureVerse[];
  verbatimText: string;
  copyright: string;
  source: BibleProviderSource;
  notice?: string;
}

export interface WordStudyItem {
  original: string;
  language: 'Hebrew' | 'Greek' | 'Aramaic';
  transliteration: string;
  meaning: string;
  prismInsight: string;
}

export interface VerseExegesisBlock {
  verseRange: string;
  heading: string;
  explanation: string;
}

export interface CrossReferenceItem {
  ref: string;
  connection: string;
}

export interface WorshipPairingItem {
  title: string;
  artistOrAuthor: string;
  lyricHighlight: string;
  whyItFits: string;
  searchQuery: string;
}

export interface StudyQuestions {
  textualDiscovery: string[];
  theologicalAnchor: string[];
  couplesHeart: string[];
  obedienceStep: string[];
}

export interface DopamineHookItem {
  title: string;
  fact: string;
}

export interface MemoryAnchorItem {
  metaphor: string;
  acronymWord: string;
  acronymLines: string[];
}

export interface StudyBreakdown {
  reference: string;
  overview: {
    author: string;
    audience: string;
    genre: string;
    historicalContext: string;
    originalHearers: string;
    redemptivePlacement: string;
    literaryStructure: string;
  };
  dopamineHook: DopamineHookItem;
  memoryAnchor: MemoryAnchorItem;
  verseExegesis: VerseExegesisBlock[];
  wordStudies: WordStudyItem[];
  notMeaning: string[];
  christThread: string;
  crossReferences: CrossReferenceItem[];
  lessons: string[];
  questions: StudyQuestions;
  guidedPrayer: string;
  worship: {
    hymns: WorshipPairingItem[];
    modernSongs: WorshipPairingItem[];
  };
  source: 'prism-ai' | 'local-study-fallback';
  providerLabel: string;
}

export type WorshipGenre =
  | 'amapiano'
  | 'afro-gospel'
  | 'hymns'
  | 'lofi'
  | 'rnb';

export interface WorshipSongSection {
  label: string;
  lyrics: string;
}

export interface GeneratedWorshipSong {
  title: string;
  reference: string;
  genre: WorshipGenre;
  key: string;
  bpm: number;
  meter: string;
  chordProgression: string[];
  sections: WorshipSongSection[];
  sunoPrompt: string;
  source: 'prism-ai' | 'local-study-fallback';
  providerLabel: string;
}

export interface MusicTrackMatch {
  found: boolean;
  query: string;
  trackName?: string;
  artistName?: string;
  artworkUrl?: string;
  previewUrl?: string;
  appleMusicUrl?: string;
  appleMusicEmbedUrl?: string;
  spotifySearchUrl: string;
  youtubeSearchUrl: string;
}

export interface AskDjChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface AskDjScriptureResponse {
  reply: string;
  primaryReference: string;
  clickedReference?: string;
  focusWord?: string;
  interactionId?: string;
  source: 'prism-ai' | 'local-study-fallback';
  providerLabel: string;
}

import type { ScriptureVerse } from './types.ts';

interface OfflineChapterEntry {
  reference: string;
  verses: ScriptureVerse[];
}

/**
 * Public-domain King James Version (KJV) passages used strictly as an offline
 * local sandbox fallback when ESV_API_KEY / YVP_APP_KEY are unset or network is offline.
 */
const OFFLINE_KJV_PASSAGES: Record<string, OfflineChapterEntry> = {
  'PSA.23': {
    reference: 'Psalms 23',
    verses: [
      { number: 1, text: 'The LORD is my shepherd; I shall not want.' },
      { number: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
      { number: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.' },
      { number: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
      { number: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
      { number: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' },
    ],
  },
  'JHN.3': {
    reference: 'John 3',
    verses: [
      { number: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
      { number: 17, text: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.' },
    ],
  },
  'JHN.10': {
    reference: 'John 10',
    verses: [
      { number: 11, text: 'I am the good shepherd: the good shepherd giveth his life for the sheep.' },
      { number: 14, text: 'I am the good shepherd, and know my sheep, and am known of mine.' },
      { number: 27, text: 'My sheep hear my voice, and I know them, and they follow me:' },
      { number: 28, text: 'And I give unto them eternal life; and they shall never perish, neither shall any man pluck them out of my hand.' },
    ],
  },
  'JHN.15': {
    reference: 'John 15',
    verses: [
      { number: 4, text: 'Abide in me, and I in you. As the branch cannot bear fruit of itself, except it abide in the vine; no more can ye, except ye abide in me.' },
      { number: 5, text: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.' },
      { number: 9, text: 'As the Father hath loved me, so have I loved you: continue ye in my love.' },
    ],
  },
  'ROM.8': {
    reference: 'Romans 8',
    verses: [
      { number: 1, text: 'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.' },
      { number: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
      { number: 38, text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,' },
      { number: 39, text: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.' },
    ],
  },
  'PRO.3': {
    reference: 'Proverbs 3',
    verses: [
      { number: 5, text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.' },
      { number: 6, text: 'In all thy ways acknowledge him, and he shall direct thy paths.' },
    ],
  },
  'PHP.4': {
    reference: 'Philippians 4',
    verses: [
      { number: 6, text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.' },
      { number: 7, text: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.' },
      { number: 8, text: 'Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.' },
    ],
  },
  '1CO.13': {
    reference: '1 Corinthians 13',
    verses: [
      { number: 4, text: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,' },
      { number: 5, text: 'Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;' },
      { number: 6, text: 'Rejoiceth not in iniquity, but rejoiceth in the truth;' },
      { number: 7, text: 'Beareth all things, believeth all things, hopeth all things, endureth all things.' },
      { number: 8, text: 'Charity never faileth: but whether there be prophecies, they shall fail; whether there be tongues, they shall cease; whether there be knowledge, it shall vanish away.' },
    ],
  },
  'ISA.43': {
    reference: 'Isaiah 43',
    verses: [
      { number: 1, text: 'But now thus saith the LORD that created thee, O Jacob, and he that formed thee, O Israel, Fear not: for I have redeemed thee, I have called thee by thy name; thou art mine.' },
      { number: 2, text: 'When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee: when thou walkest through the fire, thou shalt not be burned; neither shall the flame kindle upon thee.' },
    ],
  },
  'PSA.19': {
    reference: 'Psalms 19',
    verses: [
      { number: 7, text: 'The law of the LORD is perfect, converting the soul: the testimony of the LORD is sure, making wise the simple.' },
    ],
  },
  'REV.7': {
    reference: 'Revelation 7',
    verses: [
      { number: 17, text: 'For the Lamb which is in the midst of the throne shall feed them, and shall lead them unto living fountains of waters: and God shall wipe away all tears from their eyes.' },
    ],
  },
};

export function lookupOfflineKjvFallback(
  bookUsfm: string,
  chapter: number,
  verseStart?: number,
  verseEnd?: number,
): ScriptureVerse[] | null {
  const entry = OFFLINE_KJV_PASSAGES[`${bookUsfm}.${chapter}`];
  if (!entry) return null;

  if (verseStart !== undefined) {
    const end = verseEnd ?? verseStart;
    const filtered = entry.verses.filter((v) => v.number >= verseStart && v.number <= end);
    return filtered.length > 0 ? filtered : entry.verses;
  }

  return entry.verses;
}

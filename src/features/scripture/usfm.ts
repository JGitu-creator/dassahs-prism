export interface BibleBookMeta {
  id: number;
  usfm: string;
  name: string;
  chapters: number;
  testament: 'OT' | 'NT';
  aliases: string[];
}

export const BIBLE_BOOKS: readonly BibleBookMeta[] = [
  // Old Testament (39)
  { id: 1, usfm: 'GEN', name: 'Genesis', chapters: 50, testament: 'OT', aliases: ['gen', 'ge', 'gn'] },
  { id: 2, usfm: 'EXO', name: 'Exodus', chapters: 40, testament: 'OT', aliases: ['exo', 'exod', 'ex'] },
  { id: 3, usfm: 'LEV', name: 'Leviticus', chapters: 27, testament: 'OT', aliases: ['lev', 'le', 'lv'] },
  { id: 4, usfm: 'NUM', name: 'Numbers', chapters: 36, testament: 'OT', aliases: ['num', 'nu', 'nm', 'nb'] },
  { id: 5, usfm: 'DEU', name: 'Deuteronomy', chapters: 34, testament: 'OT', aliases: ['deu', 'deut', 'dt'] },
  { id: 6, usfm: 'JOS', name: 'Joshua', chapters: 24, testament: 'OT', aliases: ['jos', 'josh'] },
  { id: 7, usfm: 'JDG', name: 'Judges', chapters: 21, testament: 'OT', aliases: ['jdg', 'judg', 'jg', 'jdgs'] },
  { id: 8, usfm: 'RUT', name: 'Ruth', chapters: 4, testament: 'OT', aliases: ['rut', 'rth', 'ru'] },
  { id: 9, usfm: '1SA', name: '1 Samuel', chapters: 31, testament: 'OT', aliases: ['1sa', '1sam', '1 sam', '1 samuel', 'i samuel', 'i sam'] },
  { id: 10, usfm: '2SA', name: '2 Samuel', chapters: 24, testament: 'OT', aliases: ['2sa', '2sam', '2 sam', '2 samuel', 'ii samuel', 'ii sam'] },
  { id: 11, usfm: '1KI', name: '1 Kings', chapters: 22, testament: 'OT', aliases: ['1ki', '1kgs', '1 kgs', '1 kings', 'i kings', 'i kgs'] },
  { id: 12, usfm: '2KI', name: '2 Kings', chapters: 25, testament: 'OT', aliases: ['2ki', '2kgs', '2 kgs', '2 kings', 'ii kings', 'ii kgs'] },
  { id: 13, usfm: '1CH', name: '1 Chronicles', chapters: 29, testament: 'OT', aliases: ['1ch', '1chr', '1 chr', '1 chron', '1 chronicles', 'i chronicles'] },
  { id: 14, usfm: '2CH', name: '2 Chronicles', chapters: 36, testament: 'OT', aliases: ['2ch', '2chr', '2 chr', '2 chron', '2 chronicles', 'ii chronicles'] },
  { id: 15, usfm: 'EZR', name: 'Ezra', chapters: 10, testament: 'OT', aliases: ['ezr', 'ez'] },
  { id: 16, usfm: 'NEH', name: 'Nehemiah', chapters: 13, testament: 'OT', aliases: ['neh', 'ne'] },
  { id: 17, usfm: 'EST', name: 'Esther', chapters: 10, testament: 'OT', aliases: ['est', 'esth', 'es'] },
  { id: 18, usfm: 'JOB', name: 'Job', chapters: 42, testament: 'OT', aliases: ['job', 'jb'] },
  { id: 19, usfm: 'PSA', name: 'Psalms', chapters: 150, testament: 'OT', aliases: ['psa', 'psalm', 'psalms', 'ps', 'pss'] },
  { id: 20, usfm: 'PRO', name: 'Proverbs', chapters: 31, testament: 'OT', aliases: ['pro', 'prov', 'pr', 'prv'] },
  { id: 21, usfm: 'ECC', name: 'Ecclesiastes', chapters: 12, testament: 'OT', aliases: ['ecc', 'eccl', 'eccles', 'qoheleth'] },
  { id: 22, usfm: 'SNG', name: 'Song of Solomon', chapters: 8, testament: 'OT', aliases: ['sng', 'song', 'sos', 'song of songs', 'canticles'] },
  { id: 23, usfm: 'ISA', name: 'Isaiah', chapters: 66, testament: 'OT', aliases: ['isa', 'is'] },
  { id: 24, usfm: 'JER', name: 'Jeremiah', chapters: 52, testament: 'OT', aliases: ['jer', 'je', 'jr'] },
  { id: 25, usfm: 'LAM', name: 'Lamentations', chapters: 5, testament: 'OT', aliases: ['lam', 'la'] },
  { id: 26, usfm: 'EZK', name: 'Ezekiel', chapters: 48, testament: 'OT', aliases: ['ezk', 'ezek', 'eze'] },
  { id: 27, usfm: 'DAN', name: 'Daniel', chapters: 12, testament: 'OT', aliases: ['dan', 'da', 'dn'] },
  { id: 28, usfm: 'HOS', name: 'Hosea', chapters: 14, testament: 'OT', aliases: ['hos', 'ho'] },
  { id: 29, usfm: 'JOL', name: 'Joel', chapters: 3, testament: 'OT', aliases: ['jol', 'joe', 'jl'] },
  { id: 30, usfm: 'AMO', name: 'Amos', chapters: 9, testament: 'OT', aliases: ['amo', 'am'] },
  { id: 31, usfm: 'OBA', name: 'Obadiah', chapters: 1, testament: 'OT', aliases: ['oba', 'obad', 'ob'] },
  { id: 32, usfm: 'JON', name: 'Jonah', chapters: 4, testament: 'OT', aliases: ['jon', 'jnh'] },
  { id: 33, usfm: 'MIC', name: 'Micah', chapters: 7, testament: 'OT', aliases: ['mic', 'mc'] },
  { id: 34, usfm: 'NAM', name: 'Nahum', chapters: 3, testament: 'OT', aliases: ['nam', 'nah', 'na'] },
  { id: 35, usfm: 'HAB', name: 'Habakkuk', chapters: 3, testament: 'OT', aliases: ['hab', 'hb'] },
  { id: 36, usfm: 'ZEP', name: 'Zephaniah', chapters: 3, testament: 'OT', aliases: ['zep', 'zeph', 'zp'] },
  { id: 37, usfm: 'HAG', name: 'Haggai', chapters: 2, testament: 'OT', aliases: ['hag', 'hg'] },
  { id: 38, usfm: 'ZEC', name: 'Zechariah', chapters: 14, testament: 'OT', aliases: ['zec', 'zech', 'zc'] },
  { id: 39, usfm: 'MAL', name: 'Malachi', chapters: 4, testament: 'OT', aliases: ['mal', 'ml'] },

  // New Testament (27)
  { id: 40, usfm: 'MAT', name: 'Matthew', chapters: 28, testament: 'NT', aliases: ['mat', 'matt', 'mt'] },
  { id: 41, usfm: 'MRK', name: 'Mark', chapters: 16, testament: 'NT', aliases: ['mrk', 'mk', 'mar'] },
  { id: 42, usfm: 'LUK', name: 'Luke', chapters: 24, testament: 'NT', aliases: ['luk', 'lk'] },
  { id: 43, usfm: 'JHN', name: 'John', chapters: 21, testament: 'NT', aliases: ['jhn', 'jn', 'joh'] },
  { id: 44, usfm: 'ACT', name: 'Acts', chapters: 28, testament: 'NT', aliases: ['act', 'ac'] },
  { id: 45, usfm: 'ROM', name: 'Romans', chapters: 16, testament: 'NT', aliases: ['rom', 'ro', 'rm'] },
  { id: 46, usfm: '1CO', name: '1 Corinthians', chapters: 16, testament: 'NT', aliases: ['1co', '1cor', '1 cor', '1 corinthians', 'i corinthians', 'i cor'] },
  { id: 47, usfm: '2CO', name: '2 Corinthians', chapters: 13, testament: 'NT', aliases: ['2co', '2cor', '2 cor', '2 corinthians', 'ii corinthians', 'ii cor'] },
  { id: 48, usfm: 'GAL', name: 'Galatians', chapters: 6, testament: 'NT', aliases: ['gal', 'ga'] },
  { id: 49, usfm: 'EPH', name: 'Ephesians', chapters: 6, testament: 'NT', aliases: ['eph', 'ephes'] },
  { id: 50, usfm: 'PHP', name: 'Philippians', chapters: 4, testament: 'NT', aliases: ['php', 'phil', 'pp'] },
  { id: 51, usfm: 'COL', name: 'Colossians', chapters: 4, testament: 'NT', aliases: ['col', 'co'] },
  { id: 52, usfm: '1TH', name: '1 Thessalonians', chapters: 5, testament: 'NT', aliases: ['1th', '1thess', '1 thess', '1 thessalonians', 'i thessalonians'] },
  { id: 53, usfm: '2TH', name: '2 Thessalonians', chapters: 3, testament: 'NT', aliases: ['2th', '2thess', '2 thess', '2 thessalonians', 'ii thessalonians'] },
  { id: 54, usfm: '1TI', name: '1 Timothy', chapters: 6, testament: 'NT', aliases: ['1ti', '1tim', '1 tim', '1 timothy', 'i timothy', 'i tim'] },
  { id: 55, usfm: '2TI', name: '2 Timothy', chapters: 4, testament: 'NT', aliases: ['2ti', '2tim', '2 tim', '2 timothy', 'ii timothy', 'ii tim'] },
  { id: 56, usfm: 'TIT', name: 'Titus', chapters: 3, testament: 'NT', aliases: ['tit', 'ti'] },
  { id: 57, usfm: 'PHM', name: 'Philemon', chapters: 1, testament: 'NT', aliases: ['phm', 'philem', 'pm'] },
  { id: 58, usfm: 'HEB', name: 'Hebrews', chapters: 13, testament: 'NT', aliases: ['heb', 'he'] },
  { id: 59, usfm: 'JAS', name: 'James', chapters: 5, testament: 'NT', aliases: ['jas', 'jam', 'jm'] },
  { id: 60, usfm: '1PE', name: '1 Peter', chapters: 5, testament: 'NT', aliases: ['1pe', '1pet', '1 pet', '1 peter', 'i peter', 'i pet'] },
  { id: 61, usfm: '2PE', name: '2 Peter', chapters: 3, testament: 'NT', aliases: ['2pe', '2pet', '2 pet', '2 peter', 'ii peter', 'ii pet'] },
  { id: 62, usfm: '1JN', name: '1 John', chapters: 5, testament: 'NT', aliases: ['1jn', '1john', '1 john', '1 jn', 'i john'] },
  { id: 63, usfm: '2JN', name: '2 John', chapters: 1, testament: 'NT', aliases: ['2jn', '2john', '2 john', '2 jn', 'ii john'] },
  { id: 64, usfm: '3JN', name: '3 John', chapters: 1, testament: 'NT', aliases: ['3jn', '3john', '3 john', '3 jn', 'iii john'] },
  { id: 65, usfm: 'JUD', name: 'Jude', chapters: 1, testament: 'NT', aliases: ['jud', 'jd'] },
  { id: 66, usfm: 'REV', name: 'Revelation', chapters: 22, testament: 'NT', aliases: ['rev', 're', 'revelations'] },
] as const;

export interface ParsedBibleReference {
  book: BibleBookMeta;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  normalized: string;
  usfm: string;
}

function normalizeBookKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const BOOK_LOOKUP = new Map<string, BibleBookMeta>();
for (const book of BIBLE_BOOKS) {
  BOOK_LOOKUP.set(normalizeBookKey(book.name), book);
  BOOK_LOOKUP.set(normalizeBookKey(book.usfm), book);
  for (const alias of book.aliases) {
    BOOK_LOOKUP.set(normalizeBookKey(alias), book);
    BOOK_LOOKUP.set(normalizeBookKey(alias).replace(/\s+/g, ''), book);
  }
}

export function findBibleBook(rawBook: string): BibleBookMeta | null {
  const key = normalizeBookKey(rawBook);
  return BOOK_LOOKUP.get(key) ?? BOOK_LOOKUP.get(key.replace(/\s+/g, '')) ?? null;
}

/**
 * Parses references like "Psalm 23:1-4", "John 3:16", "1 Cor 13:4-7", "Romans 8",
 * or USFM forms like "PSA.23.1-4" / "JHN.3.16".
 */
export function parseBibleReference(rawInput: string): ParsedBibleReference | null {
  const trimmed = String(rawInput || '')
    .replace(/^\[|\]$/g, '')
    .replace(/[–—]/g, '-')
    .trim();
  if (!trimmed) return null;

  // Handle USFM format directly (e.g. JHN.3.16, PSA.23.1-4, ROM.8)
  const usfmMatch = trimmed.match(/^([1-3]?[A-Za-z]{2,3})\.(\d+)(?:\.(\d+)(?:-(\d+))?)?$/);
  if (usfmMatch) {
    const book = findBibleBook(usfmMatch[1]);
    if (!book) return null;
    const chapter = Number.parseInt(usfmMatch[2], 10);
    if (!Number.isFinite(chapter) || chapter < 1 || chapter > book.chapters) return null;
    const verseStart = usfmMatch[3] ? Number.parseInt(usfmMatch[3], 10) : undefined;
    const verseEnd = usfmMatch[4] ? Number.parseInt(usfmMatch[4], 10) : undefined;
    if (verseStart !== undefined && (verseStart < 1 || verseStart > 176)) return null;
    if (verseEnd !== undefined && (verseEnd < 1 || verseEnd > 176)) return null;
    return buildParsedResult(book, chapter, verseStart, verseEnd);
  }

  // Handle standard human format: "<Book> <Chapter>[:<VerseStart>[-<VerseEnd>]]"
  const humanMatch = trimmed.match(/^([1-3]?\s*[A-Za-z][A-Za-z.\s]*?)\s+(\d+)(?:\s*:\s*(\d+)(?:\s*-\s*(\d+))?)?$/i);
  if (!humanMatch) return null;

  const book = findBibleBook(humanMatch[1]);
  if (!book) return null;

  const chapter = Number.parseInt(humanMatch[2], 10);
  if (!Number.isFinite(chapter) || chapter < 1 || chapter > book.chapters) return null;

  const verseStart = humanMatch[3] ? Number.parseInt(humanMatch[3], 10) : undefined;
  const verseEnd = humanMatch[4] ? Number.parseInt(humanMatch[4], 10) : undefined;
  if (verseStart !== undefined && (verseStart < 1 || verseStart > 176)) return null;
  if (verseEnd !== undefined && (verseEnd < 1 || verseEnd > 176)) return null;

  return buildParsedResult(book, chapter, verseStart, verseEnd);
}

function buildParsedResult(
  book: BibleBookMeta,
  chapter: number,
  verseStart?: number,
  verseEnd?: number,
): ParsedBibleReference {
  const displayBook = book.usfm === 'PSA' && verseStart !== undefined ? 'Psalm' : book.name;

  if (verseStart !== undefined && verseStart >= 1) {
    const validEnd = verseEnd !== undefined && verseEnd >= verseStart ? verseEnd : undefined;
    const versePart = validEnd ? `${verseStart}-${validEnd}` : `${verseStart}`;
    return {
      book,
      chapter,
      verseStart,
      verseEnd: validEnd,
      normalized: `${displayBook} ${chapter}:${versePart}`,
      usfm: `${book.usfm}.${chapter}.${versePart}`,
    };
  }

  return {
    book,
    chapter,
    normalized: `${book.name} ${chapter}`,
    usfm: `${book.usfm}.${chapter}`,
  };
}

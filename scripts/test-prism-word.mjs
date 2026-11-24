import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { BIBLE_BOOKS, parseBibleReference } from '../src/features/scripture/usfm.ts';
import { CORE_TRANSLATIONS } from '../src/features/scripture/types.ts';
import { parseBracketedReferences } from '../src/features/scripture/referenceParser.ts';
import {
  ESV_COPYRIGHT_NOTICE,
  fetchBiblePassage,
  getAvailableBibleVersions,
} from '../src/features/scripture/providers/bibleProvider.ts';
import { sanitizeReferenceOnlyInput } from '../src/features/scripture/complianceGuard.ts';
import {
  buildLocalStudyFallback,
  buildLocalWorshipSongFallback,
  capWorshipPairings,
} from '../src/features/scripture/offlineStudyCatalog.ts';
import {
  buildAppleMusicEmbedUrl,
  searchWorshipTrack,
} from '../src/features/scripture/musicLookup.ts';
import {
  DEFAULT_WORSHIP_CHORDS,
  normalizeChordProgression,
} from '../src/features/scripture/chordUtils.ts';
import {
  CONNECTIONS_PUZZLES,
  DISPATCH_LEVELS,
  SUDOKU_TIERS,
  isDispatchLevelSolvable,
  validateSudokuTier,
} from '../src/features/scripture/studyGamesData.ts';
import {
  ALLOWED_PRISM_WORD_EMAILS,
  isAllowedPrismWordEmail,
  sanitizeVaultFileId,
} from '../src/features/scripture/accessControl.ts';
import {
  VAULT_SUBFOLDERS,
  readVaultState,
  saveAskDjInsightToVault,
  saveCommitmentsToVault,
  savePassageNoteToVault,
  saveSundayReflectionToVault,
} from '../src/features/scripture/localVault.ts';

test('1. USFM catalog contains all 66 canonical books and parses references cleanly', () => {
  assert.equal(BIBLE_BOOKS.length, 66);

  const p1 = parseBibleReference('John 3:16');
  assert.equal(p1?.usfm, 'JHN.3.16');
  assert.equal(p1?.normalized, 'John 3:16');

  const p2 = parseBibleReference('Psalm 23:1-4');
  assert.equal(p2?.usfm, 'PSA.23.1-4');
  assert.equal(p2?.normalized, 'Psalm 23:1-4');

  const p3 = parseBibleReference('1 Cor 13:4-7');
  assert.equal(p3?.usfm, '1CO.13.4-7');
  assert.equal(p3?.normalized, '1 Corinthians 13:4-7');

  const p4 = parseBibleReference('Romans 8');
  assert.equal(p4?.usfm, 'ROM.8');
  assert.equal(p4?.normalized, 'Romans 8');

  const p5 = parseBibleReference('PSA.23.1-4');
  assert.equal(p5?.normalized, 'Psalm 23:1-4');

  assert.equal(parseBibleReference('Psalms 999'), null);
  assert.equal(parseBibleReference('NotABook 1:1'), null);
});

test('2. Bracketed reference parser extracts valid Scripture links and ignores plain brackets', () => {
  const tokens = parseBracketedReferences(
    'David calls the LORD his Shepherd [John 10:11] even in dark valleys [Isaiah 43:2] [editorial note].',
  );
  const refs = tokens.filter((t) => t.type === 'ref');
  assert.equal(refs.length, 2);
  assert.equal(refs[0].normalizedRef, 'John 10:11');
  assert.equal(refs[1].normalizedRef, 'Isaiah 43:2');
});

test('3. ESV API provider sends Token header and preserves verbatim passage & copyright', async () => {
  let capturedUrl = '';
  let capturedAuth = '';
  const mockVerbatim = '[1] The LORD is my shepherd; I shall not want. [2] He makes me lie down in green pastures. (ESV)';

  const mockFetch = async (input, init) => {
    capturedUrl = String(input);
    capturedAuth = String(init?.headers?.Authorization || '');
    return new Response(
      JSON.stringify({
        canonical: 'Psalm 23:1-2',
        passages: [mockVerbatim],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  const result = await fetchBiblePassage('Psalm 23:1-2', 'ESV', {
    fetchImpl: mockFetch,
    env: { ESV_API_KEY: 'esv_test_token' },
  });

  assert.equal(capturedAuth, 'Token esv_test_token');
  assert.ok(capturedUrl.includes('api.esv.org/v3/passage/text/'));
  assert.equal(result.source, 'esv-api');
  assert.equal(result.activeTranslation, 'ESV');
  assert.equal(result.verbatimText, mockVerbatim);
  assert.equal(result.copyright, ESV_COPYRIGHT_NOTICE);
  assert.equal(result.verses.length, 2);
  assert.equal(result.verses[0].text, 'The LORD is my shepherd; I shall not want.');
});

test('4. YouVersion provider sends X-YVP-App-Key, preserves verbatim text, and fetches version copyright', async () => {
  const calls = [];
  const exactYvpContent = 'For God so loved the world that he gave his one and only Son...';

  const mockFetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, appKey: init?.headers?.['X-YVP-App-Key'] });

    if (url.includes('/v1/bibles?')) {
      return new Response(
        JSON.stringify({
          data: [
            { id: 111, abbreviation: 'NIV11', title: 'New International Version 2011' },
            { id: 2692, abbreviation: 'NASB2020', title: 'New American Standard Bible 2020' },
            { id: 116, abbreviation: 'NLT', title: 'New Living Translation' },
            { id: 1588, abbreviation: 'AMP', title: 'Amplified Bible' },
            { id: 97, abbreviation: 'MSG', title: 'The Message' },
            { id: 3034, abbreviation: 'BSB', title: 'Berean Standard Bible' },
          ],
        }),
        { status: 200 },
      );
    }

    if (url.endsWith('/v1/bibles/111')) {
      return new Response(
        JSON.stringify({
          id: 111,
          copyright: 'NIV® Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.®',
        }),
        { status: 200 },
      );
    }

    if (url.includes('/v1/bibles/111/passages/JHN.3.16?format=text')) {
      return new Response(
        JSON.stringify({
          id: 'JHN.3.16',
          reference: 'John 3:16',
          content: exactYvpContent,
        }),
        { status: 200 },
      );
    }

    return new Response('Not Found', { status: 404 });
  };

  const result = await fetchBiblePassage('John 3:16', 'NIV', {
    fetchImpl: mockFetch,
    env: { YVP_APP_KEY: 'yvp_test_key' },
  });

  assert.equal(result.source, 'youversion');
  assert.equal(result.activeTranslation, 'NIV');
  assert.equal(result.verbatimText, exactYvpContent);
  assert.ok(result.copyright.includes('Biblica'));
  assert.ok(calls.every((c) => c.appKey === 'yvp_test_key'));

  const versionsInfo = await getAvailableBibleVersions({
    fetchImpl: mockFetch,
    env: { YVP_APP_KEY: 'yvp_test_key' },
  });
  assert.equal(CORE_TRANSLATIONS.length, 7);
  assert.equal(CORE_TRANSLATIONS.includes('NASB'), true);
  assert.equal(versionsInfo.versions.length, 7);
  assert.equal(versionsInfo.versions[0].code, 'ESV');
  assert.equal(versionsInfo.versions[0].isDefault, true);
  assert.equal(versionsInfo.versions.find((v) => v.code === 'NASB')?.available, true);
  assert.equal(versionsInfo.extraYouVersionVersions.some((v) => v.code === 'BSB'), true);
});

test('5. Sandbox fallback works offline without keys and flags source honestly', async () => {
  const failingFetch = async () => {
    throw new Error('offline sandbox');
  };

  const result = await fetchBiblePassage('Psalm 23:1-4', 'ESV', {
    fetchImpl: failingFetch,
    env: {},
  });

  assert.equal(result.source, 'sandbox-fallback');
  assert.equal(result.activeTranslation, 'KJV');
  assert.equal(result.requestedTranslation, 'ESV');
  assert.equal(result.verses.length, 4);
  assert.ok(result.verses[0].text.includes('shepherd'));
  assert.ok(result.notice?.includes('public domain KJV'));
});

test('6. YouVersion AI compliance guard strips/detects licensed scripture body keys', () => {
  const safe = sanitizeReferenceOnlyInput({
    reference: 'Psalm 23:1-4',
    translationName: 'ESV',
  });
  assert.equal(safe.hadForbiddenText, false);
  assert.equal(safe.sanitized.reference, 'Psalm 23:1-4');

  const unsafe = sanitizeReferenceOnlyInput({
    primaryReference: 'John 3:16',
    question: 'Explain this verse',
    verbatimText: 'For God so loved the world...',
    verses: [{ number: 16, text: '...' }],
    content: 'licensed text',
  });
  assert.equal(unsafe.hadForbiddenText, true);
  assert.equal('verbatimText' in unsafe.sanitized, false);
  assert.equal('verses' in unsafe.sanitized, false);
  assert.equal('content' in unsafe.sanitized, false);
  assert.equal(unsafe.sanitized.primaryReference, 'John 3:16');
});

test('7. Deep 5-layer study fallback delivers exegesis, hidden gem, acronym, guardrails, Christ thread, 7 questions, prayer & hymns', () => {
  const study = buildLocalStudyFallback('Psalm 23:1-6');
  assert.equal(study.reference, 'Psalm 23:1-6');
  assert.ok(study.overview.originalHearers.length > 20);
  assert.ok(study.overview.redemptivePlacement.length > 20);
  assert.ok(study.dopamineHook.title.length > 5);
  assert.ok(study.dopamineHook.fact.length > 20);
  assert.ok(study.memoryAnchor.metaphor.length > 20);
  assert.ok(study.memoryAnchor.acronymWord.length >= 4);
  assert.ok(study.memoryAnchor.acronymLines.length >= 4);
  assert.ok(study.verseExegesis.length >= 2);
  assert.ok(study.wordStudies.length >= 2);
  assert.ok(study.notMeaning.length >= 2);
  assert.ok(study.christThread.length > 20);
  assert.ok(study.crossReferences.length >= 2);

  const totalQuestions =
    study.questions.textualDiscovery.length +
    study.questions.theologicalAnchor.length +
    study.questions.couplesHeart.length +
    study.questions.obedienceStep.length;
  assert.equal(totalQuestions, 7);
  assert.ok(study.guidedPrayer.length > 20);
  const curatedTotal = study.worship.hymns.length + study.worship.modernSongs.length;
  assert.ok(curatedTotal > 6 && curatedTotal <= 14, `Expected 7-14 songs for Psalm 23, got ${curatedTotal}`);

  const uncurated = buildLocalStudyFallback('Obadiah 1:1');
  assert.equal(uncurated.worship.hymns.length, 0);
  assert.equal(uncurated.worship.modernSongs.length, 0);

  const makeSong = (n) => ({
    title: `Song ${n}`,
    artistOrAuthor: 'Artist',
    lyricHighlight: 'Line',
    whyItFits: 'Reason',
    searchQuery: `Song ${n}`,
  });
  const capped = capWorshipPairings(
    Array.from({ length: 10 }, (_, i) => makeSong(`H${i}`)),
    Array.from({ length: 10 }, (_, i) => makeSong(`M${i}`)),
    14,
  );
  assert.equal(capped.hymns.length + capped.modernSongs.length, 14);
  const zeroCapped = capWorshipPairings([], [], 14);
  assert.equal(zeroCapped.hymns.length + zeroCapped.modernSongs.length, 0);
});

test('8. Song Studio genres (Amapiano, Afro-Gospel, Hymns, Lo-Fi, R&B) & Apple Music embed helpers work', async () => {
  const song = buildLocalWorshipSongFallback('Psalm 23:1-6', 'amapiano');
  assert.equal(song.genre, 'amapiano');
  assert.ok(song.chordProgression.length >= 4);
  assert.ok(song.sections.length >= 3);
  assert.ok(song.sunoPrompt.includes('Psalm 23:1-6'));

  for (const genre of ['amapiano', 'afro-gospel', 'hymns', 'lofi', 'rnb']) {
    const s = buildLocalWorshipSongFallback('Romans 8:28', genre);
    assert.equal(s.genre, genre);
  }

  assert.equal(
    buildAppleMusicEmbedUrl(1440857781, 1440857788),
    'https://embed.music.apple.com/us/album/1440857781?i=1440857788&theme=dark',
  );
  assert.equal(buildAppleMusicEmbedUrl('bad', 'id'), undefined);

  const lookup = await searchWorshipTrack('Goodness of God CeCe Winans', async () => {
    return new Response(
      JSON.stringify({
        results: [
          {
            collectionId: 111222,
            trackId: 333444,
            trackName: 'Goodness of God (Live)',
            artistName: 'CeCe Winans',
            previewUrl: 'https://audio.example/preview.m4a',
            trackViewUrl: 'https://music.apple.com/us/album/111222?i=333444',
          },
        ],
      }),
      { status: 200 },
    );
  });
  assert.equal(lookup.found, true);
  assert.equal(lookup.appleMusicEmbedUrl, 'https://embed.music.apple.com/us/album/111222?i=333444&theme=dark');
});

test('9. API.Bible provider sends api-key header, formats passage ranges, and preserves copyright', async () => {
  const calls = [];
  const verbatimApiBible = '[1] The LORD is my shepherd; I shall not want. [2] He maketh me to lie down...';

  const mockFetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, apiKey: init?.headers?.['api-key'] });

    if (url.includes('/v1/bibles?language=eng')) {
      return new Response(
        JSON.stringify({
          data: [
            { id: 'de4e12af7f28f599-01', abbreviation: 'KJV', name: 'King James (Authorised) Version' },
            { id: 'nlt-test-id', abbreviation: 'NLT', name: 'New Living Translation' },
          ],
        }),
        { status: 200 },
      );
    }

    if (url.includes('/passages/PSA.23.1-PSA.23.4')) {
      return new Response(
        JSON.stringify({
          data: {
            id: 'PSA.23.1-PSA.23.4',
            reference: 'Psalms 23:1-4',
            content: verbatimApiBible,
            copyright: 'NLT Copyright © Tyndale House Publishers',
          },
        }),
        { status: 200 },
      );
    }

    return new Response('Not Found', { status: 404 });
  };

  const result = await fetchBiblePassage('Psalm 23:1-4', 'NLT', {
    fetchImpl: mockFetch,
    env: { API_BIBLE_KEY: 'ab_test_key' },
  });

  assert.equal(result.source, 'api-bible');
  assert.equal(result.activeTranslation, 'NLT');
  assert.equal(result.verbatimText, verbatimApiBible);
  assert.ok(result.copyright.includes('Tyndale'));
  assert.ok(calls.every((c) => c.apiKey === 'ab_test_key'));
  assert.ok(calls.some((c) => c.url.includes('PSA.23.1-PSA.23.4')));
});

test('10. normalizeChordProgression flattens nested arrays, objects, and chord strings cleanly', () => {
  assert.deepEqual(
    normalizeChordProgression([['Dm9', 'Bm7', 'Gmaj7', 'Fmaj7'], ['Cmaj9', 'Am9']]),
    ['Dm9', 'Bm7', 'Gmaj7', 'Fmaj7', 'Cmaj9', 'Am9'],
  );
  assert.deepEqual(
    normalizeChordProgression([{ verse: ['Dm9', 'Bbmaj7'], chorus: ['Fmaj7', 'C'] }]),
    ['Dm9', 'Bbmaj7', 'Fmaj7', 'C'],
  );
  assert.deepEqual(
    normalizeChordProgression('Ebmaj9 - Cm9 - Abmaj7 - Bb7'),
    ['Ebmaj9', 'Cm9', 'Abmaj7', 'Bb7'],
  );
  assert.deepEqual(normalizeChordProgression(null), [...DEFAULT_WORSHIP_CHORDS]);
  assert.deepEqual(normalizeChordProgression([123, {}, null]), [...DEFAULT_WORSHIP_CHORDS]);
});

test('11. Strategy games data: Connections has 16 unique tiles, Dispatch levels are BFS-solvable, Sudoku tiers validate', () => {
  assert.equal(CONNECTIONS_PUZZLES.length, 4);
  for (const puzzle of CONNECTIONS_PUZZLES) {
    assert.equal(puzzle.groups.length, 4);
    const flat = puzzle.groups.flatMap((g) => g.items);
    assert.equal(flat.length, 16);
    assert.equal(new Set(flat).size, 16, `Expected 16 unique items in ${puzzle.id}`);
  }

  assert.equal(DISPATCH_LEVELS.length, 3);
  for (const lv of DISPATCH_LEVELS) {
    assert.equal(isDispatchLevelSolvable(lv), true, `Dispatch level ${lv.id} must be solvable`);
  }

  assert.equal(SUDOKU_TIERS.length, 3);
  assert.equal(SUDOKU_TIERS[0].size, 6);
  assert.equal(SUDOKU_TIERS[1].size, 6);
  assert.equal(SUDOKU_TIERS[2].size, 9);
  for (const tier of SUDOKU_TIERS) {
    assert.equal(validateSudokuTier(tier), true, `Sudoku tier ${tier.id} failed row/col/box validation`);
  }
});

test('12. Stress test parseBibleReference across all 66 books, abbreviations, and malformed/hostile inputs', () => {
  for (const book of BIBLE_BOOKS) {
    const parsed = parseBibleReference(`${book.name} 1:1`);
    assert.ok(parsed, `Expected ${book.name} 1:1 to parse`);
    assert.equal(parsed.book.usfm, book.usfm);
  }

  assert.equal(parseBibleReference('Ps 23')?.usfm, 'PSA.23');
  assert.equal(parseBibleReference('1John 4:8')?.usfm, '1JN.4.8');
  assert.equal(parseBibleReference('Song of Solomon 2:4')?.usfm, 'SNG.2.4');
  assert.equal(parseBibleReference('Matthew 5:1-12')?.normalized, 'Matthew 5:1-12');

  for (const bad of ['', '   ', '<script>alert(1)</script>', 'Hezekiah 9:9', 'John 999:999', 'Psalm 23:999']) {
    assert.equal(parseBibleReference(bad), null, `Expected invalid reference "${bad}" to return null`);
  }
});

test('13. Stress test provider failover cascade under simulated 500/429/503 outages falls back to offline KJV', async () => {
  let attempts = 0;
  const outageFetch = async (input) => {
    attempts += 1;
    const url = String(input);
    if (url.includes('api.esv.org')) return new Response('Server Error', { status: 500 });
    if (url.includes('api.youversion.com')) return new Response('Rate Limited', { status: 429 });
    if (url.includes('rest.api.bible')) return new Response('Service Unavailable', { status: 503 });
    throw new Error('Network unreachable');
  };

  const result = await fetchBiblePassage('Psalm 23:1-4', 'ESV', {
    fetchImpl: outageFetch,
    env: {
      ESV_API_KEY: 'test-esv',
      YVP_APP_KEY: 'test-yvp',
      API_BIBLE_KEY: 'test-apibible',
    },
  });

  assert.ok(attempts >= 3);
  assert.equal(result.source, 'sandbox-fallback');
  assert.equal(result.activeTranslation, 'KJV');
  assert.equal(result.verses.length, 4);
  assert.ok(result.verses[0].text.toLowerCase().includes('shepherd'));
});

test('14. Stress test normalizeChordProgression & complianceGuard against deeply nested & hostile payloads', () => {
  // Deeply nested arrays exceeding recursion depth guard & mixed garbage
  const deepNested = [
    [[[[[['F#m7']]]]]],
    ['Amaj7', 42, { chorus: ['Dmaj7', 'E7sus4'] }],
  ];
  const normalized = normalizeChordProgression(deepNested);
  assert.ok(Array.isArray(normalized));
  assert.ok(normalized.length >= 3);
  assert.ok(normalized.every((c) => typeof c === 'string' && c.length > 0));

  // Circular array should safely terminate without throwing Maximum call stack size exceeded
  const circular = ['Cm9'];
  circular.push(circular);
  const safeCircular = normalizeChordProgression(circular);
  assert.ok(safeCircular.includes('Cm9'));

  // Hostile mixed-case Scripture keys blocked cleanly
  const blocked = sanitizeReferenceOnlyInput({
    reference: 'John 3:16',
    VerbatimText: 'For God so loved...',
    passages: ['verse 1'],
    CONTENT: 'full text',
  });
  assert.equal(blocked.hadForbiddenText, true);
  assert.equal('VerbatimText' in blocked.sanitized, false);
  assert.equal('passages' in blocked.sanitized, false);
  assert.equal('CONTENT' in blocked.sanitized, false);
  assert.equal(blocked.sanitized.reference, 'John 3:16');
});

test('15. Access control allows strictly the two authorised emails and blocks path traversal', () => {
  assert.deepEqual(ALLOWED_PRISM_WORD_EMAILS, [
    'phidotaxis@gmail.com',
    'chanhadassah@gmail.com',
  ]);
  assert.equal(isAllowedPrismWordEmail('phidotaxis@gmail.com'), true);
  assert.equal(isAllowedPrismWordEmail('  ChanHadassah@Gmail.Com '), true);

  for (const outsider of [
    'stranger@gmail.com',
    'phidotaxis@gmail.com.evil.com',
    'admin@example.com',
    '',
    null,
    undefined,
    123,
  ]) {
    assert.equal(isAllowedPrismWordEmail(outsider), false);
  }

  const safe1 = sanitizeVaultFileId('../../etc/passwd');
  assert.equal(safe1.includes('..'), false);
  assert.equal(safe1.includes('/'), false);
  const safe2 = sanitizeVaultFileId('..\\Windows\\secret.txt');
  assert.equal(safe2.includes('\\'), false);
  assert.equal(sanitizeVaultFileId(''), 'general');
});

test('16. Local vault stores non-shareable notes, commitments, reflections, and insights in separate folders', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'prism-word-vault-test-'));
  try {
    const noteSave = savePassageNoteToVault(
      'PSA.23.1-6',
      'Psalm 23:1-6',
      'God restores our weary souls.',
      'phidotaxis@gmail.com',
      tempRoot,
    );
    assert.equal(noteSave.saved, true);
    assert.equal(noteSave.folderName, VAULT_SUBFOLDERS.passageNotes);

    const commSave = saveCommitmentsToVault(
      [{ id: 'c1', reference: 'Psalm 23:1-6', text: 'Pray together before sleep', done: false }],
      tempRoot,
    );
    assert.equal(commSave.saved, true);
    assert.equal(commSave.folderName, VAULT_SUBFOLDERS.commitments);

    const reflSave = saveSundayReflectionToVault(
      '2026-11-22',
      'God gave us peace during a stressful week.',
      'chanhadassah@gmail.com',
      tempRoot,
    );
    assert.equal(reflSave.saved, true);
    assert.equal(reflSave.folderName, VAULT_SUBFOLDERS.reflections);

    const insightSave = saveAskDjInsightToVault(
      'PSA.23.1-6',
      'Psalm 23:1-6',
      'What does raah mean?',
      'Continuous faithful shepherding.',
      'phidotaxis@gmail.com',
      tempRoot,
    );
    assert.equal(insightSave.saved, true);
    assert.equal(insightSave.folderName, VAULT_SUBFOLDERS.askDjInsights);

    for (const folder of Object.values(VAULT_SUBFOLDERS)) {
      assert.equal(fs.existsSync(path.join(tempRoot, folder)), true);
    }

    const state = readVaultState('PSA.23.1-6', '2026-11-22', tempRoot);
    assert.equal(state.diskVaultActive, true);
    assert.equal(state.note, 'God restores our weary souls.');
    assert.equal(state.commitments.length, 1);
    assert.equal(state.commitments[0].text, 'Pray together before sleep');
    assert.equal(state.graceReflection, 'God gave us peace during a stressful week.');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

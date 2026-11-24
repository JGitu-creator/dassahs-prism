import type {
  GeneratedWorshipSong,
  StudyBreakdown,
  WorshipGenre,
  WorshipPairingItem,
} from './types.ts';
import { parseBibleReference } from './usfm.ts';

export function capWorshipPairings(
  hymns: WorshipPairingItem[],
  modernSongs: WorshipPairingItem[],
  maxTotal = 14,
): { hymns: WorshipPairingItem[]; modernSongs: WorshipPairingItem[] } {
  const dedupe = (items: WorshipPairingItem[], blocked: Set<string>) => {
    const out: WorshipPairingItem[] = [];
    for (const item of items) {
      const key = item.title.trim().toLowerCase();
      if (!key || blocked.has(key)) continue;
      blocked.add(key);
      out.push(item);
    }
    return out;
  };

  const seen = new Set<string>();
  const cleanHymns = dedupe(hymns, seen);
  const cleanModern = dedupe(modernSongs, seen);

  if (cleanHymns.length + cleanModern.length <= maxTotal) {
    return { hymns: cleanHymns, modernSongs: cleanModern };
  }

  const half = Math.floor(maxTotal / 2);
  let hLimit = Math.min(cleanHymns.length, Math.max(half, maxTotal - cleanModern.length));
  const mLimit = Math.min(cleanModern.length, maxTotal - hLimit);
  hLimit = Math.min(cleanHymns.length, maxTotal - mLimit);

  return {
    hymns: cleanHymns.slice(0, hLimit),
    modernSongs: cleanModern.slice(0, mLimit),
  };
}

type PresetKey = `${string}.${number}`;

const CURATED_STUDY_CATALOG: Record<
  PresetKey,
  Omit<StudyBreakdown, 'reference' | 'source' | 'providerLabel'>
> = {
  'PSA.23': {
    overview: {
      author: 'King David (Israel’s shepherd-king)',
      audience: 'Israel’s worshipping assembly and weary believers across generations',
      genre: 'Lyric Psalm of Trust & Covenant Confidence',
      historicalContext:
        'Written out of David’s lived experience tending flocks in the rugged Judean wilderness and later enduring betrayal and exile. In the ancient Near East, royal inscriptions called kings "shepherds" of their nation; David subverts that title by confessing that YHWH Himself is his personal Shepherd.',
      originalHearers:
        'First sung by Israelites who knew the real danger of limestone canyons ("valleys of deep shadow"), seasonal droughts, and predators—where sheep survived solely because a vigilant shepherd carried both rod and staff.',
      redemptivePlacement:
        'Directly follows Psalm 22 (the suffering Messiah crying out on the cross) and precedes Psalm 24 (the King of Glory entering Zion)—marking the path from the Cross through the Valley to Eternity.',
      literaryStructure:
        'Two intimate portraits linked by covenant presence: vv. 1–4 depict the LORD as Shepherd ("He" becomes "You" inside the valley); vv. 5–6 depict the LORD as generous Host welcoming His guest into His house forever.',
    },
    dopamineHook: {
      title: 'Why Shepherds Rubbed Olive Oil on Sheep Faces',
      fact: 'In summer across Judea, tiny nose-flies swarmed flocks trying to lay larvae in sheep nostrils—driving sheep frantic enough to slam their heads against rocks. Ancient shepherds poured olive oil mixed with spices over a sheep’s head ("You anoint my head with oil" in v. 5) specifically to soothe their minds and shield them from invisible torment.',
    },
    memoryAnchor: {
      metaphor: 'Like stepping out of chaotic rush-hour traffic into a quiet mountain trail where an experienced guide knows every cliff and stream ahead.',
      acronymWord: 'R·E·S·T',
      acronymLines: [
        'R — Receive His care first ("The LORD is my shepherd; I shall not want")',
        'E — Expect His nearness in shadows ("You are with me")',
        'S — Surrender frantic self-protection to His rod & staff',
        'T — Trust His pursuing mercy (radaph) chasing you home every day',
      ],
    },
    verseExegesis: [
      {
        verseRange: 'vv. 1–3',
        heading: 'Covenant Ownership & Soul Restoration',
        explanation:
          'Because YHWH is "my" shepherd, David lacks nothing truly needed ("shall not want"). Green pastures and still waters are not rewards earned by anxious sheep—the Shepherd initiates rest and turns our wandering souls back onto righteous paths for His own name’s honor [Psalm 19:7].',
      },
      {
        verseRange: 'v. 4',
        heading: 'The Turning Point: From Theology to Presence',
        explanation:
          'Notice the sudden pronoun shift: David stops speaking ABOUT God ("He leads") and speaks DIRECTLY TO God ("You are with me"). The "valley of deep shadow" is not a detour outside God’s will; it is often the exact road where righteous paths lead, comforted by His protective rod and guiding staff [Isaiah 43:2].',
      },
      {
        verseRange: 'vv. 5–6',
        heading: 'The Table & Relentless Mercy',
        explanation:
          'In v. 5, the Shepherd becomes a royal Host spreading a banquet in full view of enemies—anointing David’s head with oil as an honored guest. In v. 6, "follow" translates the Hebrew radaph (to pursue intensely like a runner): God’s goodness and steadfast love actively chase the believer all the way home [Romans 8:38-39].',
      },
    ],
    wordStudies: [
      {
        original: 'רֹעֶה',
        language: 'Hebrew',
        transliteration: 'Ro‘eh',
        meaning: 'Active participle: "the One continually shepherding, feeding, and watching over me"',
        prismInsight:
          'Not a one-time title in the past, but unbroken present-tense care fulfilled personally by Jesus in [John 10:11].',
      },
      {
        original: 'שׁוּב',
        language: 'Hebrew',
        transliteration: 'Shuv ("restores")',
        meaning: 'To turn back, bring home, renew strength, or revive life',
        prismInsight:
          'God restores exhausted souls by bringing them back to Himself through His Word [Psalm 19:7], not by handing us another self-help checklist.',
      },
      {
        original: 'רָדַף',
        language: 'Hebrew',
        transliteration: 'Radaph ("shall follow / pursue")',
        meaning: 'To chase down, pursue relentlessly (used elsewhere for armies pursuing)',
        prismInsight:
          'Instead of fear chasing us from behind, covenant goodness and mercy actively pursue us every single day.',
      },
    ],
    notMeaning: [
      'It does NOT promise a painless life without dark valleys—v. 4 explicitly assumes believers walk right through them.',
      '"I shall not want" does NOT mean every material luxury on demand; it means lacking nothing necessary to walk faithfully with God.',
      'Rest in v. 2 is not passive laziness; it is trusting God’s timing enough to stop frantic self-reliance.',
    ],
    christThread:
      'In [John 10:11], Jesus takes David’s Psalm 23 imagery directly onto Himself as the Good Shepherd who lays down His life for the sheep, and in [Revelation 7:17] the Lamb on the throne still shepherds His redeemed to springs of living water.',
    crossReferences: [
      {
        ref: 'John 10:11',
        connection: 'Jesus explicitly claims the title of Good Shepherd who lays down His life so His sheep have abundant life.',
      },
      {
        ref: 'Isaiah 43:2',
        connection: 'Mirrors v. 4 with God’s personal guarantee: "When you pass through the waters, I will be with you."',
      },
      {
        ref: 'Psalm 19:7',
        connection: 'Uses the identical Hebrew verb (shuv) to show how God’s Word revives and restores the soul.',
      },
      {
        ref: 'Revelation 7:17',
        connection: 'Completes Psalm 23’s trajectory: eternity itself is dwelling in the Shepherd’s house forever.',
      },
    ],
    lessons: [
      'Security flows from the Shepherd’s presence ("You are with me"), not the absence of threats.',
      'God’s faithfulness is active pursuit (radaph)—even when we feel behind, His mercy runs toward us.',
      'God links His own name’s honor (v. 3) to guiding His people faithfully.',
    ],
    questions: {
      textualDiscovery: [
        'Where in vv. 1–6 do the pronouns shift from third person ("He") to second person ("You"), and what setting triggers that change?',
        'How does the image in v. 5 (a table in front of enemies) differ from the quiet pasture of v. 2—and why do we need both?',
      ],
      theologicalAnchor: [
        'If Jesus is the Good Shepherd of [John 10:11], what does it cost Him to guarantee that we "shall not want" spiritually?',
        'Why does David say God leads us in right paths "for His name’s sake" rather than because of our performance?',
      ],
      couplesHeart: [
        'Right now in our home and work, where are we acting like anxious sheep trying to guard ourselves instead of letting Him shepherd us?',
        'How can one of us help remind the other of "You are with me" during stressful moments this week?',
      ],
      obedienceStep: [
        'Identify one anxious burden today, lay it deliberately before the Shepherd in prayer together, and mark one tangible way you will rest in His sufficiency tonight.',
      ],
    },
    guidedPrayer:
      'Lord Jesus, our Good Shepherd, forgive us for striving as though we had to protect and provide for ourselves. Calm our restless minds beside Your still waters, walk closely with us through every shadow, and let Your pursuing goodness anchor our home today. Amen.',
    worship: {
      hymns: [
        {
          title: 'The King of Love My Shepherd Is',
          artistOrAuthor: 'Henry Williams Baker',
          lyricHighlight: 'Where streams of living water flow, my ransomed soul He leadeth...',
          whyItFits: 'Classic verse-by-verse setting of Psalm 23 honoring Christ our Shepherd.',
          searchQuery: 'The King of Love My Shepherd Is hymn',
        },
        {
          title: 'Great Is Thy Faithfulness',
          artistOrAuthor: 'Thomas Chisholm',
          lyricHighlight: 'All I have needed Thy hand hath provided; great is Thy faithfulness, Lord, unto me.',
          whyItFits: 'Celebrates daily sufficiency ("I shall not want") and lifelong covenant mercy.',
          searchQuery: 'Great Is Thy Faithfulness hymn',
        },
        {
          title: 'Savior, Like a Shepherd Lead Us',
          artistOrAuthor: 'Dorothy Thrupp',
          lyricHighlight: 'Savior, like a shepherd lead us, much we need Thy tender care.',
          whyItFits: 'Prays for humble willingness to follow our Shepherd in every pasture and trial.',
          searchQuery: 'Savior Like a Shepherd Lead Us hymn',
        },
        {
          title: 'The Lord’s My Shepherd, I’ll Not Want',
          artistOrAuthor: 'Scottish Psalter (Crimond)',
          lyricHighlight: 'My soul He doth restore again, and me to walk doth make within the paths of righteousness.',
          whyItFits: 'Classic metrical Psalm 23 sung verbatim to the beloved Crimond hymn tune.',
          searchQuery: 'The Lords My Shepherd Ill Not Want Crimond hymn',
        },
        {
          title: 'Shepherd of Tender Youth',
          artistOrAuthor: 'Clement of Alexandria',
          lyricHighlight: 'Shepherd of tender youth, guiding in love and truth through devious ways.',
          whyItFits: 'One of the earliest surviving Christian hymns looking to Christ as guiding Shepherd.',
          searchQuery: 'Shepherd of Tender Youth hymn',
        },
      ],
      modernSongs: [
        {
          title: 'Goodness of God',
          artistOrAuthor: 'CeCe Winans',
          lyricHighlight: 'Your goodness is running after, it’s running after me...',
          whyItFits: 'Echoes the Hebrew word radaph in v. 6—God’s mercy relentlessly pursuing us.',
          searchQuery: 'Goodness of God CeCe Winans',
        },
        {
          title: 'Psalm 23 (Surely Goodness, Surely Mercy)',
          artistOrAuthor: 'Shane & Shane',
          lyricHighlight: 'The Lord is my shepherd, I shall not want; in green pastures He makes me lie down...',
          whyItFits: 'Helps sing Psalm 23 verbatim into heart and memory.',
          searchQuery: 'Shane and Shane Psalm 23 Surely Goodness',
        },
        {
          title: 'The Lord Is My Shepherd (Psalm 23)',
          artistOrAuthor: 'Keith & Kristyn Getty',
          lyricHighlight: 'And I will trust in You alone, for Your endless mercy follows me.',
          whyItFits: 'Modern Irish hymn melody turning v. 4 valley courage into congregational praise.',
          searchQuery: 'Keith and Kristyn Getty Psalm 23',
        },
        {
          title: 'Psalm 23 (I Am Not Alone)',
          artistOrAuthor: 'People & Songs',
          lyricHighlight: 'Surely goodness and mercy shall follow me all the days of my life.',
          whyItFits: 'Brings vv. 4 and 6 together in an anthem of calm courage.',
          searchQuery: 'Psalm 23 People and Songs Josh Sherman',
        },
        {
          title: 'Shepherd',
          artistOrAuthor: 'Bethel Music & Amanda Cook',
          lyricHighlight: 'I’ll trust in Your unfailing love, Good Shepherd of my soul.',
          whyItFits: 'Surrenders control and rests quietly in the Shepherd’s care.',
          searchQuery: 'Shepherd Amanda Cook Bethel Music',
        },
      ],
    },
  },
  'ROM.8': {
    overview: {
      author: 'Apostle Paul',
      audience: 'House churches in Rome navigating cultural hostility and internal spiritual conflict',
      genre: 'Epistle / Redemptive-Historical Climax',
      historicalContext:
        'Dictated in Corinth around AD 57 after Jews and Gentiles had strained relationships following Claudius’s edict. Coming right after Paul’s anguished cry in chapter 7 ("Who will deliver me?"), chapter 8 answers with life in the Holy Spirit.',
      originalHearers:
        'Believers tempted to wonder whether their ongoing weakness or persecution meant God’s covenant promise had failed or His verdict against them still stood.',
      redemptivePlacement:
        'The summit of Romans 1–8: moves from human condemnation (chs. 1–3) through justification by faith (chs. 4–5) into Spirit-empowered assurance (ch. 8).',
      literaryStructure:
        'A symphonic arc bookended by two unbreakable absolutes: "no condemnation" in Christ (v. 1) and "no separation" from God’s love (vv. 38–39).',
    },
    dopamineHook: {
      title: 'Why Roman Adoption Could Never Be Undone',
      fact: 'Under first-century Roman law, a biological child could legally be disowned by a father—but an ADOPTED son or daughter (huiothesia, v. 15) gained permanent legal standing that could NEVER be revoked! Paul deliberately chose adoption law so Roman believers knew their Father would never write them out of His family.',
    },
    memoryAnchor: {
      metaphor: 'Like walking into court expecting a massive fine and discovering the Judge already stamped "PAID IN FULL" and handed you the family house keys.',
      acronymWord: 'F·R·E·E',
      acronymLines: [
        'F — Forgiven completely ("There is now no condemnation", v. 1)',
        'R — Received forever as God’s adopted heir (v. 15)',
        'E — Empowered by the Spirit who prays when you have no words (v. 26)',
        'E — Eternally held—zero force can separate you from His love (v. 39)',
      ],
    },
    verseExegesis: [
      {
        verseRange: 'vv. 1–17',
        heading: 'From Courtroom Verdict to Family Adoption',
        explanation:
          'Paul begins with katakrima—not mere disapproval, but a judicial sentence removed forever because God condemned sin in the flesh of His own Son (v. 3). Even better, the Spirit transfers us from fearful slaves into adopted heirs crying "Abba, Father" [Galatians 4:6].',
      },
      {
        verseRange: 'vv. 18–30',
        heading: 'Groaning Creation, Praying Spirit, Purposeful Weaving',
        explanation:
          'Christian hope does not deny pain: creation groans, believers groan, and the Spirit Himself intercedes for us with wordless groans (v. 26). Meanwhile, God synergeo ("works together") every circumstance—even hard ones—for one defined good: conforming us to Jesus (vv. 28–29).',
      },
      {
        verseRange: 'vv. 31–39',
        heading: 'The Unbreakable Courtroom Triumph',
        explanation:
          'Paul challenges every accuser: if God did not spare His own Son, how could He fail to provide what we need? Because Christ rose and intercedes for us, neither death, life, spiritual powers, nor anxiety can sever us from His love [Psalm 23:4].',
      },
    ],
    wordStudies: [
      {
        original: 'κατάκριμα',
        language: 'Greek',
        transliteration: 'Katakrima ("condemnation")',
        meaning: 'Both a guilty legal sentence and the punishment following it',
        prismInsight:
          'There is now ZERO katakrima for those in Christ Jesus—shame has no legal jurisdiction over a forgiven believer.',
      },
      {
        original: 'υἱοθεσία',
        language: 'Greek',
        transliteration: 'Huiothesia ("adoption as sons")',
        meaning: 'Formal placement as a full legal heir in Roman family law',
        prismInsight:
          'Unlike fragile human approval, God makes us full co-heirs with Christ—present suffering is birth pangs, not rejection.',
      },
      {
        original: 'συνεργέω',
        language: 'Greek',
        transliteration: 'Synergeo ("works together")',
        meaning: 'To weave together or cooperate toward a unified outcome',
        prismInsight:
          'Paul does not say every event is inherently good; he says God masterfully weaves every event toward Christlikeness.',
      },
    ],
    notMeaning: [
      'v. 28 does NOT mean "everything happens cleanly or feels good"—Paul explicitly calls our "good" conformity to Jesus in v. 29.',
      'v. 1 does NOT excuse careless living; the same Spirit who frees us from guilt empowers us to put sin to death (v. 13).',
      '"More than conquerors" (v. 37) does NOT mean believers avoid hardship—the verse lists famine, sword, and peril as arenas where Christ’s love holds fast.',
    ],
    christThread:
      'Christ is the centerpiece of every movement: He bore our condemnation in the flesh (v. 3), shares His inheritance as Firstborn among many brothers and sisters (v. 29), and intercedes at God’s right hand so nothing can ever separate us (v. 34).',
    crossReferences: [
      {
        ref: 'John 3:16',
        connection: 'Explains why God "did not spare his own Son" (v. 32)—out of sacrificial love for the world.',
      },
      {
        ref: 'Galatians 4:6',
        connection: 'Parallel testimony that God sent the Spirit of His Son into our hearts crying "Abba, Father."',
      },
      {
        ref: 'Philippians 4:6-7',
        connection: 'Shows the daily practice of trading anxiety for peace while we wait with patient hope.',
      },
    ],
    lessons: [
      'Shame is silenced by the cross (v. 1), and fear is silenced by the resurrection (vv. 34, 38–39).',
      'Even when we are too overwhelmed to know what to pray, the Holy Spirit intercedes faithfully for us.',
      'God measures "all things for good" by how closely they form Jesus’s character in us.',
    ],
    questions: {
      textualDiscovery: [
        'Compare v. 1 ("no condemnation") with vv. 38–39 ("unable to separate us"). How do those bookends frame everything between them?',
        'In vv. 28–29, how does Paul define the exact "good" God is working all things toward?',
      ],
      theologicalAnchor: [
        'What is the difference between feeling guilty conviction from the Holy Spirit versus living under katakrima (condemnation)?',
        'How does Paul’s logic in v. 32 ("He who did not spare His own Son...") answer doubts about whether God cares in smaller daily needs?',
      ],
      couplesHeart: [
        'Where have we been hardest on ourselves lately, forgetting there is no condemnation in Christ?',
        'What current stressor can we place under v. 28—trusting God is actively weaving patience or faith through it?',
      ],
      obedienceStep: [
        'Share one unspoken fear or self-accusation aloud, pray [Romans 8:31-39] over it together, and encourage each other with grace today.',
      ],
    },
    guidedPrayer:
      'Father, thank You that in Jesus there is zero condemnation left over our lives and zero force in creation able to separate us from Your love. When we do not know how to pray, let Your Spirit intercede and shape our hearts to look more like Christ today. Amen.',
    worship: {
      hymns: [
        {
          title: 'And Can It Be That I Should Gain',
          artistOrAuthor: 'Charles Wesley',
          lyricHighlight: 'No condemnation now I dread; Jesus, and all in Him, is mine!',
          whyItFits: 'The triumphant final stanza sings Romans 8:1 word for word.',
          searchQuery: 'And Can It Be hymn',
        },
        {
          title: 'Before the Throne of God Above',
          artistOrAuthor: 'Charitie Lees Bancroft',
          lyricHighlight: 'Upward I look and see Him there who made an end to all my sin.',
          whyItFits: 'Directly echoes Romans 8:34—Christ our risen Advocate interceding for us.',
          searchQuery: 'Before the Throne of God Above worship',
        },
        {
          title: 'It Is Well With My Soul',
          artistOrAuthor: 'Horatio Spafford',
          lyricHighlight: 'My sin, oh, the bliss of this glorious thought—my sin, not in part but the whole, is nailed to the cross!',
          whyItFits: 'Stands on the exact peace of Romans 8:1 and 8:38–39 through devastating sorrow.',
          searchQuery: 'It Is Well With My Soul hymn',
        },
        {
          title: 'How Firm a Foundation',
          artistOrAuthor: 'John Rippon Selection',
          lyricHighlight: 'The soul that on Jesus hath leaned for repose, I will not, I will not desert to His foes.',
          whyItFits: 'Proclaims the unbroken assurance of Romans 8:31–39 through fire and flood.',
          searchQuery: 'How Firm a Foundation hymn',
        },
      ],
      modernSongs: [
        {
          title: 'In Christ Alone',
          artistOrAuthor: 'Keith & Kristyn Getty',
          lyricHighlight: 'No guilt in life, no fear in death—this is the power of Christ in me.',
          whyItFits: 'Summarizes both bookends of Romans 8: no condemnation, no separation.',
          searchQuery: 'In Christ Alone Getty',
        },
        {
          title: 'Who You Say I Am',
          artistOrAuthor: 'Hillsong Worship',
          lyricHighlight: 'I am chosen, not forsaken; I am who You say I am.',
          whyItFits: 'Rejoices in spiritual adoption and freedom in Christ.',
          searchQuery: 'Who You Say I Am Hillsong Worship',
        },
        {
          title: 'No Longer Slaves',
          artistOrAuthor: 'Jonathan David & Melissa Helser',
          lyricHighlight: 'I’m no longer a slave to fear, I am a child of God.',
          whyItFits: 'Captures Romans 8:15—"you did not receive the spirit of slavery to fall back into fear."',
          searchQuery: 'No Longer Slaves Bethel Music',
        },
        {
          title: 'Abba',
          artistOrAuthor: 'Jonathan David Helser',
          lyricHighlight: 'You’re more real than the ground I’m standing on, Abba, I belong to You.',
          whyItFits: 'Responds directly to Romans 8:15 where the Spirit teaches believers to cry Abba Father.',
          searchQuery: 'Abba Jonathan David Helser',
        },
      ],
    },
  },
  'JHN.15': {
    overview: {
      author: 'Apostle John',
      audience: 'Eleven confused disciples walking with Jesus toward Gethsemane on the night of His arrest',
      genre: 'Farewell Discourse / Covenant Allegory',
      historicalContext:
        'Spoken hours before the crucifixion. In the Old Testament (Isaiah 5, Psalm 80), Israel was pictured as God’s vineyard that failed to bear good fruit. Jesus now reveals Himself as the True Vine who fulfills Israel’s calling and pours His life into His branches.',
      originalHearers:
        'Disciples about to watch their Master arrested and feel utterly powerless—needing to learn that future fruitfulness would come not by willpower, but by living union with Him.',
      redemptivePlacement:
        'Part of the Upper Room Farewell Discourse (John 13–17), bridging Jesus’s earthly ministry and His coming gift of the Holy Spirit.',
      literaryStructure:
        'Rooted union in the Vine (vv. 1–8), resting in Christ’s love and joy (vv. 9–17), and standing firm together against rejection (vv. 18–27).',
    },
    dopamineHook: {
      title: 'The Giant Golden Vine Above the Temple Doors',
      fact: 'According to first-century historian Josephus, Herod’s Jerusalem Temple featured an enormous carved vine of pure gold hanging above the Sanctuary entrance—symbolizing Israel’s religious pride. As Jesus walked past Jerusalem with His disciples toward Gethsemane, declaring "I am the TRUE vine" directly claimed that life with God flows through Him, not stone buildings.',
    },
    memoryAnchor: {
      metaphor: 'Like leaving your phone plugged into its charger overnight instead of shaking the screen wondering why the battery won’t stay at 100%.',
      acronymWord: 'V·I·N·E',
      acronymLines: [
        'V — Value closeness with Jesus over frantic output ("Abide in Me")',
        'I — Invite the Father’s gentle pruning of distractions',
        'N — Nourish others from the overflow of His love',
        'E — Expect His full joy even in demanding seasons (v. 11)',
      ],
    },
    verseExegesis: [
      {
        verseRange: 'vv. 1–8',
        heading: 'Union Before Activity ("Abide in Me")',
        explanation:
          'Notice the roles: the Father is the careful Vinedresser, Jesus is the Vine, and we are branches. A branch never strains to manufacture grapes—it simply stays attached so life-sap flows. Pruning (kathairo) cuts away clutter, not our connection [Psalm 23:2-3].',
      },
      {
        verseRange: 'vv. 9–11',
        heading: 'The Purpose of Abiding: Fullness of Joy',
        explanation:
          'Jesus compares the Father’s love for Him to His love for us—and commands us to "remain in My love." Obedience here is not cold duty; Jesus says He tells us this "that My joy may be in you, and that your joy may be full" [Philippians 4:7].',
      },
    ],
    wordStudies: [
      {
        original: 'μένω',
        language: 'Greek',
        transliteration: 'Meno ("abide / remain")',
        meaning: 'To stay at home, dwell continuously, remain rooted without wandering off',
        prismInsight:
          'Used 10+ times in one paragraph—Jesus hammers home that spiritual vitality is relational closeness, never frantic performance.',
      },
      {
        original: 'καθαίρω',
        language: 'Greek',
        transliteration: 'Kathairo ("prunes")',
        meaning: 'To clear away unproductive shoots or clean thoroughly',
        prismInsight:
          'Wordplay with katharos ("clean" in v. 3): the Father trims distractions only so more life and joy can flourish.',
      },
    ],
    notMeaning: [
      'Pruning (v. 2) does NOT mean God punishes fruitful believers out of anger—the text says He prunes branches that ALREADY bear fruit so they bear even more.',
      '"Without Me you can do nothing" (v. 5) does NOT mean we sit passive; it means eternal spiritual fruit cannot be self-manufactured.',
    ],
    christThread:
      'Jesus takes Israel’s Old Testament vine identity onto Himself ("I am the true vine") and shows that every blessing, joy, and answered prayer flows purely from living union with Him.',
    crossReferences: [
      {
        ref: 'Psalm 23:2-3',
        connection: 'Demonstrates that God restores our souls in quietness before leading us forward.',
      },
      {
        ref: '1 Corinthians 13:4-7',
        connection: 'Describes the exact character of the love Jesus commands us to abide in and show.',
      },
      {
        ref: 'Philippians 4:7',
        connection: 'Promises Christ-centered peace guarding our hearts and minds.',
      },
    ],
    lessons: [
      'Fruitfulness is the natural byproduct of connection—stop trying to produce grapes disconnected from the Vine.',
      'Jesus’s goal in teaching obedience is His own joy overflowing in us (v. 11).',
    ],
    questions: {
      textualDiscovery: [
        'In vv. 1–8, what three distinct roles do the Father, Jesus, and believers play—and why does mixing up those roles exhaust us?',
        'According to v. 11, what emotional fruit did Jesus specifically intend these words to produce on His hardest night?',
      ],
      theologicalAnchor: [
        'How does knowing the Father prunes branches that already bear fruit reshape how we interpret difficult seasons of redirection?',
        'Why is "remaining in My love" (v. 9) an active daily choice rather than a mystical feeling?',
      ],
      couplesHeart: [
        'What distraction or busy habit right now feels like "dead wood" pulling us away from quiet connection with Jesus and each other?',
        'Where have you tried to work for God lately without first abiding with God?',
      ],
      obedienceStep: [
        'Carve out 10 unhurried minutes tomorrow morning to read [John 15:4-9] together before checking phones, asking Jesus to anchor your day.',
      ],
    },
    guidedPrayer:
      'Jesus, True Vine, slow our hurried hearts down today. Teach us to abide in Your love before we rush into work, prune away whatever distracts us from You, and fill our home with Your steady joy. Amen.',
    worship: {
      hymns: [
        {
          title: 'Abide with Me',
          artistOrAuthor: 'Henry Francis Lyte',
          lyricHighlight: 'Abide with me; fast falls the eventide; the darkness deepens; Lord, with me abide.',
          whyItFits: 'A timeless prayer echoing Jesus’s invitation to dwell closely with Him.',
          searchQuery: 'Abide with Me hymn',
        },
        {
          title: 'Be Thou My Vision',
          artistOrAuthor: 'Ancient Irish Hymn',
          lyricHighlight: 'Be Thou my vision, O Lord of my heart; naught be all else to me, save that Thou art.',
          whyItFits: 'Centers our gaze on Christ as our one essential Source.',
          searchQuery: 'Be Thou My Vision hymn',
        },
        {
          title: 'Jesus, I Am Resting, Resting',
          artistOrAuthor: 'Jean Sophia Pigott',
          lyricHighlight: 'Jesus, I am resting, resting in the joy of what Thou art.',
          whyItFits: 'Lingers in the exact joy of abiding in Christ’s love from John 15:9–11.',
          searchQuery: 'Jesus I Am Resting Resting hymn',
        },
        {
          title: 'O Love That Wilt Not Let Me Go',
          artistOrAuthor: 'George Matheson',
          lyricHighlight: 'I yield my flickering torch to Thee; my heart restores its borrowed ray.',
          whyItFits: 'Honours union with Christ as our true life source, like branch and vine.',
          searchQuery: 'O Love That Wilt Not Let Me Go hymn',
        },
      ],
      modernSongs: [
        {
          title: 'Yet Not I But Through Christ in Me',
          artistOrAuthor: 'CityAlight',
          lyricHighlight: 'To this I hold, my hope is only Jesus; for my life is wholly bound to His.',
          whyItFits: 'Captures "apart from Me you can do nothing" turned into joyful strength.',
          searchQuery: 'Yet Not I But Through Christ in Me CityAlight',
        },
        {
          title: 'Build My Life',
          artistOrAuthor: 'Pat Barrett',
          lyricHighlight: 'I will build my life upon Your love, it is a firm foundation.',
          whyItFits: 'Responds directly to "abide in My love" with wholehearted devotion.',
          searchQuery: 'Build My Life Pat Barrett',
        },
        {
          title: 'Christ Be Magnified',
          artistOrAuthor: 'Cody Carnes',
          lyricHighlight: 'Were creation suddenly articulate with a thousand tongues to lift one cry...',
          whyItFits: 'Prays that every pruned branch yields fruit bringing glory to Jesus.',
          searchQuery: 'Christ Be Magnified Cody Carnes',
        },
        {
          title: 'Abide',
          artistOrAuthor: 'Aaron Williams & Dwell Songs',
          lyricHighlight: 'I depend on You, I depend on You; for my waking breath I depend on You.',
          whyItFits: 'Puts John 15:4–5 into simple, daily worship of remaining attached to Jesus.',
          searchQuery: 'Abide Aaron Williams Dwell Songs',
        },
      ],
    },
  },
};

const CURATED_PASSAGE_SONGS: Record<
  PresetKey,
  StudyBreakdown['worship']
> = {
  'JHN.3': {
    hymns: [
      {
        title: 'Amazing Grace',
        artistOrAuthor: 'John Newton',
        lyricHighlight: 'I once was lost, but now am found; was blind, but now I see.',
        whyItFits: 'Celebrates the new birth of John 3:3–8 and saving grace in Christ.',
        searchQuery: 'Amazing Grace hymn',
      },
      {
        title: 'My Jesus, I Love Thee',
        artistOrAuthor: 'William Featherston',
        lyricHighlight: 'I love Thee because Thou hast first loved me and purchased my pardon on Calvary’s tree.',
        whyItFits: 'Responds directly to John 3:16 with grateful love for the Son lifted up.',
        searchQuery: 'My Jesus I Love Thee hymn',
      },
      {
        title: 'Blessed Assurance',
        artistOrAuthor: 'Fanny Crosby',
        lyricHighlight: 'Born of His Spirit, washed in His blood.',
        whyItFits: 'Sings of new birth by the Spirit and assurance of eternal life.',
        searchQuery: 'Blessed Assurance hymn',
      },
    ],
    modernSongs: [
      {
        title: 'O Praise the Name (Anastasis)',
        artistOrAuthor: 'Hillsong Worship',
        lyricHighlight: 'He shall return in robes of white, the blazing sun shall pierce the night.',
        whyItFits: 'Walks from the cross where Jesus was lifted up (John 3:14) to risen eternal life.',
        searchQuery: 'O Praise the Name Hillsong Worship',
      },
      {
        title: 'Living Hope',
        artistOrAuthor: 'Phil Wickham',
        lyricHighlight: 'Hallelujah, praise the One who set me free; Hallelujah, death has lost its grip on me.',
        whyItFits: 'Honours the Father sending His Son so whoever believes has everlasting life.',
        searchQuery: 'Living Hope Phil Wickham',
      },
      {
        title: 'This I Believe (The Creed)',
        artistOrAuthor: 'Hillsong Worship',
        lyricHighlight: 'I believe in Christ, I believe He conquered death.',
        whyItFits: 'Echoes the Gospel summary at the heart of John 3:16–18.',
        searchQuery: 'This I Believe Hillsong Worship',
      },
      {
        title: 'Forever',
        artistOrAuthor: 'Kari Jobe',
        lyricHighlight: 'The Lamb has overcome, we sing forever.',
        whyItFits: 'Magnifies the sacrificial love revealed in John 3:16.',
        searchQuery: 'Forever Kari Jobe',
      },
    ],
  },
  'PHP.4': {
    hymns: [
      {
        title: 'What a Friend We Have in Jesus',
        artistOrAuthor: 'Joseph Scriven',
        lyricHighlight: 'Take it to the Lord in prayer; oh what peace we often forfeit.',
        whyItFits: 'Turns Philippians 4:6–7 directly into praying instead of carrying anxiety.',
        searchQuery: 'What a Friend We Have in Jesus hymn',
      },
      {
        title: 'Turn Your Eyes Upon Jesus',
        artistOrAuthor: 'Helen Howarth Lemmel',
        lyricHighlight: 'And the things of earth will grow strangely dim in the light of His glory and grace.',
        whyItFits: 'Practises Philippians 4:8 by fixing thought on Christ rather than worry.',
        searchQuery: 'Turn Your Eyes Upon Jesus hymn',
      },
      {
        title: 'It Is Well With My Soul',
        artistOrAuthor: 'Horatio Spafford',
        lyricHighlight: 'Whatever my lot, Thou hast taught me to say, it is well with my soul.',
        whyItFits: 'Models Paul’s secret of contentment in abundance or need (Philippians 4:11–13).',
        searchQuery: 'It Is Well With My Soul hymn',
      },
    ],
    modernSongs: [
      {
        title: 'Christ Is Enough',
        artistOrAuthor: 'Reuben Morgan & Jonas Myrin',
        lyricHighlight: 'Christ is my reward and all of my devotion.',
        whyItFits: 'Captures deep contentment in Christ from Philippians 4:11–13.',
        searchQuery: 'Christ Is Enough Hillsong Worship',
      },
      {
        title: 'You Are My Strength',
        artistOrAuthor: 'Hillsong Worship',
        lyricHighlight: 'You are my strength when I am weak.',
        whyItFits: 'Echoes "I can do all things through Him who strengthens me" (v. 13).',
        searchQuery: 'You Are My Strength Hillsong Worship',
      },
      {
        title: 'It Is Well',
        artistOrAuthor: 'Kristene DiMarco & Bethel Music',
        lyricHighlight: 'Through it all my eyes are on You, and it is well with me.',
        whyItFits: 'Invites God’s guarding peace (v. 7) to quiet the mind in anxious hours.',
        searchQuery: 'It Is Well Kristene DiMarco Bethel',
      },
      {
        title: 'Gratitude',
        artistOrAuthor: 'Brandon Lake',
        lyricHighlight: 'So I throw up my hands and praise You again and again.',
        whyItFits: 'Reflects the "with thanksgiving" posture of Philippians 4:4–6.',
        searchQuery: 'Gratitude Brandon Lake',
      },
    ],
  },
  'ISA.40': {
    hymns: [
      {
        title: 'Immortal, Invisible, God Only Wise',
        artistOrAuthor: 'Walter Chalmers Smith',
        lyricHighlight: 'Unresting, unhasting, and silent as light, nor wanting, nor wasting.',
        whyItFits: 'Echoes Isaiah 40:28—the everlasting Creator never grows faint or weary.',
        searchQuery: 'Immortal Invisible God Only Wise hymn',
      },
      {
        title: 'How Firm a Foundation',
        artistOrAuthor: 'John Rippon Selection',
        lyricHighlight: 'Fear not, I am with thee; oh, be not dismayed.',
        whyItFits: 'Grounds weary hearts in the unfailing Word of Isaiah 40:8.',
        searchQuery: 'How Firm a Foundation hymn',
      },
      {
        title: 'Praise, My Soul, the King of Heaven',
        artistOrAuthor: 'Henry Francis Lyte',
        lyricHighlight: 'Slow to chide and swift to bless.',
        whyItFits: 'Honours the tender Shepherd of Isaiah 40:11 who gently carries lambs.',
        searchQuery: 'Praise My Soul the King of Heaven hymn',
      },
    ],
    modernSongs: [
      {
        title: 'Everlasting God',
        artistOrAuthor: 'Brenton Brown',
        lyricHighlight: 'Strength will rise as we wait upon the Lord.',
        whyItFits: 'Sings Isaiah 40:28–31 directly as a prayer for renewed strength.',
        searchQuery: 'Everlasting God Brenton Brown',
      },
      {
        title: 'Wait on You',
        artistOrAuthor: 'Elevation Worship & Maverick City',
        lyricHighlight: 'They that wait on the Lord shall renew their strength and mount up on wings like eagles.',
        whyItFits: 'A heartfelt congregational paraphrase of Isaiah 40:31.',
        searchQuery: 'Wait on You Elevation Worship Maverick City',
      },
      {
        title: 'So Will I (100 Billion X)',
        artistOrAuthor: 'Hillsong UNITED',
        lyricHighlight: 'God of creation, there at the start before the beginning of time.',
        whyItFits: 'Echoes Isaiah 40:12–26—the Creator who measures waters and calls stars by name.',
        searchQuery: 'So Will I Hillsong UNITED',
      },
      {
        title: 'Goodness of God',
        artistOrAuthor: 'CeCe Winans',
        lyricHighlight: 'All my life You have been faithful.',
        whyItFits: 'Pairs with Isaiah 40:11 as the faithful Shepherd gently leads His flock.',
        searchQuery: 'Goodness of God CeCe Winans',
      },
    ],
  },
  '1CO.13': {
    hymns: [
      {
        title: 'O Perfect Love',
        artistOrAuthor: 'Dorothy Frances Gurney',
        lyricHighlight: 'O perfect love, all human thought transcending.',
        whyItFits: 'A historic marriage prayer rooted in patient, enduring Christian love.',
        searchQuery: 'O Perfect Love hymn',
      },
      {
        title: 'More Love to Thee, O Christ',
        artistOrAuthor: 'Elizabeth Prentiss',
        lyricHighlight: 'More love to Thee, O Christ, more love to Thee.',
        whyItFits: 'Asks Christ to fill our hearts with the selfless love described in 1 Corinthians 13.',
        searchQuery: 'More Love to Thee O Christ hymn',
      },
      {
        title: 'Blest Be the Tie That Binds',
        artistOrAuthor: 'John Fawcett',
        lyricHighlight: 'We share our mutual woes, our mutual burdens bear.',
        whyItFits: 'Pictures love bearing all things and enduring alongside believers.',
        searchQuery: 'Blest Be the Tie That Binds hymn',
      },
    ],
    modernSongs: [
      {
        title: 'How He Loves',
        artistOrAuthor: 'John Mark McMillan',
        lyricHighlight: 'He is jealous for me, loves like a hurricane.',
        whyItFits: 'Celebrates steadfast, unfailing love that never gives up.',
        searchQuery: 'How He Loves John Mark McMillan',
      },
      {
        title: 'Your Love Never Fails',
        artistOrAuthor: 'Jesus Culture',
        lyricHighlight: 'One thing remains, Your love never fails, it never gives up.',
        whyItFits: 'Echoes 1 Corinthians 13:8—"Love never fails."',
        searchQuery: 'Your Love Never Fails Jesus Culture',
      },
      {
        title: 'One Thing Remains',
        artistOrAuthor: 'Kristian Stanfill',
        lyricHighlight: 'Your love never fails, never gives up, it never runs out on me.',
        whyItFits: 'Turns Paul’s hymn of unfailing love into hopeful praise.',
        searchQuery: 'One Thing Remains Kristian Stanfill',
      },
      {
        title: 'The Blessing',
        artistOrAuthor: 'Kari Jobe & Cody Carnes',
        lyricHighlight: 'The Lord bless you and keep you, make His face shine upon you.',
        whyItFits: 'Speaks covenant faithfulness and enduring blessing over a household.',
        searchQuery: 'The Blessing Kari Jobe Cody Carnes',
      },
    ],
  },
};

export function buildLocalStudyFallback(referenceInput: string): StudyBreakdown {
  const parsed = parseBibleReference(referenceInput);
  if (parsed) {
    const key: PresetKey = `${parsed.book.usfm}.${parsed.chapter}`;
    const curated = CURATED_STUDY_CATALOG[key];
    if (curated) {
      return {
        reference: parsed.normalized,
        ...curated,
        source: 'local-study-fallback',
        providerLabel: 'Infinite Prism Deep Study Guide',
      };
    }
  }

  const label = parsed?.normalized ?? (referenceInput || 'Selected Passage');
  const isNT = parsed?.book.testament === 'NT';
  const passageSongs =
    parsed ? CURATED_PASSAGE_SONGS[`${parsed.book.usfm}.${parsed.chapter}`] : undefined;

  return {
    reference: label,
    overview: {
      author: parsed
        ? `Book of ${parsed.book.name} (${parsed.book.testament === 'OT' ? 'Old Testament' : 'New Testament'})`
        : 'Biblical Author',
      audience: isNT ? 'First-century disciples learning to follow Jesus faithfully' : 'God’s covenant people Israel',
      genre: 'Canonical Scripture & Inductive Meditation',
      historicalContext: `Read ${label} within the wider paragraph and chapter of ${parsed?.book.name ?? 'Scripture'}. Pay close attention to what precedes and follows these verses so the author’s actual argument guides your takeaway.`,
      originalHearers: `Ask what the original readers of ${parsed?.book.name ?? 'this book'} were facing—oppression, temptation, confusion, or worship—and how God’s word met them right there.`,
      redemptivePlacement: isNT
        ? 'Stands in the light of Christ’s resurrection, showing how the Gospel reshapes ordinary life.'
        : 'Prepares Israel’s hope and points forward toward God’s full deliverance in Christ [Luke 24:27].',
      literaryStructure:
        'Trace repeated words, turning points ("but," "therefore," "for"), promises, and commands across the verses.',
    },
    dopamineHook: {
      title: 'Why Chapter & Verse Numbers Didn’t Exist Originally',
      fact: 'None of the biblical authors wrote chapter or verse breaks! Chapter divisions were added by Stephen Langton around AD 1205, and verse numbers were added by printer Robert Estienne in the 1550s. That means reading the whole surrounding paragraph of ' +
        (parsed?.book.name ?? 'this book') +
        ' unlocks connections people often miss when reading a single verse alone.',
    },
    memoryAnchor: {
      metaphor: 'Like switching from zooming in on a single pixel to seeing the whole sweeping landscape photograph.',
      acronymWord: 'P·R·I·S·M',
      acronymLines: [
        'P — Pause to read the surrounding paragraph in context',
        'R — Refract key words across 2+ translations (ESV + AMP/NLT)',
        'I — Identify what this shows about God and Christ',
        'S — Surrender one attitude or habit in prayer together',
        'M — Magnify Him with a paired hymn or praise song',
      ],
    },
    verseExegesis: [
      {
        verseRange: label,
        heading: 'Context, Contrast & Core Movement',
        explanation: `Read ${label} slowly across two translations (such as ESV alongside NLT or Amplified). Watch who performs the main verbs—notice what God Himself initiates versus how He calls His people to respond [Romans 8:28].`,
      },
      {
        verseRange: 'Surrounding Verses',
        heading: 'Keeping the Paragraph Intact',
        explanation:
          'Never pull a promise or command out of its sentence. Check the verse before and after to verify whether the speaker is describing a timeless promise, historical narrative, or poetic prayer [Psalm 19:7].',
      },
    ],
    wordStudies: [
      {
        original: isNT ? 'λόγος / ῥῆμα' : 'דָּבָר',
        language: isNT ? 'Greek' : 'Hebrew',
        transliteration: isNT ? 'Logos / Rhema' : 'Davar',
        meaning: 'Word, spoken promise, living truth backed by God’s faithfulness',
        prismInsight: `Notice the main action verbs in ${label}. Tap any word directly inside the verse text to inspect it with Ask DJ.`,
      },
      {
        original: isNT ? 'χάρις' : 'חֶסֶד',
        language: isNT ? 'Greek' : 'Hebrew',
        transliteration: isNT ? 'Charis' : 'Chesed',
        meaning: isNT ? 'Unmerited grace and empowering love' : 'Steadfast covenant love and loyal mercy',
        prismInsight: 'Every section of Scripture reveals a faithful God whose mercy anchors our obedience [John 3:16].',
      },
    ],
    notMeaning: [
      `This passage should NOT be read in isolation from the surrounding chapter of ${parsed?.book.name ?? 'the book'}.`,
      'Avoid treating descriptive historical details as automatic personal promises without checking how the New Testament applies them.',
    ],
    christThread: `All Scripture testifies about Jesus Christ [Luke 24:27]. Ask how ${label} reveals a need only Christ meets, a promise fulfilled in Him, or a pattern of God’s grace centered at the cross.`,
    crossReferences: [
      {
        ref: 'Psalm 23:1-4',
        connection: 'Highlights God’s personal shepherding presence alongside His people.',
      },
      {
        ref: 'Romans 8:28',
        connection: 'Shows God weaving every season toward making believers like Christ.',
      },
      {
        ref: 'Philippians 4:6-7',
        connection: 'Calls us to turn every truth we read into thankful prayer and peace.',
      },
    ],
    lessons: [
      `God reveals His heart and wisdom in ${label} so we can trust Him more deeply, not merely collect facts.`,
      'Reading surrounding context protects our study from misinterpretation and deepens reverence.',
      'True Bible study ends in response: honest prayer, shared conversation, and worship.',
    ],
    questions: {
      textualDiscovery: [
        `What repeated words, contrasts, or turning-point connectors ("therefore," "but," "because") stand out in ${label}?`,
        'What does this passage show directly about God’s character, priorities, or promises?',
      ],
      theologicalAnchor: [
        'How does comparing ESV (literal precision) with NLT or Amplified clarify a phrase you might otherwise skim past?',
        `How does ${label} connect to the Gospel message of Jesus Christ?`,
      ],
      couplesHeart: [
        'Which line in this passage comforted or gently convicted each of us right now—and why?',
        'Is there a worry, prideful habit, or strained attitude this Scripture invites us to surrender together?',
      ],
      obedienceStep: [
        `Choose one verse from ${label} to memorize or pray over each other before tomorrow morning.`,
      ],
    },
    guidedPrayer: `Lord God, open our eyes to see wonderful truth in ${label}. Keep us faithful to Your meaning, humble in our hearts, and quick to turn Your Word into love and worship together. Amen.`,
    worship: passageSongs ?? {
      hymns: [],
      modernSongs: [],
    },
    source: 'local-study-fallback',
    providerLabel: 'Infinite Prism Deep Study Guide',
  };
}

const GENRE_DEFAULTS: Record<
  WorshipGenre,
  { key: string; bpm: number; meter: string; chords: string[]; styleDesc: string }
> = {
  amapiano: {
    key: 'C Minor',
    bpm: 112,
    meter: '4/4 Amapiano Log-Drum',
    chords: ['Cm9', 'Abmaj7', 'Fm9', 'G7'],
    styleDesc: 'South African Amapiano gospel praise with deep pitched log-drum bassline, crisp shakers, and soulful Rhodes piano chords',
  },
  'afro-gospel': {
    key: 'F Major',
    bpm: 106,
    meter: '4/4 Afro-Praise Groove',
    chords: ['F', 'C', 'Dm7', 'Bb'],
    styleDesc: 'uplifting Afro-gospel percussion, bright clean guitar riffs, joyful thanksgiving praise',
  },
  hymns: {
    key: 'D Major',
    bpm: 72,
    meter: 'Common Meter (8.6.8.6)',
    chords: ['D', 'G', 'Bm', 'A'],
    styleDesc: 'reverent organ and grand piano harmony, traditional hymn melody, cathedral warmth',
  },
  lofi: {
    key: 'C Major',
    bpm: 74,
    meter: '4/4 Warm Lo-Fi Swing',
    chords: ['Cmaj7', 'Am7', 'Fmaj7', 'G6'],
    styleDesc: 'gentle lo-fi Rhodes electric piano, subtle chill beat, quiet devotional vocal',
  },
  rnb: {
    key: 'Eb Major',
    bpm: 82,
    meter: '4/4 Neo-Soul R&B',
    chords: ['Ebmaj9', 'Cm9', 'Abmaj7', 'Bb7'],
    styleDesc: 'smooth neo-soul R&B worship with rich 9th electric piano chords, deep 808 warmth, and tender harmonies',
  },
};

export function buildLocalWorshipSongFallback(
  referenceInput: string,
  genre: WorshipGenre,
): GeneratedWorshipSong {
  const parsed = parseBibleReference(referenceInput);
  const ref = parsed?.normalized ?? (referenceInput || 'Psalm 23:1-6');
  const cfg = GENRE_DEFAULTS[genre] ?? GENRE_DEFAULTS.amapiano;

  const isPsalm23 = parsed?.book.usfm === 'PSA' && parsed.chapter === 23;
  const title = isPsalm23
    ? 'Still Waters & Pursuing Grace'
    : `Faithful in Your Word (${ref})`;

  return {
    title,
    reference: ref,
    genre,
    key: cfg.key,
    bpm: cfg.bpm,
    meter: cfg.meter,
    chordProgression: cfg.chords,
    sections: [
      {
        label: 'Verse 1',
        lyrics: isPsalm23
          ? 'You lead me past the hurried noise\nBeside the quiet streams;\nYou restore my weary soul\nAnd whisper peace unseen.'
          : `You spoke Your living truth in ${ref},\nA light along our way;\nWhen doubts arise and strength grows thin,\nYour faithfulness will stay.`,
      },
      {
        label: 'Chorus',
        lyrics: isPsalm23
          ? 'You are with me in the shadow,\nYour rod and staff my guide;\nGoodness and mercy chase me home,\nI’ll dwell right by Your side.'
          : `Holy, faithful, near to us,\nOur anchor and our song;\nIn every valley, every joy,\nTo You our hearts belong.`,
      },
      {
        label: 'Bridge',
        lyrics:
          'Not by our strength, not by our pace,\nWe rest inside Your steadfast grace;\nLet all our days and all our praise\nLift high Your worthy name.',
      },
    ],
    sunoPrompt: `Create a ${cfg.styleDesc} Christian worship song inspired by ${ref}, in ${cfg.key} at ${cfg.bpm} BPM, singable melody, hopeful and heartfelt.`,
    source: 'local-study-fallback',
    providerLabel: 'Prism Worship Studio (Local Songwriter)',
  };
}

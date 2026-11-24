export interface ConnectionsGroup {
  id: string;
  title: string;
  ref: string;
  insight: string;
  tier: 1 | 2 | 3 | 4;
  items: [string, string, string, string];
}

export interface ConnectionsPuzzle {
  id: string;
  level: number;
  title: string;
  difficulty: string;
  trapHint: string;
  groups: [ConnectionsGroup, ConnectionsGroup, ConnectionsGroup, ConnectionsGroup];
}

export interface DispatchTile {
  id: string;
  label: string;
  groupId: string;
}

export interface DispatchGate {
  groupId: string;
  title: string;
  ref: string;
  needed: number;
}

export interface DispatchLevel {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  dockCapacity: number;
  gates: DispatchGate[];
  lanes: DispatchTile[][];
  lesson: string;
}

export interface SudokuTierSpec {
  id: string;
  tier: number;
  title: string;
  subtitle: string;
  size: 6 | 9;
  boxRows: number;
  boxCols: number;
  maxMistakes: number;
  symbols: Array<{ num: number; name: string }>;
  puzzle: number[][];
  solution: number[][];
  verseBanner: string;
}

export const CONNECTIONS_PUZZLES: readonly ConnectionsPuzzle[] = [
  {
    id: 'conn-1',
    level: 1,
    title: 'Old Testament Crossroads',
    difficulty: 'Scholar Level 1',
    trapHint: 'Notice that Exodus, mountain, and hero themes overlap across groups.',
    groups: [
      {
        id: 'c1-g1',
        title: "Women Named in Jesus' Genealogy",
        ref: 'Matthew 1:3–6',
        insight: 'Grace woven into Messiah’s family line across Gentile outsiders and tested saints.',
        tier: 1,
        items: ['Tamar', 'Rahab', 'Ruth', 'Bathsheba'],
      },
      {
        id: 'c1-g2',
        title: 'Mountains of Covenant Encounter',
        ref: 'Gen 22 · Exod 19 · 1 Kgs 18 · Deut 34',
        insight: 'Key turning points in redemptive history unfolded on mountain peaks.',
        tier: 2,
        items: ['Sinai', 'Carmel', 'Moriah', 'Nebo'],
      },
      {
        id: 'c1-g3',
        title: 'Leaders Who Fled into Wilderness or Exile',
        ref: 'Exod 2 · 1 Kgs 19 · 1 Sam 21 · Jonah 1',
        insight: 'Even Israel’s bravest leaders needed God to meet them when they ran.',
        tier: 3,
        items: ['Moses', 'Elijah', 'David', 'Jonah'],
      },
      {
        id: 'c1-g4',
        title: 'Judges Raised to Deliver Israel',
        ref: 'Judges 4–16',
        insight: 'Flawed deliverers pointing toward the one sinless Deliverer to come.',
        tier: 4,
        items: ['Gideon', 'Deborah', 'Samson', 'Jephthah'],
      },
    ],
  },
  {
    id: 'conn-2',
    level: 2,
    title: 'Gospel and Parable Deep Cuts',
    difficulty: 'Disciple Level 2',
    trapHint: 'Vine, Shepherd, Galilee, and Good Soil all feel pastoral, so separate carefully.',
    groups: [
      {
        id: 'c2-g1',
        title: 'Jesus’ "I AM" Metaphors in John',
        ref: 'John 6, 10, 15',
        insight: 'Each metaphor claims total sufficiency: sustenance, entry, care, and life.',
        tier: 1,
        items: ['Vine', 'Door', 'Bread', 'Shepherd'],
      },
      {
        id: 'c2-g2',
        title: 'Sites of Signs Involving Water',
        ref: 'John 2, 5, 9 · Matt 14',
        insight: 'From joy at Cana to healing at Bethesda and Siloam, Christ rules creation.',
        tier: 2,
        items: ['Cana', 'Bethesda', 'Siloam', 'Galilee'],
      },
      {
        id: 'c2-g3',
        title: 'Pieces of the Armor of God',
        ref: 'Ephesians 6:14–17',
        insight: 'Spiritual warfare rests on truth, righteousness, peace, faith, salvation, and the Word.',
        tier: 3,
        items: ['Belt', 'Shield', 'Helmet', 'Sword'],
      },
      {
        id: 'c2-g4',
        title: 'Four Soils in the Parable of the Sower',
        ref: 'Matthew 13:3–9',
        insight: 'The harvest depends not on flashy sowing but on receptive, persevering hearts.',
        tier: 4,
        items: ['Path', 'Thorns', 'Rocky Ground', 'Good Soil'],
      },
    ],
  },
  {
    id: 'conn-3',
    level: 3,
    title: 'Prophets, Dreams, and Signs',
    difficulty: 'Expositor Level 3',
    trapHint: 'Fire, Furnace, Hail, and Darkness overlap across two testaments.',
    groups: [
      {
        id: 'c3-g1',
        title: 'Signs & Trials in the Book of Daniel',
        ref: 'Daniel 2, 3, 5, 6',
        insight: 'Earthly empires rise and fall while God preserves faithful exiles.',
        tier: 1,
        items: ['Statue', 'Fiery Furnace', "Lions' Den", 'Handwriting'],
      },
      {
        id: 'c3-g2',
        title: 'Plagues Sent Upon Egypt',
        ref: 'Exodus 8–10',
        insight: 'Each plague confronted one of Egypt’s supposed nature deities.',
        tier: 2,
        items: ['Hail', 'Locusts', 'Darkness', 'Frogs'],
      },
      {
        id: 'c3-g3',
        title: 'Biblical Symbols of the Holy Spirit',
        ref: 'Matt 3 · Acts 2 · Zech 4',
        insight: 'Peace (Dove), breath/power (Wind), refining purity (Fire), and anointing (Oil).',
        tier: 3,
        items: ['Dove', 'Wind', 'Fire', 'Oil'],
      },
      {
        id: 'c3-g4',
        title: 'Cities of Revelation’s Seven Churches',
        ref: 'Revelation 2–3',
        insight: 'Christ walks among ordinary local congregations, praising endurance and calling for repentance.',
        tier: 4,
        items: ['Ephesus', 'Smyrna', 'Laodicea', 'Philadelphia'],
      },
    ],
  },
  {
    id: 'conn-4',
    level: 4,
    title: 'Master Theology and Epistles',
    difficulty: 'Grandmaster Level 4',
    trapHint: 'Both Paul’s church letters and Transfiguration witnesses share apostle names.',
    groups: [
      {
        id: 'c4-g1',
        title: "Paul's Four Prison Epistles",
        ref: 'Written from Roman Custody',
        insight: 'Joy, cosmic Christology, and reconciliation forged while Paul was in chains.',
        tier: 1,
        items: ['Ephesians', 'Philippians', 'Colossians', 'Philemon'],
      },
      {
        id: 'c4-g2',
        title: 'Major Old Testament Covenants',
        ref: 'Gen 9, 15 · Exod 19 · 2 Sam 7',
        insight: 'Progressive promises culminating in the New Covenant in Christ’s blood.',
        tier: 2,
        items: ['Noahic', 'Abrahamic', 'Mosaic', 'Davidic'],
      },
      {
        id: 'c4-g3',
        title: 'Core Hebrew & Greek Word Studies',
        ref: 'Key Original-Language Anchors',
        insight: 'Loyal mercy (Hesed), wholeness (Shalom), self-giving love (Agape), appointed moment (Kairos).',
        tier: 3,
        items: ['Hesed', 'Shalom', 'Agape', 'Kairos'],
      },
      {
        id: 'c4-g4',
        title: 'Present at the Transfiguration',
        ref: 'Matthew 17:1–3',
        insight: 'The inner circle (Peter, James, John) beheld Law and Prophets (Moses & Elijah) bearing witness to Jesus.',
        tier: 4,
        items: ['Peter', 'James', 'John', 'Elijah'],
      },
    ],
  },
];

export const DISPATCH_LEVELS: readonly DispatchLevel[] = [
  {
    id: 'disp-1',
    level: 1,
    title: 'Level 1: Promise Blocked in Egypt',
    subtitle: 'Four dock slots. Uncover buried front tiles without choking your dock.',
    dockCapacity: 4,
    gates: [
      { groupId: 'creation', title: 'Gate 1: Eden and Dawn', ref: 'Gen 1 to 6', needed: 2 },
      { groupId: 'patriarchs', title: 'Gate 2: Patriarchs', ref: 'Gen 12 to 25', needed: 2 },
      { groupId: 'exodus', title: 'Gate 3: Deliverance', ref: 'Exod 12 to 14', needed: 2 },
      { groupId: 'kingdom', title: 'Gate 4: Kingdom', ref: '2 Sam 7', needed: 2 },
    ],
    lanes: [
      [
        { id: 'd1-1', label: 'Red Sea', groupId: 'exodus' },
        { id: 'd1-2', label: 'Eden', groupId: 'creation' },
        { id: 'd1-3', label: 'David', groupId: 'kingdom' },
      ],
      [
        { id: 'd1-4', label: 'Abraham', groupId: 'patriarchs' },
        { id: 'd1-5', label: 'Isaac', groupId: 'patriarchs' },
        { id: 'd1-6', label: 'Zion', groupId: 'kingdom' },
      ],
      [
        { id: 'd1-7', label: 'Passover', groupId: 'exodus' },
        { id: 'd1-8', label: 'Noah', groupId: 'creation' },
      ],
    ],
    lesson:
      'God often places future promise behind present blockers: clearing Red Sea and Passover first revealed Eden and set up effortless automatic boarding later.',
  },
  {
    id: 'disp-2',
    level: 2,
    title: 'Level 2: Exile to Upper Room',
    subtitle: 'Four dock slots across twelve buried tiles. Choose the wrong lane and Gridlock hits.',
    dockCapacity: 4,
    gates: [
      { groupId: 'exile', title: 'Gate 1: Exile Witnesses', ref: 'Dan 1 to 6', needed: 3 },
      { groupId: 'incarnation', title: 'Gate 2: Gospels', ref: 'Luke 2 to Matt 4', needed: 3 },
      { groupId: 'cross', title: 'Gate 3: Redemption', ref: 'John 19 to Luke 24', needed: 3 },
      { groupId: 'church', title: 'Gate 4: Early Church', ref: 'Acts 1 to 11', needed: 3 },
    ],
    lanes: [
      [
        { id: 'd2-1', label: 'Calvary', groupId: 'cross' },
        { id: 'd2-2', label: 'Babylon', groupId: 'exile' },
        { id: 'd2-3', label: 'Upper Room', groupId: 'church' },
      ],
      [
        { id: 'd2-4', label: 'Pentecost', groupId: 'church' },
        { id: 'd2-5', label: 'Fiery Furnace', groupId: 'exile' },
        { id: 'd2-6', label: 'Bethlehem', groupId: 'incarnation' },
      ],
      [
        { id: 'd2-7', label: 'Daniel', groupId: 'exile' },
        { id: 'd2-8', label: 'Jordan', groupId: 'incarnation' },
        { id: 'd2-9', label: 'Empty Tomb', groupId: 'cross' },
      ],
      [
        { id: 'd2-10', label: 'Galilee', groupId: 'incarnation' },
        { id: 'd2-11', label: 'Gethsemane', groupId: 'cross' },
        { id: 'd2-12', label: 'Antioch', groupId: 'church' },
      ],
    ],
    lesson:
      'Every era prepares the next: Exile preservation, Bethlehem incarnation, Calvary sacrifice, and Pentecost empowerment interlock in sequence.',
  },
  {
    id: 'disp-3',
    level: 3,
    title: 'Level 3: Strict Three Slot Board',
    subtitle: 'Hard mode with only three dock slots. Count every parked tile or gridlock happens fast.',
    dockCapacity: 3,
    gates: [
      { groupId: 'law', title: 'Gate 1: Torah and Tabernacle', ref: 'Exod 19 to 25', needed: 3 },
      { groupId: 'wisdom', title: 'Gate 2: Wisdom and Praise', ref: 'Psalms to Ecclesiastes', needed: 3 },
      { groupId: 'prophets', title: 'Gate 3: Major Prophets', ref: 'Isaiah to Ezekiel', needed: 3 },
      { groupId: 'letters', title: 'Gate 4: Epistles and Hope', ref: 'Romans to Revelation', needed: 3 },
    ],
    lanes: [
      [
        { id: 'd3-1', label: 'Psalms', groupId: 'wisdom' },
        { id: 'd3-2', label: 'Romans', groupId: 'letters' },
        { id: 'd3-3', label: 'Sinai', groupId: 'law' },
      ],
      [
        { id: 'd3-4', label: 'Isaiah', groupId: 'prophets' },
        { id: 'd3-5', label: 'Tabernacle', groupId: 'law' },
        { id: 'd3-6', label: 'Ephesians', groupId: 'letters' },
      ],
      [
        { id: 'd3-7', label: 'Commandments', groupId: 'law' },
        { id: 'd3-8', label: 'Proverbs', groupId: 'wisdom' },
        { id: 'd3-9', label: 'Jeremiah', groupId: 'prophets' },
      ],
      [
        { id: 'd3-10', label: 'Ecclesiastes', groupId: 'wisdom' },
        { id: 'd3-11', label: 'Ezekiel', groupId: 'prophets' },
        { id: 'd3-12', label: 'Revelation', groupId: 'letters' },
      ],
    ],
    lesson:
      'Law laid the foundation, Wisdom sang and pondered it, Prophets pointed ahead through judgment, and Epistles unveiled its fullness in Christ.',
  },
];

/**
 * Pure BFS solvability verifier matching Exodus Dispatch's exact UI rules:
 * - Pick any non-empty lane's front tile (index 0).
 * - If it matches active gate, board immediately; otherwise place in dock (if len < dockCapacity).
 * - Whenever a gate hits `needed`, advance gateIndex and auto-board all matching dock items.
 */
export function isDispatchLevelSolvable(level: DispatchLevel): boolean {
  interface SimState {
    heads: number[];
    dock: Record<string, number>;
    gateIdx: number;
    boarded: number;
  }

  const settle = (s: SimState): SimState => {
    let gateIdx = s.gateIdx;
    let boarded = s.boarded;
    const dock = { ...s.dock };
    while (gateIdx < level.gates.length) {
      const gate = level.gates[gateIdx];
      const inDock = dock[gate.groupId] || 0;
      if (inDock > 0) {
        const take = Math.min(gate.needed - boarded, inDock);
        boarded += take;
        dock[gate.groupId] = inDock - take;
        if (dock[gate.groupId] === 0) delete dock[gate.groupId];
      }
      if (boarded >= gate.needed) {
        gateIdx += 1;
        boarded = 0;
      } else {
        break;
      }
    }
    return { heads: s.heads, dock, gateIdx, boarded };
  };

  const initial = settle({
    heads: level.lanes.map(() => 0),
    dock: {},
    gateIdx: 0,
    boarded: 0,
  });

  const encode = (s: SimState) =>
    `${s.heads.join(',')}|${s.gateIdx}:${s.boarded}|${Object.keys(s.dock)
      .sort()
      .map((k) => `${k}=${s.dock[k]}`)
      .join('&')}`;

  const visited = new Set<string>([encode(initial)]);
  const queue: SimState[] = [initial];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.gateIdx >= level.gates.length) return true;

    const dockCount = Object.values(cur.dock).reduce((a, b) => a + b, 0);
    const activeGate = level.gates[cur.gateIdx];

    for (let laneIdx = 0; laneIdx < level.lanes.length; laneIdx++) {
      const head = cur.heads[laneIdx];
      const lane = level.lanes[laneIdx];
      if (head >= lane.length) continue;

      const tile = lane[head];
      const nextHeads = [...cur.heads];
      nextHeads[laneIdx] = head + 1;

      let nextState: SimState | null = null;
      if (tile.groupId === activeGate.groupId) {
        nextState = settle({
          heads: nextHeads,
          dock: cur.dock,
          gateIdx: cur.gateIdx,
          boarded: cur.boarded + 1,
        });
      } else if (dockCount < level.dockCapacity) {
        const nextDock = { ...cur.dock, [tile.groupId]: (cur.dock[tile.groupId] || 0) + 1 };
        nextState = {
          heads: nextHeads,
          dock: nextDock,
          gateIdx: cur.gateIdx,
          boarded: cur.boarded,
        };
      }

      if (nextState) {
        const key = encode(nextState);
        if (!visited.has(key)) {
          visited.add(key);
          queue.push(nextState);
        }
      }
    }
  }

  return false;
}

export const SUDOKU_TIERS: readonly SudokuTierSpec[] = [
  {
    id: 'sudoku-6-tactical',
    tier: 1,
    title: '6x6 Tactical (Hard)',
    subtitle: '2x3 boxes with 12 clues, Genesis Creation Days (Gen 1)',
    size: 6,
    boxRows: 2,
    boxCols: 3,
    maxMistakes: 3,
    symbols: [
      { num: 1, name: 'Light' },
      { num: 2, name: 'Sky' },
      { num: 3, name: 'Land' },
      { num: 4, name: 'Stars' },
      { num: 5, name: 'Sea' },
      { num: 6, name: 'Image' },
    ],
    puzzle: [
      [1, 0, 0, 0, 5, 0],
      [0, 5, 0, 1, 0, 0],
      [0, 0, 1, 0, 6, 0],
      [0, 6, 0, 2, 0, 0],
      [3, 0, 0, 0, 4, 0],
      [0, 4, 0, 3, 0, 2],
    ],
    solution: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2],
    ],
    verseBanner: 'Every 2x3 box holds all 6 days: reflection, symmetry, and order display the Creator’s craft.',
  },
  {
    id: 'sudoku-6-expert',
    tier: 2,
    title: '6x6 Expert',
    subtitle: '2x3 boxes with 10 clues, Armour of God (Eph 6:14 to 17)',
    size: 6,
    boxRows: 2,
    boxCols: 3,
    maxMistakes: 3,
    symbols: [
      { num: 1, name: 'Truth' },
      { num: 2, name: 'Justice' },
      { num: 3, name: 'Peace' },
      { num: 4, name: 'Faith' },
      { num: 5, name: 'Rescue' },
      { num: 6, name: 'Word' },
    ],
    puzzle: [
      [0, 6, 0, 0, 0, 4],
      [5, 0, 0, 3, 0, 0],
      [0, 4, 0, 0, 1, 0],
      [0, 0, 3, 2, 0, 0],
      [1, 0, 0, 0, 5, 0],
      [0, 5, 0, 0, 0, 6],
    ],
    solution: [
      [3, 6, 1, 5, 2, 4],
      [5, 2, 4, 3, 6, 1],
      [2, 4, 5, 6, 1, 3],
      [6, 1, 3, 2, 4, 5],
      [1, 3, 6, 4, 5, 2],
      [4, 5, 2, 1, 3, 6],
    ],
    verseBanner: 'Minimal clues force scanning across boxes: every Armour virtue belongs in every row, column, and box.',
  },
  {
    id: 'sudoku-9-grandmaster',
    tier: 3,
    title: '9x9 Grandmaster',
    subtitle: 'Full 9x9 with 30 clues, Nine Fruit of the Spirit (Gal 5:22 to 23)',
    size: 9,
    boxRows: 3,
    boxCols: 3,
    maxMistakes: 3,
    symbols: [
      { num: 1, name: 'Love' },
      { num: 2, name: 'Joy' },
      { num: 3, name: 'Peace' },
      { num: 4, name: 'Patience' },
      { num: 5, name: 'Kindness' },
      { num: 6, name: 'Goodness' },
      { num: 7, name: 'Faithful' },
      { num: 8, name: 'Gentle' },
      { num: 9, name: 'Self Control' },
    ],
    puzzle: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
    verseBanner: 'Singular in Paul’s Greek (karpos, meaning one unified cluster): Love through Self Control grow together as one Fruit.',
  },
];

export function validateSudokuTier(tier: SudokuTierSpec): boolean {
  const n = tier.size;
  if (tier.puzzle.length !== n || tier.solution.length !== n) return false;
  if (tier.symbols.length !== n) return false;

  for (let r = 0; r < n; r++) {
    if (tier.puzzle[r].length !== n || tier.solution[r].length !== n) return false;
    const rowSet = new Set<number>();
    const colSet = new Set<number>();
    for (let c = 0; c < n; c++) {
      const pVal = tier.puzzle[r][c];
      const sVal = tier.solution[r][c];
      if (sVal < 1 || sVal > n) return false;
      if (pVal !== 0 && pVal !== sVal) return false;
      rowSet.add(sVal);
      colSet.add(tier.solution[c][r]);
    }
    if (rowSet.size !== n || colSet.size !== n) return false;
  }

  for (let br = 0; br < n; br += tier.boxRows) {
    for (let bc = 0; bc < n; bc += tier.boxCols) {
      const boxSet = new Set<number>();
      for (let r = br; r < br + tier.boxRows; r++) {
        for (let c = bc; c < bc + tier.boxCols; c++) {
          boxSet.add(tier.solution[r][c]);
        }
      }
      if (boxSet.size !== n) return false;
    }
  }

  return true;
}

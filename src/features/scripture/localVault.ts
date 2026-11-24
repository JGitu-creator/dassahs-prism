import fs from 'node:fs';
import path from 'node:path';
import { sanitizeVaultFileId } from './accessControl.ts';

export const VAULT_SUBFOLDERS = {
  passageNotes: 'Passage Notes',
  commitments: 'Obedience Commitments',
  reflections: 'Sunday Reflections',
  askDjInsights: 'Ask DJ Insights',
} as const;

export interface VaultCommitmentItem {
  id: string;
  reference: string;
  text: string;
  done: boolean;
}

export function getVaultRootDir(overrideDir?: string): string {
  const raw = overrideDir?.trim() || process.env.PRISM_WORD_NOTES_DIR?.trim();
  if (raw) return path.resolve(raw);
  return path.resolve(process.cwd(), '..', "DJ's Notes");
}

export function isLocalDiskVaultAvailable(overrideDir?: string): boolean {
  if (process.env.VERCEL === '1') return false;
  try {
    const root = getVaultRootDir(overrideDir);
    fs.mkdirSync(root, { recursive: true });
    for (const folder of Object.values(VAULT_SUBFOLDERS)) {
      fs.mkdirSync(path.join(root, folder), { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

function resolveSubfolderPath(
  subfolder: (typeof VAULT_SUBFOLDERS)[keyof typeof VAULT_SUBFOLDERS],
  fileName: string,
  overrideDir?: string,
): string {
  const root = getVaultRootDir(overrideDir);
  const folder = path.join(root, subfolder);
  fs.mkdirSync(folder, { recursive: true });
  return path.join(folder, fileName);
}

export function readVaultState(
  rawPassageId: string,
  rawWeekKey: string,
  overrideDir?: string,
): {
  diskVaultActive: boolean;
  vaultRoot: string;
  note: string;
  commitments: VaultCommitmentItem[];
  graceReflection: string;
} {
  const vaultRoot = getVaultRootDir(overrideDir);
  if (!isLocalDiskVaultAvailable(overrideDir)) {
    return {
      diskVaultActive: false,
      vaultRoot,
      note: '',
      commitments: [],
      graceReflection: '',
    };
  }

  const passageId = sanitizeVaultFileId(rawPassageId);
  const weekKey = sanitizeVaultFileId(rawWeekKey);

  let note = '';
  try {
    const noteJsonPath = resolveSubfolderPath(
      VAULT_SUBFOLDERS.passageNotes,
      `${passageId}.json`,
      overrideDir,
    );
    if (fs.existsSync(noteJsonPath)) {
      const parsed = JSON.parse(fs.readFileSync(noteJsonPath, 'utf8')) as { content?: string };
      if (typeof parsed?.content === 'string') {
        note = parsed.content;
      }
    }
  } catch {
    // Non-fatal
  }

  let commitments: VaultCommitmentItem[] = [];
  try {
    const commJsonPath = resolveSubfolderPath(
      VAULT_SUBFOLDERS.commitments,
      'commitments.json',
      overrideDir,
    );
    if (fs.existsSync(commJsonPath)) {
      const parsed = JSON.parse(fs.readFileSync(commJsonPath, 'utf8'));
      if (Array.isArray(parsed)) {
        commitments = parsed.filter(
          (c): c is VaultCommitmentItem =>
            Boolean(c && typeof c === 'object' && typeof c.id === 'string' && typeof c.text === 'string'),
        );
      }
    }
  } catch {
    // Non-fatal
  }

  let graceReflection = '';
  try {
    const reflJsonPath = resolveSubfolderPath(
      VAULT_SUBFOLDERS.reflections,
      'reflections.json',
      overrideDir,
    );
    if (fs.existsSync(reflJsonPath)) {
      const parsed = JSON.parse(fs.readFileSync(reflJsonPath, 'utf8')) as Record<string, string>;
      if (parsed && typeof parsed[weekKey] === 'string') {
        graceReflection = parsed[weekKey];
      }
    }
  } catch {
    // Non-fatal
  }

  return {
    diskVaultActive: true,
    vaultRoot,
    note,
    commitments,
    graceReflection,
  };
}

export function savePassageNoteToVault(
  rawPassageId: string,
  reference: string,
  content: string,
  authorEmail: string,
  overrideDir?: string,
): { saved: boolean; folderName: string } {
  if (!isLocalDiskVaultAvailable(overrideDir)) {
    return { saved: false, folderName: VAULT_SUBFOLDERS.passageNotes };
  }

  const passageId = sanitizeVaultFileId(rawPassageId);
  const jsonPath = resolveSubfolderPath(
    VAULT_SUBFOLDERS.passageNotes,
    `${passageId}.json`,
    overrideDir,
  );
  const mdPath = resolveSubfolderPath(
    VAULT_SUBFOLDERS.passageNotes,
    `${passageId}.md`,
    overrideDir,
  );

  const payload = {
    passageId,
    reference: reference.trim() || passageId,
    updatedAt: new Date().toISOString(),
    authorEmail,
    content,
  };

  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
  const mdLines = [
    `# Private Study Notes: ${payload.reference}`,
    '',
    `Updated: ${payload.updatedAt}`,
    `Author: ${authorEmail}`,
    '',
    content.trim() || 'No notes written yet.',
    '',
  ];
  fs.writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
  return { saved: true, folderName: VAULT_SUBFOLDERS.passageNotes };
}

export function saveCommitmentsToVault(
  commitments: VaultCommitmentItem[],
  overrideDir?: string,
): { saved: boolean; folderName: string } {
  if (!isLocalDiskVaultAvailable(overrideDir)) {
    return { saved: false, folderName: VAULT_SUBFOLDERS.commitments };
  }

  const clean = commitments
    .filter((c) => c && typeof c.id === 'string' && typeof c.text === 'string' && c.text.trim())
    .map((c) => ({
      id: c.id.slice(0, 64),
      reference: String(c.reference || 'General').slice(0, 64),
      text: c.text.trim().slice(0, 500),
      done: Boolean(c.done),
    }));

  const jsonPath = resolveSubfolderPath(
    VAULT_SUBFOLDERS.commitments,
    'commitments.json',
    overrideDir,
  );
  const mdPath = resolveSubfolderPath(
    VAULT_SUBFOLDERS.commitments,
    'commitments.md',
    overrideDir,
  );

  fs.writeFileSync(jsonPath, JSON.stringify(clean, null, 2), 'utf8');
  const mdLines = [
    '# Private Weekly Obedience Commitments',
    '',
    `Updated: ${new Date().toISOString()}`,
    '',
    ...(clean.length > 0
      ? clean.map((c) => `- [${c.done ? 'x' : ' '}] (${c.reference}) ${c.text}`)
      : ['No commitments recorded yet.']),
    '',
  ];
  fs.writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
  return { saved: true, folderName: VAULT_SUBFOLDERS.commitments };
}

export function saveSundayReflectionToVault(
  rawWeekKey: string,
  reflection: string,
  authorEmail: string,
  overrideDir?: string,
): { saved: boolean; folderName: string } {
  if (!isLocalDiskVaultAvailable(overrideDir)) {
    return { saved: false, folderName: VAULT_SUBFOLDERS.reflections };
  }

  const weekKey = sanitizeVaultFileId(rawWeekKey);
  const jsonPath = resolveSubfolderPath(
    VAULT_SUBFOLDERS.reflections,
    'reflections.json',
    overrideDir,
  );
  const mdPath = resolveSubfolderPath(
    VAULT_SUBFOLDERS.reflections,
    `week-${weekKey}.md`,
    overrideDir,
  );

  let existing: Record<string, string> = {};
  try {
    if (fs.existsSync(jsonPath)) {
      existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as Record<string, string>;
    }
  } catch {
    existing = {};
  }

  existing[weekKey] = reflection;
  fs.writeFileSync(jsonPath, JSON.stringify(existing, null, 2), 'utf8');

  const mdLines = [
    `# Sunday Grace Reflection (Week of ${weekKey})`,
    '',
    `Updated: ${new Date().toISOString()}`,
    `Author: ${authorEmail}`,
    '',
    reflection.trim() || 'No reflection recorded yet.',
    '',
  ];
  fs.writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
  return { saved: true, folderName: VAULT_SUBFOLDERS.reflections };
}

export function saveAskDjInsightToVault(
  rawPassageId: string,
  reference: string,
  question: string,
  reply: string,
  authorEmail: string,
  overrideDir?: string,
): { saved: boolean; folderName: string } {
  if (!isLocalDiskVaultAvailable(overrideDir)) {
    return { saved: false, folderName: VAULT_SUBFOLDERS.askDjInsights };
  }

  const passageId = sanitizeVaultFileId(rawPassageId);
  const mdPath = resolveSubfolderPath(
    VAULT_SUBFOLDERS.askDjInsights,
    `${passageId}-insights.md`,
    overrideDir,
  );

  const entry = [
    `## ${reference.trim() || passageId} (${new Date().toISOString()})`,
    `Author: ${authorEmail}`,
    question.trim() ? `Question: ${question.trim()}` : '',
    '',
    reply.trim(),
    '',
    '---',
    '',
  ]
    .filter((line) => line !== '')
    .join('\n');

  fs.appendFileSync(mdPath, `${entry}\n`, 'utf8');
  return { saved: true, folderName: VAULT_SUBFOLDERS.askDjInsights };
}

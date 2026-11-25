import {
  cleanPlainProse,
  evaluateOutputSafety,
  evaluateSafetyBoundary,
  parseStrictJsonObject,
  UNTRUSTED_DATA_BOUNDARY_INSTRUCTION,
} from '../../lib/server/prism-contracts.ts';
import {
  callPrismChat,
  callPrismCompletion,
} from '../../lib/server/prism-ai-cascade.ts';
import {
  emptyUsage,
  type AiUsage,
  type ProviderPreference,
} from '../../lib/ai-usage.ts';
import {
  isFourTierEnabled,
  LOCAL_FALLBACK_LABEL,
  LOCAL_FALLBACK_MODEL,
} from '../../lib/server/prism-router.ts';

export type ForgeMode = 'stack_trace' | 'code_lego' | 'terminal_cli';
export type LegoBlockCategory = 'trigger' | 'input' | 'transform' | 'fault' | 'fix' | 'output' | 'flag';
export type LegoBlockColor = 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' | 'teal';

export interface ForgeLegoBlock {
  id: string;
  stepNumber: number;
  title: string;
  category: LegoBlockCategory;
  color: LegoBlockColor;
  codeFragment: string;
  plainMeaning: string;
  realWorldAnalogy: string;
  connectsTo?: string;
}

export interface ForgeDebuggingStep {
  id: string;
  stepNumber: number;
  title: string;
  action: string;
  verification: string;
  xpReward: number;
}

export interface ForgeCommandToken {
  token: string;
  role: 'binary' | 'subcommand' | 'flag' | 'argument' | 'pipe' | 'env';
  plainMeaning: string;
  safetyLevel: 'safe' | 'caution' | 'destructive';
}

export interface ForgeRefractionOutput {
  mode: ForgeMode;
  languageOrTool: string;
  headline: string;
  tldrSignal: string;
  vividMetaphor: string;
  dopamineHook: string;
  rootCause: string;
  legoBlocks: ForgeLegoBlock[];
  fixedCodeOrCommand: string;
  fixExplanation: string;
  debuggingQuest: ForgeDebuggingStep[];
  commandTokens: ForgeCommandToken[];
  keyTerms: string[];
  confidenceNote: string;
  usage: AiUsage;
  routeMeta: {
    tier: string;
    label: string;
    lane: string;
    fourTierEnabled: boolean;
    isLocalFallback: boolean;
    failureClass?: string;
    safetySignal?: boolean;
  };
}

export interface ForgePresetExample {
  id: string;
  mode: ForgeMode;
  title: string;
  badge: string;
  language: string;
  input: string;
}

export const FORGE_PRESET_EXAMPLES: readonly ForgePresetExample[] = [
  {
    id: 'excel-vlookup-ref',
    mode: 'stack_trace',
    title: 'Broken Excel / Sheet Formula (#REF! / VLOOKUP)',
    badge: 'Sheet Formula',
    language: 'Excel / Google Sheets',
    input: `=VLOOKUP(A2, SalesData!A:C, 4, FALSE)
Error: #REF! — Function VLOOKUP parameter 3 expects a column index between 1 and 3, but received 4.`,
  },
  {
    id: 'react-hydration-trace',
    mode: 'stack_trace',
    title: 'Angry Red Website Error (Cannot read map)',
    badge: 'Scary Error',
    language: 'TypeScript / React',
    input: `Unhandled Runtime Error
TypeError: Cannot read properties of undefined (reading 'map')
  at CourseDeckList (src/components/CourseDeckList.tsx:28:34)
Cause: The page tried to draw the list before the server finished sending the items.`,
  },
  {
    id: 'homework-retry-loop',
    mode: 'code_lego',
    title: 'Confusing Class Homework Loop',
    badge: 'Step-by-Step Code',
    language: 'TypeScript',
    input: `export async function executeWithRetry<T>(
  task: () => Promise<T>,
  retries = 3,
  baseDelayMs = 400
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await task();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** attempt));
    }
  }
  throw new Error('Could not complete after retries');
}`,
  },
  {
    id: 'terminal-safety-check',
    mode: 'terminal_cli',
    title: 'Check a Computer Command Before Running',
    badge: 'Command Check',
    language: 'Terminal CLI / Shell',
    input: `docker compose -f docker-compose.prod.yml logs --tail=150 --follow api-gateway | grep -i -E "error|timeout|502" | tee -a ./logs/gateway-incident.log`,
  },
] as const;

export function suggestForgeSnippetName(rawInput: string, languageOrTool?: string): string {
  const text = rawInput.trim();
  if (/VLOOKUP|XLOOKUP|INDEX\(|MATCH\(|#REF!|#N\/A|#VALUE!/i.test(text)) {
    const fn = text.match(/\b(VLOOKUP|XLOOKUP|SUMIFS|INDEX|IFERROR)\b/i)?.[1]?.toUpperCase();
    return fn ? `${fn} Sheet Formula Fix` : 'Spreadsheet Formula Fix';
  }
  if (/Cannot read properties of undefined|TypeError:/i.test(text)) {
    return 'Empty List Crash Fix';
  }
  if (/Traceback|RuntimeError|KeyError|ValueError/i.test(text)) {
    return 'Python Error Translation';
  }
  if (/^\s*docker\b/im.test(text)) {
    return 'Docker Log Command';
  }
  if (/^\s*git\b/im.test(text)) {
    return 'Git Command Safety Check';
  }
  if (/^\s*(?:npm|npx|yarn|pnpm)\b/im.test(text)) {
    return 'Package Command Note';
  }
  if (/\bSELECT\b[\s\S]*\bFROM\b/i.test(text)) {
    return 'SQL Query Breakdown';
  }
  const firstMeaningful = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[=#/*\s]+/, '').trim())
    .find((l) => l.length >= 4);
  if (firstMeaningful) {
    const cleaned = firstMeaningful.slice(0, 32).trim();
    return cleaned.length < firstMeaningful.length ? `${cleaned}…` : cleaned;
  }
  return languageOrTool ? `${languageOrTool} Note` : 'Saved Forge Note';
}

export function detectLanguageOrTool(rawInput: string, mode: ForgeMode): string {
  const text = rawInput.trim();
  if (/^=\s*[A-Z]{2,}\(|VLOOKUP|XLOOKUP|SUMIFS|#REF!|#N\/A|#VALUE!|#NAME\?/i.test(text)) {
    return 'Excel / Google Sheets';
  }
  if (/Traceback \(most recent call last\)|def\s+\w+|import\s+torch|RuntimeError:/i.test(text)) {
    return 'Python';
  }
  if (/TypeError:|ReferenceError:|Next\.js|react-dom|tsx:\d+|export\s+(?:async\s+)?function/i.test(text)) {
    return 'TypeScript / React';
  }
  if (/^\s*(?:docker|kubectl|git|npm|npx|curl|grep|awk|find|tar|ssh|psql)\b/im.test(text) || mode === 'terminal_cli') {
    return 'Terminal CLI / Shell';
  }
  if (/\b(?:SELECT|FROM|WHERE|JOIN|GROUP BY|INSERT INTO)\b/i.test(text)) {
    return 'SQL';
  }
  if (/\b(?:fn\s+\w+|let\s+mut|impl\s+|cargo\s+)\b/i.test(text)) {
    return 'Rust';
  }
  if (/\b(?:func\s+\w+|package\s+main|go\s+run)\b/i.test(text)) {
    return 'Go';
  }
  return mode === 'stack_trace' ? 'Runtime Stack Trace' : 'Source Code';
}

export function parseCommandTokensLocal(rawInput: string): ForgeCommandToken[] {
  const firstLine = rawInput
    .trim()
    .split(/\r?\n/)
    .find((line) => line.trim().length > 0 && !line.trim().startsWith('#'))
    || rawInput.trim();

  const rawParts =
    firstLine.match(/(?:\|\||&&|>>|\||;|>|[^\s"|';>]+|"[^"]*"|'[^']*')+/g) || [];
  if (rawParts.length === 0) {
    return [
      {
        token: 'command',
        role: 'binary',
        plainMeaning: 'Primary executable or shell entrypoint.',
        safetyLevel: 'safe',
      },
    ];
  }

  let expectBinary = true;
  return rawParts.slice(0, 14).map((part, idx): ForgeCommandToken => {
    const clean = part.trim();
    if (clean === '|' || clean === '&&' || clean === '||' || clean === ';' || clean === '>' || clean === '>>') {
      expectBinary = true;
      return {
        token: clean,
        role: 'pipe',
        plainMeaning:
          clean === '|'
            ? 'Pipes output from the left block directly into the next command block.'
            : clean === '&&'
              ? 'Runs the next command only if the previous block succeeded (exit code 0).'
              : 'Chains or redirects stream output to the next target.',
        safetyLevel: 'safe',
      };
    }

    if (/^[A-Z_][A-Z0-9_]*=/.test(clean)) {
      return {
        token: clean,
        role: 'env',
        plainMeaning: 'Sets an environment variable scoped to this command execution.',
        safetyLevel: 'safe',
      };
    }

    const isDestructive = /\b(?:rm|-rf|--force|--hard|drop|delete|kill|prune)\b/i.test(clean);
    const isCaution = /\b(?:sudo|chmod|chown|rebase|reset|prod|write|-f)\b/i.test(clean);
    const safetyLevel: ForgeCommandToken['safetyLevel'] = isDestructive
      ? 'destructive'
      : isCaution
        ? 'caution'
        : 'safe';

    if (expectBinary) {
      expectBinary = false;
      return {
        token: clean,
        role: 'binary',
        plainMeaning: `Launches the ${clean} program as the primary engine for this stage.`,
        safetyLevel,
      };
    }

    if (clean.startsWith('--') || clean.startsWith('-')) {
      return {
        token: clean,
        role: 'flag',
        plainMeaning: describeFlagMeaning(clean),
        safetyLevel,
      };
    }

    if (idx === 1 && /^[a-z][a-z0-9-]*$/i.test(clean)) {
      return {
        token: clean,
        role: 'subcommand',
        plainMeaning: `Executes the "${clean}" action mode inside the tool.`,
        safetyLevel,
      };
    }

    return {
      token: clean,
      role: 'argument',
      plainMeaning: `Target resource, path, or filter pattern (${clean}) passed into the command.`,
      safetyLevel,
    };
  });
}

function describeFlagMeaning(flag: string): string {
  const lower = flag.toLowerCase();
  if (lower.startsWith('--tail')) return 'Limits output to the most recent lines so your terminal is not flooded.';
  if (lower === '--follow' || lower === '-f') return 'Streams live output continuously or specifies an explicit config file.';
  if (lower === '-i' || lower === '--ignore-case') return 'Matches text case-insensitively (both uppercase and lowercase).';
  if (lower === '-e' || lower === '-E') return 'Enables extended pattern matching rules for multiple keywords.';
  if (lower === '-a' || lower === '--append') return 'Appends new output to the end of the file without erasing existing logs.';
  if (lower === '-r' || lower === '-R' || lower === '--recursive') return 'Walks through all nested folders and children recursively.';
  if (lower.includes('force') || lower.includes('hard')) return 'Overrides safety prompts and forces immediate execution. Verify backups first.';
  return `Modifier flag (${flag}) that customizes how this command block behaves.`;
}

export function buildLocalForgeRefraction(
  rawInput: string,
  mode: ForgeMode,
  options?: {
    blockedBySafety?: boolean;
    safetyReason?: string;
    failureClass?: string;
  },
): ForgeRefractionOutput {
  const usage = emptyUsage('local', LOCAL_FALLBACK_MODEL, {
    tier: 'tier4',
    label: LOCAL_FALLBACK_LABEL,
  });

  if (options?.blockedBySafety) {
    return {
      mode,
      languageOrTool: 'Safety Boundary Guard',
      headline: 'Protected Boundary: Secret or Instruction Override Blocked',
      tldrSignal:
        'Local Structural Refraction intercepted an untrusted override directive or credential disclosure request before any remote model call.',
      vividMetaphor:
        'Like a circuit breaker snapping shut the instant a voltage spike hits the workbench, keeping your vault and keys 100% sealed.',
      dopamineHook:
        'Zero secret leaks. Trim out the flagged line and your LEGO workbench is ready to roll.',
      rootCause:
        'Input contained a prompt-injection directive or request for protected environment keys.',
      legoBlocks: [
        {
          id: 'safety-block-1',
          stepNumber: 1,
          title: 'Pre-Flight Safety Gate',
          category: 'trigger',
          color: 'rose',
          codeFragment: 'evaluateSafetyBoundary(input)',
          plainMeaning: 'Scans input for secret extraction or system instruction overrides before network routing.',
          realWorldAnalogy: 'Airport security scanner checking luggage before boarding.',
          connectsTo: 'Local Isolation',
        },
        {
          id: 'safety-block-2',
          stepNumber: 2,
          title: 'Zero-Call Local Isolation',
          category: 'fix',
          color: 'emerald',
          codeFragment: 'attempts = 0 -> Local Structural Refraction',
          plainMeaning: 'Refunds credits and returns a safe local diagnostic with zero external API traffic.',
          realWorldAnalogy: 'A sealed glass vault door that stays locked while keeping the reading room open.',
        },
      ],
      fixedCodeOrCommand: '// Remove any "ignore previous instructions" or secret dump requests and paste your real stack trace or code snippet.',
      fixExplanation:
        'Dassah\'s Prism never discloses API keys, environment variables, or internal prompts. Paste standard code, stack traces, or terminal commands to refract them.',
      debuggingQuest: [
        {
          id: 'quest-safety-1',
          stepNumber: 1,
          title: 'Remove Override or Secret Request',
          action: 'Delete lines asking for API keys, .env values, or instruction overrides.',
          verification: 'Input contains only your actual stack trace, function, or CLI command.',
          xpReward: 25,
        },
      ],
      commandTokens: [],
      keyTerms: ['safety-boundary', 'local-structural-refraction', 'zero-secret-leaks'],
      confidenceNote:
        'Local structural refraction fallback; protected boundary enforced with zero remote calls.',
      usage,
      routeMeta: {
        tier: 'tier4',
        label: LOCAL_FALLBACK_LABEL,
        lane: 'forge',
        fourTierEnabled: isFourTierEnabled(),
        isLocalFallback: true,
        failureClass: options.failureClass || 'unsafe_boundary',
        safetySignal: true,
      },
    };
  }

  const languageOrTool = detectLanguageOrTool(rawInput, mode);
  const lines = rawInput
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const firstLine = lines[0] || 'Input snippet';
  const errorLine =
    lines.find((l) => /(?:Error|Exception|Traceback|Cannot read|failed|mismatch|panic|fatal)/i.test(l))
    || firstLine;
  const frameLines = lines.filter((l) => /^(?:at\s+|File\s+|in\s+)/i.test(l));
  const topFrame = frameLines[0] || lines[1] || firstLine;
  const commandTokens = parseCommandTokensLocal(rawInput);

  if (mode === 'stack_trace') {
    const isUndefinedRead = /Cannot read properties of (?:undefined|null)/i.test(rawInput);
    const isShapeMismatch = /shapes cannot be multiplied|dimension|shape/i.test(rawInput);

    const headline = isUndefinedRead
      ? 'Null or Undefined Value Reached a Method Call Before Initialization'
      : isShapeMismatch
        ? 'Tensor Matrix Dimensions Do Not Align at Linear Projection Layer'
        : `Runtime Fault Detected in ${languageOrTool}`;

    const rootCause = isUndefinedRead
      ? 'A component or function tried to call .map() or read a property on data that arrived as undefined or null on the first render pass.'
      : isShapeMismatch
        ? 'The incoming tensor width (inner dimension) does not match the weight matrix input dimension expected by the layer.'
        : `Execution halted at: ${cleanPlainProse(errorLine.slice(0, 180))}`;

    const fixedCode = isUndefinedRead
      ? `// Guard with optional chaining and a default empty array fallback:\nconst safeItems = Array.isArray(data?.items) ? data.items : [];\nreturn safeItems.map((item) => <Card key={item.id} item={item} />);`
      : isShapeMismatch
        ? `# Align projection input features with hidden_states last dimension (768 -> 256):\nself.projection = nn.Linear(in_features=768, out_features=256)\nlogits = self.projection(hidden_states)`
        : `// 1. Guard inputs at the entry frame (${topFrame.slice(0, 70)})\n// 2. Validate null/undefined or boundary shapes before invoking downstream methods.`;

    return {
      mode,
      languageOrTool,
      headline,
      tldrSignal: `Root fault isolated: ${cleanPlainProse(errorLine.slice(0, 160))}. Guard the upstream input at ${cleanPlainProse(topFrame.slice(0, 90))} before calling downstream operations.`,
      vividMetaphor:
        'Like a LEGO conveyor belt trying to snap a roof tile onto an empty baseplate slot before the foundation brick has arrived.',
      dopamineHook:
        'One guard clause at the entry brick turns a red wall of stack frames into a clean green build.',
      rootCause,
      legoBlocks: [
        {
          id: 'lego-1',
          stepNumber: 1,
          title: 'Upstream Data Arrival',
          category: 'input',
          color: 'cyan',
          codeFragment: lines[lines.length - 1]?.slice(0, 110) || firstLine.slice(0, 110),
          plainMeaning: 'Raw state, API payload, or tensor enters the execution pipeline without a defensive guard.',
          realWorldAnalogy: 'An unlabelled shipping box arriving at the assembly table.',
          connectsTo: 'Call Site Frame',
        },
        {
          id: 'lego-2',
          stepNumber: 2,
          title: 'Active Call Site Frame',
          category: 'transform',
          color: 'amber',
          codeFragment: topFrame.slice(0, 110),
          plainMeaning: 'This file and line number is the exact workbench location where your code touched the unguarded value.',
          realWorldAnalogy: 'The specific LEGO instruction page where two mismatched studs meet.',
          connectsTo: 'Runtime Crash Point',
        },
        {
          id: 'lego-3',
          stepNumber: 3,
          title: 'Runtime Fault Trigger',
          category: 'fault',
          color: 'rose',
          codeFragment: errorLine.slice(0, 110),
          plainMeaning: rootCause,
          realWorldAnalogy: 'The red warning light flashing when a gear teeth count does not match.',
          connectsTo: 'Snap-In Guard Fix',
        },
        {
          id: 'lego-4',
          stepNumber: 4,
          title: 'Snap-In Guard Brick',
          category: 'fix',
          color: 'emerald',
          codeFragment: fixedCode.split('\n').slice(-2).join(' '),
          plainMeaning: 'Validates shape or falls back to a safe default value so the pipeline never crashes.',
          realWorldAnalogy: 'Adding a stabilizer plate underneath the joint so every brick locks flush.',
        },
      ],
      fixedCodeOrCommand: fixedCode,
      fixExplanation:
        'By adding an explicit guard brick right before the crashing frame, invalid or not-yet-loaded data is normalized safely instead of throwing an unhandled exception.',
      debuggingQuest: [
        {
          id: 'quest-1',
          stepNumber: 1,
          title: 'Jump to the Top User Stack Frame',
          action: `Open the file referenced in "${cleanPlainProse(topFrame.slice(0, 90))}" (skip node_modules or internal library frames).`,
          verification: 'You can see the exact variable or parameter being accessed on that line.',
          xpReward: 30,
        },
        {
          id: 'quest-2',
          stepNumber: 2,
          title: 'Snap In the Defensive Guard Brick',
          action: 'Apply the fallback or dimension alignment shown in the Fixed Output block.',
          verification: 'The function handles empty, null, or boundary inputs without throwing.',
          xpReward: 45,
        },
        {
          id: 'quest-3',
          stepNumber: 3,
          title: 'Run & Lock In Regression Check',
          action: 'Re-run the failing route or test case with the empty/edge payload.',
          verification: 'Zero runtime exceptions and clean UI or tensor output.',
          xpReward: 50,
        },
      ],
      commandTokens,
      keyTerms: ['stack-frame', 'root-cause', 'defensive-guard', 'local-refraction'],
      confidenceNote:
        'Local Structural Refraction fallback active. Verify exact line numbers and variable names against your source file.',
      usage,
      routeMeta: {
        tier: 'tier4',
        label: LOCAL_FALLBACK_LABEL,
        lane: 'forge',
        fourTierEnabled: isFourTierEnabled(),
        isLocalFallback: true,
        failureClass: options?.failureClass || 'local_fallback',
      },
    };
  }

  if (mode === 'terminal_cli') {
    return {
      mode,
      languageOrTool,
      headline: 'Visual Pipeline Breakdown of Your Terminal Command',
      tldrSignal: `Splits "${cleanPlainProse(firstLine.slice(0, 100))}" into ${commandTokens.length} clear LEGO blocks so you can verify every flag, pipe, and file target before pressing Enter.`,
      vividMetaphor:
        'Like snapping transparent water pipes together: block 1 pumps the stream, block 2 filters the noise, and block 3 saves a clean copy.',
      dopamineHook:
        'Never paste a mystery terminal line blindly again. Every flag is now colour-coded and plain English.',
      rootCause:
        'Dense shell pipelines chain multiple programs and flags on one line, hiding destructive flags or stream redirects.',
      legoBlocks: commandTokens.slice(0, 5).map((tok, idx, arr) => ({
        id: `cli-lego-${idx + 1}`,
        stepNumber: idx + 1,
        title: `${tok.role.toUpperCase()} · ${tok.token.slice(0, 28)}`,
        category:
          tok.role === 'binary'
            ? 'trigger'
            : tok.role === 'flag'
              ? 'flag'
              : tok.role === 'pipe'
                ? 'transform'
                : 'output',
        color:
          tok.safetyLevel === 'destructive'
            ? 'rose'
            : tok.safetyLevel === 'caution'
              ? 'amber'
              : tok.role === 'binary'
                ? 'cyan'
                : tok.role === 'pipe'
                  ? 'blue'
                  : 'emerald',
        codeFragment: tok.token,
        plainMeaning: tok.plainMeaning,
        realWorldAnalogy:
          tok.role === 'binary'
            ? 'The power motor brick driving this stage.'
            : tok.role === 'pipe'
              ? 'A connector hose passing output into the next module.'
              : 'A control dial tuning how the module runs.',
        ...(idx < arr.length - 1 ? { connectsTo: arr[idx + 1].token } : {}),
      })),
      fixedCodeOrCommand: firstLine,
      fixExplanation:
        'Each token above has been inspected for safety. Green blocks are read-only or safe modifiers; amber or rose blocks modify files or production state.',
      debuggingQuest: [
        {
          id: 'cli-quest-1',
          stepNumber: 1,
          title: 'Inspect Target Paths & Flags',
          action: 'Check any amber or rose token cards in the Command Token Inspector.',
          verification: 'You confirm the command points to the right config file and directory.',
          xpReward: 30,
        },
        {
          id: 'cli-quest-2',
          stepNumber: 2,
          title: 'Run Dry-Run or Bounded Preview First',
          action: 'Execute with a bounded flag (such as --tail=50 or --dry-run) to confirm output shape.',
          verification: 'Terminal stream outputs expected lines cleanly.',
          xpReward: 45,
        },
      ],
      commandTokens,
      keyTerms: ['cli-pipeline', 'flags', 'stdout-pipe', 'sandbox-check'],
      confidenceNote:
        'Local Structural Refraction fallback active. Always verify file paths and environment context before running shell commands.',
      usage,
      routeMeta: {
        tier: 'tier4',
        label: LOCAL_FALLBACK_LABEL,
        lane: 'forge',
        fourTierEnabled: isFourTierEnabled(),
        isLocalFallback: true,
        failureClass: options?.failureClass || 'local_fallback',
      },
    };
  }

  // Default: code_lego mode
  const chunks = lines.slice(0, 8);
  const blockCount = Math.min(4, Math.max(2, chunks.length));
  const stepSize = Math.max(1, Math.ceil(lines.length / blockCount));
  const legoBlocks: ForgeLegoBlock[] = [];

  for (let i = 0; i < blockCount; i++) {
    const slice = lines.slice(i * stepSize, (i + 1) * stepSize).join('\n');
    const stepNo = i + 1;
    const category: LegoBlockCategory =
      i === 0 ? 'input' : i === blockCount - 1 ? 'output' : 'transform';
    const color: LegoBlockColor =
      i === 0 ? 'cyan' : i === blockCount - 1 ? 'emerald' : i === 1 ? 'blue' : 'amber';
    legoBlocks.push({
      id: `code-lego-${stepNo}`,
      stepNumber: stepNo,
      title:
        i === 0
          ? '1. Function Signature & Inputs'
          : i === blockCount - 1
            ? `${stepNo}. Return Value & Exit Guarantee`
            : `${stepNo}. Core Logic & State Transform`,
      category,
      color,
      codeFragment: slice.slice(0, 140) || firstLine.slice(0, 140),
      plainMeaning:
        i === 0
          ? 'Accepts caller parameters and sets safe default boundaries before execution begins.'
          : i === blockCount - 1
            ? 'Delivers the resolved output or surfaces an explicit error if all attempts fail.'
            : 'Transforms intermediate state, handles branching conditions, and manages async timing.',
      realWorldAnalogy:
        i === 0
          ? 'The intake hopper where raw LEGO bricks are sorted by size.'
          : i === blockCount - 1
            ? 'The finished quality-checked module rolling off the assembly line.'
            : 'A geared turntable brick that routes pieces to the right track.',
      ...(i < blockCount - 1 ? { connectsTo: `Stage ${stepNo + 1}` } : {}),
    });
  }

  return {
    mode: 'code_lego',
    languageOrTool,
    headline: `Visual LEGO Brick Architecture for ${languageOrTool}`,
    tldrSignal: `Deconstructs this ${lines.length}-line ${languageOrTool} routine into ${legoBlocks.length} snap-together logic blocks: intake signature, core transformation loop, and output guarantee.`,
    vividMetaphor:
      'Like a self-resetting pinball bumper: if a ball misses the ramp on attempt one, it waits a beat with exponential backoff and launches again.',
    dopamineHook:
      'Instead of reading 15 lines of nested braces at once, trace 4 colour-coded LEGO bricks from top to bottom.',
    rootCause:
      'Dense control flow mixes happy-path execution with error recovery and timing math inside the same block.',
    legoBlocks,
    fixedCodeOrCommand: rawInput.trim(),
    fixExplanation:
      'Each LEGO block above isolates one responsibility so you can reason about inputs, state transitions, and failure exits independently.',
    debuggingQuest: [
      {
        id: 'code-quest-1',
        stepNumber: 1,
        title: 'Verify Input Contracts at Block 1',
        action: 'Check the parameters and default values entering the first LEGO brick.',
        verification: 'All inputs have explicit types or safe default values.',
        xpReward: 30,
      },
      {
        id: 'code-quest-2',
        stepNumber: 2,
        title: 'Trace the Middle Transform Loop',
        action: 'Follow the connector arrow from Block 1 through the middle transform bricks.',
        verification: 'Every branch either returns a valid value or advances toward termination.',
        xpReward: 40,
      },
      {
        id: 'code-quest-3',
        stepNumber: 3,
        title: 'Confirm the Final Exit Brick',
        action: 'Inspect the last LEGO block to verify what happens when retries or branches finish.',
        verification: 'Callers always receive a typed result or a clear error message.',
        xpReward: 45,
      },
    ],
    commandTokens,
    keyTerms: ['input-contract', 'control-flow', 'error-boundary', 'lego-architecture'],
    confidenceNote:
      'Local Structural Refraction fallback active. Verify edge cases and types in your IDE.',
    usage,
    routeMeta: {
      tier: 'tier4',
      label: LOCAL_FALLBACK_LABEL,
      lane: 'forge',
      fourTierEnabled: isFourTierEnabled(),
      isLocalFallback: true,
      failureClass: options?.failureClass || 'local_fallback',
    },
  };
}

function buildForgeAiPrompt(rawInput: string, mode: ForgeMode): string {
  const modeFocus =
    mode === 'stack_trace'
      ? 'MODE: Stack Trace & Error Refractor. Isolate the exact root cause, translate each stack frame / failure stage into visual LEGO bricks, provide a clean working code fix, and create a 3-step debugging quest.'
      : mode === 'terminal_cli'
        ? 'MODE: Terminal & CLI Command Explainer. Break every binary, subcommand, flag, pipe, and argument into visual LEGO bricks and commandTokens with safety levels (safe | caution | destructive), plus a safe verification quest.'
        : 'MODE: Code & Docs to Visual LEGO Brick Logic. Deconstruct this code or technical documentation into 3 to 5 snap-together LEGO bricks showing data flow, plain-English meaning, and vivid everyday analogies.';

  return [
    'You are "Prism Forge", the developer & engineering cognitive refractor inside Dassah\'s Prism Engine.',
    UNTRUSTED_DATA_BOUNDARY_INSTRUCTION,
    modeFocus,
    'Write in clean, natural plain English. NEVER use markdown asterisks (* or **), hashes (#), backticks in prose strings, or decorative em-dashes. Never use the words "sovereign" or "divine".',
    'Output ONLY a single valid JSON object matching these exact keys (zero markdown fences):',
    '{',
    '  "languageOrTool": "Detected language or CLI tool name",',
    '  "headline": "Crisp 5-10 word title of what this code/trace does or why it failed",',
    '  "tldrSignal": "1-2 sentences stripping 80% of noise into the core engineering takeaway",',
    '  "vividMetaphor": "1 vivid everyday physical LEGO / workshop analogy (max 22 words)",',
    '  "dopamineHook": "1 short, encouraging momentum spark (max 16 words)",',
    '  "rootCause": "1 clear sentence explaining the core bug, bottleneck, or architectural heart",',
    '  "legoBlocks": [',
    '    {',
    '      "stepNumber": 1,',
    '      "title": "Short 2-5 word brick title",',
    '      "category": "trigger | input | transform | fault | fix | output | flag",',
    '      "color": "cyan | emerald | amber | rose | blue | teal",',
    '      "codeFragment": "Exact short code line, frame, or flag for this brick",',
    '      "plainMeaning": "1-2 plain English sentences explaining what this brick does",',
    '      "realWorldAnalogy": "1 short everyday analogy for this specific brick",',
    '      "connectsTo": "Name of the next brick"',
    '    }',
    '  ],',
    '  "fixedCodeOrCommand": "Clean, ready-to-copy fixed code snippet or safe CLI command",',
    '  "fixExplanation": "1-2 sentences explaining why this fix or pattern works reliably",',
    '  "debuggingQuest": [',
    '    {',
    '      "stepNumber": 1,',
    '      "title": "Short quest step title",',
    '      "action": "Concrete action to take in IDE or terminal",',
    '      "verification": "How to verify this step succeeded",',
    '      "xpReward": 35',
    '    }',
    '  ],',
    '  "keyTerms": ["term1", "term2", "term3"],',
    '  "confidenceNote": "Brief reminder to verify types, paths, or line numbers against source"',
    '}',
    '--- BEGIN UNTRUSTED SOURCE DATA ---',
    rawInput,
    '--- END UNTRUSTED SOURCE DATA ---',
  ].join('\n');
}

const VALID_CATEGORIES = new Set<LegoBlockCategory>([
  'trigger',
  'input',
  'transform',
  'fault',
  'fix',
  'output',
  'flag',
]);

const VALID_COLORS = new Set<LegoBlockColor>([
  'cyan',
  'emerald',
  'amber',
  'rose',
  'blue',
  'teal',
]);

function normalizeAiForgePayload(
  parsed: Record<string, unknown>,
  rawInput: string,
  mode: ForgeMode,
  usage: AiUsage,
): ForgeRefractionOutput {
  const fallback = buildLocalForgeRefraction(rawInput, mode);

  const rawBlocks = Array.isArray(parsed.legoBlocks) ? parsed.legoBlocks : [];
  const legoBlocks: ForgeLegoBlock[] =
    rawBlocks.length >= 2
      ? rawBlocks.slice(0, 6).map((b, idx) => {
          const item = (b && typeof b === 'object' ? b : {}) as Record<string, unknown>;
          const catRaw = String(item.category || '').toLowerCase() as LegoBlockCategory;
          const colorRaw = String(item.color || '').toLowerCase() as LegoBlockColor;
          return {
            id: `ai-lego-${idx + 1}`,
            stepNumber: idx + 1,
            title: cleanPlainProse(String(item.title || `Block ${idx + 1}`)).slice(0, 80),
            category: VALID_CATEGORIES.has(catRaw) ? catRaw : idx === 0 ? 'input' : 'transform',
            color: VALID_COLORS.has(colorRaw) ? colorRaw : idx === 0 ? 'cyan' : 'emerald',
            codeFragment: String(item.codeFragment || '').trim().slice(0, 180) || fallback.legoBlocks[0].codeFragment,
            plainMeaning:
              cleanPlainProse(String(item.plainMeaning || '')).slice(0, 260)
              || fallback.legoBlocks[0].plainMeaning,
            realWorldAnalogy:
              cleanPlainProse(String(item.realWorldAnalogy || '')).slice(0, 200)
              || fallback.legoBlocks[0].realWorldAnalogy,
            ...(typeof item.connectsTo === 'string' && item.connectsTo.trim()
              ? { connectsTo: cleanPlainProse(item.connectsTo).slice(0, 60) }
              : {}),
          };
        })
      : fallback.legoBlocks;

  const rawQuests = Array.isArray(parsed.debuggingQuest) ? parsed.debuggingQuest : [];
  const debuggingQuest: ForgeDebuggingStep[] =
    rawQuests.length >= 1
      ? rawQuests.slice(0, 4).map((q, idx) => {
          const item = (q && typeof q === 'object' ? q : {}) as Record<string, unknown>;
          return {
            id: `ai-quest-${idx + 1}`,
            stepNumber: idx + 1,
            title: cleanPlainProse(String(item.title || `Step ${idx + 1}`)).slice(0, 80),
            action:
              cleanPlainProse(String(item.action || '')).slice(0, 240)
              || fallback.debuggingQuest[0].action,
            verification:
              cleanPlainProse(String(item.verification || '')).slice(0, 200)
              || fallback.debuggingQuest[0].verification,
            xpReward: Number.isFinite(Number(item.xpReward))
              ? Math.max(15, Math.min(100, Math.round(Number(item.xpReward))))
              : 35,
          };
        })
      : fallback.debuggingQuest;

  const rawTerms = Array.isArray(parsed.keyTerms)
    ? parsed.keyTerms.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    : [];

  return {
    mode,
    languageOrTool:
      cleanPlainProse(String(parsed.languageOrTool || '')).slice(0, 60) || fallback.languageOrTool,
    headline: cleanPlainProse(String(parsed.headline || '')).slice(0, 140) || fallback.headline,
    tldrSignal: cleanPlainProse(String(parsed.tldrSignal || '')).slice(0, 320) || fallback.tldrSignal,
    vividMetaphor:
      cleanPlainProse(String(parsed.vividMetaphor || '')).slice(0, 220) || fallback.vividMetaphor,
    dopamineHook:
      cleanPlainProse(String(parsed.dopamineHook || '')).slice(0, 180) || fallback.dopamineHook,
    rootCause: cleanPlainProse(String(parsed.rootCause || '')).slice(0, 260) || fallback.rootCause,
    legoBlocks,
    fixedCodeOrCommand:
      String(parsed.fixedCodeOrCommand || '').trim().slice(0, 4000) || fallback.fixedCodeOrCommand,
    fixExplanation:
      cleanPlainProse(String(parsed.fixExplanation || '')).slice(0, 300) || fallback.fixExplanation,
    debuggingQuest,
    commandTokens: fallback.commandTokens,
    keyTerms:
      rawTerms.length > 0 ? rawTerms.slice(0, 6).map((t) => cleanPlainProse(t)) : fallback.keyTerms,
    confidenceNote:
      cleanPlainProse(String(parsed.confidenceNote || '')).slice(0, 220) || fallback.confidenceNote,
    usage,
    routeMeta: {
      tier: usage.tier || 'tier1',
      label: usage.label || 'Groq · Tier 1',
      lane: 'forge',
      fourTierEnabled: isFourTierEnabled(),
      isLocalFallback: false,
    },
  };
}

export async function refractWithPrismForge(input: {
  text: string;
  mode: ForgeMode;
  preferredProvider?: ProviderPreference;
}): Promise<ForgeRefractionOutput> {
  const rawText = String(input.text || '').trim();
  const mode: ForgeMode =
    input.mode === 'stack_trace' || input.mode === 'code_lego' || input.mode === 'terminal_cli'
      ? input.mode
      : 'stack_trace';

  // 1. Pre-flight safety boundary guard
  const safety = evaluateSafetyBoundary({ text: rawText });
  if (!safety.safe) {
    return buildLocalForgeRefraction(rawText, mode, {
      blockedBySafety: true,
      safetyReason: safety.reason,
      failureClass: 'unsafe_boundary',
    });
  }

  // 2. Call Best-First Infinite Cascade (Mistral Pool -> Gemini -> OpenRouter Free Pool -> Groq -> Local)
  try {
    const prompt = buildForgeAiPrompt(rawText, mode);
    const completion = await callPrismCompletion(
      prompt,
      input.preferredProvider || 'auto',
      undefined,
      true,
    );

    if (
      !completion.text
      || completion.usage.provider === 'local'
      || !evaluateOutputSafety(completion.text).safe
    ) {
      return buildLocalForgeRefraction(rawText, mode, {
        failureClass: !evaluateOutputSafety(completion.text || '').safe
          ? 'output_safety_scrubbed'
          : 'all_remote_exhausted',
      });
    }

    const parsed = parseStrictJsonObject(completion.text);
    if (!parsed.ok) {
      return buildLocalForgeRefraction(rawText, mode, {
        failureClass: 'schema_fallback',
      });
    }

    const normalized = normalizeAiForgePayload(parsed.value, rawText, mode, completion.usage);
    if (!evaluateOutputSafety(JSON.stringify(normalized)).safe) {
      return buildLocalForgeRefraction(rawText, mode, {
        failureClass: 'output_safety_scrubbed',
      });
    }
    return normalized;
  } catch {
    return buildLocalForgeRefraction(rawText, mode, {
      failureClass: 'provider_exception',
    });
  }
}

export async function askDjForgePairProgrammer(input: {
  question: string;
  forgeContext: string;
  history?: Array<{ role: string; text: string }>;
  previousInteractionId?: string;
}): Promise<{
  reply: string;
  usage: AiUsage;
  interactionId?: string;
  isLocalFallback: boolean;
}> {
  const question = String(input.question || '').trim();
  const context = String(input.forgeContext || '').trim().slice(0, 6000);

  const safety = evaluateSafetyBoundary({
    text: question,
    context,
    question,
  });

  if (!safety.safe) {
    return {
      reply:
        'Local Structural Refraction (Safety Boundary): I cannot reveal API keys, environment variables, or override system instructions. Ask me about a stack frame, LEGO block, or code fix instead.',
      usage: emptyUsage('local', LOCAL_FALLBACK_MODEL, {
        tier: 'tier4',
        label: LOCAL_FALLBACK_LABEL,
      }),
      isLocalFallback: true,
    };
  }

  const systemInstruction = [
    'You are Ask DJ, a warm, razor-sharp pair programmer inside Prism Forge (powered by Dassah\'s Prism Engine).',
    'Help the user understand stack traces, code blocks, and terminal commands using visual LEGO brick analogies and concrete fixes.',
    'Write in clean plain English paragraphs or numbered steps (1. 2. 3.) only. NEVER use markdown asterisks (* or **), hashes (#), or decorative em-dashes. Never use the words "sovereign" or "divine".',
    UNTRUSTED_DATA_BOUNDARY_INSTRUCTION,
    context ? `CURRENT PRISM FORGE WORKBENCH CONTEXT:\n${context}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    // Primary: Gemini Interactions SDK (@google/genai with previousInteractionId to save tokens),
    // cascading automatically to Mistral Pool -> OpenRouter Free Pool -> Groq -> Local
    const result = await callPrismChat(
      question,
      input.history || [],
      systemInstruction,
      'gemini',
      input.previousInteractionId,
    );

    if (!result.text || !evaluateOutputSafety(result.text).safe) {
      return {
        reply:
          'Local Structural Refraction: Check the red Fault Brick and green Fix Brick on your workbench first, then verify the variable types at the top user stack frame.',
        usage: emptyUsage('local', LOCAL_FALLBACK_MODEL, {
          tier: 'tier4',
          label: LOCAL_FALLBACK_LABEL,
        }),
        isLocalFallback: true,
      };
    }

    return {
      reply: cleanPlainProse(result.text),
      usage: result.usage,
      ...(result.interactionId ? { interactionId: result.interactionId } : {}),
      isLocalFallback: result.usage.provider === 'local',
    };
  } catch {
    return {
      reply:
        'Local Structural Refraction: Remote pair-programming models are temporarily resting. Start with Step 1 of your Guided Debugging Quest and verify the guard brick input.',
      usage: emptyUsage('local', LOCAL_FALLBACK_MODEL, {
        tier: 'tier4',
        label: LOCAL_FALLBACK_LABEL,
      }),
      isLocalFallback: true,
    };
  }
}

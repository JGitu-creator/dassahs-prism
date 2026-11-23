import {
  emptyUsage,
  parseStrictProviderUsage,
  type AiProvider,
  type AiUsage,
  type ProviderPreference,
} from '../ai-usage.ts';
import {
  buildLaneMessages,
  buildLocalFallbackData,
  evaluateOutputSafety,
  evaluateSafetyBoundary,
  getResponseFormatForLane,
  parseStrictJsonObject,
  validateLanePayload,
  type ChatOutput,
  type FocusCoreOutput,
  type LaneOutput,
  type LensOutput,
  type PlayCardOutput,
  type PrismLane,
  type SafetyBoundaryResult,
  type StructuredPrismLane,
} from './prism-contracts.ts';

/**
 * Prism tiers. 'pool' is the open-ended OpenRouter free-model pool that sits
 * between the fixed remote tiers (Groq → Groq → Gemini) and the local fallback,
 * turning the cascade into an extensible "backup of backup" chain.
 */
export type PrismTier = 'tier1' | 'tier2' | 'tier3' | 'pool' | 'tier4';
export type RemotePrismTier = 'tier1' | 'tier2' | 'tier3';

export const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
export const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';

export const DEFAULT_GROQ_TIER1_MODEL = 'openai/gpt-oss-20b';
export const DEFAULT_GROQ_TIER2_MODEL = 'openai/gpt-oss-120b';
export const DEFAULT_TIER3_GEMINI_MODEL = 'gemini-2.0-flash';
export const LOCAL_FALLBACK_MODEL = 'local-fallback';
export const LOCAL_FALLBACK_LABEL = 'Local Structural Refraction';

export const TIER1_LABEL = 'Groq · Tier 1';
export const TIER2_LABEL = 'Groq · Tier 2';
export const TIER3_LABEL = 'Gemini';
export const POOL_LABEL = 'OpenRouter · Free Pool';

/**
 * Seed list of OpenRouter free models that advertised structured output in the
 * live catalog (checked 22 Nov 2026). Operators can prepend their own list via
 * OPENROUTER_FREE_MODELS (comma separated); the live catalog is also discovered
 * at runtime so new free models join the pool without a code change.
 */
export const DEFAULT_OPENROUTER_FREE_POOL: readonly string[] = [
  'baidu/ernie-5.5-flash-preview:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'google/gemma-4-31b-it:free',
  'particle-ai/particle-1:free',
];
const DEFAULT_OPENROUTER_VISION_MODELS: readonly string[] = [
  'nvidia/nemotron-3.5-super-vl:free',
  'google/gemma-4-31b-it:free',
  'particle-ai/particle-1:free',
];
const DEFAULT_POOL_MAX_MODELS = 4;
const POOL_TOTAL_DEADLINE_MS = 45_000;
const POOL_PER_MODEL_TIMEOUT_MS = 12_000;
const CATALOG_TTL_MS = 60 * 60 * 1000;

export type ModelCapabilityEntry = {
  provider: AiProvider;
  model: string;
  tier: PrismTier | 'deferred';
  supportsStrictJsonSchema: boolean;
  supportsVision: boolean;
  approvedForProduction: boolean;
  deferredReason?: string;
};

const DEFERRED_GROQ_VISION_MODEL = ['qwen', 'qwen3.8-27b'].join('/');
const DEFERRED_OPENROUTER_FREE_MODEL = ['openrouter', 'free'].join('/');

export const PRISM_CAPABILITY_MATRIX: readonly ModelCapabilityEntry[] = [
  {
    provider: 'groq',
    model: DEFAULT_GROQ_TIER1_MODEL,
    tier: 'tier1',
    supportsStrictJsonSchema: true,
    supportsVision: false,
    approvedForProduction: true,
  },
  {
    provider: 'groq',
    model: DEFAULT_GROQ_TIER2_MODEL,
    tier: 'tier2',
    supportsStrictJsonSchema: true,
    supportsVision: false,
    approvedForProduction: true,
  },
  {
    provider: 'gemini',
    model: DEFAULT_TIER3_GEMINI_MODEL,
    tier: 'tier3',
    supportsStrictJsonSchema: true,
    supportsVision: true,
    approvedForProduction: true,
  },
  ...DEFAULT_OPENROUTER_FREE_POOL.map((model): ModelCapabilityEntry => ({
    provider: 'openrouter',
    model,
    tier: 'pool',
    supportsStrictJsonSchema: true,
    supportsVision: DEFAULT_OPENROUTER_VISION_MODELS.includes(model),
    approvedForProduction: true,
  })),
  {
    provider: 'groq',
    model: DEFERRED_GROQ_VISION_MODEL,
    tier: 'deferred',
    supportsStrictJsonSchema: false,
    supportsVision: false,
    approvedForProduction: false,
    deferredReason: 'deferred_visual_faithfulness_false_and_preview_instability',
  },
  {
    provider: 'openrouter',
    model: DEFERRED_OPENROUTER_FREE_MODEL,
    tier: 'deferred',
    supportsStrictJsonSchema: false,
    supportsVision: false,
    approvedForProduction: false,
    deferredReason: 'zero_of_four_schema_validity_in_screening',
  },
  {
    provider: 'local',
    model: LOCAL_FALLBACK_MODEL,
    tier: 'tier4',
    supportsStrictJsonSchema: true,
    supportsVision: false,
    approvedForProduction: true,
  },
] as const;

export const PROVIDER_CAPABILITY_MATRIX = PRISM_CAPABILITY_MATRIX;

const FORBIDDEN_FOUR_TIER_MODEL_PATTERNS: readonly RegExp[] = [
  /^openrouter\/free$/i,
  /^qwen\/qwen3\.8-27b$/i,
  /^apodex\//i,
  /^inclusionai\//i,
];

function sanitizeApprovedModel(candidate: string | undefined, fallback: string): string {
  const trimmed = candidate?.trim();
  if (!trimmed) return fallback;
  for (const forbidden of FORBIDDEN_FOUR_TIER_MODEL_PATTERNS) {
    if (forbidden.test(trimmed)) return fallback;
  }
  return trimmed;
}

/**
 * Infinite-Tier Orchestrator activation check.
 * Enabled ON by default (Groq Tier 1 -> Groq Tier 2 -> Gemini 2.0 Flash -> OpenRouter Free Pool -> Local Refraction).
 * Operators can explicitly disable via PRISM_FOUR_TIER_ENABLED=false as an emergency kill-switch.
 */
export function isFourTierEnabled(env: Record<string, string | undefined> = process.env): boolean {
  const raw = env.PRISM_FOUR_TIER_ENABLED;
  if (raw === undefined) return true;
  return raw === 'true';
}

export function getGroqTier1Model(env: Record<string, string | undefined> = process.env): string {
  return sanitizeApprovedModel(env.GROQ_TIER1_MODEL, DEFAULT_GROQ_TIER1_MODEL);
}

export function getGroqTier2Model(env: Record<string, string | undefined> = process.env): string {
  return sanitizeApprovedModel(env.GROQ_TIER2_MODEL, DEFAULT_GROQ_TIER2_MODEL);
}

export function getTier3GeminiModel(env: Record<string, string | undefined> = process.env): string {
  return sanitizeApprovedModel(env.GEMINI_TIER3_MODEL, DEFAULT_TIER3_GEMINI_MODEL);
}

export type FourTierHealthMetadata = {
  fourTierEnabled: boolean;
  groqModels: {
    tier1: string;
    tier2: string;
  };
  tier3Model: string;
  multimodalLane: 'tier3_gemini';
  groqVisionDeferred: true;
  openRouterPool: {
    enabled: boolean;
    seedModels: string[];
    dynamicDiscovery: boolean;
  };
  providers: {
    groq: boolean;
    openrouter: boolean;
    gemini: boolean;
    local: true;
  };
};

/**
 * Safe non-secret routing telemetry for /api/health.
 * Returns boolean-only readiness flags; never exposes key values.
 */
export function getFourTierHealthMetadata(
  env: Record<string, string | undefined> = process.env,
): FourTierHealthMetadata {
  const openRouterReady = Boolean(getOpenRouterKey(env));
  return {
    fourTierEnabled: isFourTierEnabled(env),
    groqModels: {
      tier1: getGroqTier1Model(env),
      tier2: getGroqTier2Model(env),
    },
    tier3Model: getTier3GeminiModel(env),
    multimodalLane: 'tier3_gemini',
    groqVisionDeferred: true,
    openRouterPool: {
      enabled: openRouterReady && env.OPENROUTER_POOL_ENABLED !== 'false',
      seedModels: getConfiguredPoolSeed(env),
      dynamicDiscovery: env.OPENROUTER_DYNAMIC_DISCOVERY !== 'false',
    },
    providers: {
      groq: Boolean(env.GROQ_API_KEY?.trim()),
      openrouter: openRouterReady,
      gemini: Boolean(env.GEMINI_API_KEY?.trim()),
      local: true,
    },
  };
}

// ---------------------------------------------------------------------------
// OpenRouter Free Pool (open-ended "backup of backup" tier)
// ---------------------------------------------------------------------------

function getOpenRouterKey(env: Record<string, string | undefined>): string {
  return (env.OPENROUTER_API_KEY || env.ROUTER_API_KEY || '').trim();
}

function isAllowedPoolModel(model: string): boolean {
  if (!model || !model.includes('/')) return false;
  return !FORBIDDEN_FOUR_TIER_MODEL_PATTERNS.some((re) => re.test(model));
}

function getConfiguredPoolSeed(env: Record<string, string | undefined>): string[] {
  const fromEnv = (env.OPENROUTER_FREE_MODELS || '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  return Array.from(new Set([...fromEnv, ...DEFAULT_OPENROUTER_FREE_POOL])).filter(isAllowedPoolModel);
}

type CatalogModel = { id: string; structured: boolean; vision: boolean };
let catalogCache: { at: number; models: CatalogModel[] } | null = null;

/** Test hook: clears the cached OpenRouter catalog. */
export function resetOpenRouterCatalogCache(): void {
  catalogCache = null;
}

async function discoverOpenRouterFreeModels(
  fetchImpl: typeof fetch,
  nowMs: number,
): Promise<CatalogModel[]> {
  if (catalogCache && nowMs - catalogCache.at < CATALOG_TTL_MS) return catalogCache.models;
  try {
    const response = await fetchWithTimeout(fetchImpl, OPENROUTER_MODELS_URL, { method: 'GET' }, 4000);
    if (!response.ok) return catalogCache?.models ?? [];
    const body = (await response.json()) as { data?: Array<Record<string, unknown>> };
    const models: CatalogModel[] = (Array.isArray(body?.data) ? body.data : [])
      .map((m) => {
        const id = typeof m.id === 'string' ? m.id : '';
        const params = Array.isArray(m.supported_parameters) ? (m.supported_parameters as string[]) : [];
        const arch = (m.architecture && typeof m.architecture === 'object' ? m.architecture : {}) as Record<string, unknown>;
        const inputs = Array.isArray(arch.input_modalities) ? (arch.input_modalities as string[]) : [];
        return {
          id,
          structured: params.includes('structured_outputs') || params.includes('response_format'),
          vision: inputs.includes('image'),
        };
      })
      .filter((m) => m.id.endsWith(':free') && m.structured && isAllowedPoolModel(m.id));
    catalogCache = { at: nowMs, models };
    return models;
  } catch {
    return catalogCache?.models ?? [];
  }
}

async function resolvePoolModels(args: {
  env: Record<string, string | undefined>;
  fetchImpl: typeof fetch;
  nowMs: number;
  needsVision: boolean;
}): Promise<string[]> {
  const seed = getConfiguredPoolSeed(args.env);
  const discovered = args.env.OPENROUTER_DYNAMIC_DISCOVERY === 'false'
    ? []
    : await discoverOpenRouterFreeModels(args.fetchImpl, args.nowMs);
  const visionSet = new Set([
    ...DEFAULT_OPENROUTER_VISION_MODELS,
    ...discovered.filter((m) => m.vision).map((m) => m.id),
  ]);
  const ordered = Array.from(new Set([...seed, ...discovered.map((m) => m.id)]));
  const eligible = args.needsVision ? ordered.filter((m) => visionSet.has(m)) : ordered;
  const maxModels = Math.max(1, Math.min(12, Number(args.env.OPENROUTER_POOL_MAX) || DEFAULT_POOL_MAX_MODELS));
  return eligible.slice(0, maxModels);
}

async function callOpenRouterCandidate(args: {
  fetchImpl: typeof fetch;
  apiKey: string;
  model: string;
  lane: PrismLane;
  request: FourTierRequest;
  maxOutputTokens: number;
  timeoutMs: number;
}): Promise<RemoteCallResult> {
  const messages: Array<Record<string, unknown>> = buildLaneMessages(args.lane, {
    text: args.request.text,
    context: args.request.context,
    history: args.request.history,
    systemInstruction: args.request.systemInstruction,
    cognitiveMode: args.request.cognitiveMode,
    simplicityLevel: args.request.simplicityLevel,
    isStory: args.request.isStory,
    missionGoal: args.request.missionGoal,
    hasImage: Boolean(args.request.image),
  }).map((m) => ({ ...m }));

  if (args.request.image && messages.length > 0) {
    const last = messages[messages.length - 1];
    last.content = [
      { type: 'text', text: String(last.content ?? '') },
      {
        type: 'image_url',
        image_url: { url: `data:${args.request.image.mimeType};base64,${args.request.image.data}` },
      },
    ];
  }

  const payload: Record<string, unknown> = {
    model: args.model,
    messages,
    temperature: args.lane === 'chat' ? 0.4 : 0.2,
    max_tokens: args.maxOutputTokens,
    stream: false,
    usage: { include: true },
  };
  if (args.lane !== 'chat') {
    payload.response_format = getResponseFormatForLane(args.lane);
  }

  try {
    const response = await fetchWithTimeout(
      args.fetchImpl,
      OPENROUTER_CHAT_COMPLETIONS_URL,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${args.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://dassahs-prism.vercel.app',
          'X-Title': "Dassah's Prism Engine",
        },
        body: JSON.stringify(payload),
      },
      args.timeoutMs,
    );
    const retryAfterMs = parseRetryAfterMs(response.headers?.get?.('retry-after') ?? null);
    if (!response.ok) return { status: response.status, retryAfterMs };
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return { status: 200, text: '', rawUsage: undefined };
    }
    const record = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
    const choices = Array.isArray(record.choices) ? record.choices : [];
    const firstChoice = (choices[0] && typeof choices[0] === 'object' ? choices[0] : {}) as Record<string, unknown>;
    const message = (firstChoice.message && typeof firstChoice.message === 'object'
      ? firstChoice.message
      : {}) as Record<string, unknown>;
    const content = typeof message.content === 'string' ? message.content : '';
    return {
      status: response.status,
      text: content,
      rawUsage: record.usage,
      resolvedModel: typeof record.model === 'string' && record.model.trim() ? record.model.trim() : args.model,
    };
  } catch (error) {
    return { error };
  }
}

// ---------------------------------------------------------------------------
// Complexity Classification (Tier 1 vs Deliberate Tier 2 Escalation)
// ---------------------------------------------------------------------------

export type ComplexityOptions = {
  forceTier2?: boolean;
  cognitiveMode?: string;
  simplicityLevel?: string;
  safetySignal?: boolean;
  safe?: boolean;
};

export type ComplexityInput = { text: string } & ComplexityOptions;

export type ComplexityClassification = {
  level: 'fast' | 'complex';
  recommendedTier: 'tier1' | 'tier2';
  wordCount: number;
  reasons: string[];
};

export function classifyComplexity(
  textOrInput: string | ComplexityInput,
  options?: ComplexityOptions,
): ComplexityClassification {
  const text = typeof textOrInput === 'string' ? textOrInput : textOrInput.text;
  const opts: ComplexityOptions = typeof textOrInput === 'string'
    ? (options ?? {})
    : textOrInput;

  const trimmed = (text || '').trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const sentences = trimmed
    ? trimmed.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean)
    : [];
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : wordCount;
  const paragraphs = trimmed
    ? trimmed.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).length
    : 0;

  const reasons: string[] = [];

  if (opts.forceTier2) {
    reasons.push('force_tier2');
  }
  if (trimmed.length > 6000 || wordCount >= 1200) {
    reasons.push('long_document');
  }
  if (opts.simplicityLevel === 'detailed' && wordCount >= 300) {
    reasons.push('detailed_complexity');
  }
  if (paragraphs > 12) {
    reasons.push('multi_section_structure');
  }
  if (avgSentenceLength >= 26 && wordCount >= 350) {
    reasons.push('high_sentence_density');
  }

  const complex = reasons.length > 0;
  return {
    level: complex ? 'complex' : 'fast',
    recommendedTier: complex ? 'tier2' : 'tier1',
    wordCount,
    reasons,
  };
}

// ---------------------------------------------------------------------------
// Fail-Closed Failure-Class Policy
// ---------------------------------------------------------------------------

export type FailureClass =
  | 'none'
  | 'transient_429'
  | 'transient_5xx'
  | 'transient_timeout'
  | 'deterministic_schema'
  | 'missing_usage'
  | 'over_budget'
  | 'unsafe_boundary'
  | 'auth_or_config';

export type FailureDecision = 'tier_accepted' | 'next_tier' | 'candidate_failed';

export type TierDecision =
  | 'tier1_accepted'
  | 'tier2_accepted'
  | 'tier3_accepted'
  | 'next_tier'
  | 'candidate_failed';

export type ClassifyFailureInput = {
  status?: number;
  error?: unknown;
  schemaValid?: boolean;
  hasValidUsage?: boolean;
  overBudget?: boolean;
  unsafe?: boolean;
  tier?: RemotePrismTier;
};

export type FailureClassification = {
  decision: FailureDecision;
  tierDecision: TierDecision;
  failureClass: FailureClass;
  retryable: boolean;
};

function isTimeoutError(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof Error) {
    const name = error.name.toLowerCase();
    const message = error.message.toLowerCase();
    return (
      name === 'aborterror'
      || name === 'timeouterror'
      || /timeout|timed out|abort/.test(message)
    );
  }
  return /timeout|timed out|abort/i.test(String(error));
}

function isAuthOrConfigError(error: unknown): boolean {
  if (!error) return false;
  const message = error instanceof Error ? error.message : String(error);
  return /key_missing|missing.*api.*key|unconfigured|401|403/i.test(message);
}

export function classifyFailure(input: ClassifyFailureInput): FailureClassification {
  if (input.unsafe === true) {
    return {
      decision: 'candidate_failed',
      tierDecision: 'candidate_failed',
      failureClass: 'unsafe_boundary',
      retryable: false,
    };
  }

  if (input.status === 429) {
    return {
      decision: 'next_tier',
      tierDecision: 'next_tier',
      failureClass: 'transient_429',
      retryable: true,
    };
  }

  if (typeof input.status === 'number' && input.status >= 500 && input.status <= 599) {
    return {
      decision: 'next_tier',
      tierDecision: 'next_tier',
      failureClass: 'transient_5xx',
      retryable: true,
    };
  }

  if (isTimeoutError(input.error)) {
    return {
      decision: 'next_tier',
      tierDecision: 'next_tier',
      failureClass: 'transient_timeout',
      retryable: true,
    };
  }

  if (
    input.status === 401
    || input.status === 403
    || input.status === 404
    || isAuthOrConfigError(input.error)
  ) {
    return {
      decision: 'next_tier',
      tierDecision: 'next_tier',
      failureClass: 'auth_or_config',
      retryable: false,
    };
  }

  if (input.status === 400 || input.status === 422 || input.schemaValid === false) {
    return {
      decision: 'candidate_failed',
      tierDecision: 'candidate_failed',
      failureClass: 'deterministic_schema',
      retryable: false,
    };
  }

  if (input.hasValidUsage === false) {
    return {
      decision: 'candidate_failed',
      tierDecision: 'candidate_failed',
      failureClass: 'missing_usage',
      retryable: false,
    };
  }

  if (input.overBudget === true) {
    return {
      decision: 'candidate_failed',
      tierDecision: 'candidate_failed',
      failureClass: 'over_budget',
      retryable: false,
    };
  }

  if (input.error != null || (typeof input.status === 'number' && (input.status < 200 || input.status >= 300))) {
    return {
      decision: 'next_tier',
      tierDecision: 'next_tier',
      failureClass: 'transient_5xx',
      retryable: true,
    };
  }

  const acceptedTier = input.tier ?? 'tier1';
  const tierDecision: TierDecision =
    acceptedTier === 'tier2'
      ? 'tier2_accepted'
      : acceptedTier === 'tier3'
        ? 'tier3_accepted'
        : 'tier1_accepted';

  return {
    decision: 'tier_accepted',
    tierDecision,
    failureClass: 'none',
    retryable: false,
  };
}

// ---------------------------------------------------------------------------
// Budget & Cost Ceilings
// ---------------------------------------------------------------------------

type TierBudget = {
  maxOutputTokens: number;
  maxTotalTokens: number;
  timeoutMs: number;
  maxRetries: number;
  retryDelaysMs: readonly number[];
};

function getDefaultTierBudget(lane: PrismLane, tier: RemotePrismTier, hasImage: boolean): TierBudget {
  if (hasImage && tier === 'tier3') {
    return {
      maxOutputTokens: 900,
      maxTotalTokens: 12000,
      timeoutMs: 20000,
      maxRetries: 2,
      retryDelaysMs: [0, 2000, 4000],
    };
  }
  if (lane === 'play') {
    if (tier === 'tier1') {
      return { maxOutputTokens: 700, maxTotalTokens: 6000, timeoutMs: 10000, maxRetries: 1, retryDelaysMs: [0, 1000] };
    }
    if (tier === 'tier2') {
      return { maxOutputTokens: 1000, maxTotalTokens: 12000, timeoutMs: 15000, maxRetries: 1, retryDelaysMs: [0, 1500] };
    }
    return { maxOutputTokens: 1000, maxTotalTokens: 12000, timeoutMs: 20000, maxRetries: 1, retryDelaysMs: [0, 1500] };
  }
  if (lane === 'lens') {
    if (tier === 'tier1') {
      return { maxOutputTokens: 800, maxTotalTokens: 8000, timeoutMs: 12000, maxRetries: 1, retryDelaysMs: [0, 1000] };
    }
    if (tier === 'tier2') {
      return { maxOutputTokens: 1000, maxTotalTokens: 12000, timeoutMs: 15000, maxRetries: 1, retryDelaysMs: [0, 1500] };
    }
    return { maxOutputTokens: 900, maxTotalTokens: 12000, timeoutMs: 20000, maxRetries: 1, retryDelaysMs: [0, 1500] };
  }
  if (lane === 'chat') {
    if (tier === 'tier1') {
      return { maxOutputTokens: 1000, maxTotalTokens: 10000, timeoutMs: 15000, maxRetries: 1, retryDelaysMs: [0, 1000] };
    }
    return { maxOutputTokens: 1400, maxTotalTokens: 16000, timeoutMs: 18000, maxRetries: 1, retryDelaysMs: [0, 1500] };
  }
  // focus lane
  if (tier === 'tier1') {
    return { maxOutputTokens: 900, maxTotalTokens: 8000, timeoutMs: 12000, maxRetries: 1, retryDelaysMs: [0, 1000] };
  }
  if (tier === 'tier2') {
    return { maxOutputTokens: 1400, maxTotalTokens: 16000, timeoutMs: 18000, maxRetries: 1, retryDelaysMs: [0, 1500] };
  }
  return { maxOutputTokens: 1400, maxTotalTokens: 16000, timeoutMs: 20000, maxRetries: 1, retryDelaysMs: [0, 1500] };
}

function estimateUsageCostUsd(model: string, usage: AiUsage): number {
  const lower = model.toLowerCase();
  let inputPerMillion = 0.15;
  let outputPerMillion = 0.6;
  if (lower.includes('gpt-oss-20b')) {
    inputPerMillion = 0.075;
    outputPerMillion = 0.3;
  } else if (lower.includes('gpt-oss-120b')) {
    inputPerMillion = 0.15;
    outputPerMillion = 0.6;
  } else if (lower.includes('gemini-2.0-flash')) {
    inputPerMillion = 0.1;
    outputPerMillion = 0.4;
  }
  return (
    (usage.promptTokens / 1_000_000) * inputPerMillion
    + (usage.completionTokens / 1_000_000) * outputPerMillion
  );
}

// ---------------------------------------------------------------------------
// Four-Tier Router Execution
// ---------------------------------------------------------------------------

export type FourTierRequest = {
  lane: PrismLane;
  text: string;
  context?: string;
  question?: string;
  missionGoal?: string;
  cognitiveMode?: string;
  simplicityLevel?: string;
  isScenic?: boolean;
  isStory?: boolean;
  preferredProvider?: ProviderPreference;
  image?: { data: string; mimeType: string };
  imageData?: string;
  imageMimeType?: string;
  history?: Array<{ role: string; text: string }>;
  systemInstruction?: string;
  forceTier2?: boolean;
  maxTokensBudget?: number;
  maxCostUsd?: number;
  timeoutMs?: number;
  /**
   * Optional future-ready BYOK (Bring Your Own Key) ephemeral configuration.
   * Validated against injection/forbidden patterns and never persisted or logged.
   */
  byok?: {
    provider: 'groq' | 'gemini' | 'openrouter';
    apiKey: string;
    model?: string;
  };
};

export type AttemptRecord = {
  tier: PrismTier;
  provider: AiProvider;
  model: string;
  status?: number;
  failureClass: FailureClass;
  decision: FailureDecision;
  retryCount: number;
  durationMs: number;
};

export type FourTierResult = {
  ok: true;
  lane: PrismLane;
  tier: PrismTier;
  provider: AiProvider;
  model: string;
  label: string;
  isLocalFallback: boolean;
  shouldRefundCredits: boolean;
  decision: 'tier1_accepted' | 'tier2_accepted' | 'tier3_accepted' | 'pool_accepted' | 'tier4_local_fallback';
  failureClass: FailureClass;
  fallbackReason?: string;
  whyCare: string;
  data: FocusCoreOutput | PlayCardOutput | LensOutput | ChatOutput;
  usage: AiUsage;
  safety: SafetyBoundaryResult;
  complexity: ComplexityClassification;
  attempts: AttemptRecord[];
};

export type GeminiInvokerArgs = {
  prompt: string;
  systemInstruction: string;
  model: string;
  image?: { data: string; mimeType: string };
  timeoutMs: number;
  lane: PrismLane;
  maxOutputTokens: number;
};

export type GeminiInvokerResponse = {
  status: number;
  text: string;
  rawUsage: unknown;
  retryAfterMs?: number;
};

export type RouterDependencies = {
  fetchImpl?: typeof fetch;
  sleepImpl?: (ms: number) => Promise<void>;
  nowImpl?: () => number;
  env?: Record<string, string | undefined>;
  geminiInvoker?: (args: GeminiInvokerArgs) => Promise<GeminiInvokerResponse>;
  maxRetriesPerTier?: number;
  retryDelaysMs?: readonly number[];
};

type RemoteCallResult = {
  status?: number;
  text?: string;
  rawUsage?: unknown;
  resolvedModel?: string;
  error?: unknown;
  retryAfterMs?: number;
};

function parseRetryAfterMs(headerValue: string | null): number | undefined {
  if (!headerValue) return undefined;
  const seconds = Number(headerValue);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(4000, Math.round(seconds * 1000));
  }
  const parsedDate = Date.parse(headerValue);
  if (Number.isFinite(parsedDate)) {
    const delta = parsedDate - Date.now();
    if (delta > 0) return Math.min(4000, delta);
  }
  return undefined;
}

async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    const timeoutError = new Error('Provider request timed out');
    timeoutError.name = 'TimeoutError';
    controller.abort(timeoutError);
  }, timeoutMs);

  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      const reason = controller.signal.reason;
      if (reason instanceof Error) throw reason;
      const timeoutError = new Error('Provider request timed out');
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function callGroqCandidate(args: {
  fetchImpl: typeof fetch;
  apiKey: string;
  model: string;
  lane: PrismLane;
  request: FourTierRequest;
  maxOutputTokens: number;
  timeoutMs: number;
}): Promise<RemoteCallResult> {
  const messages = buildLaneMessages(args.lane, {
    text: args.request.text,
    context: args.request.context,
    history: args.request.history,
    systemInstruction: args.request.systemInstruction,
    cognitiveMode: args.request.cognitiveMode,
    simplicityLevel: args.request.simplicityLevel,
    isStory: args.request.isStory,
    missionGoal: args.request.missionGoal,
    hasImage: false,
  });

  const payload: Record<string, unknown> = {
    model: args.model,
    messages,
    temperature: args.lane === 'chat' ? 0.4 : 0.2,
    max_completion_tokens: Math.max(args.maxOutputTokens, 1600),
    stream: false,
  };

  if (/gpt-oss/i.test(args.model)) {
    payload.reasoning_effort = 'low';
    payload.include_reasoning = false;
  }

  if (args.lane !== 'chat') {
    payload.response_format = getResponseFormatForLane(args.lane);
  }

  try {
    const response = await fetchWithTimeout(
      args.fetchImpl,
      GROQ_CHAT_COMPLETIONS_URL,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${args.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      args.timeoutMs,
    );

    const retryAfterMs = parseRetryAfterMs(response.headers?.get?.('retry-after') ?? null);
    if (!response.ok) {
      return { status: response.status, retryAfterMs };
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return { status: 200, text: '', rawUsage: undefined };
    }

    const record = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
    const choices = Array.isArray(record.choices) ? record.choices : [];
    const firstChoice = (choices[0] && typeof choices[0] === 'object' ? choices[0] : {}) as Record<string, unknown>;
    const message = (firstChoice.message && typeof firstChoice.message === 'object'
      ? firstChoice.message
      : {}) as Record<string, unknown>;
    const content = typeof message.content === 'string' ? message.content : '';
    const resolvedModel = typeof record.model === 'string' && record.model.trim()
      ? record.model.trim()
      : args.model;

    return {
      status: response.status,
      text: content,
      rawUsage: record.usage,
      resolvedModel,
    };
  } catch (error) {
    return { error };
  }
}

async function callGeminiCandidate(args: {
  fetchImpl: typeof fetch;
  geminiInvoker?: RouterDependencies['geminiInvoker'];
  apiKey: string;
  model: string;
  lane: PrismLane;
  request: FourTierRequest;
  maxOutputTokens: number;
  timeoutMs: number;
}): Promise<RemoteCallResult> {
  const messages = buildLaneMessages(args.lane, {
    text: args.request.text,
    context: args.request.context,
    history: args.request.history,
    systemInstruction: args.request.systemInstruction,
    cognitiveMode: args.request.cognitiveMode,
    simplicityLevel: args.request.simplicityLevel,
    isStory: args.request.isStory,
    missionGoal: args.request.missionGoal,
    hasImage: Boolean(args.request.image),
  });

  const systemMessage = messages.find((m) => m.role === 'system')?.content ?? '';
  const nonSystemMessages = messages.filter((m) => m.role !== 'system');
  const promptText = nonSystemMessages
    .map((m) => (m.role === 'assistant' ? `Assistant: ${m.content}` : m.content))
    .join('\n\n');

  if (args.geminiInvoker) {
    try {
      const invoked = await args.geminiInvoker({
        prompt: promptText,
        systemInstruction: systemMessage,
        model: args.model,
        image: args.request.image,
        timeoutMs: args.timeoutMs,
        lane: args.lane,
        maxOutputTokens: args.maxOutputTokens,
      });
      return {
        status: invoked.status,
        text: invoked.text,
        rawUsage: invoked.rawUsage,
        resolvedModel: args.model,
        retryAfterMs: invoked.retryAfterMs,
      };
    } catch (error) {
      return { error };
    }
  }

  const userParts: Array<Record<string, unknown>> = [];
  if (args.request.image) {
    userParts.push({
      inlineData: {
        mimeType: args.request.image.mimeType,
        data: args.request.image.data,
      },
    });
  }
  userParts.push({ text: promptText });

  const generationConfig: Record<string, unknown> = {
    temperature: args.lane === 'chat' ? 0.4 : 0.2,
    maxOutputTokens: args.maxOutputTokens,
  };
  if (args.lane !== 'chat') {
    generationConfig.responseMimeType = 'application/json';
  }

  const bodyPayload: Record<string, unknown> = {
    contents: [{ role: 'user', parts: userParts }],
    generationConfig,
  };
  if (systemMessage) {
    bodyPayload.systemInstruction = { parts: [{ text: systemMessage }] };
  }

  const url = `${GEMINI_API_BASE_URL}/${encodeURIComponent(args.model)}:generateContent`;

  try {
    const response = await fetchWithTimeout(
      args.fetchImpl,
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': args.apiKey,
        },
        body: JSON.stringify(bodyPayload),
      },
      args.timeoutMs,
    );

    const retryAfterMs = parseRetryAfterMs(response.headers?.get?.('retry-after') ?? null);
    if (!response.ok) {
      return { status: response.status, retryAfterMs };
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return { status: 200, text: '', rawUsage: undefined };
    }

    const record = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
    const candidates = Array.isArray(record.candidates) ? record.candidates : [];
    const firstCandidate = (candidates[0] && typeof candidates[0] === 'object'
      ? candidates[0]
      : {}) as Record<string, unknown>;
    const contentObj = (firstCandidate.content && typeof firstCandidate.content === 'object'
      ? firstCandidate.content
      : {}) as Record<string, unknown>;
    const parts = Array.isArray(contentObj.parts) ? contentObj.parts : [];
    const text = parts
      .map((part) => {
        if (part && typeof part === 'object' && typeof (part as Record<string, unknown>).text === 'string') {
          return (part as Record<string, unknown>).text as string;
        }
        return '';
      })
      .join('')
      .trim();

    return {
      status: response.status,
      text,
      rawUsage: record.usageMetadata ?? record.usage,
      resolvedModel: args.model,
    };
  } catch (error) {
    return { error };
  }
}

function extractWhyCareFromLaneData(lane: PrismLane, data: LaneOutput): string {
  if (lane === 'play') {
    return ((data as PlayCardOutput).dopamineBoost || '').trim() || 'Local structural refraction fallback; verify key points and next steps against the original source.';
  }
  if (lane === 'lens') {
    return ((data as LensOutput).whyItMatters || '').trim() || 'Local structural refraction fallback; verify key points and next steps against the original source.';
  }
  if (lane === 'chat') {
    return ((data as ChatOutput).text || '').trim() || 'Local structural refraction fallback; verify key points and next steps against the original source.';
  }
  return ((data as FocusCoreOutput).confidenceNote || '').trim() || 'Local structural refraction fallback; verify key points and next steps against the original source.';
}

function buildTier4Result(args: {
  request: FourTierRequest;
  safety: SafetyBoundaryResult;
  complexity: ComplexityClassification;
  attempts: AttemptRecord[];
  failureClass: FailureClass;
  fallbackReason?: string;
  blockedBySafety?: boolean;
}): FourTierResult {
  const usage = emptyUsage('local', LOCAL_FALLBACK_MODEL, {
    tier: 'tier4',
    label: LOCAL_FALLBACK_LABEL,
  });
  const data = buildLocalFallbackData(args.request.lane, {
    text: args.request.text,
    context: args.request.context,
    question: args.request.question,
    hasImage: Boolean(args.request.image),
    blockedBySafety: args.blockedBySafety,
    safetyAction: args.safety.action,
  });
  const whyCare = extractWhyCareFromLaneData(args.request.lane, data);
  return {
    ok: true,
    lane: args.request.lane,
    tier: 'tier4',
    provider: 'local',
    model: LOCAL_FALLBACK_MODEL,
    label: LOCAL_FALLBACK_LABEL,
    isLocalFallback: true,
    shouldRefundCredits: true,
    decision: 'tier4_local_fallback',
    failureClass: args.failureClass,
    ...(args.fallbackReason ? { fallbackReason: args.fallbackReason } : {}),
    whyCare,
    data,
    usage,
    safety: args.safety,
    complexity: args.complexity,
    attempts: args.attempts,
  };
}

function getTierConfig(
  tier: RemotePrismTier,
  env: Record<string, string | undefined>,
): { provider: AiProvider; model: string; label: string } {
  if (tier === 'tier1') {
    return { provider: 'groq', model: getGroqTier1Model(env), label: TIER1_LABEL };
  }
  if (tier === 'tier2') {
    return { provider: 'groq', model: getGroqTier2Model(env), label: TIER2_LABEL };
  }
  return { provider: 'gemini', model: getTier3GeminiModel(env), label: TIER3_LABEL };
}

function buildTierSequence(
  request: FourTierRequest,
  complexity: ComplexityClassification,
): RemotePrismTier[] {
  // Multimodal inputs strictly bypass text-only Groq Tier 1 & Tier 2 (qwen/qwen3.8-27b vision deferred).
  if (request.image) {
    return ['tier3'];
  }
  if (request.preferredProvider === 'gemini') {
    return complexity.recommendedTier === 'tier2'
      ? ['tier3', 'tier2']
      : ['tier3', 'tier1', 'tier2'];
  }
  if (complexity.recommendedTier === 'tier2') {
    return ['tier2', 'tier3'];
  }
  return ['tier1', 'tier2', 'tier3'];
}

export async function routeFourTier(
  rawRequest: FourTierRequest,
  deps?: RouterDependencies,
): Promise<FourTierResult> {
  const env = deps?.env ?? process.env;
  const fetchImpl = deps?.fetchImpl ?? fetch;
  const sleepImpl = deps?.sleepImpl
    ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const nowImpl = deps?.nowImpl ?? (() => Date.now());

  const normalizedImage = rawRequest.image
    ? {
        data: rawRequest.image.data.replace(/^data:image\/[^;]+;base64,/i, ''),
        mimeType: rawRequest.image.mimeType,
      }
    : typeof rawRequest.imageData === 'string'
      && rawRequest.imageData.length > 0
      && rawRequest.imageData.length <= 14_000_000
      && typeof rawRequest.imageMimeType === 'string'
      && /^image\/(png|jpeg|jpg|webp|gif)$/i.test(rawRequest.imageMimeType)
      ? {
          data: rawRequest.imageData.replace(/^data:image\/[^;]+;base64,/i, ''),
          mimeType: rawRequest.imageMimeType,
        }
      : undefined;

  const normalizedLane: PrismLane =
    rawRequest.lane === 'focus_plus'
      || rawRequest.lane === 'play'
      || rawRequest.lane === 'lens'
      || rawRequest.lane === 'chat'
      ? rawRequest.lane
      : 'focus';

  const request: FourTierRequest = {
    ...rawRequest,
    lane: normalizedLane,
    text: rawRequest.text ?? '',
    ...(normalizedImage ? { image: normalizedImage } : {}),
  };

  // 1. Pre-flight server-side safety guard BEFORE any remote call
  const safety = evaluateSafetyBoundary({
    text: request.text,
    context: request.context,
    question: request.question,
    missionGoal: request.missionGoal,
  });

  const complexity = classifyComplexity(request.text, {
    forceTier2: request.forceTier2,
    cognitiveMode: request.cognitiveMode,
    simplicityLevel: request.simplicityLevel,
    safetySignal: safety.safetySignal,
    safe: safety.safe,
  });

  if (!safety.safe) {
    return buildTier4Result({
      request,
      safety,
      complexity,
      attempts: [],
      failureClass: 'unsafe_boundary',
      fallbackReason: safety.reason || safety.action,
      blockedBySafety: true,
    });
  }

  const attempts: AttemptRecord[] = [];
  const tierSequence = buildTierSequence(request, complexity);
  const hasImage = Boolean(request.image);
  let lastFailureClass: FailureClass = 'auth_or_config';
  let lastFallbackReason = 'all_remote_tiers_unavailable';
  let shouldStopAllRemote = false;

  const byokProvider = request.byok?.provider;
  const byokKey = typeof request.byok?.apiKey === 'string' ? request.byok.apiKey.trim() : '';

  for (const tier of tierSequence) {
    const config = getTierConfig(tier, env);
    const budget = getDefaultTierBudget(request.lane, tier, hasImage);
    const maxTokensBudget = request.maxTokensBudget ?? budget.maxTotalTokens;
    const timeoutMs = request.timeoutMs ?? budget.timeoutMs;
    const maxRetries = deps?.maxRetriesPerTier ?? budget.maxRetries;
    const retryDelays = deps?.retryDelaysMs ?? budget.retryDelaysMs;

    // Check provider key availability (including optional ephemeral BYOK override)
    const groqKey = (byokProvider === 'groq' && byokKey) ? byokKey : (env.GROQ_API_KEY?.trim() || '');
    const geminiKey = (byokProvider === 'gemini' && byokKey) ? byokKey : (env.GEMINI_API_KEY?.trim() || '');

    if ((tier === 'tier1' || tier === 'tier2') && !groqKey) {
      attempts.push({
        tier,
        provider: config.provider,
        model: config.model,
        failureClass: 'auth_or_config',
        decision: 'next_tier',
        retryCount: 0,
        durationMs: 0,
      });
      lastFailureClass = 'auth_or_config';
      lastFallbackReason = 'groq_key_missing';
      continue;
    }

    if (tier === 'tier3' && !geminiKey && !deps?.geminiInvoker) {
      attempts.push({
        tier,
        provider: config.provider,
        model: config.model,
        failureClass: 'auth_or_config',
        decision: 'next_tier',
        retryCount: 0,
        durationMs: 0,
      });
      lastFailureClass = 'auth_or_config';
      lastFallbackReason = 'gemini_key_missing';
      continue;
    }

    let prevRetryAfterMs: number | undefined;

    for (let attemptIdx = 0; attemptIdx <= maxRetries; attemptIdx += 1) {
      if (attemptIdx > 0) {
        const scheduledDelay = retryDelays[attemptIdx] ?? retryDelays[retryDelays.length - 1] ?? 1000;
        const delayMs = deps?.retryDelaysMs
          ? scheduledDelay
          : Math.max(scheduledDelay, prevRetryAfterMs ?? 0);
        if (delayMs > 0) {
          await sleepImpl(delayMs);
        }
      }

      const startedAt = nowImpl();
      const callResult: RemoteCallResult = tier === 'tier3'
        ? await callGeminiCandidate({
            fetchImpl,
            geminiInvoker: deps?.geminiInvoker,
            apiKey: geminiKey,
            model: config.model,
            lane: request.lane,
            request,
            maxOutputTokens: budget.maxOutputTokens,
            timeoutMs,
          })
        : await callGroqCandidate({
            fetchImpl,
            apiKey: groqKey,
            model: config.model,
            lane: request.lane,
            request,
            maxOutputTokens: budget.maxOutputTokens,
            timeoutMs,
          });
      const durationMs = Math.max(0, nowImpl() - startedAt);
      prevRetryAfterMs = callResult.retryAfterMs;

      // Non-2xx or transport error
      if (callResult.error != null || (typeof callResult.status === 'number' && (callResult.status < 200 || callResult.status >= 300))) {
        const classification = classifyFailure({
          status: callResult.status,
          error: callResult.error,
          tier,
        });
        attempts.push({
          tier,
          provider: config.provider,
          model: config.model,
          ...(typeof callResult.status === 'number' ? { status: callResult.status } : {}),
          failureClass: classification.failureClass,
          decision: classification.decision,
          retryCount: attemptIdx,
          durationMs,
        });
        lastFailureClass = classification.failureClass;
        lastFallbackReason = classification.failureClass;

        if (classification.decision === 'candidate_failed') {
          shouldStopAllRemote = true;
          break;
        }
        if (classification.retryable && attemptIdx < maxRetries) {
          continue;
        }
        break;
      }

      // HTTP 200 candidate verification: schema -> strict usage -> budget -> output safety
      const rawText = callResult.text ?? '';
      let schemaValid = false;
      let validatedData: LaneOutput | null = null;

      if (request.lane === 'chat') {
        const trimmedChat = rawText.trim();
        if (trimmedChat.length > 0) {
          schemaValid = true;
          validatedData = { text: trimmedChat };
        }
      } else {
        const parsed = parseStrictJsonObject(rawText);
        if (parsed.ok) {
          const validated = validateLanePayload(request.lane as StructuredPrismLane, parsed.value);
          if (validated.ok) {
            schemaValid = true;
            validatedData = validated.data;
          }
        }
      }

      const resolvedModel = callResult.resolvedModel || config.model;
      const usageParsed = parseStrictProviderUsage(callResult.rawUsage, config.provider, resolvedModel, {
        tier,
        label: config.label,
      });
      const hasValidUsage = usageParsed.ok;

      let overBudget = false;
      if (usageParsed.ok) {
        if (usageParsed.usage.totalTokens > maxTokensBudget) {
          overBudget = true;
        }
        if (
          typeof request.maxCostUsd === 'number'
          && Number.isFinite(request.maxCostUsd)
          && estimateUsageCostUsd(resolvedModel, usageParsed.usage) > request.maxCostUsd
        ) {
          overBudget = true;
        }
      }

      const serializedOutput = validatedData ? JSON.stringify(validatedData) : rawText;
      const outputSafety = evaluateOutputSafety(serializedOutput);
      const unsafe = !outputSafety.safe;

      const classification = classifyFailure({
        status: callResult.status ?? 200,
        schemaValid,
        hasValidUsage,
        overBudget,
        unsafe,
        tier,
      });

      attempts.push({
        tier,
        provider: config.provider,
        model: resolvedModel,
        status: callResult.status ?? 200,
        failureClass: classification.failureClass,
        decision: classification.decision,
        retryCount: attemptIdx,
        durationMs,
      });

      if (classification.decision === 'tier_accepted' && validatedData && usageParsed.ok) {
        const acceptedDecision: FourTierResult['decision'] =
          tier === 'tier2'
            ? 'tier2_accepted'
            : tier === 'tier3'
              ? 'tier3_accepted'
              : 'tier1_accepted';
        return {
          ok: true,
          lane: request.lane,
          tier,
          provider: config.provider,
          model: resolvedModel,
          label: config.label,
          isLocalFallback: false,
          shouldRefundCredits: false,
          decision: acceptedDecision,
          failureClass: 'none',
          whyCare: extractWhyCareFromLaneData(request.lane, validatedData),
          data: validatedData,
          usage: usageParsed.usage,
          safety,
          complexity,
          attempts,
        };
      }

      lastFailureClass = classification.failureClass;
      lastFallbackReason = unsafe && outputSafety.reason
        ? outputSafety.reason
        : classification.failureClass;

      if (classification.decision === 'candidate_failed') {
        // Fail closed: 0 same-model retries, NEVER fan out to another remote provider
        shouldStopAllRemote = true;
        break;
      }

      if (classification.retryable && attemptIdx < maxRetries) {
        continue;
      }
      break;
    }

    if (shouldStopAllRemote) {
      break;
    }
  }

  // -------------------------------------------------------------------------
  // Tier 4..N: OpenRouter Infinite Free Pool ("Backup of Backup" Cascade)
  // Executes when fixed tiers (Groq + Gemini) are exhausted on transient or
  // missing-key errors, and OPENROUTER_API_KEY (or BYOK openrouter key) is set.
  // -------------------------------------------------------------------------
  const openRouterKey = (byokProvider === 'openrouter' && byokKey) ? byokKey : getOpenRouterKey(env);
  if (!shouldStopAllRemote && openRouterKey && env.OPENROUTER_POOL_ENABLED !== 'false') {
    const poolStartedAt = nowImpl();
    const customByokModel = byokProvider === 'openrouter' && request.byok?.model && isAllowedPoolModel(request.byok.model)
      ? [request.byok.model.trim()]
      : [];
    const poolModels = [
      ...customByokModel,
      ...(await resolvePoolModels({
        env,
        fetchImpl,
        nowMs: poolStartedAt,
        needsVision: hasImage,
      })),
    ];
    const poolBudget = getDefaultTierBudget(request.lane, 'tier3', hasImage);
    const maxTokensBudget = request.maxTokensBudget ?? poolBudget.maxTotalTokens;
    const perModelTimeoutMs = Math.min(request.timeoutMs ?? POOL_PER_MODEL_TIMEOUT_MS, POOL_PER_MODEL_TIMEOUT_MS);

    for (const poolModel of Array.from(new Set(poolModels))) {
      if (nowImpl() - poolStartedAt >= POOL_TOTAL_DEADLINE_MS) {
        break;
      }
      const startedAt = nowImpl();
      const callResult = await callOpenRouterCandidate({
        fetchImpl,
        apiKey: openRouterKey,
        model: poolModel,
        lane: request.lane,
        request,
        maxOutputTokens: poolBudget.maxOutputTokens,
        timeoutMs: perModelTimeoutMs,
      });
      const durationMs = Math.max(0, nowImpl() - startedAt);

      if (callResult.error != null || (typeof callResult.status === 'number' && (callResult.status < 200 || callResult.status >= 300))) {
        const classification = classifyFailure({
          status: callResult.status,
          error: callResult.error,
          tier: 'tier3',
        });
        attempts.push({
          tier: 'pool',
          provider: 'openrouter',
          model: poolModel,
          ...(typeof callResult.status === 'number' ? { status: callResult.status } : {}),
          failureClass: classification.failureClass,
          decision: 'next_tier',
          retryCount: 0,
          durationMs,
        });
        lastFailureClass = classification.failureClass;
        lastFallbackReason = classification.failureClass;
        continue;
      }

      const rawText = callResult.text ?? '';
      let schemaValid = false;
      let validatedData: LaneOutput | null = null;
      if (request.lane === 'chat') {
        const trimmedChat = rawText.trim();
        if (trimmedChat.length > 0) {
          schemaValid = true;
          validatedData = { text: trimmedChat };
        }
      } else {
        const parsed = parseStrictJsonObject(rawText);
        if (parsed.ok) {
          const validated = validateLanePayload(request.lane as StructuredPrismLane, parsed.value);
          if (validated.ok) {
            schemaValid = true;
            validatedData = validated.data;
          }
        }
      }

      const resolvedModel = callResult.resolvedModel || poolModel;
      const usageParsed = parseStrictProviderUsage(callResult.rawUsage, 'openrouter', resolvedModel, {
        tier: 'pool',
        label: POOL_LABEL,
      });
      const hasValidUsage = usageParsed.ok;
      const overBudget = usageParsed.ok && usageParsed.usage.totalTokens > maxTokensBudget;
      const serializedOutput = validatedData ? JSON.stringify(validatedData) : rawText;
      const outputSafety = evaluateOutputSafety(serializedOutput);
      const unsafe = !outputSafety.safe;

      const classification = classifyFailure({
        status: callResult.status ?? 200,
        schemaValid,
        hasValidUsage,
        overBudget,
        unsafe,
        tier: 'tier3',
      });

      attempts.push({
        tier: 'pool',
        provider: 'openrouter',
        model: resolvedModel,
        status: callResult.status ?? 200,
        failureClass: classification.failureClass,
        decision: classification.decision === 'tier_accepted' ? 'tier_accepted' : 'next_tier',
        retryCount: 0,
        durationMs,
      });

      if (unsafe) {
        lastFailureClass = 'unsafe_boundary';
        lastFallbackReason = outputSafety.reason || 'unsafe_boundary';
        break;
      }

      if (classification.decision === 'tier_accepted' && validatedData && usageParsed.ok) {
        return {
          ok: true,
          lane: request.lane,
          tier: 'pool',
          provider: 'openrouter',
          model: resolvedModel,
          label: POOL_LABEL,
          isLocalFallback: false,
          shouldRefundCredits: false,
          decision: 'pool_accepted',
          failureClass: 'none',
          whyCare: extractWhyCareFromLaneData(request.lane, validatedData),
          data: validatedData,
          usage: usageParsed.usage,
          safety,
          complexity,
          attempts,
        };
      }

      lastFailureClass = classification.failureClass;
      lastFallbackReason = classification.failureClass;
    }
  }

  return buildTier4Result({
    request,
    safety,
    complexity,
    attempts,
    failureClass: lastFailureClass,
    fallbackReason: lastFallbackReason,
    blockedBySafety: lastFailureClass === 'unsafe_boundary',
  });
}

export type ProviderPreference = 'auto' | 'groq' | 'openrouter' | 'gemini' | 'mistral' | 'gpt' | 'claude' | 'deepseek';

export type AiTier = 'tier1' | 'tier2' | 'tier3' | 'pool' | 'tier4' | 'legacy';

export type AiProvider = 'groq' | 'gemini' | 'openrouter' | 'mistral' | 'local' | 'unknown' | (string & {});

export type AiUsage = {
  provider: AiProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  tier?: AiTier;
  label?: string;
};

export type StrictUsageParseResult =
  | { ok: true; usage: AiUsage }
  | { ok: false; reason: 'missing_usage' | 'invalid_usage' };

export const emptyUsage = (
  provider: AiProvider = 'unknown',
  model = 'unknown',
  meta?: { tier?: AiTier; label?: string },
): AiUsage => ({
  provider,
  model,
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  ...(meta?.tier ? { tier: meta.tier } : {}),
  ...(meta?.label ? { label: meta.label } : {}),
});

export const mergeUsage = (items: AiUsage[]): AiUsage => items.reduce<AiUsage>((total, item) => {
  const tier = item.tier ?? total.tier;
  const label = item.label ?? total.label;
  return {
    provider: item.provider || total.provider,
    model: item.model || total.model,
    promptTokens: total.promptTokens + (item.promptTokens || 0),
    completionTokens: total.completionTokens + (item.completionTokens || 0),
    totalTokens: total.totalTokens + (item.totalTokens || 0),
    ...(tier ? { tier } : {}),
    ...(label ? { label } : {}),
  };
}, emptyUsage());

const isValidNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0;

const pickFirstPresentField = (
  record: Record<string, unknown>,
  keys: readonly string[],
): { found: boolean; value: unknown } => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return { found: true, value: record[key] };
    }
  }
  return { found: false, value: undefined };
};

const PROMPT_TOKEN_KEYS = ['prompt_tokens', 'input_tokens', 'promptTokenCount', 'promptTokens'] as const;
const COMPLETION_TOKEN_KEYS = ['completion_tokens', 'output_tokens', 'candidatesTokenCount', 'completionTokens'] as const;
const TOTAL_TOKEN_KEYS = ['total_tokens', 'totalTokenCount', 'totalTokens'] as const;

export const parseStrictProviderUsage = (
  rawUsage: unknown,
  provider: AiProvider,
  model: string,
  meta?: { tier?: AiTier; label?: string },
): StrictUsageParseResult => {
  if (rawUsage == null || typeof rawUsage !== 'object' || Array.isArray(rawUsage)) {
    return { ok: false, reason: 'missing_usage' };
  }

  const record = rawUsage as Record<string, unknown>;
  const promptField = pickFirstPresentField(record, PROMPT_TOKEN_KEYS);
  const completionField = pickFirstPresentField(record, COMPLETION_TOKEN_KEYS);
  const totalField = pickFirstPresentField(record, TOTAL_TOKEN_KEYS);

  if (!promptField.found && !completionField.found && !totalField.found) {
    return { ok: false, reason: 'missing_usage' };
  }

  if (
    promptField.value === undefined
    && completionField.value === undefined
    && totalField.value === undefined
  ) {
    return { ok: false, reason: 'missing_usage' };
  }

  if (!promptField.found || !isValidNonNegativeInteger(promptField.value)) {
    return { ok: false, reason: 'invalid_usage' };
  }

  if (!completionField.found || !isValidNonNegativeInteger(completionField.value)) {
    return { ok: false, reason: 'invalid_usage' };
  }

  const promptTokens = promptField.value;
  const completionTokens = completionField.value;

  let totalTokens: number;
  if (totalField.found && totalField.value !== undefined) {
    if (!isValidNonNegativeInteger(totalField.value)) {
      return { ok: false, reason: 'invalid_usage' };
    }
    if (totalField.value < 1 || totalField.value < promptTokens + completionTokens) {
      return { ok: false, reason: 'invalid_usage' };
    }
    totalTokens = totalField.value;
  } else {
    totalTokens = promptTokens + completionTokens;
  }

  if (totalTokens <= 0) {
    return { ok: false, reason: 'invalid_usage' };
  }

  return {
    ok: true,
    usage: {
      provider,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      ...(meta?.tier ? { tier: meta.tier } : {}),
      ...(meta?.label ? { label: meta.label } : {}),
    },
  };
};

export const usageFromOpenRouter = (usage: Record<string, unknown> | undefined, model: string): AiUsage => {
  const promptTokens = Number(usage?.prompt_tokens || usage?.input_tokens || 0);
  const completionTokens = Number(usage?.completion_tokens || usage?.output_tokens || 0);
  return {
    provider: 'openrouter',
    model,
    promptTokens,
    completionTokens,
    totalTokens: Number(usage?.total_tokens || promptTokens + completionTokens),
  };
};

export const usageFromGroq = (usage: Record<string, unknown> | undefined, model: string): AiUsage => {
  const promptTokens = Number(usage?.prompt_tokens || 0);
  const completionTokens = Number(usage?.completion_tokens || 0);
  return {
    provider: 'groq',
    model,
    promptTokens,
    completionTokens,
    totalTokens: Number(usage?.total_tokens || promptTokens + completionTokens),
  };
};

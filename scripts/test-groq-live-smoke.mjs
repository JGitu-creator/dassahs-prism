import test from 'node:test';
import assert from 'node:assert/strict';
import { routeFourTier } from '../src/lib/server/prism-router.ts';

const RUN_LIVE = process.env.RUN_LIVE_GROQ_TESTS === 'true';

test('Opt-in live Groq strict json_schema smoke test (synthetic non-private fixture only)', { skip: !RUN_LIVE }, async () => {
  assert.ok(process.env.GROQ_API_KEY?.trim(), 'GROQ_API_KEY is required when RUN_LIVE_GROQ_TESTS=true');
  const res = await routeFourTier({
    lane: 'focus',
    text: 'Synthetic release checklist: 1. Export configuration snapshot. 2. Run contract tests. 3. Verify /api/health returns 200.',
  });
  assert.equal(res.ok, true);
  assert.equal(res.isLocalFallback, false, `Expected live Groq response, got fallback (${res.failureClass})`);
  assert.equal(res.provider, 'groq');
  assert.ok(res.usage.totalTokens > 0);
});

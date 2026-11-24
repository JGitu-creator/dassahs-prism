import { NextResponse } from 'next/server';
import { requirePrismWordAuth } from '@/features/scripture/serverAuth';

export const dynamic = 'force-dynamic';

interface ProviderDiagnostic {
  id: string;
  label: string;
  configured: boolean;
  status: 'ready' | 'waiting' | 'missing';
  message: string;
  nextStep: string;
}

interface UpkeepAlert {
  level: 'waiting' | 'advisory' | 'ready';
  title: string;
  detail: string;
  action: string;
}

export async function GET(req: Request) {
  const auth = await requirePrismWordAuth(req);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(req.url);
  const runProbe = searchParams.get('probe') !== '0';

  const hasEsvKey = Boolean(process.env.ESV_API_KEY?.trim());
  const hasYvpKey = Boolean(process.env.YVP_APP_KEY?.trim());
  const hasApiBibleKey = Boolean(process.env.API_BIBLE_KEY?.trim());
  const hasMistralKey = Boolean(process.env.MISTRAL_API_KEY?.trim());
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim());
  const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY?.trim() || process.env.ROUTER_API_KEY?.trim());
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY?.trim());

  let esvStatus: 'ready' | 'waiting' | 'missing' = hasEsvKey ? 'ready' : 'missing';
  let esvMessage = hasEsvKey
    ? 'ESV API key is present.'
    : 'No ESV API key found in environment settings.';
  let esvNextStep = hasEsvKey
    ? 'Ready to display verbatim ESV passages.'
    : 'Add ESV_API_KEY to .env.local or use NIV, NLT, Amplified, The Message, or KJV right away.';

  let yvpStatus: 'ready' | 'waiting' | 'missing' = hasYvpKey ? 'ready' : 'missing';
  let yvpMessage = hasYvpKey
    ? 'YouVersion Platform key is active for NIV and Amplified Bible.'
    : 'No YouVersion Platform key found in environment settings.';
  let yvpNextStep = hasYvpKey
    ? 'Working smoothly.'
    : 'Add YVP_APP_KEY to enable YouVersion licensed versions.';

  let apiBibleStatus: 'ready' | 'waiting' | 'missing' = hasApiBibleKey ? 'ready' : 'missing';
  let apiBibleMessage = hasApiBibleKey
    ? 'API.Bible key is active for NLT, The Message, and KJV.'
    : 'No API.Bible key found in environment settings.';
  let apiBibleNextStep = hasApiBibleKey
    ? 'Working smoothly.'
    : 'Add API_BIBLE_KEY to enable NLT, The Message, and KJV via API.Bible.';

  if (runProbe) {
    const probes = await Promise.allSettled([
      hasEsvKey
        ? fetch('https://api.esv.org/v3/passage/text/?q=John+3:16', {
            headers: { Authorization: `Token ${process.env.ESV_API_KEY?.trim()}` },
            signal: AbortSignal.timeout(3500),
          })
        : Promise.resolve(null),
      hasYvpKey
        ? fetch('https://api.youversion.com/v1/bibles/111/passages/JHN.3.16?format=text', {
            headers: { 'X-YVP-App-Key': process.env.YVP_APP_KEY?.trim() || '' },
            signal: AbortSignal.timeout(3500),
          })
        : Promise.resolve(null),
      hasApiBibleKey
        ? fetch('https://rest.api.bible/v1/bibles?language=eng', {
            headers: { 'api-key': process.env.API_BIBLE_KEY?.trim() || '' },
            signal: AbortSignal.timeout(3500),
          })
        : Promise.resolve(null),
    ]);

    const esvProbe = probes[0];
    if (hasEsvKey && esvProbe.status === 'fulfilled' && esvProbe.value) {
      if (esvProbe.value.ok) {
        esvStatus = 'ready';
        esvMessage = 'Crossway ESV API responded cleanly.';
        esvNextStep = 'ESV is approved and active.';
      } else if (esvProbe.value.status === 403 || esvProbe.value.status === 401) {
        esvStatus = 'waiting';
        esvMessage = `Crossway ESV returned HTTP ${esvProbe.value.status}. Application approval is usually still pending (Crossway states up to 3 to 4 weeks for apps that use AI features).`;
        esvNextStep =
          'Wait for Crossway confirmation, or read NIV, NLT, Amplified, The Message, or KJV right now while ESV automatically falls back to KJV.';
      } else {
        esvStatus = 'waiting';
        esvMessage = `Crossway ESV returned temporary status ${esvProbe.value.status}.`;
        esvNextStep = 'Try refreshing shortly or switch translation to NIV or NLT.';
      }
    } else if (hasEsvKey && esvProbe.status === 'rejected') {
      esvStatus = 'waiting';
      esvMessage = 'Crossway ESV timed out during check.';
      esvNextStep = 'Check internet connectivity or use NIV, NLT, Amplified, The Message, or KJV.';
    }

    const yvpProbe = probes[1];
    if (hasYvpKey && yvpProbe.status === 'fulfilled' && yvpProbe.value) {
      if (yvpProbe.value.ok) {
        yvpStatus = 'ready';
        yvpMessage = 'YouVersion Platform live passage check succeeded (NIV and Amplified ready).';
      } else {
        yvpStatus = 'waiting';
        yvpMessage = `YouVersion Platform returned HTTP ${yvpProbe.value.status}.`;
        yvpNextStep = 'Check version permissions inside platform.youversion.com or use NLT, The Message, or KJV.';
      }
    } else if (hasYvpKey && yvpProbe.status === 'rejected') {
      yvpStatus = 'waiting';
      yvpMessage = 'YouVersion Platform timed out during check.';
      yvpNextStep = 'Retry shortly or use API.Bible translations.';
    }

    const abProbe = probes[2];
    if (hasApiBibleKey && abProbe.status === 'fulfilled' && abProbe.value) {
      if (abProbe.value.ok) {
        apiBibleStatus = 'ready';
        apiBibleMessage = 'API.Bible live connection succeeded (NLT, The Message, and KJV ready).';
      } else {
        apiBibleStatus = 'waiting';
        apiBibleMessage = `API.Bible returned HTTP ${abProbe.value.status}.`;
        apiBibleNextStep = 'Verify your key permissions at scripture.api.bible or switch to YouVersion versions.';
      }
    } else if (hasApiBibleKey && abProbe.status === 'rejected') {
      apiBibleStatus = 'waiting';
      apiBibleMessage = 'API.Bible timed out during check.';
      apiBibleNextStep = 'Retry shortly or use YouVersion versions.';
    }
  }

  const bibleProviders: ProviderDiagnostic[] = [
    {
      id: 'esv',
      label: 'ESV via Crossway API',
      configured: hasEsvKey,
      status: esvStatus,
      message: esvMessage,
      nextStep: esvNextStep,
    },
    {
      id: 'youversion',
      label: 'NIV and Amplified via YouVersion Platform',
      configured: hasYvpKey,
      status: yvpStatus,
      message: yvpMessage,
      nextStep: yvpNextStep,
    },
    {
      id: 'api-bible',
      label: 'NLT, The Message, and KJV via API.Bible',
      configured: hasApiBibleKey,
      status: apiBibleStatus,
      message: apiBibleMessage,
      nextStep: apiBibleNextStep,
    },
    {
      id: 'local-kjv',
      label: 'Built in Public Domain KJV Reserve',
      configured: true,
      status: 'ready',
      message: 'Always active so Bible reading never goes blank even completely offline.',
      nextStep: 'No upkeep required.',
    },
  ];

  const upkeepAlerts: UpkeepAlert[] = [];
  if (esvStatus !== 'ready') {
    upkeepAlerts.push({
      level: 'waiting',
      title: 'Waiting for Crossway ESV API approval',
      detail: esvMessage,
      action:
        'Confirm your Crossway application form answers Yes to API3 guidelines and clearly states that ESV text is never sent to any AI model. Until approved, use NIV, NLT, Amplified, The Message, or KJV.',
    });
  }
  if (!hasMistralKey || !hasGeminiKey) {
    upkeepAlerts.push({
      level: 'advisory',
      title: 'Optional AI provider key missing',
      detail: 'One of Mistral or Gemini keys is unset, so the cascade will lean on remaining providers and built in study guides.',
      action: 'Add MISTRAL_API_KEY and GEMINI_API_KEY in Vercel environment variables before deploying live.',
    });
  }
  upkeepAlerts.push({
    level: 'advisory',
    title: 'Planned framework upkeep notice',
    detail: 'Next.js 16.4 notes that React 18 support will be retired when upgrading to Next.js 17 later.',
    action: 'Everything runs cleanly on React 18.3 today; plan a React 19 upgrade before moving to Next.js 17.',
  });

  const remoteAiConfigured = hasMistralKey || hasGeminiKey || hasOpenRouterKey || hasGroqKey;

  return NextResponse.json({
    overall: remoteAiConfigured && (yvpStatus === 'ready' || apiBibleStatus === 'ready') ? 'healthy' : 'degraded',
    checkedAt: new Date().toISOString(),
    bibleProviders,
    aiCascade: {
      studyAndSongsOrder: [
        {
          name: 'Tier 1 Mistral Pool',
          models: 'mistral-small-latest, mistral-large-latest, ministral-14b-2512',
          configured: hasMistralKey,
        },
        {
          name: 'Tier 2 Gemini Interactions',
          models: 'gemini-3.5-flash-lite',
          configured: hasGeminiKey,
        },
        {
          name: 'Tier 3 OpenRouter Free Pool',
          models: 'Automatic free tier rotation',
          configured: hasOpenRouterKey,
        },
        {
          name: 'Tier 4 Groq Remote Reserve',
          models: 'Emergency low latency fallback',
          configured: hasGroqKey,
        },
        {
          name: 'Built in Study and Worship Reserve',
          models: 'Offline exegesis, hymns, and Web Audio chord synthesis',
          configured: true,
        },
      ],
      askDjDefault: {
        name: 'Gemini Interactions SDK',
        model: process.env.GEMINI_TIER3_MODEL?.trim() || 'gemini-3.5-flash-lite',
        statefulMemory: true,
        configured: hasGeminiKey,
      },
    },
    upkeepAlerts,
  });
}

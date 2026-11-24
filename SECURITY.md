# Security Policy

## Scope

Dassah's Prism is a public Next.js application with server-side provider integrations, Supabase authentication, a Chrome extension, and optional private Prism Word routes. The latest `main` branch is the supported public line; older branches and preview deployments are not production guarantees.

## Reporting a vulnerability

Please report suspected vulnerabilities privately through the repository's GitHub security reporting flow or by contacting the maintainer through the project account. Do not open a public issue containing API keys, session cookies, private documents, personal data, or a working exploit.

Include the affected route or file, reproduction steps, impact, and whether the issue affects confidentiality, integrity, or availability. We will acknowledge a report when received and may request a minimal redacted reproduction. Please allow time for triage and a fix before public disclosure.

## Secret handling

Provider keys, Supabase service credentials, Prism Word allowlists, and session-signing secrets belong only in server-side environment variables. They must not use `NEXT_PUBLIC_` names, be committed to Git, be sent through the browser, or be pasted into feedback, documents, or the extension.

`PRISM_SHADOW_MODE` and `PRISM_FOUR_TIER_ENABLED` are disabled in the repository's safe defaults. Do not enable shadow execution or promote experimental routing without a reviewed branch, bounded fixtures, budget controls, and validation.

// Shuaib: import this helper into the existing Worker; see WORKER-EMAIL-DOMAIN-BLOCK.md.
export function isBlockedLeadEmail(email) {
  return String(email ?? '')
    .replace(/\0/g, '')
    .trim()
    .toLowerCase()
    .endsWith('@ultraleadgeneration.com');
}

// Returns the rejection response, or null so the EXISTING handler can continue.
// Pass the Worker's EXISTING response headers to preserve its CORS policy.
export function blockedLeadEmailResponse(payload, existingResponseHeaders) {
  if (!isBlockedLeadEmail(payload?.email)) return null;
  const headers = new Headers(existingResponseHeaders);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify({
    ok: false,
    code: 'EMAIL_NOT_ALLOWED',
    message: 'Please use a different email address.'
  }), { status: 400, headers });
}

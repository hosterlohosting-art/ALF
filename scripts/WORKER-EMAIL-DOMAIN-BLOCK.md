# Instructions for Shuaib: existing /web-lead Worker

This is a guard for the current Worker, not a replacement backend. The ALF frontend's endpoint, Turnstile, consent, attribution and routing must remain unchanged. The helper is not wired into ALF or deployed anywhere.

## Exact helper

Use the JavaScript in `worker-email-domain-guard.mjs`. It rejects email addresses ending in `@ultraleadgeneration.com`, case-insensitively, including surrounding whitespace and null characters removed by email normalization. Similar domains such as `notultraleadgeneration.com` remain allowed. It returns HTTP 400 with `ok:false`, code `EMAIL_NOT_ALLOWED`, and the required user-facing message.

## Integration point

1. Locate the current POST `/web-lead` handler. Keep its existing Origin/CORS enforcement, rate limits and JSON parsing.
2. Immediately after parsing the JSON body, and BEFORE any origin-specific test/production branching, deduplication success response, email notification, enqueue, Salesforce/COCO write or other lead side effect, call the guard. Apply it to BOTH consulta and main-site-v1 branches.
3. Use the SAME response-header construction already used by this handler. Do not reflect arbitrary origins or add a new allowlist. The names `payload` and `existingResponseHeaders` below are placeholders for the Worker's existing variables; its private source is unavailable in ALF.

```js
import { blockedLeadEmailResponse } from './worker-email-domain-guard.mjs';

// Inside the existing /web-lead POST handler, after its JSON parse:
const blockedResponse = blockedLeadEmailResponse(payload, existingResponseHeaders);
if (blockedResponse) return blockedResponse;

// Continue the existing validation, Turnstile, deduplication and routing unchanged.
```

If the Worker uses an existing JSON-response helper with request IDs, call that helper with status 400 and the exact JSON fields above instead. Preserve its CORS/cache headers and request-ID handling. Retain Turnstile enforcement for all allowed addresses. If email is normalized again later, ensure no later transformation can turn an allowed value into the blocked domain after this check.

The ALF frontend already catches blocked addresses with the required message. The original standalone handler deliberately displays a generic error for backend failures; this handoff does not change that behavior or add tracking events.

## Tests before deployment

- On BOTH origins, bypass browser validation with controlled API tests or a test harness; `test@ultraleadgeneration.com`, `TEST@ULTRALEADGENERATION.COM`, mixed case and surrounding whitespace must return 400, `ok:false`, and the required message. There must be no email, queue event, CRM write or success conversion. Verify rejection before existing duplicate/test success branches too.
- Keep test-only delivery enabled while testing legitimate Gmail/other addresses with genuine Turnstile tokens. Confirm the original routing and deduplication still work and allowed submissions still reach their intended test inbox/CRM as configured.
- Check preflight and POST CORS headers for both currently allowed origins. Do not bypass Turnstile or change production routing.
- Request approval for the Worker deployment separately. ALF's current instruction is NOT to deploy.

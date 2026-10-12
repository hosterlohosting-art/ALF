# ALF form changes — deployment preparation

Prepared 12 October 2026. GitHub push authorized after review; no separate hosting deployment or Worker update performed.

## Prepared changes

- 21 English/Spanish contact form instances repaired by adding only the existing handler's names: firstName, lastName, email, phone, practiceArea, message. This covers legacy and clean routes for mission/vision, community, team, video library, why choose us, and events. No CSS, structure, field content or recipient changes.
- script.js rejects the blocked email domain before request submission and conversion tracking. Existing event names and parameters remain unchanged; case conversion calls occur after server acceptance.
- server.js rejects blocked contact/newsletter email addresses before outbound notifications, CRM forwarding or storage. Null-character normalization matches existing contact email cleanup. Website script version is incremented to invalidate served HTML script URLs.
- chatgpt/index.html rejects blocked addresses before its existing fetch. The Worker endpoint, site key, Turnstile and routing remain unchanged.
- Test scripts and scripts/form-domain-audit.json record coverage. No external Worker helper or handoff instructions are included in the repository.

## Passed verification

- node scripts/audit-all-form-domain-block.cjs: 343 forms on 266 tracked public HTML pages; 263 newsletter, 77 contact, 1 standalone Worker and 2 search forms. Every shared email form tested with lowercase/uppercase blocked addresses and Gmail/other legitimate addresses. All contact payloads now contain required fields. Existing legitimate payloads and event names match the baseline handler applied to the repaired markup.
- node scripts/test-email-domain-block.cjs: backend handlers with rejected mixed-case/null-containing emails, no blocked outbound calls, legitimate email/CRM forwarding, newsletter storage, full shared success/error handling, standalone Worker frontend, no blocked success conversions.
- npm run check and git diff --check pass.
- All 21 repaired HTML files differ from HEAD only by six field-name additions per form (126 attributes total).

All integrations were mocked. No real notification, Salesforce/COCO record or external Worker update was made. Search and authenticated CMS administration workflows are unchanged.

## Remaining requirements

1. The external /web-lead handler still needs server-side domain blocking by its owner. Until this is implemented and verified, direct Worker requests can bypass the ChatGPT frontend restriction. Its code and configuration are outside this repository and remain unchanged.
2. Actual inbox delivery and downstream COCO receipt have not been independently verified. Perform controlled accepted-submission tests in the existing test setup before final end-to-end sign-off; do not change recipients/routing to conduct these tests.
3. The user authorized pushing the reviewed changes to GitHub. Include only the intended modified HTML, script.js, server.js, and relevant test/handoff files. Preserve unrelated existing untracked files. No separate hosting deployment or Worker update is authorized; hosting configured to deploy automatically from main may react to the push.

The local website changes are ready for deployment review; complete end-to-end protection still depends on the external Worker owner and live integration acceptance checks.

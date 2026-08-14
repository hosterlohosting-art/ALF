# Awad Law Firm CMS architecture

## Safety boundary

The CMS is embedded in the existing Node service under `/admin`. The public HTML, contact forms,
Salesforce delivery, Web3Forms notifications, hCaptcha, location APIs, and static asset routes remain
independent. CMS publishing will only affect public rendering after a content type has been migrated and
verified on staging.

## Storage

CMS records are stored below `DATA_DIR/cms` so production data survives application deployments:

- `content.json` — current content records.
- `revisions.json` — immutable before/after snapshots used for restoration.
- `audit.json` — editorial activity history.
- `media/` — managed uploads in the media phase.

Writes use a temporary file followed by an atomic rename. The storage directory is excluded from Git.

## Content model

All records share publishing, language, URL, SEO, and revision fields. Type-specific fields are stored in
the `fields` object and will be validated by the corresponding editor.

- Pages
- Articles
- Events
- Team members
- Newsletters
- Media
- Global content such as menus, footer details, CTAs, testimonials, results, and FAQs

## Publishing workflow

Content begins as a draft, can be published, and can later be archived. Every save records a revision and
an audit entry. The next phase adds scheduled publication, previews, visual section editing, granular
roles, and restoration controls.

## Migration strategy

Existing HTML remains the source of truth during the CMS build. Each content family is imported,
visually compared, and activated separately. This avoids a single high-risk site-wide cutover and keeps
forms and integrations isolated from editorial changes.

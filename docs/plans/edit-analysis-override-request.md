# Plan: Member-requested Edit Analysis (override request / approve / reject)

**Repo:** Irene (Appknox dashboard, Ember.js + Glimmer + TypeScript)
**Status:** Planning only — NOT implemented. FE plan; BE is being built separately.
**Created:** 2026-07-14
**Owner:** abhinavv@appknox.com

---

## Goal

Currently only Owners/Admins can use **Edit Analysis** (override severity / ignore a
vulnerability). Enhance so that **Members** can raise a *request* to override severity or
ignore a vuln, which an **Owner** approves or rejects. Gated by a new **org-level toggle**
(disabled by default, Owner-controlled). Applies only to **files uploaded after** the
feature ships **and** after the org toggle is turned on.

## Current-access finding (important)

The Edit Analysis entry point is gated by **`this.me.org.is_admin`**:
- `app/components/file-details/vulnerability-analysis-details/edit-analysis-button/index.hbs:1`
  → `{{#if this.me.org.is_admin}}`
- KnoxIQ twin: `app/components/knox-iq/vulnerability-analysis-details/edit-analysis-button/`

`app/models/organization-me.ts` exposes `is_admin`, `is_owner`, derived
`is_member = !is_admin && !is_owner`.

⇒ **Admins and Owners already have full Edit Analysis today; Members do not.** So this
enhancement is effectively **Members-only** for the raise-a-request flow. Admins/Owners keep
existing direct edit + reset.
**TODO / confirm with BE:** is `is_admin` true for Owners? If Owners are NOT `is_admin`, the
current gate already needs a tweak.

---

## Key existing code (grounding)

### Edit Analysis button (thin per-context wrapper)
- `app/components/file-details/vulnerability-analysis-details/edit-analysis-button/index.ts`
  — builds `analysisDataModel`, opens drawer, defines save/reset handlers. API calls here:
  `ajax.put`/`ajax.delete` to `files/{fileId}/vulnerability_preferences/{vulnId}/risk`
  (see `editResetAnalysisURL`), then `analysis.reload()` + `RISK_OVERRIDE_EVENT` analytics.
- `.../edit-analysis-button/index.hbs` — gate `is_admin` + `(or @analysis.isRisky
  @analysis.isOverriddenAsPassed)`; deprecated/read-only via `isVulnerabilityActive`.
- `.../edit-analysis-button/reset-confirm/` — reset confirmation UI.
- KnoxIQ parallel copy: `app/components/knox-iq/vulnerability-analysis-details/edit-analysis-button/`.
- Rendered from `app/components/file-details/vulnerability-analysis-details/index.hbs:52`.

### Shared reusable override drawer (`app/components/analysis-risk/override-edit-drawer/`)
- `index.ts` — drawer shell; defines central `AnalysisRiskDataModel` interface (the contract
  every caller fills: risk, overriddenRisk, comment, criteria, handlers…).
- `content/index.ts` — switches between `override-details`, `override-form`, `reset-confirm`.
- `override-form/index.ts` — the edit form; ember-changeset validation for risk/criteria/comment;
  "Ignore vulnerability" = selecting `ENUMS.RISK.NONE`; criteria = current-file vs all-future.
- `override-details/index.ts` — read-back of an existing override.
- **Third consumer (keep additive!):** `app/components/project-settings/analysis-settings/
  vulnerability-list/index.ts` uses this drawer with `VulnerabilityPreferenceModel` for
  project-level bulk override. Any `AnalysisRiskDataModel` changes must be optional/additive.

### Models
- `app/models/analysis.ts` — `risk`, `computedRisk`, `overriddenRisk`, `overriddenRiskComment`,
  `overrideCriteria`, `overriddenBy`, `overriddenDate`, `status`; getters `isRisky`,
  `isOverriddenRisk`, `isNonPassedRiskOverridden`, `isOverriddenAsPassed`, `isRiskPassedBySystem`.
  belongsTo `vulnerability`, `file`.
- `app/models/vulnerability.ts` — `isActive` drives deprecated/read-only lock.
- `app/models/vulnerability-preference.ts` — per-project override.
- `app/models/file.ts` — belongsTo `project`/`profile`; `lastFile` drives criteria logic.
  Need `createdOn` (or equivalent) to gate "past files".
- `app/models/organization-me.ts` — role source of truth (`is_admin`/`is_owner`/`is_member`).
- `app/models/organization-preference.ts`, `organization-ai-feature.ts` — org toggle precedents.

### Role gating
- `app/services/me.ts` — `me.org` = `organization-me`. Templates use `this.me.org.is_owner` / `.is_admin`.

### Org settings / toggle precedent
- `app/components/organization/ai-powered-features/index.ts` — BEST template for the new toggle:
  `store.queryRecord` a preference model, optimistic toggle with rollback on error
  (`toggleFeature` task), owner-gated.
- `app/components/organization/settings/index.hbs` — owner-gated sections `{{#if this.me.org.is_owner}}`.
- Templates: `app/templates/authenticated/dashboard/organization-settings/*`.

### In-app notifications
- `app/services/ak-notifications.ts` (+ `ak-notifications-base.ts`) — fetch / unread / markAllAsRead;
  queries `nf-in-app-notification`. `sk-notifications.ts` = Storeknox variant (not needed here).
- `app/models/nf-in-app-notification.ts` — `messageCode`, `context`, `hasRead`, `createdOn`.
- `app/components/notifications-page/notification_map.ts` — maps `messageCode` → message component
  + typed context class. Also update `NotificationMessageKey` / `NotificationContexts` types.
- Each message: `notifications-page/messages/nf-xxx/` with `index.hbs` + `index.ts` + `context.ts`.
- Link-out precedent: `messages/nf-sastcmpltd1/index.hbs` uses `AkLink @route='authenticated.dashboard.file'`.
- **Approve/reject inline precedent:** `app/components/notifications-page/namespace-message/`
  implements approved / rejected / unmoderated states with inline approve + reject-with-reason
  tasks — closest analogue to this whole flow.
- Bell: `app/components/notifications-dropdown/` (auto-renders once messageCode registered).

### Enums (`app/enums.ts`)
- `RISK`: NONE 0, LOW 1, MEDIUM 2, HIGH 3, CRITICAL 4 (+ UNKNOWN for scanning). "Ignore" = NONE.
- `ANALYSIS_OVERRIDE_CRITERIA`: `CURRENT_FILE`, `ALL_FUTURE_UPLOAD` → the `all` boolean sent to API.

---

## FE work items

### 1. Org-level toggle (Owners only)
- New toggle in Organization Settings modeled on `organization/ai-powered-features/`.
- Back with a model (extend `organization-preference.ts` or new `organization-override-preference.ts`)
  + `store.queryRecord` + `save()`, optimistic-toggle-with-rollback.
- Visibility gated on `me.org.is_owner`; default OFF (value from BE).

### 2. Edit Analysis button — role-aware branching
Rework `.../edit-analysis-button/index.hbs` (+ KnoxIQ twin) so the icon renders for Members too,
branching on role + request state + org-toggle + file eligibility (`createdOn`):
- **Owner/Admin:** unchanged direct edit + reset.
- **Member, no request (toggle ON & file eligible):** "Raise request" → drawer in **request mode**.
- **Member, request pending:** read-only **"under review"** view; blocks duplicate requests for
  same vuln + file (other members see same UI).
- **Member, approved:** read-only overridden view (no re-edit / no reset).

### 3. Extend shared override drawer
- Add optional `mode: 'edit' | 'request' | 'review' | 'approve'` to `AnalysisRiskDataModel`.
- Request-mode: reuse `override-form`, submit → new `raiseOverrideRequestHandler`.
- Approve/Reject actions for Owners on a pending request (approve = 1 click; reject requires reason —
  mirror namespace `Unmoderated` → reject-with-reason).
- New handler tasks in the two `edit-analysis-button/index.ts` files: `raiseRequest`,
  `approveRequest`, `rejectRequest(reason)` → new endpoints → `analysis.reload()`.

### 4. Owner approve/reject on the vuln page (not only via notification)
- Drive approve/reject UI off `overrideRequestStatus === 'pending'` on the analysis, independent of
  navigation source. After resolve, `analysis.reload()` so other owners lose the approve/reject
  controls (satisfies "only one owner can approve").

### 5. In-app notifications (new messageCodes)
Add message components under `notifications-page/messages/` + register in `notification_map.ts`
+ extend types, for:
- request-raised → all Owners
- request-approved → requester (member) + other owners
- request-rejected → requester, includes reason (reason NOT shown on vuln page)
Each with "View vuln details" deep link (needs file_id + vulnerability_id in context).

### 6. Report (PDF) changes — TBD / deferred
Spec marks design TBD. In the report's existing Edit-Analysis audit section, add "approved by
<owner>" for member-requested + owner-approved overrides. Hold for design + BE report fields.

### 7. i18n + tests
- Add `translations/` keys (e.g. `overrideRequest.*`).
- Per CLAUDE.md `tests-accompany-src`: integration tests for drawer modes, button role-gating,
  org toggle, and each new notification message component.

---

## Behavior rules from spec (checklist)
- [ ] Org toggle: Owner-only, default OFF.
- [ ] Members can raise request across projects they can access.
- [ ] Raise → in-app notification to all Owners (+ email, BE).
- [ ] Owner approve/reject reachable from notification AND direct vuln view.
- [ ] On approve: notify requester + other owners; other owners lose approve/reject for that vuln.
- [ ] Member view of approved override: read-only, no re-edit / no reset. Admin/Owner keep re-edit + reset.
- [ ] While pending: no other member can raise for same vuln + file id; they see the review UI.
- [ ] Reject requires reason; requester notified with reason; reason NOT on vuln page.
- [ ] After reject: any member can re-raise.
- [ ] Report shows who approved the override (TBD design).
- [ ] Only files uploaded after feature release AND after toggle turned on are eligible.

---

## Open questions for BE (assumptions to confirm)
1. Org-toggle field name + endpoint (mirror `organization-ai-feature`). Guess: `allow_member_override_requests`.
2. Override-request state shape on analysis / vuln-preference payload:
   `overrideRequestStatus` (none/pending/approved/rejected), `requestedBy`, `requestedRisk`,
   `requestedComment`, `requestCriteria`, `approvedBy`, `rejectedReason`, request id.
3. Endpoints for create / approve / reject(reason) — likely under
   `files/:id/vulnerability_preferences/:vulnId/...`.
4. New notification `messageCode`s + context JSON (must include file_id + vulnerability_id).
5. Is `is_admin` true for Owners? (Determines whether the Owner path gate needs changing.)
6. `file.createdOn` (or feature-availability timestamp) exposed for past-files gating.

## Recommended build order (when green-lit)
1. UI-only, low risk: drawer `mode` + role-aware button branching (feature-flag / stubbed fields).
2. Org toggle (Owner) once preference field exists.
3. Wire real create/approve/reject endpoints.
4. Notification message components once messageCodes finalized.
5. Report changes (after design).
6. Tests + i18n throughout.

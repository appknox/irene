# Architecture

Irene is the dashboard: a single-page Ember Octane application.

If your change makes something here wrong, update this file in the same PR.

For setup and deploy, see [README.md](README.md).

## Contents

1. [Context](#1-context)
2. [Structure](#2-structure)
3. [Runtime](#3-runtime)
4. [Crosscutting concepts](#4-crosscutting-concepts)
5. [Invariants](#5-invariants)
6. [Sharp edges](#6-sharp-edges)
7. [Glossary](#7-glossary)
8. [Where to make a change](#8-where-to-make-a-change)

---

## 1. Context

### 1.1 What it is

Irene renders scan results for mobile applications — static, dynamic and API
scans — plus the organization, project, billing and reporting surfaces around
them.

It has no backend of its own. Every screen is a view onto the REST API.
Almost all complexity here comes from three places: the shape of that API, the
permission model layered over it, and the size of the UI surface.

### 1.2 System context

```
                    ┌──────────────────────┐
      IdP ─────────►│                      │
 (SAML2, OIDC)      │                      │
                    │        Irene         │◄──── REST API
   Freshdesk ◄──────│   (browser SPA)      │        (api, v2, v3)
    (widget)        │                      │
                    │                      │◄──── WebSocket (socket.io)
      Pendo ◄───────│                      │        realtime counters
   (analytics)      └──────────────────────┘
                               │
                               └──► Chargebee (billing callback)
```

Everything except the IdP redirect is reached through, or configured by, the
the API. Irene holds no third-party credentials of its own — widget keys and
the websocket host arrive from the server at boot (§3.1).

### 1.3 Constraints

- **Browser-only.** No server-side rendering, no build-time data.
- **Runtime configured.** Branding, enabled modules and integration keys come
  from the API at boot, not from the build. The same bundle serves every
  deployment, including whitelabel ones.
- **Two locales, always in step.** English and Japanese (§4.7).

---

## 2. Structure

### 2.1 Layers

Dependencies point one way. A layer may use anything below it, never above.

```
  routes / controllers      own the URL, load page data
          │
          ▼
      components            render, handle interaction
          │
          ▼
       services             cross-cutting state (session, org, notifications)
          │
          ▼
  models / adapters / serializers      ──►  REST API
```

Components reach services directly; they do not reach adapters. Adapters do not
reach services other than for URL construction (`organization`, `session`).

### 2.2 Code map

#### `app/routes` + `app/controllers`

Routes fetch the data a page needs and own query params. `app/router.ts`
declares the route tree; nearly all of it sits under an `authenticated` branch that
enforces a valid session.

Controllers are thin — mostly query-param declarations. Business logic lives in
components and services.

#### `app/components`

Two groups, and it matters which one you're in:

- **`ak-*` — the design system.** `ak-button`, `ak-table`,
  `ak-select`, `ak-modal`, and so on. Generic, product-agnostic, each with a
  `.stories.js` file for Storybook. **Change these with care** — every feature
  depends on them.
- **Everything else — feature components**, namespaced by product area:
  `file-details`, `project-settings`, `organization`, `storeknox`, `knox-iq`,
  `sbom`, `privacy-module`, `partner`, `security`, `ai-reporting`.

Standard component shape:

```
my-component/
├── index.hbs      template
├── index.ts       Glimmer component class
├── index.scss     styles, referenced with local-class
└── index.stories.js   (ak-* only)
```

#### `app/models`, `app/adapters`, `app/serializers`

The Ember Data layer. One model per API resource. Adapters build URLs;
serializers normalize payloads. See **API access** below — the adapter
hierarchy is the least obvious part of this codebase.

#### `app/services`

Cross-cutting state. The ones almost everything depends on:

| Service                         | Owns                                                    |
| ------------------------------- | ------------------------------------------------------- |
| `session` (ember-simple-auth)   | Authentication                                          |
| `me`                            | The current user's org membership and role              |
| `organization`                  | The selected organization, its features and AI features |
| `notifications`                 | Toasts                                                  |
| `ajax`                          | Direct HTTP outside Ember Data                          |
| `intl` (ember-intl)             | Translation                                             |
| `realtime`, `websocket`, `poll` | Live scan-status updates                                |
| `whitelabel`                    | White-label deployment behaviour                        |

#### `app/styles`

Three-layer styling contract — see **Styling** below.

#### `mirage/`

The full API mocked for tests and local development.

#### `tests/`

Unit for models/adapters/serializers/helpers, integration for components,
acceptance for flows. Shared helpers in `tests/helpers/`.

---

---

## 3. Runtime

### 3.1 Boot sequence

```
1. ApplicationRoute      configuration service → /v2/server_configuration
                                                 /v2/frontend_configuration
                         whitelabel branding, websocket host, widget keys
2. Session               ember-simple-auth restores or redirects to /login
3. AuthenticatedRoute    in parallel:
                           store.findAll('vulnerability')
                           organization.load()          → selected org
                           configuration.getDashboardConfig()
                         then: storeknox org (optional, failure tolerated)
                         then: store.findRecord('user', id)
4. afterModel            me.getMembership(), integrations, Pendo, websocket
```

Two consequences worth knowing. Nothing org-scoped can run before step 3 —
adapters build `/organizations/<selected.id>/…` and `selected` is null until
then. And the Storeknox load is deliberately failure-tolerant; the rest is not.

### 3.2 Request flow

```
component ──► service ──► IreneAjaxService ─────────────┐
                                                        ├──► REST API
component ──► store ──► adapter ──► serializer ─────────┘
```

Which path applies is the single most common source of confusion — see §4.1.

---

## 4. Crosscutting concepts

### 4.1 API access — two paths

Requests go out through one of two layers. They fail differently, so check
which one you're in before writing error handling.

**1. Ember Data (the default).** For anything modelled as a resource.

```
app/adapters/commondrf.ts  ──►  DRFAuthenticationBase  ──►  RESTAdapter
```

Most adapters extend `commondrf` or its nested variant. Most serializers
extend `DRFSerializer`; a few use `JSONAPISerializer`.

**2. `IreneAjaxService` (`app/services/ajax.ts`).** For
endpoints that are actions rather than resources — toggling a feature,
triggering a scan, posting an override request.

They fail differently, and code that handles one does not handle the other:

|                    | Ember Data adapters                   | `IreneAjaxService`                                                                                      |
| ------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Rejects with       | `AdapterError` with an `errors` array | non-429 failures: `{ ...response, payload }`                                                            |
| `parseError` reads | `errors[0].detail` / `.title`         | `payload.detail`                                                                                        |
| Available verbs    | Full REST                             | `request`, `post`, `put`, `delete` — **no `patch`**; use `makeRequest(url, { method: 'PATCH' })`        |
| HTTP 429           | Rejects like any other error          | **Resolves.** Handed to `rateLimit.handleResponse`, then the parsed body is returned as a success value |

`IreneAjaxService` treats 429 as a rate-limit event, not a request failure:
`makeRequest` skips the throw for that status and returns the parsed body. A
`try/catch` around the call never runs, so a caller that assumes a resolved
promise means success will act on an error payload. The `RateLimitService`
owns the user-facing countdown; the calling component should not also report
the failure.

### 4.2 API namespaces

Four namespaces coexist. The resource decides which:

| Namespace          | Value            |
| ------------------ | ---------------- |
| `namespace`        | `api`            |
| `namespace_v2`     | `api/v2`         |
| `namespace_v3`     | `api/v3`         |
| `hudson_namespace` | `api/hudson-api` |

An adapter picks its namespace when building the URL. There is no global rule —
check the adapter.

### 4.3 Authentication and session

`ember-simple-auth` with authenticators in `app/authenticators/`: `irene`
(username/password), `saml2`, `login`, plus OIDC routes.

`app/adapters/auth-base.ts` centralises request behaviour for every Ember Data
adapter:

- **401** → redirect to `/login` with `sessionExpired` or `userInactive`
- **429** → hand to the `rate-limit` service
- Everything else → default handling

### 4.4 Organizations, roles and features

Every authenticated request happens in the context of one selected
organization.

- `organization.selected` — the current `OrganizationModel`. **Must be loaded
  before adapters can build org-scoped URLs.**
- `organization.selected.features` — per-org feature flags
  (`sbom`, `storeknox`, `privacy`, `member_override_request`, …)
- `me.org` — an `OrganizationMeModel` carrying `is_owner`, `is_admin`,
  `is_member`

Permission checks read `me.org`; feature gating reads
`organization.selected.features`. Most gated UI checks both.

### 4.5 Runtime configuration and whitelabel

The `configuration` service fetches three endpoints at boot and holds the
result for the session:

| Endpoint                      | Supplies                                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `/v2/server_configuration`    | websocket host, enterprise flag, device farm URL                                                                  |
| `/v2/frontend_configuration`  | branding, theme colours, logos, registration links, and the integration keys — Pendo, Freshchat, Freshdesk widget |
| `/v2/dashboard_configuration` | dashboard URL, device farm URL                                                                                    |

The `whitelabel` service reads from it to override branding. Because this is
runtime data, the same build serves every deployment — never gate on `ENV` for
anything a deployment can vary.

### 4.6 Realtime

`websocket` opens a socket.io connection to the host from server configuration.
`realtime` holds counters (`FileCounter`, `ProjectCounter`, …) that components
observe to know when server-side data has changed. `poll` covers endpoints with
no socket channel.

### 4.7 Internationalization

`ember-intl`, with `translations/en.json` and `translations/ja.json`.
The two files hold the same keys, and should stay that way.

Templates use `{{t 'key'}}`; classes use `this.intl.t('key')`.

### 4.8 Styling

Three layers, and skipping the middle one is a bug:

```
_theme.scss                  raw values: palette, shadows, radii
   ↓
_component-variables.scss    per-component bridge variables
   ↓
component/index.scss         local-class, consumes bridge vars only
```

A component's SCSS must reference variables prefixed with its own folder path.
It must not reach past the bridge to a raw theme value. `local-class` means
class names are hashed at build time.

See the `component-scss-refactor` skill for the full procedure.

### 4.9 Enums

`app/enums.ts` is the shared vocabulary — risk levels, analysis
statuses, platforms, scan types. A transform adds `CHOICES`, `VALUES`,
`BASE_CHOICES` and `BASE_VALUES` to each enum. Never hardcode the numbers.

---

## 5. Invariants

Things that are true, that reading the code will not tell you:

- **`en.json` and `ja.json` always have identical key structure.** Adding a key
  to one without the other is a defect, not a to-do.
- **Adapters never talk to `IreneAjaxService`, and services never talk to
  adapters' private `ajax`.** The two paths stay separate.
- **Components do not build URLs from string literals.** Endpoint fragments come
  from `ENV.endpoints`.
- **`ak-*` components have no product knowledge.** No feature flags, no roles,
  no API calls.
- **Component SCSS never references a raw theme variable.** Always through a
  bridge variable.
- **No component reads `ENV` for feature flags.** Features come from
  `organization.selected.features`.

---

## 6. Sharp edges

| Edge                                                                     | Consequence                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`MeService` fetches in its constructor**                               | Merely _touching_ `this.me` issues `GET /organizations/:id/me`. A component that injects `me` forces a request on every render context — and fails in any test that doesn't mock it. Guard access behind cheaper conditions.                                                                                                           |
| **`organization.selected` must be loaded first**                         | Org-scoped adapters build `/organizations/undefined/…` when it is null.                                                                                                                                                                                                                                                                |
| **Serializers may override `primaryKey`**                                | `analysis-override-request` uses `uuid`. A payload keyed by `id` normalizes to an id-less record that silently never materialises.                                                                                                                                                                                                     |
| **`parseError` returns `undefined` for HTTP 500 via `IreneAjaxService`** | It takes the `status == 500` branch and reads `error.title`, which that shape lacks. The user sees an empty toast.                                                                                                                                                                                                                     |
| **`AkButton` applies `...attributes` before its own `disabled` binding** | A passed-through `disabled` attribute is silently overwritten. Always use `@disabled=`.                                                                                                                                                                                                                                                |
| **`riskText` has no default branch**                                     | Its `switch` covers `UNKNOWN` and `NONE`–`CRITICAL`; anything else — an unmapped number, or `NaN` from a non-numeric arg — returns `undefined`. `override-form` casts the result with `as string` and passes it straight to `intl.t()`, which throws. Give every call a fallback, as `analysis-risk/text` does with `\|\| 'untested'`. |
| **`IreneAjaxService` has no `patch`**                                    | Use `makeRequest(url, { method: 'PATCH' })`.                                                                                                                                                                                                                                                                                           |
| **HTTP 429 resolves instead of rejecting**                               | `makeRequest` routes it to `rateLimit.handleResponse` and returns the body. Your `catch` never fires — check the payload, or leave the message to `RateLimitService`.                                                                                                                                                                  |
| **Mirage: later route registrations win**                                | A `beforeEach` default can be overridden per test. Convenient, and easy to trip over.                                                                                                                                                                                                                                                  |

---

## 7. Glossary

| Term                            | Meaning                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------- |
| **Analysis**                    | The result of testing one vulnerability against one file                      |
| **Analysis overview**           | The summarised analysis row shown in listing tables                           |
| **Override**                    | A manual change to an analysis's severity, with a reason                      |
| **Override request**            | A member's request for an override, pending owner/admin review                |
| **File**                        | One uploaded build of an app                                                  |
| **Project**                     | An app across all its uploaded files                                          |
| **Profile**                     | Per-project scan configuration                                                |
| **Namespace**                   | Both an API version prefix _and_ an app-identifier grouping — context decides |
| **VA / SAST / DAST / API scan** | Vulnerability assessment and its scan types                                   |
| **SBOM**                        | Software Bill of Materials                                                    |
| **Storeknox**                   | App-store discovery and monitoring module                                     |
| **KnoxIQ**                      | AI-assisted analysis module                                                   |
| **Partner**                     | Reseller-facing dashboard                                                     |
| **Whitelabel**                  | Rebranded deployment of the same app                                          |

---

## 8. Where to make a change

| Task                       | Start at                                                     |
| -------------------------- | ------------------------------------------------------------ |
| Change how a screen looks  | `app/components/<feature>/…`                                 |
| Add a field from the API   | `app/models/…`, then the serializer                          |
| Change an endpoint URL     | `app/adapters/…` and `config/environment.js`                 |
| Add a page                 | `app/router.ts`, then `app/routes/…`                         |
| Add user-facing text       | `translations/en.json` **and** `ja.json`                     |
| Change a colour or spacing | `_theme.scss` → `_component-variables.scss` → component SCSS |
| Add a shared UI primitive  | `app/components/ak-*` (plus a story)                         |
| Mock an endpoint for tests | `mirage/factories`, `mirage/models`, `mirage/config.js`      |

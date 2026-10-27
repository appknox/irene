# KnoxIQ and AEIS Editing - Technical Details and FE Integration Guide

Oct 5, 2026 · @Utkarsh

## Overview

This vulnerability's analysis page has two independent editable data domains that didn't exist before this backend work: a human **AEIS override** (score/likelihood/exploit vectors) and **KnoxIQ finding editing** (summary, remediation, POC, exploitability per finding). Both are brand new write paths — there was no previous FE integration to preserve compatibility with.

Both are gated by **one single flag**: whether the organization currently has KnoxIQ enabled. This flag is read fresh on every request (not cached per-analysis), so treat it as live state, not something to store.

**The one thing to get right first:** the flag only reflects *current* org state, not *historical* data. If an org had KnoxIQ enabled, used it, and later disabled it, the AEIS/KnoxIQ-finding data for files scanned during that window becomes **inaccessible** — the AEIS fields disappear from the analysis response entirely, and the KnoxIQ findings endpoint returns `403 Forbidden`. This is current, intentional (if debatable) backend behavior — see the **Known limitations** section at the end before you design around it.

## Which UI to show

Read the org's KnoxIQ flag once per page load (it comes back as part of the org/organization payload your app already fetches — look for the `knoxiq` key under the org's AI features). Everything else branches off that one boolean.

| Flag state | AEIS Score card | Findings editor |
| --- | --- | --- |
| KnoxIQ enabled | Show it (falls back to "No AEIS score available yet" if this specific analysis has no score) | Show the **KnoxIQ finding editor** (rich fields, per-finding CRUD) |
| KnoxIQ disabled | Don't render it — the backend omits the fields entirely | Show the **legacy findings editor** (flat title + description list) |

There is no analysis-level "this file was scanned by KnoxIQ" signal separate from the org flag today — don't try to infer one. If the flag is off, treat the KnoxIQ-specific UI as fully unavailable, not degraded.

## AEIS Score section

Only relevant when KnoxIQ is enabled.

### Reading the current score/vectors

`GET /api/hudson-api/analyses/{id}` (security dashboard page) or `GET /api/v2/analyses/{id}` (KnoxIQ page) — both return the same three fields:

```json
{
  "exploitability_score": 7.1,
  "exploitability_likelihood": "low",
  "exploitability": {
    "score": 7.1,
    "exploitability_likelihood": "low",
    "signals": {
      "requires_chaining": true,
      "remote_exploitation": true,
      "public_exploit_exists": true,
      "local_exploitation_only": true,
      "minimal_user_interaction": true,
      "no_authentication_required": true,
      "obscure_or_environment_specific": true
    },
    "signal_reasoning": { "public_exploit_exists": "..." },
    "attack_scenario": ["..."],
    "references": ["..."],
    "exploitability_analysis": { "summary": "...", "evidence": ["..."] },
    "ai_model_used": "...",
    "ai_fallback_used": false
  }
}
```

- If KnoxIQ is **disabled** for the org: these three keys are **absent from the response entirely** — check `'exploitability' in response`, don't assume `null`.
- If KnoxIQ is **enabled** but this analysis has no AEIS data yet: the keys are present but `null`.
- Each signal value is `true`, `false`, or the string `"unknown"` — treat it as a tri-state, not a boolean.

### Setting/editing the override (Edit button → Save)

`PUT /api/v2/analyses/{id}/aeis-override`

```json
{
  "score": 7.1,
  "likelihood": "low",
  "signals": {
    "requires_chaining": true,
    "remote_exploitation": false,
    "public_exploit_exists": false,
    "local_exploitation_only": true,
    "minimal_user_interaction": false,
    "no_authentication_required": false,
    "obscure_or_environment_specific": true
  }
}
```

- `score`: required, float 0–10.
- `likelihood`: required, one of `"low" | "medium" | "high" | "critical"` (a different scale from the finding-editor one below — don't mix them up).
- `signals`: optional. Omit it to change only score/likelihood and keep the AI's existing vectors. If you send it, send **all 7 keys** — any key you omit is normalized to `"unknown"`, not left at its previous value. There's no partial-signal patch; the editor should always submit the full 7-key object once the user opens the vectors section.
- Returns `403` if the org doesn't currently have KnoxIQ enabled.
- Response body is the same analysis payload shown above, already reflecting the new override.

### Clearing the override (revert to AI data)

`DELETE /api/v2/analyses/{id}/aeis-override` — no body. Reverts `exploitability_score`/`exploitability_likelihood`/`exploitability` back to whatever the AI originally computed (or `null` if there was none).

## KnoxIQ Finding editing

Only relevant when KnoxIQ is enabled. All four endpoints below return `403 Forbidden` for the whole resource if the org's KnoxIQ flag is off — there's no partial/read-only fallback here, unlike the AEIS section.

### List findings

`GET /api/knoxiq/analyses/{analysis_id}/findings`

```json
{
  "results": [{
    "id": 42,
    "finding_id": "F-0",
    "title": "Debug logging enabled",
    "description": "...",
    "validation": { "confidence_label": "HIGH", "finding_summary": "...", "evidence": ["..."], "reasoning": "..." },
    "remediation": { "remediation": "...", "steps": ["..."], "code_examples": [], "references": [] },
    "poc": { "poc_title": "...", "verification_steps": [{ "step_number": 1, "title": "...", "expected_result": "..." }] },
    "developer_prompt": null,
    "exploitability": { "exploitability_likelihood": "High", "exploitability_analysis": { "summary": "..." } },
    "scan_type": 1,
    "scan_id": 123
  }]
}
```

`id`, `finding_id`, `scan_type`, `scan_id` are read-only — never send them back.

### Add a finding (+ Add Finding button)

`POST /api/knoxiq/analyses/{analysis_id}/findings`

Body can be `{}` (creates a blank manual finding with an auto-generated `finding_id` like `manual-a1b2c3d4`) or include any of the write fields below immediately. Response is the full finding object, same shape as the list above.

### Edit a finding

`PATCH /api/knoxiq/analyses/{analysis_id}/findings/{finding_id}` — flat, write-only body. Send only the fields you're changing; each one is merged independently server-side, so untouched fields (including ones you never had a UI for) survive:

| Field | Type | Maps to |
| --- | --- | --- |
| `confidence` | int, `-1\|1\|2\|3` | validation confidence |
| `summary` | string | validation finding summary |
| `evidence` | string\[\] | validation evidence bullets |
| `reasoning` | string | validation reasoning |
| `remediation_steps` | `[{heading, body}]` | remediation step list |
| `steps_to_reproduce` | `[{heading, body}]` | POC verification steps |
| `exploitability_likelihood` | int, `-1\|1\|2\|3` | exploitability likelihood |
| `exploitability_analysis` | string | exploitability analysis summary |

See **Reference tables** below for what the `-1/1/2/3` scale means.

**`title` and `description` cannot be edited.** They're declared on the serializer but the save logic never writes them — sending them is silently ignored, no error. Don't build editable title/description fields for KnoxIQ findings; if product wants that, it needs a backend change first.

**`remediation.steps` has two possible shapes on read**, depending on whether a step has ever been edited:

- Untouched AI data: a plain string, e.g. `"Set debug='false' in config.xml"`.
- Edited via this API: an object, `{"heading": "...", "body": "..."}`.

Your load-into-editor code must handle both: `typeof step === 'string' ? {heading: '', body: step} : step`. Once you PATCH `remediation_steps`, that finding's steps are always objects from then on.

### Delete a finding

`DELETE /api/knoxiq/analyses/{analysis_id}/findings/{finding_id}` — no body, no soft-delete. One thing to know: if the deleted finding happened to be the one driving this analysis's AEIS score/vectors, those vectors can go blank on the KnoxIQ page afterward (the AEIS *number* survives, the detailed signals don't) — consider warning the user before deleting a finding that's currently the AEIS source, though the API won't tell you which one that is up front.

## Legacy (non-KnoxIQ) Findings editing

Only relevant when KnoxIQ is **disabled**. This is a completely different mechanism from KnoxIQ finding editing — don't try to share code between them beyond the form fields themselves.

There's no per-finding REST resource. Findings live as a plain JSON array on the analysis itself, and you save the **whole array** as part of the **whole analysis** save:

`PUT /api/hudson-api/analyses/{id}`

```json
{
  "findings": [
    { "title": "Finding 1", "description": "...", "screenshot": "" },
    { "title": "Finding 2", "description": "...", "screenshot": "" }
  ],
  "risk": 3,
  "status": 3,
  "cvss_vector": "...",
  "legacy_cvss_vector": "..."
}
```

(plus the rest of the analysis-edit payload your form already sends — regulatory category lists, overridden\_risk fields, etc. — this endpoint expects the complete form state, not a partial patch.)

Each finding is just `{title, description, screenshot}` — no confidence, no evidence, no remediation steps, nothing structured. To add/edit/remove a finding: mutate the array client-side, then send the **entire updated array** back in this one PUT. There's no way to touch a single finding in isolation.

## Shared scenarios (same regardless of KnoxIQ)

### CVSS / risk / status edits

All go through the same `PUT /api/hudson-api/analyses/{id}` whole-analysis save used for legacy findings above — `risk`, `status`, `cvss_vector`, `active_cvss_vector_fields`, `legacy_cvss_vector`, `legacy_cvss_vector_fields`. This part of the API is unaffected by the KnoxIQ flag.

### Mark as Passed — recommended pattern

Marking an analysis Passed sets CVSS to a canonical "definitely passed" vector rather than just zeroing a number — every CVSS metric is set to its hardest-to-exploit value (no impact, hardest attack preconditions), so the vector itself reads as deliberate, not coincidental:

```json
{ "risk": 0, "status": 3, "cvss_vector": "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N" }
```

**If this analysis has AEIS data** (`exploitability_score !== null`), mirror the same idea by also overriding AEIS to its own hardest-to-exploit shape, right after the CVSS save succeeds:

```json
PUT /api/v2/analyses/{id}/aeis-override
{
  "score": 0,
  "likelihood": "low",
  "signals": {
    "requires_chaining": true,
    "remote_exploitation": false,
    "public_exploit_exists": false,
    "local_exploitation_only": true,
    "minimal_user_interaction": false,
    "no_authentication_required": false,
    "obscure_or_environment_specific": true
  }
}
```

This is a **frontend orchestration choice**, not something the backend enforces automatically — the backend has no concept of "Mark as Passed" touching AEIS on its own. If you skip this call, the AEIS card will keep showing the AI's original (possibly high-risk) score next to a Passed CVSS badge, which reads as contradictory. On the KnoxIQ page itself this is partly masked — it swaps to a plain passed view and hides the AEIS card entirely once `risk` is 0 — but the security dashboard page has no such hiding logic, so the AEIS card stays visible there with whatever score it last had.

## Reference tables

### Finding editor confidence / exploitability likelihood scale

Used for `confidence` and `exploitability_likelihood` on the KnoxIQ finding PATCH. Note there's no Critical tier here — only 4 values.

| Value sent | Label shown |
| --- | --- |
| `3` | High |
| `2` | Medium |
| `1` | Low |
| `-1` | Unknown |

### AEIS override likelihood scale

Used for `likelihood` on the AEIS override PUT — a different scale from the one above, sent as a string, and it does have a Critical tier (folded into High server-side since the underlying risk enum has no Critical exploitability tier):

| Value sent | Meaning |
| --- | --- |
| `"critical"` | Critical (stored server-side as High) |
| `"high"` | High |
| `"medium"` | Medium |
| `"low"` | Low |

### The 7 AEIS signal keys

Each is `true`, `false`, or `"unknown"`:

| Key | Label |
| --- | --- |
| `requires_chaining` | Requires Chaining |
| `remote_exploitation` | Remote Exploitation |
| `public_exploit_exists` | Public Exploit Exists |
| `local_exploitation_only` | Local Exploitation Only |
| `minimal_user_interaction` | Minimal User Interaction |
| `no_authentication_required` | No Authentication Required |
| `obscure_or_environment_specific` | Obscure Or Environment Specific |

### Risk enum (`risk`, `overridden_risk`, `legacy_cvss_risk`)

| Value | Meaning |
| --- | --- |
| `0` | None / Passed |
| `1` | Low |
| `2` | Medium |
| `3` | High |
| `4` | Critical |

## Known limitations / gotchas to design around

- **KnoxIQ-disabled hides historical data, not just new access.** If an org had KnoxIQ, scanned files, then disabled it, the AEIS fields vanish from the analysis response and the findings endpoint 403s — for files that genuinely have real historical data sitting in the database. Don't build a "no data yet" empty state assuming it only ever means "never scanned"; it can also mean "was scanned, now hidden." There's no way for the FE to tell these two cases apart today.
- **`title`/`description` are not editable on KnoxIQ findings.** The fields exist on read but any value you PATCH for them is silently dropped. Don't wire up an editable title field expecting it to persist.
- **`remediation.steps` has two shapes** — plain string (untouched AI data) or `{heading, body}` object (edited). Normalize on load; see the KnoxIQ Finding editing section above.
- **AEIS `signals` writes are all-or-nothing.** Sending a partial signals object resets the keys you didn't include to `"unknown"` — always submit all 7.
- **Deleting a KnoxIQ finding can blank the AEIS vector list** on the KnoxIQ page if that finding was the one driving the analysis's exploitability data (the score number survives; the signals/attack-scenario detail doesn't). The API gives no advance warning which finding that is.
- **Two different confidence/likelihood scales exist side by side** — the finding editor's `-1/1/2/3` integer scale and the AEIS override's `"low"/"medium"/"high"/"critical"` string scale. They are not interchangeable; see Reference tables.
- **The security dashboard's AEIS card doesn't auto-hide when an analysis is marked Passed** (unlike the KnoxIQ page, which swaps to a plain passed view). If you implement the Mark as Passed → AEIS mirroring pattern above, this is less jarring since the card will show the canonical "passed" vectors instead of stale high-risk ones — but it's still visible, just not alarming.

## Backend: what it had to achieve, and how

Everything above is the API surface. This section is the plain-language "why does it work like that" behind it, for anyone who wants the reasoning rather than just the endpoints.

### The requirement, in one sentence

A human needed to be able to correct two things KnoxIQ's AI computes — the AEIS exploitability score/vectors, and a finding's own write-up (summary, remediation, POC, exploitability analysis) — without losing any of the AI's original work in the process. Before this, both were 100% read-only everywhere.

### The core idea: layer the human edit on top, don't replace the AI's data

The AI's output for an analysis (and for each finding) is one big JSON blob computed by the scan. The simple way to let a human "edit" it would be to let them overwrite that blob, or parts of it, directly. That's the wrong design here, and we found out why the hard way during this work: the first version of the AEIS override did exactly that — saving a new score/likelihood replaced the *entire* exploitability object, including the signal vectors, attack scenario and reasoning the AI had already produced. The KnoxIQ page's vector list went blank every time someone used the feature it was built for.

The fix, and the pattern used everywhere in this feature, is: **store the human's edit in its own separate field, and merge it on top of the AI's data at read time** — never write the human edit into the AI's own data, and never let the human edit erase AI fields it didn't touch.

- `Analysis` gets a new `aeis_override` field (empty by default). Reading the "current" exploitability score/likelihood/vectors means: take the AI's version, then layer the human override's score and likelihood on top of it — but keep the AI's signals, attack scenario and reasoning untouched unless the human specifically edited signals too.
- `KnoxIQFinding` gets a new `content_override` field (empty by default). Reading a finding's "current" content means: take the AI's result for that finding, then layer whatever the human has overridden (summary, a remediation step, a POC step, an exploitability note) on top — again, only the pieces actually edited, nothing else.

This is also why editing a finding's summary doesn't require sending back its remediation, POC and exploitability data too: the write side accepts small, flat, single-purpose fields (just `summary`, or just `remediation_steps`, etc.), and the backend takes care of merging each one into the right nested spot of the stored override, leaving every other part of the finding exactly as the AI left it.

### Why this is safe to ship

Both new fields are **optional and empty by default**. Every analysis and every finding that existed before this work simply has an empty override, so nothing changes for them until a human actually uses the new editor. Nothing about how the AI computes or stores its own results changed, and nothing that CI/CD (the automated pass/fail checks on a build) reads was touched — those checks intentionally keep reading the AI's raw numbers, so a human correcting the dashboard view never silently changes whether a build passes.

### What was considered and deliberately not shipped

An organization can turn KnoxIQ on and off. The question came up: if an org used KnoxIQ, built up real override data, then switched it off later, should that past data still be visible? A fix for this was built and tested, then **rolled back by product decision** — today, turning KnoxIQ off hides all of this (both reading and editing) regardless of whether real data exists underneath, exactly like a brand-new org that never had it. See **Known limitations** above for what this means for the FE.

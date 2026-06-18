# Scenario scripts — reference

Describes the **data shape** and **verification behavior** in more detail, still without implementation or migration notes.

---

## Data shape (same pattern as today)

Each scenario is one object:

| Field         | Purpose                                            |
| ------------- | -------------------------------------------------- |
| `title`       | Scenario name (also used to name stored values)    |
| `description` | Optional; for UI/documentation only—not sent to AI |
| `data`        | **Ordered list of steps** (first item runs first)  |

Each item in `data` is a small flat object. Every step includes:

| Field    | Required | Meaning                                    |
| -------- | -------- | ------------------------------------------ |
| `action` | Yes      | What to do (see table below)               |
| `id`     | Yes      | Which control (email, logo, env, login, …) |

Other fields depend on `action` (see below).

---

## Actions and fields

### `tap`

Click a control. Use `times` for multi-tap unlocks (e.g. logo × 13).

| Field   | Required | Notes               |
| ------- | -------- | ------------------- |
| `times` | No       | Default `1`, max 20 |

Example: `{ "action": "tap", "id": "logo", "times": 13 }`

---

### `long_press`

Press and hold (hidden menus, debug entries).

| Field         | Required | Notes            |
| ------------- | -------- | ---------------- |
| `duration_ms` | No       | Default ~1500 ms |

Example: `{ "action": "long_press", "id": "version" }`

---

### `enter_text`

Type into a field. Value is stored securely for the scan; AI only sees a **slot name**, not the text.

| Field       | Required | Notes                                     |
| ----------- | -------- | ----------------------------------------- |
| `value`     | Yes      | Stored server-side for the run            |
| `is_secure` | No       | Default `false`; use `true` for passwords |

Example: `{ "action": "enter_text", "id": "password", "value": "…", "is_secure": true }`

**Stored slot name** (internal): derived from scenario `title` + step `id`, e.g. `tenant_login_password`. Plans refer to it as `{{tenant_login_password}}`.

---

### `select`

Choose one visible option (environment, language, list row)—typical after a dialog opens.

| Field    | Required | Notes                   |
| -------- | -------- | ----------------------- |
| `option` | Yes      | Short label, e.g. `Dev` |

Example: `{ "action": "select", "id": "env", "option": "Dev" }`

---

### `check`

Set a checkbox or switch on or off (terms, remember me).

| Field     | Required | Notes          |
| --------- | -------- | -------------- |
| `checked` | No       | Default `true` |

Example: `{ "action": "check", "id": "terms", "checked": true }`

---

### `swipe`

Swipe on a control or area (onboarding carousel, scroll list).

| Field       | Required | Notes                            |
| ----------- | -------- | -------------------------------- |
| `direction` | Yes      | `up`, `down`, `left`, or `right` |
| `times`     | No       | Default `1`                      |

Example: `{ "action": "swipe", "id": "carousel", "direction": "left", "times": 3 }`

---

### `drag`

Drag a control (e.g. slider).

| Field       | Required | Notes                         |
| ----------- | -------- | ----------------------------- |
| `direction` | Yes      | `up`, `down`, `left`, `right` |
| `distance`  | Yes      | `short`, `medium`, or `long`  |

Example: `{ "action": "drag", "id": "volume_slider", "direction": "right", "distance": "medium" }`

---

### `wait`

Pause before the next step (animations, network after login).

| Field     | Required | Notes                               |
| --------- | -------- | ----------------------------------- |
| `seconds` | Yes      | Capped (e.g. 1–15)                  |
| `id`      | Yes      | Label for logs only (e.g. `settle`) |

Example: `{ "action": "wait", "id": "settle", "seconds": 2 }`

---

## Full example (login + environment)

```json
{
  "title": "Tenant login",
  "description": "",
  "data": [
    { "action": "tap", "id": "logo", "times": 13 },
    { "action": "select", "id": "env", "option": "Dev" },
    {
      "action": "enter_text",
      "id": "email",
      "value": "user@example.com",
      "is_secure": false
    },
    {
      "action": "enter_text",
      "id": "password",
      "value": "…",
      "is_secure": true
    },
    { "action": "check", "id": "terms", "checked": true },
    { "action": "tap", "id": "login", "times": 1 },
    { "action": "wait", "id": "settle", "seconds": 2 }
  ]
}
```

---

## Verification (immediately after each action)

Verification runs **right after** the device action, **before** the next checklist step. Results are safe to show in ops UI (no secret values).

### General rules

- **Pass** → advance to next step (or next planning cycle if the screen changed a lot).
- **Fail** → record step index + reason; planner/operator can retry or fix the script—not by retyping secrets into the AI.
- The **AI does not** perform verification; a **system checker** reads the UI hierarchy (and optional hashes for secrets).

### Per action

| Action       | What we check                                                                                                                                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tap`        | Click succeeded. If the step usually opens UI: hierarchy changed, dialog/sheet appeared, or target state updated. Multi-tap: all taps delivered or clear UI change after the last one.                                                                                                               |
| `long_press` | Gesture succeeded; expected menu/dialog/change if applicable.                                                                                                                                                                                                                                        |
| `enter_text` | **Non-secret:** text in the targeted field matches what was stored (normalized compare). **Secret:** field is non-empty, focused/input state looks correct, masked when applicable; compare using a secure hash—never log or return the plaintext. Wrong field: fail (“text not in expected field”). |
| `select`     | Node matching `option` is selected, or dialog/sheet closed and follow-up UI visible. If option not in hierarchy: fail (“option not found”).                                                                                                                                                          |
| `check`      | Checkbox/switch `checked` attribute matches requested `checked`.                                                                                                                                                                                                                                     |
| `swipe`      | Swipe executed; for carousels, page/content index or visible items changed when expected.                                                                                                                                                                                                            |
| `drag`       | Drag executed; thumb/slider position changed when detectable.                                                                                                                                                                                                                                        |
| `wait`       | Elapsed time only.                                                                                                                                                                                                                                                                                   |

### Example: enter text on email

1. Executor types into the bound field (using stored slot, not AI text).
2. Verifier reads hierarchy for **that** field’s element.
3. Non-secret email: visible text equals stored value → **pass**.
4. If text is missing or on wrong element → **fail**, message like `step 3: email field mismatch` (no value in message for secure fields).

### Example: tap logo then select Dev

1. After tap × 13: verifier sees UI change or dialog markers → **pass**.
2. Select Dev: verifier finds “Dev” (or equivalent) selected or dialog dismissed → **pass**.
3. If select runs before dialog exists → **fail** `step 2: option not visible` (operator may need more taps or order fix).

---

## Suggested control ids (UI dropdown)

Use presets where possible; custom ids are short lowercase identifiers only.

**Auth:** `email`, `password`, `username`, `phone`, `otp`, `login`, `submit`, `continue`

**Setup:** `logo`, `version`, `build_number`, `env`, `environment`

**Chrome:** `skip`, `next`, `close`, `cancel`, `ok`, `terms`, `remember_me`

**Motion:** `screen`, `list`, `carousel`, `onboarding_carousel`

---

## Limits

| Limit              | Value (v1)     |
| ------------------ | -------------- |
| Steps per scenario | 20             |
| Tap / swipe times  | 1–20           |
| Wait seconds       | 1–15           |
| Option text length | 32 characters  |
| Value length       | 512 characters |

---

## AI and playbook (short)

- Compiler turns `data[]` into an **ordered playbook** (action + id + slot name / option only).
- **Planner** maps each line to a plan step on the current screen (`element_id` when possible).
- **Executor** runs tools; **verifier** runs after each tool.
- **No** `value` or secret content in planner tools or playbook text in the strict security mode.

---

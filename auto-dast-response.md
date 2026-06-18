# Scenario API — Frontend Reference

API reference for **Scenario**, **ScenarioUserRole**, and **ScenarioStep** management.

**Base URL:** `https://autodast.staging.appknox.io/api` (replace with your environment)

**Path prefix:** `/v2/projects/{project_id}/scenarios`

---

## Authentication

Scenario APIs use **Personal Access Token** authentication.

```bash
--header 'Authorization: Token YOUR_PERSONAL_ACCESS_TOKEN'
--header 'Content-Type: application/json'
```

| Header          | Value                           |
| --------------- | ------------------------------- |
| `Authorization` | `Token <personal_access_token>` |
| `Content-Type`  | `application/json`              |

> **Note:** The raw `Authorization: <token>` style used by presign endpoints (e.g. `navigation_graph`) does **not** work here. You must include the `Token` prefix.

### Auth errors

| Status | Body                                                              | Cause                                           |
| ------ | ----------------------------------------------------------------- | ----------------------------------------------- |
| `401`  | `{"detail":"Authentication credentials were not provided."}`      | Missing or malformed `Authorization` header     |
| `401`  | `{"detail":"Invalid token."}`                                     | Token not found or inactive user                |
| `403`  | `{"detail":"You do not have permission to perform this action."}` | Authenticated but no write access to project    |
| `404`  | `{"detail":"No Project matches the given query."}`                | Invalid project ID, or user cannot read project |

---

## Enums

### Scenario type (`type`) — read-only on create

| Value | Label | Notes                                          |
| ----- | ----- | ---------------------------------------------- |
| `0`   | Login | One per project; system-created; cannot delete |
| `1`   | Other | User-created via `POST`                        |

### Step action (`action`)

| Value | Name         | `value` field meaning                                            |
| ----- | ------------ | ---------------------------------------------------------------- |
| `0`   | `tap`        | Optional tap count (`1`–`20`); empty = `1`                       |
| `1`   | `long_press` | Optional duration in ms (positive integer)                       |
| `2`   | `enter_text` | **Required** text (max 512 chars); use `is_secure` for passwords |
| `3`   | `select`     | **Required** option label (max 32 chars)                         |
| `4`   | `check`      | Optional `true` / `false`; empty = `true`                        |
| `5`   | `swipe`      | **Required** direction: `up`, `down`, `left`, `right`            |
| `6`   | `drag`       | **Required** `direction:distance` e.g. `right:medium`            |
| `7`   | `wait`       | **Required** seconds (`1`–`60`)                                  |

### Secure value masking

When `is_secure: true`, API responses replace `value` with:

```
************
```

Send this masked string back when updating a secure step **without** changing the secret. The server keeps the stored value.

---

## Shared object shapes

### Scenario (list / create response)

```json
{
  "id": 1,
  "name": "Onboarding flow",
  "description": "Optional description",
  "type": 1,
  "project": "https://autodast.staging.appknox.io/api/v2/projects/1",
  "is_active": false,
  "is_deleted": false,
  "created_on": "2026-06-12T13:41:04.004914Z",
  "updated_on": "2026-06-12T13:41:04.004931Z",
  "last_updated_by": 1
}
```

### Scenario detail (retrieve / bulk save response)

Same as above, plus:

```json
{
  "roles": [{ "id": 1, "name": "Admin" }],
  "steps": [
    {
      "id": 4,
      "role": 1,
      "order": 1,
      "action": 2,
      "identifier": "email",
      "value": "user@example.com",
      "is_secure": false
    }
  ]
}
```

For **Other** scenarios (`type: 1`): `role` on steps is always `null`, `roles` is `[]`.

### Step

| Field        | Type            | Required                               | Notes                                                                  |
| ------------ | --------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| `id`         | integer         | read-only                              |                                                                        |
| `role`       | integer \| null | Login: required; Other: must be `null` | Role PK                                                                |
| `order`      | integer         | yes                                    | `>= 1`; unique per `(role, order)` or per scenario when `role` is null |
| `action`     | integer         | yes                                    | See action enum                                                        |
| `identifier` | string          | yes                                    | Lowercase identifier (see validation)                                  |
| `value`      | string          | depends on action                      | Masked when `is_secure: true`                                          |
| `is_secure`  | boolean         | no                                     | Default `false`                                                        |

### Role (Login only)

| Field  | Type    | Required  |
| ------ | ------- | --------- |
| `id`   | integer | read-only |
| `name` | string  | yes       |

---

## Step validation rules

### `identifier`

- Required
- Pattern: `^[a-z][a-z0-9_]*$` (lowercase letter first, then letters/digits/underscores)
- Max length: **64**

**Example presets:** `email`, `password`, `login`, `logo`, `env`, `terms`, `skip`, `next`

### `value` by action

| Action         | Required | Validation                                                                     |
| -------------- | -------- | ------------------------------------------------------------------------------ |
| `0` tap        | No       | If set: integer `1`–`20`                                                       |
| `1` long_press | No       | If set: positive integer (ms)                                                  |
| `2` enter_text | **Yes**  | Max 512 characters                                                             |
| `3` select     | **Yes**  | Max 32 characters                                                              |
| `4` check      | No       | `true` or `false` (case-insensitive)                                           |
| `5` swipe      | **Yes**  | `up`, `down`, `left`, `right`                                                  |
| `6` drag       | **Yes**  | `direction:distance` — direction as swipe; distance: `short`, `medium`, `long` |
| `7` wait       | **Yes**  | Integer `1`–`60` (seconds)                                                     |

### Validation error shape (`400`)

Field errors:

```json
{
  "action": ["\"99\" is not a valid choice."],
  "identifier": [
    "identifier must be a short lowercase identifier (letters, digits, underscores; start with a letter)."
  ],
  "value": ["value is required for enter_text."]
}
```

Non-field errors:

```json
{
  "non_field_errors": ["Other scenarios must not contain roles."]
}
```

Indexed step errors (bulk save):

```json
{
  "non_field_errors": ["steps[0].role must reference a role in this scenario."]
}
```

---

## Login vs Other rules

| Rule                  | Login (`type: 0`)            | Other (`type: 1`)   |
| --------------------- | ---------------------------- | ------------------- |
| Create via `POST`     | No (system-created)          | Yes                 |
| Delete scenario       | Blocked (`400`)              | Allowed (`204`)     |
| Roles                 | Supported                    | Must not send roles |
| Step `role`           | **Required** (valid role ID) | Must be `null`      |
| Delete Login scenario | —                            | —                   |

### Frontend flow: Login scenario with roles + steps

Steps require a **role ID**. New roles in the same payload do not have IDs yet at validation time. Use a **two-step save**:

1. **Save roles first** (empty steps):

```bash
curl --location --request PUT 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/1' \
--header 'Authorization: Token YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
  "scenario": { "name": "Login", "description": "", "is_active": true },
  "roles": [{ "name": "Admin" }],
  "steps": []
}'
```

2. **Save steps** using `role` id from response:

```bash
curl --location --request PUT 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/1' \
--header 'Authorization: Token YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
  "scenario": { "name": "Login", "description": "", "is_active": true },
  "roles": [{ "id": 1, "name": "Admin" }],
  "steps": [
    { "order": 1, "role": 1, "action": 2, "identifier": "email", "value": "user@example.com", "is_secure": false },
    { "order": 2, "role": 1, "action": 2, "identifier": "password", "value": "secret", "is_secure": true }
  ]
}'
```

---

## Endpoints

### 1. List scenarios

```
GET /v2/projects/{project_id}/scenarios
```

**Status codes**

| Code  | Meaning                       |
| ----- | ----------------------------- |
| `200` | Success                       |
| `401` | Not authenticated             |
| `404` | Project not found / no access |

**Response `200`:** Array of scenario objects (no nested roles/steps).

```bash
curl --location 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios' \
--header 'Authorization: Token YOUR_TOKEN'
```

---

### 2. Create scenario (Other only)

```
POST /v2/projects/{project_id}/scenarios
```

**Request body**

| Field         | Type    | Required | Validation                                      |
| ------------- | ------- | -------- | ----------------------------------------------- |
| `name`        | string  | yes      | Max 4096; unique per project (case-insensitive) |
| `description` | string  | no       | Max 4096                                        |
| `is_active`   | boolean | no       | Default `false`                                 |

**Status codes**

| Code  | Meaning                     |
| ----- | --------------------------- |
| `201` | Created (`type` always `1`) |
| `400` | Duplicate name              |
| `401` | Not authenticated           |
| `403` | No write access             |
| `404` | Project not found           |

**`400` example**

```json
{ "name": ["A Scenario with name Onboarding flow already exists."] }
```

```bash
curl --location --request POST 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios' \
--header 'Authorization: Token YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
  "name": "Onboarding flow",
  "description": "Post-login onboarding",
  "is_active": false
}'
```

---

### 3. Get scenario detail

```
GET /v2/projects/{project_id}/scenarios/{scenario_id}
```

**Status codes**

| Code  | Meaning                                |
| ----- | -------------------------------------- |
| `200` | Success (includes `roles` and `steps`) |
| `401` | Not authenticated                      |
| `404` | Scenario or project not found          |

```bash
curl --location 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/1' \
--header 'Authorization: Token YOUR_TOKEN'
```

---

### 4. Bulk save scenario (roles + steps)

```
PUT /v2/projects/{project_id}/scenarios/{scenario_id}
```

Replaces the scenario metadata and **upserts** roles/steps from the payload. Roles and steps **not** in the payload are soft-deleted.

**Request body**

```json
{
  "scenario": {
    "name": "string",
    "description": "string | null",
    "is_active": false
  },
  "roles": [{ "id": 1, "name": "Admin" }, { "name": "New Role" }],
  "steps": [
    {
      "id": 4,
      "role": 1,
      "order": 1,
      "action": 0,
      "identifier": "login",
      "value": "1",
      "is_secure": false
    }
  ]
}
```

| Field      | Required | Notes                            |
| ---------- | -------- | -------------------------------- |
| `scenario` | yes      |                                  |
| `roles`    | no       | Omit or `[]` for Other scenarios |
| `steps`    | no       | Omit or `[]` to clear all steps  |

**Validations**

| Error                                              | Status                                                          |
| -------------------------------------------------- | --------------------------------------------------------------- |
| Duplicate role ids in payload                      | `400`                                                           |
| Duplicate role names (case-insensitive) in payload | `400`                                                           |
| Roles sent on Other scenario                       | `400` — `"Other scenarios must not contain roles."`             |
| Login step missing/invalid `role`                  | `400` — `steps[n].role must reference a role in this scenario.` |
| Other step with non-null `role`                    | `400`                                                           |
| Duplicate `(role, order)` in steps                 | `400`                                                           |
| Unsecure secure step with masked value             | `400` — `steps[n]: cannot unsecure without changing value.`     |
| Role/step id not in scenario                       | `400`                                                           |
| Per-step `action` / `identifier` / `value` rules   | `400`                                                           |

**Status codes**

| Code  | Meaning                           |
| ----- | --------------------------------- |
| `200` | Success — returns scenario detail |
| `400` | Validation error                  |
| `401` | Not authenticated                 |
| `403` | No write access                   |
| `404` | Not found                         |

```bash
# Other scenario — steps only, role must be null
curl --location --request PUT 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/2' \
--header 'Authorization: Token YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
  "scenario": { "name": "Onboarding flow", "description": "Updated", "is_active": true },
  "steps": [
    { "order": 1, "action": 0, "identifier": "skip", "value": "", "is_secure": false, "role": null },
    { "order": 2, "action": 7, "identifier": "settle", "value": "2", "is_secure": false, "role": null }
  ]
}'
```

---

### 5. Delete scenario

```
DELETE /v2/projects/{project_id}/scenarios/{scenario_id}
```

**Status codes**

| Code  | Meaning                                                 |
| ----- | ------------------------------------------------------- |
| `204` | Soft-deleted (Other only)                               |
| `400` | Login scenario — `["Login Scenario can't be deleted."]` |
| `401` | Not authenticated                                       |
| `403` | No write access                                         |
| `404` | Not found                                               |

```bash
curl --location --request DELETE 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/2' \
--header 'Authorization: Token YOUR_TOKEN'
```

---

### 6. List steps

```
GET /v2/projects/{project_id}/scenarios/{scenario_id}/steps
```

**Status codes:** `200`, `401`, `404`

```bash
curl --location 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/2/steps' \
--header 'Authorization: Token YOUR_TOKEN'
```

---

### 7. Create step

```
POST /v2/projects/{project_id}/scenarios/{scenario_id}/steps
```

**Request body**

| Field        | Required                          |
| ------------ | --------------------------------- |
| `order`      | yes                               |
| `action`     | yes                               |
| `identifier` | yes                               |
| `value`      | depends on action                 |
| `is_secure`  | no (default `false`)              |
| `role`       | Login: yes; Other: omit or `null` |

**Status codes**

| Code  | Meaning           |
| ----- | ----------------- |
| `201` | Created           |
| `400` | Validation error  |
| `401` | Not authenticated |
| `403` | No write access   |
| `404` | Not found         |

```bash
curl --location --request POST 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/2/steps' \
--header 'Authorization: Token YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
  "order": 1,
  "action": 2,
  "identifier": "email",
  "value": "user@example.com",
  "is_secure": false,
  "role": null
}'
```

---

### 8. Get step

```
GET /v2/projects/{project_id}/scenarios/{scenario_id}/steps/{step_id}
```

**Status codes:** `200`, `401`, `404`

---

### 9. Update step

```
PUT /v2/projects/{project_id}/scenarios/{scenario_id}/steps/{step_id}
PATCH /v2/projects/{project_id}/scenarios/{scenario_id}/steps/{step_id}
```

**Validations**

| Case                                                  | Status  | Error                                                  |
| ----------------------------------------------------- | ------- | ------------------------------------------------------ |
| `is_secure: false` on secure step without new `value` | `400`   | `"Cannot unsecure a step without changing its value."` |
| `value: "************"` on secure step                | ignored | Stored secret preserved                                |
| Invalid `role` for scenario type                      | `400`   |                                                        |
| Action / identifier / value rules                     | `400`   |                                                        |

**Status codes:** `200`, `400`, `401`, `403`, `404`

```bash
# Unsecure by providing a new plaintext value
curl --location --request PUT 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/2/steps/3' \
--header 'Authorization: Token YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
  "order": 1,
  "action": 2,
  "identifier": "password",
  "value": "new-plaintext-value",
  "is_secure": false,
  "role": null
}'
```

---

### 10. Delete step

```
DELETE /v2/projects/{project_id}/scenarios/{scenario_id}/steps/{step_id}
```

**Status codes:** `204`, `401`, `403`, `404`

```bash
curl --location --request DELETE 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/2/steps/3' \
--header 'Authorization: Token YOUR_TOKEN'
```

---

### 11. Bulk update steps only

```
PUT /v2/projects/{project_id}/scenarios/{scenario_id}/steps/bulk_update
```

Same step array semantics as bulk scenario save. Steps not in payload are soft-deleted.

**Request body**

```json
{
  "steps": [
    {
      "id": 1,
      "order": 1,
      "action": 0,
      "identifier": "skip",
      "value": "",
      "is_secure": false,
      "role": null
    },
    {
      "order": 2,
      "action": 7,
      "identifier": "settle",
      "value": "3",
      "is_secure": false,
      "role": null
    }
  ]
}
```

> Include `id` when updating existing steps. Omit `id` to create new steps.

**Status codes**

| Code  | Meaning                                                 |
| ----- | ------------------------------------------------------- |
| `200` | Returns full scenario detail                            |
| `400` | Validation / unique constraint on `(role, order)`       |
| `401` | Not authenticated                                       |
| `403` | No write access                                         |
| `404` | Not found                                               |
| `405` | Wrong URL (e.g. `PUT .../steps` without `/bulk_update`) |

```bash
curl --location --request PUT 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/2/steps/bulk_update' \
--header 'Authorization: Token YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
  "steps": [
    { "id": 1, "order": 1, "action": 0, "identifier": "skip", "value": "", "is_secure": false, "role": null },
    { "order": 2, "action": 7, "identifier": "wait", "value": "3", "is_secure": false, "role": null }
  ]
}'
```

---

### 12. Toggle step secure flag

```
PATCH /v2/projects/{project_id}/scenarios/{scenario_id}/steps/{step_id}/secure
```

**Request body**

| Field       | Type    | Required |
| ----------- | ------- | -------- |
| `is_secure` | boolean | yes      |

**Behavior**

| Action                                | Result                                                    |
| ------------------------------------- | --------------------------------------------------------- |
| `is_secure: true`                     | Marks step secure; response masks `value`                 |
| `is_secure: true` when already secure | `200` (idempotent)                                        |
| `is_secure: false`                    | **`400`** — must unsecure via `PUT` step with new `value` |

**Status codes**

| Code  | Meaning                                 |
| ----- | --------------------------------------- |
| `200` | Success                                 |
| `400` | Missing `is_secure` or unsecure blocked |
| `401` | Not authenticated                       |
| `403` | No write access                         |
| `404` | Step not found                          |

**`400` examples**

```json
{ "is_secure": ["This field is required."] }
```

```json
{ "is_secure": ["Cannot unsecure a step without changing its value."] }
```

```bash
# Mark secure
curl --location --request PATCH 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/2/steps/3/secure' \
--header 'Authorization: Token YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{ "is_secure": true }'
```

```bash
# Blocked unsecure
curl --location --request PATCH 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/2/steps/3/secure' \
--header 'Authorization: Token YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{ "is_secure": false }'
```

---

### 13. Get role

```
GET /v2/projects/{project_id}/scenarios/{scenario_id}/roles/{role_id}
```

Login scenarios only. **Status codes:** `200`, `401`, `404`

```bash
curl --location 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/1/roles/1' \
--header 'Authorization: Token YOUR_TOKEN'
```

---

### 14. Update role

```
PUT /v2/projects/{project_id}/scenarios/{scenario_id}/roles/{role_id}
PATCH /v2/projects/{project_id}/scenarios/{scenario_id}/roles/{role_id}
```

**Request body**

| Field  | Type   | Required |
| ------ | ------ | -------- |
| `name` | string | yes      |

**Validations**

| Error                           | Status                                                   |
| ------------------------------- | -------------------------------------------------------- |
| Role on non-Login scenario      | `400` — `"Roles are only supported on Login scenarios."` |
| Duplicate role name in scenario | `400`                                                    |

**Status codes:** `200`, `400`, `401`, `403`, `404`

```bash
curl --location --request PUT 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/1/roles/1' \
--header 'Authorization: Token YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{ "name": "Super Admin" }'
```

---

### 15. Delete role

```
DELETE /v2/projects/{project_id}/scenarios/{scenario_id}/roles/{role_id}
```

Soft-deletes the role and **all its steps**.

**Status codes**

| Code  | Meaning            |
| ----- | ------------------ |
| `204` | Deleted            |
| `400` | Non-Login scenario |
| `401` | Not authenticated  |
| `403` | No write access    |
| `404` | Not found          |

```bash
curl --location --request DELETE 'https://autodast.staging.appknox.io/api/v2/projects/1/scenarios/1/roles/1' \
--header 'Authorization: Token YOUR_TOKEN'
```

---

## Secure value — frontend checklist

1. After `PATCH .../secure` with `is_secure: true`, display `************` — never show the real value again from GET.
2. When saving a form with a secure field unchanged, send `value: "************"` and `is_secure: true`.
3. To change a secret: send a **new** `value` (and optionally `is_secure: false`).
4. Do **not** call `PATCH .../secure` with `is_secure: false` — use `PUT` on the step with a new value instead.
5. Bulk save: unsecure with masked value returns `400` for that step index.

---

## Quick status code reference

| Code  | When                                 |
| ----- | ------------------------------------ |
| `200` | Successful GET, PUT, PATCH           |
| `201` | Successful POST (scenario or step)   |
| `204` | Successful DELETE (no body)          |
| `400` | Validation / business rule violation |
| `401` | Missing or invalid auth              |
| `403` | No write permission                  |
| `404` | Resource not found or no read access |
| `405` | HTTP method not allowed on URL       |

---

## Example: full Other scenario flow

```bash
export BASE="https://autodast.staging.appknox.io/api"
export TOKEN="YOUR_TOKEN"
export PROJECT=1

# 1. Create
curl -X POST "$BASE/v2/projects/$PROJECT/scenarios" \
  -H "Authorization: Token $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Checkout","description":"","is_active":false}'

# 2. Add steps (assume scenario id=2)
curl -X PUT "$BASE/v2/projects/$PROJECT/scenarios/2" \
  -H "Authorization: Token $TOKEN" -H "Content-Type: application/json" \
  -d '{"scenario":{"name":"Checkout","description":"","is_active":true},"steps":[{"order":1,"action":0,"identifier":"submit","value":"1","is_secure":false,"role":null}]}'

# 3. Secure a password step (assume step id=3)
curl -X PATCH "$BASE/v2/projects/$PROJECT/scenarios/2/steps/3/secure" \
  -H "Authorization: Token $TOKEN" -H "Content-Type: application/json" \
  -d '{"is_secure":true}'

# 4. Delete scenario
curl -X DELETE "$BASE/v2/projects/$PROJECT/scenarios/2" \
  -H "Authorization: Token $TOKEN"
```

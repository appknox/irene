# DAST Scan Window APIs

Base URL: `https://autodast.staging.appknox.io` (local: `http://127.0.0.1:8000`)

Auth header (required):

```
Authorization: Token <your_token>
```

---

## 1. Automated scan window preference

`GET` / `PUT` `/api/v2/profiles/{profile_id}/ds_automated_scan_window_preference`

### Payload fields

| Field                             | Type             | Required on PUT      | Description                           |
| --------------------------------- | ---------------- | -------------------- | ------------------------------------- |
| `id`                              | integer          | —                    | Read-only profile id                  |
| `dynamic_scan_automation_enabled` | boolean          | yes                  | Enable/disable automated dynamic scan |
| `scan_window_type`                | string           | yes                  | `anytime` or `specific_time`          |
| `scan_window_start_at`            | string (`HH:MM`) | when `specific_time` | Wall-clock start (inclusive)          |
| `scan_window_end_before`          | string (`HH:MM`) | when `specific_time` | Wall-clock end (exclusive)            |
| `scan_window_timezone`            | string           | when `specific_time` | IANA timezone (e.g. `Asia/Kolkata`)   |

### Validation (`400`)

| Rule                                            | Error message                                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Invalid `scan_window_type`                      | `"\"<value>\" is not a valid choice."`                                                                                         |
| `specific_time` without start, end, or timezone | `"scan_window_start_at, scan_window_end_before, and scan_window_timezone are required when scan_window_type is specific_time"` |
| Invalid time format                             | Field-level error on `scan_window_start_at` / `scan_window_end_before`                                                         |
| Invalid IANA timezone                           | `"<value> is not a valid IANA timezone."`                                                                                      |
| Start equals end                                | `"scan_window_start_at and scan_window_end_before cannot be equal"`                                                            |
| Window shorter than 3 hours                     | `"scan_window_end_before must be at least 3 hours after scan_window_start_at"`                                                 |
| `anytime`                                       | Start, end, and timezone are cleared (may be omitted)                                                                          |

Minimum window duration is **3 hours** (same-day or overnight).

### GET

```bash
curl -s -H "Authorization: Token <your_token>" \
  -H "Content-Type: application/json" \
  "https://autodast.staging.appknox.io/api/v2/profiles/{profile_id}/ds_automated_scan_window_preference"
```

**Response `200` (`anytime`):**

```json
{
  "id": 42,
  "dynamic_scan_automation_enabled": false,
  "scan_window_type": "anytime",
  "scan_window_start_at": null,
  "scan_window_end_before": null,
  "scan_window_timezone": ""
}
```

**Response `200` (`specific_time`):**

```json
{
  "id": 42,
  "dynamic_scan_automation_enabled": true,
  "scan_window_type": "specific_time",
  "scan_window_start_at": "09:00",
  "scan_window_end_before": "18:00",
  "scan_window_timezone": "Asia/Kolkata"
}
```

**Response `401` (missing/invalid token):**

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### PUT — `specific_time` (same-day)

**Payload:**

```json
{
  "dynamic_scan_automation_enabled": true,
  "scan_window_type": "specific_time",
  "scan_window_start_at": "09:00",
  "scan_window_end_before": "18:00",
  "scan_window_timezone": "Asia/Kolkata"
}
```

```bash
curl -s -X PUT \
  -H "Authorization: Token <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "dynamic_scan_automation_enabled": true,
    "scan_window_type": "specific_time",
    "scan_window_start_at": "09:00",
    "scan_window_end_before": "18:00",
    "scan_window_timezone": "Asia/Kolkata"
  }' \
  "https://autodast.staging.appknox.io/api/v2/profiles/{profile_id}/ds_automated_scan_window_preference"
```

**Response `200`:**

```json
{
  "id": 42,
  "dynamic_scan_automation_enabled": true,
  "scan_window_type": "specific_time",
  "scan_window_start_at": "09:00",
  "scan_window_end_before": "18:00",
  "scan_window_timezone": "Asia/Kolkata"
}
```

### PUT — `specific_time` (overnight)

**Payload:**

```json
{
  "dynamic_scan_automation_enabled": true,
  "scan_window_type": "specific_time",
  "scan_window_start_at": "22:00",
  "scan_window_end_before": "07:00",
  "scan_window_timezone": "America/New_York"
}
```

```bash
curl -s -X PUT \
  -H "Authorization: Token <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "dynamic_scan_automation_enabled": true,
    "scan_window_type": "specific_time",
    "scan_window_start_at": "22:00",
    "scan_window_end_before": "07:00",
    "scan_window_timezone": "America/New_York"
  }' \
  "https://autodast.staging.appknox.io/api/v2/profiles/{profile_id}/ds_automated_scan_window_preference"
```

**Response `200`:**

```json
{
  "id": 42,
  "dynamic_scan_automation_enabled": true,
  "scan_window_type": "specific_time",
  "scan_window_start_at": "22:00",
  "scan_window_end_before": "07:00",
  "scan_window_timezone": "America/New_York"
}
```

### PUT — `anytime`

**Payload:**

```json
{
  "dynamic_scan_automation_enabled": true,
  "scan_window_type": "anytime"
}
```

```bash
curl -s -X PUT \
  -H "Authorization: Token <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "dynamic_scan_automation_enabled": true,
    "scan_window_type": "anytime"
  }' \
  "https://autodast.staging.appknox.io/api/v2/profiles/{profile_id}/ds_automated_scan_window_preference"
```

**Response `200`:**

```json
{
  "id": 42,
  "dynamic_scan_automation_enabled": true,
  "scan_window_type": "anytime",
  "scan_window_start_at": null,
  "scan_window_end_before": null,
  "scan_window_timezone": ""
}
```

### PUT — validation errors

**Payload (window shorter than 3 hours):**

```json
{
  "dynamic_scan_automation_enabled": true,
  "scan_window_type": "specific_time",
  "scan_window_start_at": "09:00",
  "scan_window_end_before": "11:00",
  "scan_window_timezone": "Asia/Kolkata"
}
```

**Response `400`:**

```json
{
  "non_field_errors": [
    "scan_window_end_before must be at least 3 hours after scan_window_start_at"
  ]
}
```

**Payload (missing timezone):**

```json
{
  "dynamic_scan_automation_enabled": true,
  "scan_window_type": "specific_time",
  "scan_window_start_at": "09:00",
  "scan_window_end_before": "18:00"
}
```

**Response `400`:**

```json
{
  "non_field_errors": [
    "scan_window_start_at, scan_window_end_before, and scan_window_timezone are required when scan_window_type is specific_time"
  ]
}
```

**Payload (invalid timezone):**

```json
{
  "dynamic_scan_automation_enabled": true,
  "scan_window_type": "specific_time",
  "scan_window_start_at": "09:00",
  "scan_window_end_before": "18:00",
  "scan_window_timezone": "Invalid/Zone"
}
```

**Response `400`:**

```json
{
  "scan_window_timezone": ["Invalid/Zone is not a valid IANA timezone."]
}
```

---

## 2. Automation preference

`GET` / `PUT` `/api/v2/profiles/{profile_id}/automation_preference`

Automation on/off only. Scan-window fields are **not** supported on this endpoint.

### Payload fields

| Field                             | Type    | Required on PUT | Description                           |
| --------------------------------- | ------- | --------------- | ------------------------------------- |
| `id`                              | integer | —               | Read-only profile id                  |
| `dynamic_scan_automation_enabled` | boolean | yes             | Enable/disable automated dynamic scan |

### GET

```bash
curl -s -H "Authorization: Token <your_token>" \
  -H "Content-Type: application/json" \
  "https://autodast.staging.appknox.io/api/v2/profiles/{profile_id}/automation_preference"
```

**Response `200`:**

```json
{
  "id": 42,
  "dynamic_scan_automation_enabled": true
}
```

### PUT

**Payload:**

```json
{
  "dynamic_scan_automation_enabled": true
}
```

```bash
curl -s -X PUT \
  -H "Authorization: Token <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"dynamic_scan_automation_enabled": true}' \
  "https://autodast.staging.appknox.io/api/v2/profiles/{profile_id}/automation_preference"
```

**Response `200`:**

```json
{
  "id": 42,
  "dynamic_scan_automation_enabled": true
}
```

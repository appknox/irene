# Unit Tests

Reference for `write-tests`. Read when the subject is a model, adapter,
serializer, helper or util.

---

## Setup

```js
import { setupTest } from 'ember-qunit';

module('Unit | Model | analysis-override-request', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks); // only if the subject makes network calls
});
```

Location by kind:

| Kind       | Path                                    |
| ---------- | --------------------------------------- |
| Model      | `tests/unit/models/<name>-test.js`      |
| Adapter    | `tests/unit/adapters/<name>-test.js`    |
| Serializer | `tests/unit/serializers/<name>-test.js` |
| Helper     | `tests/unit/helpers/<name>-test.js`     |
| Util       | `tests/unit/utils/<name>-test.js`       |

---

## Models

Test computed getters and instance methods — not the attribute declarations.

```js
const store = this.owner.lookup('service:store');
const record = store.push(
  store.normalize(
    'analysis-overview',
    this.server.create('analysis-overview').toJSON()
  )
);
```

Cover:

- Every getter, every distinct output
- Enum-backed getters at each enum value **and** at `null` / `undefined`
- Instance methods that call an adapter — success and failure

```js
test.each(
  'hasPendingOverrideRequest reflects the request status',
  [
    [OverrideRequestStatus.PENDING, true],
    [OverrideRequestStatus.APPROVED, false],
    [null, false],
  ],
  function (assert, [status, expected]) {
    const model = pushOverview({ override_request_status: status });
    assert.strictEqual(model.hasPendingOverrideRequest, expected);
  }
);
```

---

## Adapters

Assert the built URL, not the response. URL construction is where these break.

```js
const adapter = this.owner.lookup('adapter:analysis-override-request');

assert.true(
  adapter._buildURL('42').endsWith('/api/analyses/42/override_requests')
);
```

Cover every URL-building method, including action URLs
(`approve`, `reject`) and any that read `organization.selected` — those need the
organization service loaded first.

---

## Serializers

Assert normalization, especially a custom `primaryKey`.

```js
const serializer = this.owner.lookup('serializer:analysis-override-request');
assert.strictEqual(serializer.primaryKey, 'uuid');
```

A serializer with a custom `primaryKey` silently produces id-less records when
the payload uses `id`. Pin it with a test.

---

## Helpers and utils

Pure functions — table-drive them.

```js
test.each(
  'riskText maps each risk value to its label key',
  [
    [ENUMS.RISK.NONE, 'passed'],
    [ENUMS.RISK.CRITICAL, 'critical'],
    [null, undefined],
  ],
  function (assert, [risk, expected]) {
    assert.strictEqual(riskText([risk]), expected);
  }
);
```

Always include the undefined-return case. `riskText` returns `undefined` for an
unmapped value, and callers pass that straight into `intl.t()`, which throws.

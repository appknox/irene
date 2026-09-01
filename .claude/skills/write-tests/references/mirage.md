# Mirage Routes & Network Setup

Reference for `write-tests`. Read when the component makes network calls.

---

## Step 6 — Mirage routes

Use the `v2` (or appropriate version) namespace relative path. Mirage prepends `api` automatically:

```js
this.server.get('/v2/projects/:projectId/scenarios', ...);
this.server.post('/v2/projects/:projectId/scenarios', ...);
this.server.put('/v2/projects/:projectId/scenarios/:id', ...);
this.server.del('/v2/projects/:projectId/scenarios/:id', ...);
```

For list endpoints using DRF pagination, return:

```js
{ count: results.length, next: null, previous: null, results: [...] }
```

For reload-after-mutate tests, use schema-backed GET handlers so the reload reflects changes:

```js
this.server.get('/v2/projects/:projectId/scenarios', (schema) => {
  const results = schema.scenarios.all().models.map((s) => s.toJSON());

  return { count: results.length, next: null, previous: null, results };
});
```

For loading state tests, use `{ timing: N }` and `waitFor` / `waitUntil`:

```js
this.server.get('/v2/...', () => ({ ... }), { timing: 150 });

render(TEMPLATE); // no await

await waitFor(selectors.loader, { timeout: 200 });
assert.dom(selectors.loader).exists();

await waitUntil(() => !find(selectors.loader), { timeout: 500 });
assert.dom(selectors.loader).doesNotExist();
```

---

## Org / `me` service setup

`MeService` fetches on instantiation. Any component that reads `this.me`
— including `AnalysisRisk::Tag` and anything nesting it — needs this, or the
suite fails with `Internal Server Error` from `OrganizationMEAdapter`:

```js
this.server.createList('organization', 1);
this.server.createList('organization-me', 1, {
  is_owner: true,
  is_admin: true,
});

this.server.get('/organizations/:id/me', (schema, req) =>
  schema.organizationMes.find(`${req.params.id}`)?.toJSON()
);

await this.owner.lookup('service:organization').load();
```

Without the `load()`, `organization.selected` is null and the adapter requests
`/organizations/undefined/me`.

Change roles per test with `this.server.db.organizationMes.update('1', role)`.

## Override drawer route chain

Opening the drawer resolves analysis → file → project:

```js
this.server.get('/v3/projects/:id', (schema, req) =>
  schema.projects.find(`${req.params.id}`)?.toJSON()
);
this.server.get('/v3/files/:id', (schema, req) =>
  schema.files.find(`${req.params.id}`)?.toJSON()
);
this.server.get('/v2/analyses/:id', (schema, req) =>
  schema.analyses.find(`${req.params.id}`)?.toJSON()
);
```

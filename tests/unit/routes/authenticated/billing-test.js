import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/billing', 'Unit | Route | authenticated/billing', {
  needs: [
    'service:organization',
  ]
});

test('it exists', function (assert) {
  const route = this.subject();
  assert.ok(route);
});

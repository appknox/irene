import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/organization/teams', 'Unit | Route | authenticated/organization/teams', {
  needs: [
    'service:me',
  ]
});

test('it exists', function (assert) {
  let route = this.subject();
  assert.ok(route);
});

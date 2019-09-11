import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/organization/settings', 'Unit | Route | authenticated/organization/settings', {
  // Specify the other units that are required for this test.
  needs: [
    'service:me',
    'service:organization',
    'service:notification-messages-service',
  ]
});

test('it exists', function (assert) {
  let route = this.subject();
  assert.ok(route);
});

import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/github-cloud/redirect', 'Unit | Route | authenticated/github cloud/redirect', {
  // Specify the other units that are required for this test.
  needs: [
    'service:ajax',
    'service:notification-messages-service',
    'service:organization',
  ]
});

test('it exists', function (assert) {
  let route = this.subject();
  assert.ok(route);
});

import { moduleFor, test } from 'ember-qunit';

moduleFor('service:ajax', 'Unit | Service | ajax', {
  needs: [
    'service:session',
  ]
});

test('it exists', function (assert) {
  const service = this.subject();
  assert.ok(service);
});

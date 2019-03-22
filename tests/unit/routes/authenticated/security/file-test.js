import { run } from '@ember/runloop';
import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/security/file', 'Unit | Route | authenticated/security/file', {
});

test('it exists', function(assert) {
  let route = this.subject();
  run(function() {
    assert.ok(route);
  });
});

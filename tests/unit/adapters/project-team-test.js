import { moduleFor, test } from 'ember-qunit';

moduleFor('adapter:project-team', 'Unit | Adapter | project team', {
  needs: [
    'service:session',
    'service:organization',
  ]
});

test('it exists', function (assert) {
  let adapter = this.subject();
  assert.ok(adapter);
});

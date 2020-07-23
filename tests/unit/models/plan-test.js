import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { run } from '@ember/runloop';

module('Unit | Model | plan', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const plan = run(() => this.owner.lookup('service:store').createRecord('plan'));
    assert.equal(plan.get('descriptionItems'), undefined, "Description");
  });
});

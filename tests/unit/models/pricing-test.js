import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { run } from '@ember/runloop';

module('Unit | Model | pricing', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const pricing = run(() => this.owner.lookup('service:store').createRecord('pricing'));
    assert.equal(pricing.get('descriptionItems'), undefined, "Description");
  });
});

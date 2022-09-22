/* eslint-disable ember/no-classic-classes */
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | am app', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('am-app', {});
    assert.ok(model);
  });
});

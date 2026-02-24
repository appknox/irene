import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | privacy pii settings', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let model = this.owner
      .lookup('service:store')
      .createRecord('privacy-pii-settings');

    assert.ok(!!model);
  });
});

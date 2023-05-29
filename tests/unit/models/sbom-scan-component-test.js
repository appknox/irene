import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | sbom app component', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('sbom-scan-component', {});
    assert.ok(model);
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | sbom scan report', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('sbom-scan-report', {});
    assert.ok(model);
  });
});

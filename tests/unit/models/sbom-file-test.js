import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | sbom file', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('sbom-file', {});
    assert.ok(model);
  });

  test('reachabilityStatus is stored independently of scan status', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('sbom-file', {
      status: 3,
      reachabilityStatus: 2,
    });

    assert.strictEqual(model.status, 3);
    assert.strictEqual(model.reachabilityStatus, 2);
  });
});

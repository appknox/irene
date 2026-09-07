import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | saml2 idp metadata', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('saml2-idp-metadata', {});
    assert.ok(model);
  });
});

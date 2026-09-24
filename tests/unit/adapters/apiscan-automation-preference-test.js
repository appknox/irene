import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | apiscan automation preference', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const adapter = this.owner.lookup('adapter:apiscan-automation-preference');

    assert.ok(adapter);
  });

  test('it builds the profile-nested preference url', function (assert) {
    const adapter = this.owner.lookup('adapter:apiscan-automation-preference');

    adapter.setNestedUrlNamespace('42');

    assert.true(
      adapter
        ._buildURL()
        .endsWith('api/profiles/42/apiscanautomation_preference')
    );
  });
});

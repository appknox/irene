import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | sbom-component-inventory', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const adapter = this.owner.lookup('adapter:sbom-component-inventory');
    assert.ok(adapter);
  });

  test('_buildURL points at the sb_components endpoint', function (assert) {
    const adapter = this.owner.lookup('adapter:sbom-component-inventory');

    const listURL = adapter._buildURL('sbom-component-inventory');
    assert.ok(
      listURL.endsWith('api/v2/sb_components'),
      `expected list url, got ${listURL}`
    );

    const recordURL = adapter._buildURL('sbom-component-inventory', 7);
    assert.ok(
      recordURL.endsWith('api/v2/sb_components/7'),
      `expected record url, got ${recordURL}`
    );
  });
});

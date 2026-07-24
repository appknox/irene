import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | sbom project', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:sbom-project');
    assert.ok(adapter);
  });

  test('urlForQuery builds the component drill-down URL', function (assert) {
    const adapter = this.owner.lookup('adapter:sbom-project');

    const nestedURL = adapter.urlForQuery({ sbomComponentId: 5 });

    assert.ok(
      nestedURL.endsWith('api/v2/sb_components/5/sb_projects'),
      `expected nested drill-down url, got ${nestedURL}`
    );

    const baseURL = adapter.urlForQuery({});

    assert.ok(
      baseURL.endsWith('api/v2/sb_projects'),
      `expected base sb_projects url, got ${baseURL}`
    );
  });
});

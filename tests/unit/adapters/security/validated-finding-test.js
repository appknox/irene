import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import ENV from 'irene/config/environment';

module('Unit | Adapter | security/validated-finding', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
    this.adapter = this.store.adapterFor('security/validated-finding');

    this.collectionUrl = (analysisId) =>
      `${ENV.host}/${ENV.namespace}/knoxiq/analyses/${analysisId}/findings`;

    this.snapshotFor = (analysisId) => ({
      id: '7',
      adapterOptions: { analysisId },
    });
  });

  // ─── Query ─────────────────────────────────────────────────────────────────

  test('urlForQuery nests findings under their analysis', function (assert) {
    assert.strictEqual(
      this.adapter.urlForQuery({ analysisId: '42' }),
      this.collectionUrl('42')
    );
  });

  test('urlForQuery removes the analysis id from the query params', function (assert) {
    const query = { analysisId: '42', limit: 10 };

    this.adapter.urlForQuery(query);

    assert.notOk('analysisId' in query);
    assert.strictEqual(query.limit, 10, 'leaves the other params alone');
  });

  // ─── Detail urls ───────────────────────────────────────────────────────────

  test('urlForCreateRecord posts to the collection', function (assert) {
    assert.strictEqual(
      this.adapter.urlForCreateRecord(
        'security/validated-finding',
        this.snapshotFor('42')
      ),
      this.collectionUrl('42')
    );
  });

  test.each(
    'detail urls address the finding under its analysis',
    [['urlForUpdateRecord'], ['urlForDeleteRecord']],
    function (assert, [method]) {
      assert.strictEqual(
        this.adapter[method](
          '7',
          'security/validated-finding',
          this.snapshotFor('42')
        ),
        `${this.collectionUrl('42')}/7`
      );
    }
  );

  test('a numeric analysis id builds the same url', function (assert) {
    assert.strictEqual(
      this.adapter.urlForCreateRecord(
        'security/validated-finding',
        this.snapshotFor(42)
      ),
      this.collectionUrl('42')
    );
  });

  // ─── Update verb ───────────────────────────────────────────────────────────

  test('updateRecord patches rather than putting', async function (assert) {
    const record = this.server.create('security/validated-finding');

    this.server.patch('/knoxiq/analyses/:analysisId/findings/:id', (_, req) => {
      this.requestMethod = req.method;

      return record.toJSON();
    });

    const finding = this.store.push(
      this.store.normalize('security/validated-finding', record.toJSON())
    );

    await finding.save({ adapterOptions: { analysisId: '42' } });

    assert.strictEqual(this.requestMethod, 'PATCH');
  });
});

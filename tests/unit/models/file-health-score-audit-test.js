import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

module('Unit | Model | file-health-score-audit', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    setupFileModelEndpoints(this.server);

    this.store = this.owner.lookup('service:store');
  });

  test('file.fetchFileHealthScoreAudit hits the endpoint and pushes a record', async function (assert) {
    const file = this.server.create('file', { id: 10 });
    const fileModel = this.store.push(
      this.store.normalize('file', file.toJSON())
    );

    const healthScoreAudit = await fileModel.fetchFileHealthScoreAudit();

    assert.ok(healthScoreAudit, 'a record is returned');
    assert.strictEqual(
      healthScoreAudit.id,
      '10',
      'the record is keyed by the file id'
    );

    assert.true(
      Array.isArray(healthScoreAudit.auditTrail),
      'auditTrail is an array'
    );

    assert.ok(healthScoreAudit.auditTrail.length, 'auditTrail is populated');

    assert.strictEqual(
      typeof healthScoreAudit.auditTrail[0].knoxiq_ran,
      'boolean',
      'auditTrail entries expose the knoxiq_ran flag'
    );

    assert.ok(healthScoreAudit.currentScore, 'currentScore object is present');

    assert.strictEqual(
      typeof healthScoreAudit.currentScore.status,
      'string',
      'currentScore.status is present'
    );
  });
});

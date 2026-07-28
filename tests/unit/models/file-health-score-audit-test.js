import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

module('Unit | Model | file-health-score-audit', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { file_health_score_audit } = setupFileModelEndpoints(this.server);

    this.set('file_health_score_audit', file_health_score_audit);
    this.store = this.owner.lookup('service:store');
  });

  test('file.fetchFileHealthScoreAudit hits the endpoint and pushes a record', async function (assert) {
    const file = this.server.create('file', { id: 10 });
    const fileModel = this.store.push(
      this.store.normalize('file', file.toJSON())
    );

    const healthScoreAudit = await fileModel.fetchFileHealthScoreAudit();
    const { file_health_score_audit } = this;

    assert.strictEqual(
      healthScoreAudit.id,
      String(file.id),
      'the record is keyed by the file id'
    );

    assert.strictEqual(
      healthScoreAudit.auditTrail.length,
      file_health_score_audit.audit_trail.length,
      'auditTrail length matches factory data'
    );

    assert.strictEqual(
      healthScoreAudit.auditTrail[0].knoxiq_ran,
      file_health_score_audit.audit_trail[0].knoxiq_ran,
      'first audit trail entry knoxiq_ran matches factory'
    );

    assert.strictEqual(
      healthScoreAudit.auditTrail[1].knoxiq_ran,
      file_health_score_audit.audit_trail[1].knoxiq_ran,
      'second audit trail entry knoxiq_ran matches factory'
    );

    assert.strictEqual(
      healthScoreAudit.currentScore.status,
      file_health_score_audit.current_score.status,
      'currentScore.status matches factory'
    );

    assert.strictEqual(
      healthScoreAudit.currentScore.score,
      file_health_score_audit.current_score.score,
      'currentScore.score matches factory'
    );
  });
});

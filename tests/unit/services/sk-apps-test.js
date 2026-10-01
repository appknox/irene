import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import ENUMS from 'irene/enums';

module('Unit | Service | sk-apps', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('the inventory query includes decommissioned apps', async function (assert) {
    let capturedQuery = null;

    // Register the stub before sk-apps is first resolved.
    class StoreStub extends Service {
      async query(modelName, query) {
        capturedQuery = query;

        const result = [];
        result.meta = { count: 0 };

        return result;
      }
    }

    // setupMirage caches service:store; unregister it so the stub takes effect.
    this.owner.unregister('service:store');
    this.owner.register('service:store', StoreStub);

    const service = this.owner.lookup('service:sk-apps');

    await service.reload();

    assert.strictEqual(
      capturedQuery.app_status,
      `${ENUMS.SK_APP_STATUS.ACTIVE},${ENUMS.SK_APP_STATUS.DECOMMISSIONED}`,
      'a decommissioned app must not vanish from the inventory'
    );
  });
});

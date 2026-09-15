import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Model | project-signing-certificate', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it inherits the organization certificate getters', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = this.server.create(
      'signing-certificate',
      'withExpiredStatus'
    );

    const model = store.push(
      store.normalize('project-signing-certificate', record.toJSON())
    );

    assert.strictEqual(model.statusColor, 'error');
    assert.notStrictEqual(model.expiresOn, '');
    assert.strictEqual(model.name, record.name);
  });
});

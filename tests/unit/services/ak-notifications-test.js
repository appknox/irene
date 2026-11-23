import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Service | ak-notifications', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:ak-notifications');
    assert.ok(service);
  });

  test('it should get unReadCount', async function (assert) {
    this.unread_nf = this.server.createList('nf-in-app-notification', 3, {
      hasRead: false,
      messageCode: 'RANDOM_NF_CODE',
    });

    this.read_nf = this.server.createList('nf-in-app-notification', 10, {
      hasRead: true,
      messageCode: 'RANDOM_NF_CODE',
    });
    const service = this.owner.lookup('service:ak-notifications');
    await service.refresh.perform();
    assert.false(service.showUnReadOnly);
    assert.strictEqual(service.unReadCount, 3);
    assert.strictEqual(service.notifications.length, 10);
    assert.strictEqual(service.notifications_drop_down.length, 3);
  });

  test('it should only fetch only unread', async function (assert) {
    const service = this.owner.lookup('service:ak-notifications');
    service.showUnReadOnly = true;

    this.unread_nf = this.server.createList('nf-in-app-notification', 3, {
      hasRead: false,
      messageCode: 'RANDOM_NF_CODE',
    });

    this.read_nf = this.server.createList('nf-in-app-notification', 10, {
      hasRead: true,
      messageCode: 'RANDOM_NF_CODE',
    });

    await service.refresh.perform();
    assert.true(service.showUnReadOnly);
    assert.strictEqual(service.unReadCount, 3);
    assert.strictEqual(service.notifications.length, 3);
    assert.strictEqual(service.notifications_drop_down.length, 3);
  });

  test('it leaves out NF_AM_NEWVERSN notifications', async function (assert) {
    const visible = this.server.createList('nf-in-app-notification', 2, {
      hasRead: false,
      messageCode: 'RANDOM_NF_CODE',
    });

    this.server.createList('nf-in-app-notification', 2, {
      hasRead: false,
      messageCode: 'NF_AM_NEWVERSN',
    });

    const service = this.owner.lookup('service:ak-notifications');
    await service.refresh.perform();

    const visibleIds = visible.map((n) => n.id);

    assert.deepEqual(
      service.notifications.map((n) => n.id),
      visibleIds
    );

    assert.deepEqual(
      service.notifications_drop_down.map((n) => n.id),
      visibleIds
    );
  });
});

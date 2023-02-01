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

    this.server.get('v2/nf_in_app_notifications', function (schema, request) {
      const data = schema.nfInAppNotifications.all().models;
      if (request.queryParams.has_read == 'false') {
        const unread_data = data.filter((d) => d.hasRead == false);
        if (request.queryParams.limit == '0') {
          return {
            count: unread_data.length,
            next: null,
            previous: null,
            results: [],
          };
        }
        return {
          count: unread_data.length,
          next: null,
          previous: null,
          results: unread_data,
        };
      }
      return {
        count: data.length,
        next: null,
        previous: null,
        results: data,
      };
    });
    const service = this.owner.lookup('service:ak-notifications');
    await service.refresh.perform();
    assert.false(service.showUnReadOnly);
    assert.strictEqual(service.unReadCount, 3);
    assert.strictEqual(service.notifications.length, 13);
  });

  test('it should get fetch only unread', async function (assert) {
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

    this.server.get('v2/nf_in_app_notifications', function (schema, request) {
      const data = schema.nfInAppNotifications.all().models;

      if (request.queryParams.has_read == 'false') {
        const unread_data = data.filter((d) => d.hasRead == false);
        if (request.queryParams.limit == '0') {
          return {
            count: unread_data.length,
            next: null,
            previous: null,
            results: [],
          };
        }
        return {
          count: unread_data.length,
          next: null,
          previous: null,
          results: unread_data,
        };
      }
      return {
        count: data.length,
        next: null,
        previous: null,
        results: data,
      };
    });

    await service.refresh.perform();
    assert.true(service.showUnReadOnly);
    assert.strictEqual(service.unReadCount, 3);
    assert.strictEqual(service.notifications.length, 3);
  });
});

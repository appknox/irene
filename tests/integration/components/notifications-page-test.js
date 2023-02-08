import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setComponentTemplate } from '@ember/component';
import Component from '@glimmer/component';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module('Integration | Component | notifications-page', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    class NotificationMesaageTest extends Component {}
    class NotificationTestContext {
      constructor(input) {
        this.test_name = input.test_name;
      }
    }

    setComponentTemplate(
      hbs`<span data-test-notification-messages-test>test {{@context.test_name}}</span>`,
      NotificationMesaageTest
    );

    this.owner.register(
      'component:notification-message-test',
      NotificationMesaageTest
    );
    NotificationMap['NF_TEST'] = {
      component: 'notification-message-test',
      context: NotificationTestContext,
    };
  });

  test('it renders', async function (assert) {
    await render(hbs`<NotificationsPage />`);
    assert.notEqual(
      this.element.textContent.trim().indexOf('t:notifications:()'),
      -1
    );
  });

  test('it should render all notification', async function (assert) {
    this.unread_nf = this.server.createList('nf-in-app-notification', 3, {
      hasRead: false,
      messageCode: 'NF_TEST',
      context: {
        test_name: 'unread',
      },
    });

    this.read_nf = this.server.createList('nf-in-app-notification', 10, {
      hasRead: true,
      messageCode: 'NF_TEST',
      context: {
        test_name: 'read',
      },
    });

    const service = this.owner.lookup('service:ak-notifications');

    this.server.get('v2/nf_in_app_notifications', function (schema, request) {
      if (request.queryParams.has_read == 'false') {
        const unreadData = this.serialize(
          schema.nfInAppNotifications.where({ hasRead: false })
        );
        if (request.queryParams.limit == '0') {
          return {
            count: unreadData.nfInAppNotifications.length,
            next: null,
            previous: null,
            results: [],
          };
        }
        return {
          count: unreadData.nfInAppNotifications.length,
          next: null,
          previous: null,
          results: unreadData.nfInAppNotifications,
        };
      }
      const data = this.serialize(schema.nfInAppNotifications.all());
      return {
        count: data.nfInAppNotifications.length,
        next: null,
        previous: null,
        results: data.nfInAppNotifications,
      };
    });
    await service.reload();
    await render(hbs`<NotificationsPage />`);
    assert.dom('[data-test-notification-message]').exists({ count: 13 });
    assert.dom('[data-test-notification-empty]').doesNotExist();
  });

  test('it should render empty', async function (assert) {
    const service = this.owner.lookup('service:ak-notifications');

    this.server.get('v2/nf_in_app_notifications', function () {
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    });
    await service.reload();
    await render(hbs`<NotificationsPage />`);
    assert.dom('[data-test-notification-message]').doesNotExist();
    assert.dom('[data-test-notification-empty]').exists();
  });

  test('it should render loading', async function (assert) {
    const service = this.owner.lookup('service:ak-notifications');
    this.server.get('v2/nf_in_app_notifications', function () {
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    });
    await service.reload();
    service.fetch = {
      isRunning: true,
    };
    await render(hbs`<NotificationsPage />`);
    assert.dom('[data-test-notification-message]').doesNotExist();
    assert.dom('[data-test-notification-empty]').doesNotExist();
    assert.dom('[data-test-ak-loader]').exists();
  });
});

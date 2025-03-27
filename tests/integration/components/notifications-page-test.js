import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setComponentTemplate } from '@ember/component';
import Component from '@glimmer/component';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module('Integration | Component | notifications-page', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

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

    const getModelName = (product) =>
      product === 'appknox'
        ? 'nf-in-app-notification'
        : 'sk-nf-in-app-notification';

    const getServiceName = (product) =>
      `service:${product === 'appknox' ? 'ak-notifications' : 'sk-notifications'}`;

    this.setProperties({
      getModelName,
      getServiceName,
    });
  });

  test.each(
    'it renders',
    ['appknox', 'storeknox'],
    async function (assert, product) {
      this.set('product', product);

      await render(hbs`<NotificationsPage @product={{this.product}} />`);
      assert.notEqual(
        this.element.textContent.trim().indexOf(t('notifications')),
        -1
      );
    }
  );

  test.each(
    'it should render all notification',
    ['appknox', 'storeknox'],
    async function (assert, product) {
      this.set('product', product);

      this.unread_nf = this.server.createList(this.getModelName(product), 3, {
        hasRead: false,
        messageCode: 'NF_TEST',
        context: {
          test_name: 'unread',
        },
      });

      this.read_nf = this.server.createList(this.getModelName(product), 10, {
        hasRead: true,
        messageCode: 'NF_TEST',
        context: {
          test_name: 'read',
        },
      });

      const service = this.owner.lookup(this.getServiceName(product));
      await service.reload();
      await render(hbs`<NotificationsPage @product={{this.product}} />`);
      assert.dom('[data-test-notification-message]').exists({ count: 10 });
      assert.dom('[data-test-notification-empty]').doesNotExist();
    }
  );

  test.each(
    'it should render empty',
    ['appknox', 'storeknox'],
    async function (assert, product) {
      this.set('product', product);

      const service = this.owner.lookup(this.getServiceName(product));
      await service.reload();
      await render(hbs`<NotificationsPage @product={{this.product}} />`);
      assert.dom('[data-test-notification-message]').doesNotExist();
      assert.dom('[data-test-notification-empty]').exists();
    }
  );

  test.each(
    'it should render loading',
    ['appknox', 'storeknox'],
    async function (assert, product) {
      this.set('product', product);

      const service = this.owner.lookup(this.getServiceName(product));
      await service.reload();
      service.fetch = {
        isRunning: true,
      };
      await render(hbs`<NotificationsPage @product={{this.product}} />`);
      assert.dom('[data-test-notification-message]').doesNotExist();
      assert.dom('[data-test-notification-empty]').doesNotExist();
      assert.dom('[data-test-ak-loader]').exists();
    }
  );
});

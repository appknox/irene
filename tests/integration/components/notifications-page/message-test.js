import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setComponentTemplate } from '@ember/component';
import Component from '@glimmer/component';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module(
  'Integration | Component | notifications-page/message',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      const getModelName = (product) =>
        product === 'appknox'
          ? 'nf-in-app-notification'
          : 'sk-nf-in-app-notification';

      this.setProperties({ getModelName });
    });

    test.each(
      'it should render error component for non registered messageCode',
      ['appknox', 'storeknox'],
      async function (assert, product) {
        this.set('product', product);

        this.notification = this.server.create(this.getModelName(product), {
          hasRead: true,
          messageCode: 'NF_ERROR',
          context: {
            test_name: 'read',
          },
        });

        await render(
          hbs`<NotificationsPage::Message @notification={{this.notification}}/>`
        );

        assert
          .dom('[data-test-notification-message-component]')
          .exists()
          .containsText(
            'no message object registered for messageCode: NF_ERROR'
          );
      }
    );

    test.each(
      'it should render context components based on message_code',
      ['appknox', 'storeknox'],
      async function (assert, product) {
        this.set('product', product);

        class NotificationMesaageTest extends Component {}

        class NotificationTestContext {
          constructor(input) {
            this.test_name = input.test_name;
          }
        }

        setComponentTemplate(
          hbs`<span data-test-notification-messages-test22>test {{@context.test_name}}</span>`,
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

        this.notification = this.server.create(this.getModelName(product), {
          hasRead: true,
          messageCode: 'NF_TEST',
          context: {
            test_name: 'rand_read',
          },
        });

        await render(
          hbs`<NotificationsPage::Message @notification={{this.notification}}/>`
        );

        assert
          .dom('[data-test-notification-message-component]')
          .exists()
          .containsText('test rand_read');
      }
    );

    test.each(
      'it should render relative createdOn',
      ['appknox', 'storeknox'],
      async function (assert, product) {
        this.set('product', product);

        class NotificationMesaageTest extends Component {}

        class NotificationTestContext {
          constructor(input) {
            this.test_name = input.test_name;
          }
        }

        setComponentTemplate(
          hbs`<span data-test-notification-messages-test22>test {{@context.test_name}}</span>`,
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

        this.notification = this.server.create(this.getModelName(product), {
          hasRead: true,
          messageCode: 'NF_TEST',
          createdOn: new Date(),
          context: {
            test_name: 'rand_read',
          },
        });

        await render(
          hbs`<NotificationsPage::Message @notification={{this.notification}}/>`
        );

        assert
          .dom('[data-test-notification-created-on]')
          .exists()
          .containsText('a few seconds ago');
      }
    );

    test.each(
      'it should unread/read notification',
      ['appknox', 'storeknox'],
      async function (assert, product) {
        this.set('product', product);

        class NotificationMesaageTest extends Component {}
        class NotificationTestContext {
          constructor(input) {
            this.test_name = input.test_name;
          }
        }

        setComponentTemplate(
          hbs`<span data-test-notification-messages-test22>test {{@context.test_name}}</span>`,
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

        this.notification = this.server.create(this.getModelName(product), {
          hasRead: true,
          messageCode: 'NF_TEST',
          createdOn: new Date(),
          context: {
            test_name: 'rand_read',
          },
        });

        await render(
          hbs`<NotificationsPage::Message @notification={{this.notification}}/>`
        );

        assert.dom('[data-test-notification-checkbox-label]').exists();

        await click('[data-test-notification-checkbox-label]');

        assert.false(this.notification.hasRead);

        await click('[data-test-notification-checkbox-label]');

        assert.true(this.notification.hasRead);
      }
    );
  }
);

import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | notifications-page/bell-icon',
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
      'it should render bell icon and should open dropdown on click',
      ['appknox', 'storeknox'],
      async function (assert, product) {
        this.set('product', product);

        await render(
          hbs`<NotificationsPage::BellIcon @product={{this.product}} />`
        );

        assert.dom('[data-test-notification-dropdown]').doesNotExist();

        assert
          .dom(`[data-test-bell-icon]`)
          .hasAttribute('title', '0 unread notifications');

        await click('[data-test-bell-icon-trigger]');

        assert.dom(`[data-test-notification-dropdown]`).exists();
      }
    );

    test.each(
      'it should render unread dot if unread notifications exists',
      ['appknox', 'storeknox'],
      async function (assert, product) {
        this.set('product', product);

        this.unread_nf = this.server.createList(this.getModelName(product), 2, {
          hasRead: false,
          messageCode: 'RANDOM_NF_CODE',
        });

        this.read_nf = this.server.createList(this.getModelName(product), 5, {
          hasRead: true,
          messageCode: 'RANDOM_NF_CODE',
        });

        await render(
          hbs`<NotificationsPage::BellIcon @product={{this.product}} />`
        );

        assert
          .dom(`[data-test-bell-icon]`)
          .hasAttribute('title', '2 unread notifications');

        assert.dom(`[data-test-notification-icon]`).exists();

        assert.dom(`[data-test-unread-dot]`).exists();
      }
    );

    test.each(
      'it should not render unread dot if unread notifications exists',
      ['appknox', 'storeknox'],
      async function (assert, product) {
        this.set('product', product);

        this.read_nf = this.server.createList(this.getModelName(product), 5, {
          hasRead: true,
          messageCode: 'RANDOM_NF_CODE',
        });

        await render(
          hbs`<NotificationsPage::BellIcon @product={{this.product}} />`
        );

        assert
          .dom(`[data-test-bell-icon]`)
          .hasAttribute('title', '0 unread notifications');

        assert.dom(`[data-test-notification-icon]`).exists();
        assert.dom(`[data-test-unread-dot]`).doesNotExist();
      }
    );

    test.each(
      'it should show/hide unread dot based on realtime unread notifications count',
      ['appknox', 'storeknox'],
      async function (assert, product) {
        this.set('product', product);

        this.unread_nf = this.server.createList(this.getModelName(product), 5, {
          hasRead: false,
          messageCode: 'RANDOM_NF_CODE',
        });

        this.read_nf = this.server.createList(this.getModelName(product), 5, {
          hasRead: true,
          messageCode: 'RANDOM_NF_CODE',
        });

        const serviceName =
          product === 'appknox' ? 'ak-notifications' : 'sk-notifications';

        const service = this.owner.lookup(`service:${serviceName}`);

        await render(
          hbs`<NotificationsPage::BellIcon @product={{this.product}} />`
        );

        assert
          .dom(`[data-test-bell-icon]`)
          .hasAttribute('title', '5 unread notifications');

        assert.dom(`[data-test-unread-dot]`).exists();

        await service.markAllAsRead.perform();

        assert
          .dom(`[data-test-bell-icon]`)
          .hasAttribute('title', '0 unread notifications');

        assert.dom(`[data-test-unread-dot]`).doesNotExist();
      }
    );
  }
);

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
    setupIntl(hooks);

    test('it should render bell icon and should open dropdown on click', async function (assert) {
      await render(hbs`<NotificationsPage::BellIcon />`);
      assert.dom('[data-test-notification-dropdown]').doesNotExist();
      assert
        .dom(`[data-test-bell-icon]`)
        .hasAttribute('title', '0 unread notifications');
      await click('[data-test-bell-icon-trigger]');
      assert.dom(`[data-test-notification-dropdown]`).exists();
    });

    test('it should render unread dot if unread notifications exists', async function (assert) {
      this.unread_nf = this.server.createList('nf-in-app-notification', 2, {
        hasRead: false,
        messageCode: 'RANDOM_NF_CODE',
      });

      this.read_nf = this.server.createList('nf-in-app-notification', 5, {
        hasRead: true,
        messageCode: 'RANDOM_NF_CODE',
      });

      await render(hbs`<NotificationsPage::BellIcon />`);

      assert
        .dom(`[data-test-bell-icon]`)
        .hasAttribute('title', '2 unread notifications');
      assert.dom(`[data-test-notification-icon]`).exists();
      assert.dom(`[data-test-unread-dot]`).exists();
    });

    test('it should not render unread dot if unread notifications exists', async function (assert) {
      this.read_nf = this.server.createList('nf-in-app-notification', 5, {
        hasRead: true,
        messageCode: 'RANDOM_NF_CODE',
      });

      await render(hbs`<NotificationsPage::BellIcon />`);

      assert
        .dom(`[data-test-bell-icon]`)
        .hasAttribute('title', '0 unread notifications');
      assert.dom(`[data-test-notification-icon]`).exists();
      assert.dom(`[data-test-unread-dot]`).doesNotExist();
    });

    test('it should show/hide unread dot based on realtime unread notifications count', async function (assert) {
      this.unread_nf = this.server.createList('nf-in-app-notification', 5, {
        hasRead: false,
        messageCode: 'RANDOM_NF_CODE',
      });

      this.read_nf = this.server.createList('nf-in-app-notification', 5, {
        hasRead: true,
        messageCode: 'RANDOM_NF_CODE',
      });

      const service = this.owner.lookup('service:ak-notifications');

      await render(hbs`<NotificationsPage::BellIcon />`);

      assert
        .dom(`[data-test-bell-icon]`)
        .hasAttribute('title', '5 unread notifications');
      assert.dom(`[data-test-unread-dot]`).exists();
      await service.markAllAsRead.perform();
      assert
        .dom(`[data-test-bell-icon]`)
        .hasAttribute('title', '0 unread notifications');
      assert.dom(`[data-test-unread-dot]`).doesNotExist();
    });
  }
);

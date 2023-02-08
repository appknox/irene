import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | notifications-page/bell-icon',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(function () {});

    test('it should render bell icon with link to notifications page', async function (assert) {
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
      this.owner.lookup('service:ak-notifications');

      await render(hbs`<NotificationsPage::BellIcon />`);

      assert.strictEqual(this.element.textContent.trim(), '');
      assert
        .dom(`[data-test-bell-icon]`)
        .hasAttribute('title', '0 unread notifications');
      // assert
      //   .dom(`[data-test-bell-icon]`)
      //   .hasAttribute('href', '/dashboard/notifications');
      assert.dom(`[data-test-notification-icon]`).exists();
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
      this.owner.lookup('service:ak-notifications');

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
      this.owner.lookup('service:ak-notifications');

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
      let service = this.owner.lookup('service:ak-notifications');

      await render(hbs`<NotificationsPage::BellIcon />`);

      assert
        .dom(`[data-test-bell-icon]`)
        .hasAttribute('title', '5 unread notifications');
      assert.dom(`[data-test-unread-dot]`).exists();

      this.server.post(
        'v2/nf_in_app_notifications/mark_all_as_read',
        function (schema, request) {
          let notifications_list = schema.nfInAppNotifications.all().models;
          for (let nf of notifications_list) {
            nf.hasRead = true;
            nf.save();
          }
          return new Response(204, {}, {});
        }
      );
      await service.markAllAsRead.perform();

      assert
        .dom(`[data-test-bell-icon]`)
        .hasAttribute('title', '0 unread notifications');
      assert.dom(`[data-test-unread-dot]`).doesNotExist();
      assert.ok(1);
    });
  }
);

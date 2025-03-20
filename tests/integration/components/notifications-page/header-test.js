import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | notifications-page/header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  class AkNotificationsServiceStub extends Service {
    get notifications() {
      return [];
    }
    showUnReadOnly = false;
    unReadCount = 0;
    refresh = {};
    markAllAsRead = {};
  }

  hooks.beforeEach(function () {
    this.owner.register('service:ak-notifications', AkNotificationsServiceStub);
    this.owner.register('service:sk-notifications', AkNotificationsServiceStub);

    const getModelName = (product) =>
      product === 'appknox'
        ? 'nf-in-app-notification'
        : 'sk-nf-in-app-notification';

    const getServiceName = (product) =>
      `service:${product === 'appknox' ? 'ak-notifications' : 'sk-notifications'}`;

    this.setProperties({ getModelName, getServiceName });
  });

  test.each(
    'it renders',
    ['appknox', 'storeknox'],
    async function (assert, product) {
      this.set('product', product);

      await render(
        hbs`<NotificationsPage::Header @product={{this.product}} />`
      );

      assert.notEqual(
        this.element.textContent.trim().indexOf(t('notifications')),
        -1
      );
    }
  );

  test.each(
    'it should show unread count',
    ['appknox', 'storeknox'],
    async function (assert, product) {
      this.set('product', product);

      await render(
        hbs`<NotificationsPage::Header @product={{this.product}} />`
      );

      assert.dom('[data-test-unread-count]').exists().containsText('0');

      const service = this.owner.lookup(this.getServiceName(product));
      service.unReadCount = 1;

      await render(
        hbs`<NotificationsPage::Header @product={{this.product}} />`
      );

      assert.dom('[data-test-unread-count]').containsText('1');
    }
  );

  test.each(
    'it should trigger refresh on show unread change',
    ['appknox', 'storeknox'],
    async function (assert, product) {
      this.set('product', product);

      assert.expect(2);

      const service = this.owner.lookup(this.getServiceName(product));

      service.refresh.perform = () => {
        assert.true(true, 'refresh.perform called');
      };

      await render(
        hbs`<NotificationsPage::Header @product={{this.product}} />`
      );

      assert.dom('[data-test-ak-toggle-unread]').exists();

      await click('[data-test-ak-toggle-unread] [data-test-toggle-input]');
    }
  );

  test.each(
    'it should trigger markAllAsRead',
    ['appknox', 'storeknox'],
    async function (assert, product) {
      this.set('product', product);

      assert.expect(2);

      const service = this.owner.lookup(this.getServiceName(product));

      service.markAllAsRead.perform = () => {
        assert.true(true, 'markAllAsRead.perform called');
      };

      await render(
        hbs`<NotificationsPage::Header @product={{this.product}} />`
      );

      assert.dom('[data-test-ak-button-mark-all-as-read]').exists();

      await click('[data-test-ak-button-mark-all-as-read]');
    }
  );
});

import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | notifications-page/header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

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
  });

  test('it renders', async function (assert) {
    await render(hbs`<NotificationsPage::Header />`);

    assert.notEqual(
      this.element.textContent.trim().indexOf('t:notifications:()'),
      -1
    );
  });

  test('it should show unread count', async function (assert) {
    await render(hbs`<NotificationsPage::Header />`);
    assert.dom('[data-test-unread-count]').exists().containsText('0');
    const service = this.owner.lookup('service:ak-notifications');
    service.unReadCount = 1;
    await render(hbs`<NotificationsPage::Header />`);
    assert.dom('[data-test-unread-count]').containsText('1');
  });

  test('it should trigger refresh on show unread change', async function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:ak-notifications');
    service.refresh.perform = () => {
      assert.true(true, 'refresh.perform called');
    };
    await render(hbs`<NotificationsPage::Header />`);
    assert.dom('[data-test-ak-toggle-unread]').exists();
    await click('[data-test-ak-toggle-unread] [data-test-toggle-input]');
  });

  test('it should trigger markAllAsRead', async function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:ak-notifications');
    service.markAllAsRead.perform = () => {
      assert.true(true, 'markAllAsRead.perform called');
    };
    await render(hbs`<NotificationsPage::Header />`);
    assert.dom('[data-test-ak-button-mark-all-as-read]').exists();
    await click('[data-test-ak-button-mark-all-as-read]');
  });
});

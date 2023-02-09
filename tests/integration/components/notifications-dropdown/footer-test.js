import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | notifications-dropdown/footer',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      await render(hbs`<NotificationsDropdown::Footer />`);

      assert.strictEqual(
        this.element.textContent.trim(),
        'View All Notifications'
      );
    });

    test('it should trigger onClick', async function (assert) {
      assert.expect(2);
      this.onClick = function () {
        assert.true(true);
      };
      await render(
        hbs`<NotificationsDropdown::Footer @onViewAllNotificationClick={{this.onClick}} />`
      );
      assert.dom('[data-test-notification-dropdown-link]').exists();
      await click('[data-test-notification-dropdown-link]');
    });
  }
);

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

      this.onViewAllNotificationClick = () => {
        assert.true(true, 'onViewAllNotificationClick handler was called');
      };

      await render(hbs`
        <NotificationsDropdown::Footer 
          @onViewAllNotificationClick={{this.onViewAllNotificationClick}} 
        />
      `);

      assert
        .dom('[data-test-notification-dropdown-link]')
        .exists('Notification dropdown link exists');

      await click('[data-test-notification-dropdown-link]');
    });
  }
);

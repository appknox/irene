import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setComponentTemplate } from '@ember/component';
import Component from '@glimmer/component';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module('Integration | Component | notifications-dropdown', function (hooks) {
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

    const template = hbs`
      <div {{style position="relative"}}>
        <button id="notification-button" type="button" {{on "click" this.openDropdown}}>Button</button>
        <NotificationsDropdown
            @onClose={{this.closeDropdown}}
            @anchorRef={{this.anchorRef}}
          />
      </div>
    
    `;

    this.setProperties({
      anchorRef: null,
      openDropdown: (event) => {
        this.set('anchorRef', event.target);
      },
      closeDropdown: () => {
        this.anchorRef = null;
      },
      template,
    });
  });

  test('it renders', async function (assert) {
    await render(this.template);
    await click('#notification-button');

    assert.dom('[data-test-notification-dropdown]').exists();

    assert.notEqual(
      this.element.textContent.trim().indexOf(t('notifications')),
      -1
    );
  });

  test('it should render only unread notification', async function (assert) {
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

    await render(this.template);

    await click('#notification-button');
    await click('#notification-button');
    const service = this.owner.lookup('service:ak-notifications');
    await service.reload();
    assert.dom('[data-test-notification-message]').exists({ count: 3 });
    assert.dom('[data-test-notification-empty]').doesNotExist();
  });

  test('it should render empty', async function (assert) {
    await render(this.template);
    await click('#notification-button');
    const service = this.owner.lookup('service:ak-notifications');
    await service.reload();
    assert.dom('[data-test-notification-message]').doesNotExist();
    assert.dom('[data-test-notification-empty]').exists();
  });

  test('it should render loading', async function (assert) {
    await render(this.template);
    await click('#notification-button');

    const service = this.owner.lookup('service:ak-notifications');
    service.reload();
    service.fetchUnRead = {
      isRunning: true,
    };

    await render(this.template);

    assert.dom('[data-test-notification-message]').doesNotExist();
    assert.dom('[data-test-notification-empty]').doesNotExist();
    assert.dom('[data-test-ak-loader]').exists();
  });
});

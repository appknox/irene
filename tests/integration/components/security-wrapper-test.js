import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }
  success(msg) {
    this.successMsg = msg;
  }
}

class FreshdeskStub extends Service {
  supportWidgetIsEnabled = false;
  freshchatEnabled = false;
}

class ConfigurationStub extends Service {
  frontendData = {};
  themeData = {};
  imageData = {};
  serverData = { enterprise: false };
}

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isCrispEnabled() {
    return true;
  }
}

module('Integration | Component | security-wrapper', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const store = this.owner.lookup('service:store');

    const organizationMe = store.createRecord('organization-me', {
      is_owner: true,
      is_admin: true,
    });

    class OrganizationMeStub extends Service {
      org = organizationMe;
    }

    await this.owner.lookup('service:organization').load();

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:freshdesk', FreshdeskStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:configuration', ConfigurationStub);

    const organization = this.owner.lookup('service:organization');

    this.setProperties({
      organization: organization,
      user: store.createRecord('user', this.server.create('user').toJSON()),
    });

    // handle submissions api for each test
    this.server.get('/submissions', () => []);
  });

  test('it renders main top-nav with logo', async function (assert) {
    await render(hbs`
        <SecurityWrapper
          @user={{this.user}}
        />
    `);

    assert.dom('[data-test-topNav]').exists();

    assert.dom('[data-test-topNav-logo]').exists();

    assert.dom('[data-test-topNav-title]').doesNotExist();

    assert.dom('[data-test-security-nav-menu]').exists();

    assert.dom('[data-test-side-nav]').doesNotExist();

    assert.dom('[data-test-bell-icon]').doesNotExist();

    assert
      .dom('[data-test-topNav-profileBtn]')
      .isNotDisabled()
      .hasText(this.user.username);
  });
});

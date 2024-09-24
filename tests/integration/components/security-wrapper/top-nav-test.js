import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import Service from '@ember/service';

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isCrispEnabled() {
    return false;
  }
}

module('Integration | Component | security-wrapper/top-nav', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    this.owner.register('service:integration', IntegrationStub);

    this.setProperties({
      user: store.createRecord('user', this.server.create('user').toJSON()),
    });
  });

  test('it exists', async function (assert) {
    await render(hbs`
        <SecurityWrapper::TopNav @user={{this.user}} />
      `);

    assert.dom('[data-test-security-appbar]').exists();

    assert.dom('[data-test-security-appknox-logo]').exists();

    assert.dom('[data-test-security-profile-btn]').exists();
  });

  test('test profile btn and logout', async function (assert) {
    assert.expect(8);

    await render(hbs`
        <SecurityWrapper::TopNav @user={{this.user}} />
      `);

    assert.dom('[data-test-security-appbar]').exists();

    assert
      .dom('[data-test-security-profile-btn]')
      .isNotDisabled()
      .hasText(this.user.username);

    await click('[data-test-security-profile-btn]');

    assert.dom('[data-test-security-profile-menu-item]').exists();

    const menuItems = findAll('[data-test-security-profile-menu-item]');

    assert.dom(menuItems[0]).hasText(this.user.username);
    assert.dom(menuItems[1]).hasText(this.user.email);
    assert.dom(menuItems[2]).hasText('Logout');

    await click(menuItems[2].querySelector('button'));

    await click('[data-test-security-profile-btn]');

    assert.dom('[data-test-security-profile-menu-item]').doesNotExist();
  });
});

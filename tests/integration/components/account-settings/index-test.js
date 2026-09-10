import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

function organizationStub({ cyodEnabled = true } = {}) {
  return class OrganizationStub extends Service {
    selected = { id: 42 };
    isCyodEnabled = cyodEnabled;
  };
}

function tabLabels(element) {
  return [...element.querySelectorAll('[data-test-ak-tab-item]')].map((el) =>
    el.textContent.trim()
  );
}

module('Integration | Component | account-settings', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  test('the CYOD tab sits between developer settings and notifications', async function (assert) {
    this.owner.register('service:organization', organizationStub());

    await render(hbs`<AccountSettings />`);

    const labels = tabLabels(this.element);
    const cyodIndex = labels.indexOf(t('cyod.settings.tabLabel'));

    assert.strictEqual(
      cyodIndex,
      labels.indexOf(t('developerSettings')) + 1,
      'comes straight after developer settings'
    );

    assert.strictEqual(
      cyodIndex + 1,
      labels.indexOf(t('notificationPreferences')),
      'and sits before notification preferences'
    );
  });

  test('the CYOD tab is absent without the entitlement', async function (assert) {
    this.owner.register(
      'service:organization',
      organizationStub({ cyodEnabled: false })
    );

    await render(hbs`<AccountSettings />`);

    assert.notOk(
      tabLabels(this.element).includes(t('cyod.settings.tabLabel')),
      'no CYOD tab'
    );
  });
});

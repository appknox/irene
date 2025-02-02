import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

import Service from '@ember/service';

class RouterStub extends Service {
  currentRouteName = 'authenticated.dashboard.organization.namespaces';

  transitionTo(routeName) {
    this.currentRouteName = routeName;
  }
}

module('Integration | Component | organization-details', function (hooks) {
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

    // unregister to override any lookup
    this.owner.unregister('service:router');
    this.owner.register('service:router', RouterStub);
  });

  test('it renders organization details', async function (assert) {
    await render(hbs`<OrganizationDetails />`);

    const organization = this.owner.lookup('service:organization');

    assert.dom('[data-test-org-name]').hasText(organization.selected.name);
  });

  test('on org name header action button click route to organization settings', async function (assert) {
    await render(hbs`<OrganizationDetails />`);

    assert
      .dom('[data-test-org-name-action-btn]')
      .exists()
      .hasText(t('organizationSettings'));

    await click('[data-test-org-name-action-btn]');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(
      router.currentRouteName,
      'authenticated.dashboard.organization-settings'
    );
  });

  test('organization settings button should not be visible to member', async function (assert) {
    const me = this.owner.lookup('service:me');

    me.org.is_owner = false;
    me.org.is_admin = false;

    await render(hbs`<OrganizationDetails />`);

    assert.dom('[data-test-org-name-action-btn]').doesNotExist();
  });

  test('organization settings button should not be visible to member add button disabled', async function (assert) {
    const me = this.owner.lookup('service:me');
    const organization = this.owner.lookup('service:organization');

    organization.selected.set('name', '');

    me.org.is_owner = false;
    me.org.is_admin = false;

    await render(hbs`<OrganizationDetails />`);

    assert.dom('[data-test-org-name-action-btn]').doesNotExist();
    assert.dom('[data-test-org-name-add-btn]').exists().isDisabled();
  });

  test('no org name add button and org settings button visible', async function (assert) {
    const organization = this.owner.lookup('service:organization');

    organization.selected.set('name', '');

    await render(hbs`<OrganizationDetails />`);

    assert.dom('[data-test-org-name-action-btn]').exists();
    assert.dom('[data-test-org-name-add-btn]').exists().isNotDisabled();
  });
});

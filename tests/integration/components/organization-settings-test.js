import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';

import Service from '@ember/service';

class OrganizationMeStub extends Service {
  org = {
    is_owner: true,
    is_admin: true,
  };
}

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

class RouterStub extends Service {
  currentRouteName = 'authenticated.organization.namespaces';
}

module('Integration | Component | organization-settings', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:router', RouterStub);
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders organization settings', async function (assert) {
    const organization = this.owner.lookup('service:organization');
    const user = this.owner.lookup('service:store').createRecord('user');

    this.setProperties({
      model: {
        organization: organization.selected,
        user,
      },
    });

    await render(hbs`<OrganizationSettings @model={{this.model}} />`);

    assert.dom('[data-test-org-name]').hasText(this.model.organization.name);

    assert
      .dom('[data-test-org-name-action-btn]')
      .isNotDisabled()
      .hasText('t:editName:()');
  });

  test('edit name button should be not visible to admin/member', async function (assert) {
    const organization = this.owner.lookup('service:organization');
    const user = this.owner.lookup('service:store').createRecord('user');

    this.setProperties({
      model: { organization: organization.selected, user },
    });

    const me = this.owner.lookup('service:me');

    me.org.is_owner = false;
    me.org.is_admin = true;

    await render(hbs`<OrganizationSettings @model={{this.model}} />`);

    assert.dom('[data-test-org-name-action-btn]').doesNotExist();
  });

  test('no org name only add button visible', async function (assert) {
    const organization = this.owner.lookup('service:organization');
    const user = this.owner.lookup('service:store').createRecord('user');

    this.setProperties({
      model: { organization: organization.selected, user },
    });

    this.model.organization.set('name', '');

    await render(hbs`<OrganizationSettings @model={{this.model}} />`);

    assert.dom('[data-test-org-name-action-btn]').doesNotExist();
    assert.dom('[data-test-org-name-add-btn]').exists().isNotDisabled();
  });

  test('no org name only add button visible and disabled', async function (assert) {
    const organization = this.owner.lookup('service:organization');
    const user = this.owner.lookup('service:store').createRecord('user');

    this.setProperties({
      model: { organization: organization.selected, user },
    });

    this.model.organization.set('name', '');

    const me = this.owner.lookup('service:me');

    me.org.is_owner = false;

    await render(hbs`<OrganizationSettings @model={{this.model}} />`);

    assert.dom('[data-test-org-name-action-btn]').doesNotExist();
    assert.dom('[data-test-org-name-add-btn]').exists().isDisabled();
  });

  test('organization mfa should render', async function (assert) {
    const organization = this.owner.lookup('service:organization');
    const user = this.owner.lookup('service:store').createRecord('user');

    this.setProperties({
      model: { organization: organization.selected, user },
    });

    await render(hbs`<OrganizationSettings @model={{this.model}} />`);

    assert.dom('[data-test-mfa-title]').hasText('t:multiFactorAuth:()');

    assert.dom('[data-test-toggle-input]').exists().isDisabled().isNotChecked();

    assert
      .dom('[data-test-enable-mandatory-mfa-label]')
      .hasText('t:enableMandatoryMFATitle:()');

    assert
      .dom('[data-test-enable-mandatory-mfa-description]')
      .hasText('t:enableMandatoryMFADescription:()');

    assert
      .dom('[data-test-enable-mandatory-mfa-warning]')
      .hasText('t:enableMandatoryMFAWarning:()');

    assert
      .dom('[data-test-enable-mandatory-mfa-requirement]')
      .includesText('t:enableMandatoryMFARequirement:()');
  });
});

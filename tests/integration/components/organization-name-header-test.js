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

module('Integration | Component | organization-name-header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();

    this.owner.register('service:me', OrganizationMeStub);
  });

  test('it renders organization name header', async function (assert) {
    const organization = this.owner.lookup('service:organization');

    this.setProperties({
      organization,
      showActionBtn: true,
      actionBtnIconName: 'pencil',
      actionBtnLabel: 'Edit Name',
      actionBtnClick() {},
      showAddOrgNameBtn: false,
      onAddBtnClick() {},
    });

    await render(
      hbs`<OrganizationNameHeader
        @organization={{this.organization.selected}}
        @showActionBtn={{this.showActionBtn}}
        @actionBtnIconName={{this.actionBtnIconName}}
        @actionBtnLabel={{this.actionBtnLabel}}
        @actionBtnClick={{this.actionBtnClick}}
        @showAddOrgNameBtn={{this.showAddOrgNameBtn}}
        @onAddBtnClick={{this.onAddBtnClick}} />`
    );

    assert.dom('[data-test-org-name]').hasText(this.organization.selected.name);

    assert
      .dom('[data-test-org-name-action-btn]')
      .exists()
      .hasText(this.actionBtnLabel);
  });

  test('it renders organization name header with no action button', async function (assert) {
    const organization = this.owner.lookup('service:organization');

    this.setProperties({
      organization,
      showActionBtn: false,
      actionBtnIconName: 'pencil',
      actionBtnLabel: 'Edit Name',
      actionBtnClick() {},
      showAddOrgNameBtn: false,
      onAddBtnClick() {},
    });

    await render(
      hbs`<OrganizationNameHeader
        @organization={{this.organization.selected}}
        @showActionBtn={{this.showActionBtn}}
        @actionBtnIconName={{this.actionBtnIconName}}
        @actionBtnLabel={{this.actionBtnLabel}}
        @actionBtnClick={{this.actionBtnClick}}
        @showAddOrgNameBtn={{this.showAddOrgNameBtn}}
        @onAddBtnClick={{this.onAddBtnClick}} />`
    );

    assert.dom('[data-test-org-name]').hasText(this.organization.selected.name);
    assert.dom('[data-test-org-name-action-btn]').doesNotExist();
  });

  test('it renders organization name header with action button & add button', async function (assert) {
    const organization = this.owner.lookup('service:organization');

    this.setProperties({
      organization,
      showActionBtn: true,
      actionBtnIconName: 'cog',
      actionBtnLabel: 'Organization Settings',
      actionBtnClick() {},
      showAddOrgNameBtn: true,
      onAddBtnClick() {},
    });

    await render(
      hbs`<OrganizationNameHeader
        @organization={{this.organization.selected}}
        @showActionBtn={{this.showActionBtn}}
        @actionBtnIconName={{this.actionBtnIconName}}
        @actionBtnLabel={{this.actionBtnLabel}}
        @actionBtnClick={{this.actionBtnClick}}
        @showAddOrgNameBtn={{this.showAddOrgNameBtn}}
        @onAddBtnClick={{this.onAddBtnClick}} />`
    );

    assert.dom('[data-test-org-name]').doesNotExist();

    assert
      .dom('[data-test-org-name-action-btn]')
      .exists()
      .hasText(this.actionBtnLabel);

    assert
      .dom('[data-test-org-name-add-btn]')
      .exists()
      .hasText('Add Organization Name')
      .isNotDisabled();
  });

  test('it renders organization name header with add button and no action button', async function (assert) {
    const organization = this.owner.lookup('service:organization');

    this.setProperties({
      organization,
      showActionBtn: false,
      actionBtnIconName: 'pencil',
      actionBtnLabel: 'Edit Name',
      actionBtnClick() {},
      showAddOrgNameBtn: true,
      onAddBtnClick() {},
    });

    await render(
      hbs`<OrganizationNameHeader
        @organization={{this.organization.selected}}
        @showActionBtn={{this.showActionBtn}}
        @actionBtnIconName={{this.actionBtnIconName}}
        @actionBtnLabel={{this.actionBtnLabel}}
        @actionBtnClick={{this.actionBtnClick}}
        @showAddOrgNameBtn={{this.showAddOrgNameBtn}}
        @onAddBtnClick={{this.onAddBtnClick}} />`
    );

    assert.dom('[data-test-org-name]').doesNotExist();
    assert.dom('[data-test-org-name-action-btn]').doesNotExist();

    assert
      .dom('[data-test-org-name-add-btn]')
      .exists()
      .hasText('Add Organization Name')
      .isNotDisabled();
  });

  test('it renders organization name header with add button disabled', async function (assert) {
    const organization = this.owner.lookup('service:organization');

    this.setProperties({
      organization,
      showActionBtn: false,
      actionBtnIconName: 'pencil',
      actionBtnLabel: 'Edit Name',
      actionBtnClick() {},
      showAddOrgNameBtn: true,
      onAddBtnClick() {},
    });

    const me = this.owner.lookup('service:me');

    me.org.is_owner = false;

    await render(
      hbs`<OrganizationNameHeader
        @organization={{this.organization.selected}}
        @showActionBtn={{this.showActionBtn}}
        @actionBtnIconName={{this.actionBtnIconName}}
        @actionBtnLabel={{this.actionBtnLabel}}
        @actionBtnClick={{this.actionBtnClick}}
        @showAddOrgNameBtn={{this.showAddOrgNameBtn}}
        @onAddBtnClick={{this.onAddBtnClick}} />`
    );

    assert.dom('[data-test-org-name]').doesNotExist();

    assert
      .dom('[data-test-org-name-add-btn]')
      .exists()
      .hasText('Add Organization Name')
      .hasClass(/add-button-disabled/i);
  });
});

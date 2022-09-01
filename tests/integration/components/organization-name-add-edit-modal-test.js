import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
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

module(
  'Integration | Component | organization-name-add-edit-modal',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);
      await this.owner.lookup('service:organization').load();

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it renders organization name edit add modal', async function (assert) {
      const organization = this.owner.lookup('service:organization');

      this.setProperties({
        organization,
        handleCancel() {},
      });

      await render(
        hbs`<OrganizationNameAddEditModal @organization={{this.organization.selected}} @handleCancel={{this.handleCancel}} />`
      );

      assert
        .dom('[data-test-org-name-edit-input]')
        .exists()
        .hasValue(this.organization.selected.name);
    });

    test('it should edit organization name', async function (assert) {
      const organization = this.owner.lookup('service:organization');

      this.setProperties({
        organization,
        handleCancel() {},
      });

      await render(
        hbs`<OrganizationNameAddEditModal @organization={{this.organization.selected}} @handleCancel={{this.handleCancel}} />`
      );

      assert
        .dom('[data-test-org-name-edit-input]')
        .exists()
        .hasValue(this.organization.selected.name);

      assert.dom('[data-test-org-name-edit-save-btn]').exists();

      const updatedOrgName = `${this.organization.selected.name} updated`;

      await fillIn('[data-test-org-name-edit-input]', updatedOrgName);

      await click('[data-test-org-name-edit-save-btn]');

      assert.strictEqual(this.organization.selected.name, updatedOrgName);

      assert
        .dom('[data-test-org-name-success-message]')
        .exists()
        .hasText('t:organizationNameAddedOrUpdated:("type":"edit")');
    });

    test('it should add organization name', async function (assert) {
      const organization = this.owner.lookup('service:organization');

      await organization.selected.set('name', '');

      this.setProperties({
        organization,
        handleCancel() {},
      });

      await render(
        hbs`<OrganizationNameAddEditModal @organization={{this.organization.selected}} @handleCancel={{this.handleCancel}} />`
      );

      assert
        .dom('[data-test-org-name-edit-input]')
        .exists()
        .hasValue(this.organization.selected.name);

      assert.dom('[data-test-org-name-edit-save-btn]').exists();

      const newOrgName = 'appknox';

      await fillIn('[data-test-org-name-edit-input]', newOrgName);

      await click('[data-test-org-name-edit-save-btn]');

      assert.strictEqual(this.organization.selected.name, newOrgName);

      assert
        .dom('[data-test-org-name-success-message]')
        .exists()
        .hasText('t:organizationNameAddedOrUpdated:("type":"add")');
    });
  }
);

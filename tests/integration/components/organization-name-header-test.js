import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';

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

module('Integration | Component | organization-name-header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const organizationMe = this.server.create('organization-me', {
      is_admin: true,
      is_owner: true,
      is_member: false,
    });

    await this.owner.lookup('service:organization').load();

    // stub
    this.owner.register('service:notifications', NotificationsStub);

    // intercept
    this.server.get('organizations/:id/me', (schema) => {
      return schema.organizationMes.find(organizationMe.id).toJSON();
    });

    this.setProperties({
      organizationMe,
    });
  });

  test('it renders organization name header', async function (assert) {
    const organization = this.owner.lookup('service:organization');

    this.setProperties({
      organization,
    });

    await render(
      hbs`
        <OrganizationNameHeader @organization={{this.organization.selected}}>
          <:actionBtn>
            <button data-test-org-name-action-btn type="button">action</button>
          </:actionBtn>
        </OrganizationNameHeader>
      `
    );

    assert.dom('[data-test-org-name-label]').hasText(t('organizationName'));
    assert.dom('[data-test-org-name]').hasText(this.organization.selected.name);

    assert.dom('[data-test-org-name-action-btn]').exists().isNotDisabled();
  });

  test('it renders organization name header with add button and no action button', async function (assert) {
    const organization = this.owner.lookup('service:organization');

    organization.selected.set('name', '');

    this.setProperties({
      organization,
    });

    await render(
      hbs`<OrganizationNameHeader @organization={{this.organization.selected}} />`
    );

    assert.dom('[data-test-org-name-label]').doesNotExist();
    assert.dom('[data-test-org-name]').doesNotExist();
    assert.dom('[data-test-org-name-action-btn]').doesNotExist();

    assert
      .dom('[data-test-org-name-add-btn]')
      .exists()
      .hasText(t('addOrgName'))
      .isNotDisabled();
  });

  test('it renders organization name header with add button disabled', async function (assert) {
    // set user role as admin
    this.organizationMe.update({
      is_owner: false,
      is_admin: true,
    });

    const organization = this.owner.lookup('service:organization');

    organization.selected.set('name', '');

    this.setProperties({
      organization,
    });

    await render(
      hbs`
        <OrganizationNameHeader @organization={{this.organization.selected}}>
          <:actionBtn>
            <button data-test-org-name-action-btn type="button">action</button>
          </:actionBtn>
        </OrganizationNameHeader>
      `
    );

    assert.dom('[data-test-org-name-label]').doesNotExist();
    assert.dom('[data-test-org-name]').doesNotExist();

    assert
      .dom('[data-test-org-name-add-btn]')
      .exists()
      .hasText(t('addOrgName'))
      .isDisabled();
  });

  test.each(
    'it should edit organization name',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      this.server.put('/organizations/:id', (_, req) => {
        return fail
          ? new Response(500)
          : { id: req.params.id, ...JSON.parse(req.requestBody) };
      });

      const organization = this.owner.lookup('service:organization');

      this.setProperties({
        organization,
      });

      await render(
        hbs`
        <OrganizationNameHeader @organization={{this.organization.selected}}>
          <:actionBtn as |ab|>
            <button data-test-org-name-action-btn type="button" {{on 'click' ab.openEditOrgNameModal}}>action</button>
          </:actionBtn>
        </OrganizationNameHeader>
      `
      );

      assert
        .dom('[data-test-org-name]')
        .hasText(this.organization.selected.name);

      assert.dom('[data-test-org-name-action-btn]').exists().isNotDisabled();

      await click('[data-test-org-name-action-btn]');

      assert.dom('[data-test-ak-modal-header]').hasText(t('editName'));

      assert
        .dom('[data-test-form-label]')
        .hasText(t('organizationNameEditLabel'));

      assert
        .dom('[data-test-org-name-edit-input]')
        .exists()
        .hasValue(this.organization.selected.name);

      assert.dom('[data-test-org-name-edit-save-btn]').exists();

      const updatedOrgName = `${this.organization.selected.name} updated`;
      const existingName = this.organization.selected.name;

      await fillIn('[data-test-org-name-edit-input]', updatedOrgName);

      await click('[data-test-org-name-edit-save-btn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(notify.errorMsg, t('pleaseTryAgain'));
        assert.strictEqual(this.organization.selected.name, existingName);
        assert.dom('[data-test-ak-modal-header]').hasText(t('editName'));
        assert.dom('[data-test-org-name-edit-input]').hasValue(updatedOrgName);

        assert.dom('[data-test-org-name-edit-save-btn]').exists();

        assert
          .dom('[data-test-form-label]')
          .hasText(t('organizationNameEditLabel'));
      } else {
        assert.strictEqual(this.organization.selected.name, updatedOrgName);

        assert.dom('[data-test-ak-modal-header]').hasText(t('message'));

        assert
          .dom('[data-test-org-name-success-message]')
          .exists()
          .hasText(t('organizationNameAddedOrUpdated', { type: 'edit' }));

        assert
          .dom('[data-test-org-name-success-okBtn]')
          .isNotDisabled()
          .hasText(t('ok'));

        await click('[data-test-org-name-success-okBtn]');

        assert.dom('[data-test-ak-modal-header]').doesNotExist();
        assert.dom('[data-test-form-label]').doesNotExist();
        assert.dom('[data-test-org-name-edit-input]').doesNotExist();
        assert.dom('[data-test-org-name-edit-save-btn]').doesNotExist();
      }
    }
  );

  test.each(
    'it should add organization name',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      this.server.put('/organizations/:id', (_, req) => {
        return fail
          ? new Response(500)
          : { id: req.params.id, ...JSON.parse(req.requestBody) };
      });

      const organization = this.owner.lookup('service:organization');

      organization.selected.set('name', '');

      this.setProperties({
        organization,
      });

      await render(
        hbs`<OrganizationNameHeader @organization={{this.organization.selected}} />`
      );

      assert.dom('[data-test-org-name]').doesNotExist();

      assert
        .dom('[data-test-org-name-add-btn]')
        .exists()
        .hasText(t('addOrgName'))
        .isNotDisabled();

      await click('[data-test-org-name-add-btn]');

      assert.dom('[data-test-ak-modal-header]').hasText(t('addName'));

      assert
        .dom('[data-test-form-label]')
        .hasText(t('organizationNameAddLabel'));

      assert.dom('[data-test-org-name-edit-input]').exists().hasNoValue();

      assert.dom('[data-test-org-name-edit-save-btn]').exists();

      const newOrgName = 'appknox';

      await fillIn('[data-test-org-name-edit-input]', newOrgName);

      await click('[data-test-org-name-edit-save-btn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(notify.errorMsg, t('pleaseTryAgain'));
        assert.strictEqual(this.organization.selected.name, '');
        assert.dom('[data-test-ak-modal-header]').hasText(t('addName'));
        assert.dom('[data-test-org-name-edit-input]').hasValue(newOrgName);
        assert.dom('[data-test-org-name-edit-save-btn]').exists();

        assert
          .dom('[data-test-form-label]')
          .hasText(t('organizationNameAddLabel'));
      } else {
        assert.strictEqual(this.organization.selected.name, newOrgName);

        assert.dom('[data-test-ak-modal-header]').hasText(t('message'));

        assert
          .dom('[data-test-org-name-success-message]')
          .exists()
          .hasText(t('organizationNameAddedOrUpdated', { type: 'add' }));

        assert
          .dom('[data-test-org-name-success-okBtn]')
          .isNotDisabled()
          .hasText(t('ok'));

        await click('[data-test-org-name-success-okBtn]');

        assert.dom('[data-test-ak-modal-header]').doesNotExist();
        assert.dom('[data-test-form-label]').doesNotExist();
        assert.dom('[data-test-org-name-edit-input]').doesNotExist();
        assert.dom('[data-test-org-name-edit-save-btn]').doesNotExist();
      }
    }
  );
});

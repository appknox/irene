import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  error(msg) {
    return (this.errorMsg = msg);
  }
  success(msg) {
    return (this.successMsg = msg);
  }
}

module(
  'Integration | Component | organization/settings-header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      await this.server.createList('organization', 1);
      await this.owner.lookup('service:organization').load();
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it renders org name and edit button', async function (assert) {
      this.set('isOwner', true);
      this.set(
        'organization',
        this.owner.lookup('service:organization').selected
      );
      await render(
        hbs`<Organization::SettingsHeader @isOwner={{this.isOwner}} @organization={{this.organization}}/>`
      );
      assert.dom('[data-test-org-name-label]').hasText(`t:organizationName:()`);
      assert.dom('[data-test-org-name-value]').hasText(this.organization.name);
      assert.dom('[data-test-org-name-edit-btn]').includesText(`t:edit:()`);
    });

    test('it should show ellipsis for 255 chars', async function (assert) {
      this.set('isOwner', true);
      const selectedOrg = this.owner.lookup('service:organization').selected;
      selectedOrg.set('name', 'a'.repeat(255));
      this.set('organization', selectedOrg);
      await render(
        hbs`<Organization::SettingsHeader @isOwner={{this.isOwner}} @organization={{this.organization}}/>`
      );
      const orgNameTextEl = this.element.querySelector(
        `[data-test-org-name-value]`
      );
      assert.true(
        orgNameTextEl.scrollWidth > orgNameTextEl.clientWidth,
        'Ellipsis applied'
      );
    });

    test('it should not show edit button', async function (assert) {
      this.set('isOwner', false);
      this.set(
        'organization',
        this.owner.lookup('service:organization').selected
      );
      await render(
        hbs`<Organization::SettingsHeader @isOwner={{this.isOwner}} @organization={{this.organization}}/>`
      );
      assert.dom('[data-test-org-name-edit-btn]').doesNotExist();
    });

    test('clicking on edit btn should open edit org name modal', async function (assert) {
      this.set('isOwner', true);
      this.set(
        'organization',
        this.owner.lookup('service:organization').selected
      );
      await render(
        hbs`<Organization::SettingsHeader @isOwner={{this.isOwner}} @organization={{this.organization}}/>`
      );
      await click(this.element.querySelector('[data-test-org-name-edit-btn]'));

      assert
        .dom('[data-test-org-edit-modal-label]')
        .hasText(`t:editOrganizationNameModalLabel:()`);
      assert
        .dom(`[data-test-org-edit-modal-cancel-btn]`)
        .hasText(`t:cancel:()`);
      assert.dom(`[data-test-org-edit-modal-save-btn]`).hasText(`t:save:()`);
      assert
        .dom(`[data-test-org-edit-modal-input]`)
        .hasValue(this.organization.name);
    });

    test('it should handle org name update success workflow', async function (assert) {
      this.server.put('/organizations/:id', (schema, req) => {
        return req.requestBody;
      });
      this.set('isOwner', true);
      this.set(
        'organization',
        this.owner.lookup('service:organization').selected
      );
      const notify = this.owner.lookup('service:notifications');
      await render(
        hbs`<Organization::SettingsHeader @isOwner={{this.isOwner}} @organization={{this.organization}}/>`
      );
      await click(this.element.querySelector('[data-test-org-name-edit-btn]'));

      await fillIn(`[data-test-org-edit-modal-input]`, 'Test Org');

      await click(`[data-test-org-edit-modal-save-btn]`);

      assert.equal(
        notify.get('successMsg'),
        `t:organizationNameUpdated:()`,
        `t:organizationNameUpdated:()`
      );

      assert.dom(`[data-test-org-edit-modal]`).doesNotExist();
      assert.dom(`[data-test-org-name-value]`).hasText(this.organization.name);
    });

    test('it should show error and disable save btn if org name exceed 255 char', async function (assert) {
      this.set('isOwner', true);
      this.set(
        'organization',
        this.owner.lookup('service:organization').selected
      );
      await render(
        hbs`<Organization::SettingsHeader @isOwner={{this.isOwner}} @organization={{this.organization}}/>`
      );
      await click(this.element.querySelector('[data-test-org-name-edit-btn]'));

      await fillIn(`[data-test-org-edit-modal-input]`, 'T'.repeat(256));

      assert
        .dom(`[data-test-org-edit-modal-save-btn]`)
        .hasAttribute('disabled');

      assert.dom(`[data-test-input-error-org-name]`).exists();

      await fillIn(`[data-test-org-edit-modal-input]`, '');

      assert
        .dom(`[data-test-org-edit-modal-save-btn]`)
        .hasAttribute('disabled');

      assert.dom(`[data-test-input-error-org-name]`).exists();
    });

    test('clicking on cancel btn should close the modal', async function (assert) {
      this.set('isOwner', true);
      this.set(
        'organization',
        this.owner.lookup('service:organization').selected
      );
      await render(
        hbs`<Organization::SettingsHeader @isOwner={{this.isOwner}} @organization={{this.organization}}/>`
      );
      await click(this.element.querySelector('[data-test-org-name-edit-btn]'));

      assert.dom('[data-test-org-edit-modal]').exists();
      await click(`[data-test-org-edit-modal-cancel-btn]`);
      assert.dom('[data-test-org-edit-modal]').doesNotExist();
    });
  }
);

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import Service from '@ember/service';

import { setupRequiredEndpoints } from '../../helpers/acceptance-utils';

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isPendoEnabled() {
    return false;
  }

  isCrispEnabled() {
    return false;
  }
}

class WebsocketStub extends Service {
  async connect() {}

  async configure() {}
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

  setDefaultAutoClear() {}
}

module('Acceptance | Organization settings', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization, currentOrganizationMe } =
      await setupRequiredEndpoints(this.server);

    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.setProperties({ organization, organizationMe: currentOrganizationMe });
  });

  test('it renders organization settings', async function (assert) {
    this.organizationMe.update({ is_owner: true, is_admin: true });

    await visit('dashboard/organization/settings');

    assert.dom('[data-test-org-name]').hasText(this.organization.name);

    assert
      .dom('[data-test-org-name-action-btn]')
      .isNotDisabled()
      .hasText(t('editName'));
  });

  test('edit name button should be not visible to admin/member', async function (assert) {
    this.organizationMe.update({ is_owner: false, is_admin: true });

    await visit('dashboard/organization/settings');

    assert.dom('[data-test-org-name-action-btn]').doesNotExist();
  });

  test('no org name only add button visible', async function (assert) {
    this.organization.update({ name: '' });

    this.organizationMe.update({ is_owner: true, is_admin: true });

    await visit('dashboard/organization/settings');

    assert.dom('[data-test-org-name-action-btn]').doesNotExist();
    assert.dom('[data-test-org-name-add-btn]').exists().isNotDisabled();
  });

  test('no org name only add button visible and disabled', async function (assert) {
    this.organization.update({ name: '' });

    this.organizationMe.update({ is_owner: false, is_admin: true });

    await visit('dashboard/organization/settings');

    assert.dom('[data-test-org-name-action-btn]').doesNotExist();
    assert.dom('[data-test-org-name-add-btn]').exists().isDisabled();
  });

  test('organization mfa should render', async function (assert) {
    await visit('dashboard/organization/settings');

    assert.dom('[data-test-mfa-title]').hasText(t('multiFactorAuth'));

    assert.dom('[data-test-toggle-input]').exists().isDisabled().isNotChecked();

    assert
      .dom('[data-test-enable-mandatory-mfa-label]')
      .hasText(t('enableMandatoryMFATitle'));

    assert
      .dom('[data-test-enable-mandatory-mfa-description]')
      .hasText(t('enableMandatoryMFADescription'));

    assert
      .dom('[data-test-enable-mandatory-mfa-warning]')
      .hasText(t('enableMandatoryMFAWarning'));

    assert
      .dom('[data-test-enable-mandatory-mfa-requirement]')
      .includesText(t('enableMandatoryMFARequirement'));
  });
});

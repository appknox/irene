import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { find, visit } from '@ember/test-helpers';
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

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  deviceRegistration: '[data-test-orgDeviceRegistration]',
  deviceRegistrationToggle: '[data-test-orgDeviceRegistration-toggle] input',
  signingCert: '[data-test-orgSigningCert]',
  signingCertOpenBtn: '[data-test-orgSigningCert-openBtn]',
  goToCyodSettings: '[data-test-orgDeviceRegistration-goToCyodSettings]',
  divider: '[data-test-ak-divider]',
};

/**
 * The CYOD fields a given organization-factory trait sets, without the rest of
 * the built record — the suite's organization already exists, so only these
 * attributes should change.
 */
function cyodAttrs(context, trait) {
  const { features, cyod_registration_enabled } = context.server.build(
    'organization',
    trait
  );

  return { features, cyod_registration_enabled };
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

  test('it shows the CYOD device registration only when the org has the cyod feature', async function (assert) {
    this.organizationMe.update({ is_owner: true });
    this.organization.update(cyodAttrs(this, 'withCyodEnabled'));

    await visit('dashboard/organization/settings');

    assert.dom(selectors.deviceRegistration).exists();
    assert.dom(selectors.signingCert).exists();

    // The two are separate settings sections, so a rule has to sit between the
    // devices table and the certificate panel.
    const registration = find(selectors.deviceRegistration);
    const certificate = find(selectors.signingCert);

    const between = [...document.querySelectorAll(selectors.divider)]
      .filter(
        (hr) =>
          registration.compareDocumentPosition(hr) &
          Node.DOCUMENT_POSITION_FOLLOWING
      )
      .filter(
        (hr) =>
          certificate.compareDocumentPosition(hr) &
          Node.DOCUMENT_POSITION_PRECEDING
      );

    assert.strictEqual(
      between.length,
      1,
      'exactly one divider separates the devices table from Add Certificate'
    );
  });

  test('a non-owner sees no CYOD settings at all', async function (assert) {
    this.organizationMe.update({ is_owner: false, is_admin: true });
    this.organization.update(cyodAttrs(this, 'withCyodEnabled'));

    await visit('dashboard/organization/settings');

    assert
      .dom(selectors.deviceRegistration)
      .doesNotExist("the registration switch is the owner's to flip");

    assert.dom(selectors.signingCert).doesNotExist();
  });

  test('the owner can reach the certificate drawer from settings', async function (assert) {
    this.organizationMe.update({ is_owner: true });
    this.organization.update(cyodAttrs(this, 'withCyodEnabled'));

    await visit('dashboard/organization/settings');

    assert
      .dom(selectors.signingCertOpenBtn)
      .hasText(t('cyod.signingCert.add'))
      .isNotDisabled();

    assert.dom(selectors.deviceRegistrationToggle).isChecked();

    assert
      .dom(selectors.goToCyodSettings)
      .hasAttribute(
        'href',
        /\/settings\/cyod-settings$/,
        'the empty state links to where a member registers a device'
      );
  });

  test('turning CYOD registration off collapses the certificate section', async function (assert) {
    this.organizationMe.update({ is_owner: true });
    this.organization.update(cyodAttrs(this, 'withCyodRegistrationDisabled'));

    await visit('dashboard/organization/settings');

    assert
      .dom(selectors.deviceRegistration)
      .exists('the switch itself stays reachable so it can be turned back on');

    assert
      .dom(selectors.signingCert)
      .doesNotExist('certificates are part of the CYOD setup');
  });

  test('it hides the CYOD device registration when the org lacks the cyod feature', async function (assert) {
    this.organizationMe.update({ is_owner: true });
    this.organization.update({
      features: { ...this.organization.features, cyod: false },
    });

    await visit('dashboard/organization/settings');

    assert.dom(selectors.deviceRegistration).doesNotExist();
    assert.dom(selectors.signingCert).doesNotExist();
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';

import ENUMS from 'irene/enums';
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

module('Integration | Component | organization-mfa', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();

    this.owner.register('service:notifications', NotificationsStub);

    const organization = this.owner.lookup('service:organization');
    const user = this.owner.lookup('service:store').createRecord('user');

    this.setProperties({
      organization: organization.selected,
      user,
    });
  });

  test('it should render', async function (assert) {
    await render(
      hbs`<OrganizationMfa @organization={{this.organization}} @user={{this.user}} />`
    );

    assert.dom('[data-test-mfa-title]').hasText('t:multiFactorAuth:()');

    assert.dom('[data-test-toggle-input]').exists().isDisabled().isNotChecked();

    assert
      .dom(
        '[data-test-ak-form-label]',
        find('[data-test-enable-mandatory-mfa-label]')
      )
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

  test('it should render with mfa enbaled', async function (assert) {
    this.organization.set('mandatoryMfa', true);

    await render(
      hbs`<OrganizationMfa @organization={{this.organization}} @user={{this.user}} />`
    );

    assert.dom('[data-test-mfa-title]').hasText('t:multiFactorAuth:()');

    assert.dom('[data-test-toggle-input]').exists().isDisabled().isChecked();
  });

  test('it should render with mfa enbaled and not disabled', async function (assert) {
    this.organization.set('mandatoryMfa', true);
    this.user.set('mfaMethod', ENUMS.MFA_METHOD.TOTP);

    await render(
      hbs`<OrganizationMfa @organization={{this.organization}} @user={{this.user}} />`
    );

    assert.dom('[data-test-mfa-title]').hasText('t:multiFactorAuth:()');

    assert.dom('[data-test-toggle-input]').exists().isNotDisabled().isChecked();
  });

  test('it should toggle mfa', async function (assert) {
    assert.expect(11);

    this.server.put('/organizations/:id', (schema, req) => {
      const orgUpdateReqBody = JSON.parse(req.requestBody);

      assert.strictEqual(
        this.organization.mandatoryMfa,
        orgUpdateReqBody.mandatory_mfa
      );

      return { id: req.params.id, ...orgUpdateReqBody };
    });

    this.user.set('mfaMethod', ENUMS.MFA_METHOD.TOTP);
    const notify = this.owner.lookup('service:notifications');

    await render(
      hbs`<OrganizationMfa @organization={{this.organization}} @user={{this.user}} />`
    );

    assert.dom('[data-test-mfa-title]').hasText('t:multiFactorAuth:()');

    assert
      .dom('[data-test-toggle-input]')
      .exists()
      .isNotDisabled()
      .isNotChecked();

    await click('[data-test-enable-mandatory-mfa-label]');

    assert.dom('[data-test-toggle-input]').isChecked();
    assert.true(this.organization.mandatoryMfa);

    await click('[data-test-enable-mandatory-mfa-label]');

    assert.dom('[data-test-toggle-input]').isNotChecked();
    assert.false(this.organization.mandatoryMfa);

    assert.strictEqual(notify.successMsg, 't:changedMandatoryMFA:()');
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
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

module('Integration | Component | organization-mfa-setting', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders default elements for owner', async function (assert) {
    this.set('user', {});
    this.set(
      'organization',
      this.owner.lookup('service:organization').selected
    );
    await render(
      hbs`<OrganizationMfaSetting
        @user={{this.user}}
        @organization={{this.organization}}/>`
    );

    assert.dom(`[data-test-mfa-setting-title]`).hasText(`t:multiFactorAuth:()`);

    assert
      .dom(`[data-test-mfa-setting-sub-title]`)
      .hasText(`t:mandatoryMultiFactAuth:()`);

    assert
      .dom(`[data-test-mfa-setting-toggle]`)
      .hasAttribute('type', 'checkbox');

    assert
      .dom(`[data-test-mfa-setting-toggle-title]`)
      .hasText(`t:enableMandatoryMFATitle:()`);

    assert
      .dom(`[data-test-mfa-setting-desc]`)
      .hasText(`t:enableMandatoryMFADescription:()`);

    assert.dom(`[data-test-mfa-setting-warning-note-icon]`).exists;
    assert
      .dom(`[data-test-mfa-setting-warning-note-text]`)
      .hasText(`t:enableMandatoryMFAWarning:()`);
  });

  test('it should not show user mfa desc', async function (assert) {
    this.set('user', { mfaEnabled: true });
    this.set(
      'organization',
      this.owner.lookup('service:organization').selected
    );
    await render(
      hbs`<OrganizationMfaSetting
        @user={{this.user}}
        @organization={{this.organization}}/>`
    );
    assert.dom(`[data-test-mfa-setting-user-mfa]`).doesNotExist();
  });

  test('it should show user mfa config details', async function (assert) {
    this.set('user', { mfaEnabled: false });
    this.set(
      'organization',
      this.owner.lookup('service:organization').selected
    );
    await render(
      hbs`<OrganizationMfaSetting
        @user={{this.user}}
        @organization={{this.organization}}/>`
    );
    assert
      .dom(`[data-test-mfa-setting-user-mfa-desc]`)
      .containsText(`t:enableMandatoryMFARequirement:()`);

    assert.dom(`[data-test-mfa-setting-user-mfa-icon]`).exists;

    assert
      .dom(`[data-test-mfa-setting-user-mfa-link]`)
      .hasAttribute('href', '/settings/security');
    assert
      .dom(`[data-test-mfa-setting-user-mfa-link]`)
      .hasText(`t:accountSettings:() > t:security:() > t:multiFactorAuth:()`);
  });

  test('it should toggle checkbox disabled state', async function (assert) {
    this.set('user', { mfaEnabled: false });
    this.set(
      'organization',
      this.owner.lookup('service:organization').selected
    );
    await render(
      hbs`<OrganizationMfaSetting
        @user={{this.user}}
        @organization={{this.organization}}/>`
    );

    assert.dom(`[data-test-mfa-setting-toggle]`).hasAttribute('disabled');
    this.set('user', { mfaEnabled: true });
    assert.ok(1, 'set user mfaEnabled: true'); //dummy assertion for logging
    assert
      .dom(`[data-test-mfa-setting-toggle]`)
      .doesNotHaveAttribute('disabled');
  });

  test('it should update org mandatoryMfa state', async function (assert) {
    this.server.put('/organizations/:id', (schema, req) => {
      return req.requestBody;
    });
    this.set('user', { mfaEnabled: true });
    const org = this.owner.lookup('service:organization').selected;
    org.set('mandatoryMfa', false);
    this.set('organization', org);

    const notify = this.owner.lookup('service:notifications');
    await render(
      hbs`<OrganizationMfaSetting
        @user={{this.user}}
        @organization={{this.organization}}/>`
    );

    assert.equal(
      this.element.querySelector(`[data-test-mfa-setting-toggle]`).checked,
      false
    );

    await click(`[data-test-mfa-setting-toggle]`);

    assert.equal(
      this.element.querySelector(`[data-test-mfa-setting-toggle]`).checked,
      true
    );

    assert.equal(notify.get('successMsg'), `t:changedMandatoryMFA:()`);
  });

  test('it should show error msg while update flag', async function (assert) {
    this.server.put(
      '/organizations/:id',
      { errors: [{ detail: 'Could not update organization setting' }] },
      500
    );
    this.set('user', { mfaEnabled: true });
    const org = this.owner.lookup('service:organization').selected;
    org.set('mandatoryMfa', false);
    this.set('organization', org);

    const notify = this.owner.lookup('service:notifications');
    await render(
      hbs`<OrganizationMfaSetting
        @user={{this.user}}
        @organization={{this.organization}}/>`
    );

    assert.equal(
      this.element.querySelector(`[data-test-mfa-setting-toggle]`).checked,
      false
    );

    await click(`[data-test-mfa-setting-toggle]`);

    assert.equal(
      this.element.querySelector(`[data-test-mfa-setting-toggle]`).checked,
      false
    );

    assert.equal(
      notify.get('errorMsg'),
      `Could not update organization setting`
    );
  });
});

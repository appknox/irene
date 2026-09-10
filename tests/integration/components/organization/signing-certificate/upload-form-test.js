import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

const UPLOAD_URL = '/api/organizations/1/signing-certificates/';

// ─── Stubs ─────────────────────────────────────────────────────────────────────
class NotificationsStub extends Service {
  successMsg = null;
  errorMsg = null;

  success(msg) {
    this.successMsg = msg;
  }

  error(msg) {
    this.errorMsg = msg;
  }

  setDefaultAutoClear() {}
}

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  name: '[data-test-orgSigningCert-name]',
  nameLabel: '[data-test-orgSigningCert-nameLabel]',
  bundleId: '[data-test-orgSigningCert-bundleId]',
  bundleIdLabel: '[data-test-orgSigningCert-bundleIdLabel]',
  password: '[data-test-orgSigningCert-password]',
  passwordLabel: '[data-test-orgSigningCert-passwordLabel]',
  passwordRequired: '[data-test-orgSigningCert-passwordRequired]',
  p12: '[data-test-orgSigningCert-p12]',
  p12Chip: '[data-test-orgSigningCert-p12Chip]',
  p12Clear: '[data-test-orgSigningCert-p12Clear]',
  profile: '[data-test-orgSigningCert-profile]',
  profileChip: '[data-test-orgSigningCert-profileChip]',
  profileClear: '[data-test-orgSigningCert-profileClear]',
  tip: '[data-test-orgSigningCert-tip]',
  uploadBtn: '[data-test-orgSigningCert-uploadBtn]',
  cancelBtn: '[data-test-orgSigningCert-cancelBtn]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Organization::SigningCertificate::UploadForm
  @baseUrl={{this.baseUrl}}
  @onUploaded={{this.onUploaded}}
  @onCancel={{this.onCancel}}
/>`;

// ─── Fixtures ──────────────────────────────────────────────────────────────────
// Distinct contents, so the assertions prove each file lands in its own field.
const P12_CONTENT = 'p12-bytes';
const PROFILE_CONTENT = 'mobileprovision-bytes';

// ─── Helpers ───────────────────────────────────────────────────────────────────
async function chooseP12() {
  await triggerEvent(selectors.p12, 'change', {
    files: [new File([P12_CONTENT], 'identity.p12')],
  });
}

async function chooseProfile() {
  await triggerEvent(selectors.profile, 'change', {
    files: [new File([PROFILE_CONTENT], 'team.mobileprovision')],
  });
}

module(
  'Integration | Component | organization/signing-certificate/upload-form',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.notify = this.owner.lookup('service:notifications');

      this.setProperties({
        baseUrl: UPLOAD_URL,
        uploaded: 0,
        cancelled: 0,
        onUploaded: () => this.set('uploaded', this.uploaded + 1),
        onCancel: () => this.set('cancelled', this.cancelled + 1),
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('it labels every field and marks the password mandatory', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.nameLabel).hasText(t('cyod.signingCert.name'));
      assert
        .dom(selectors.bundleIdLabel)
        .hasText(t('cyod.signingCert.bundleIdLabel'));
      assert
        .dom(selectors.passwordLabel)
        .containsText(t('cyod.signingCert.password'));

      assert
        .dom(selectors.passwordRequired)
        .hasText('*', 'the password is marked mandatory');
      assert.dom(selectors.tip).exists();
    });

    test('save is blocked until both files and the password are supplied', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.uploadBtn).isDisabled('nothing supplied yet');

      await chooseP12();
      assert
        .dom(selectors.uploadBtn)
        .isDisabled('the profile is still missing');

      await chooseProfile();
      assert.dom(selectors.uploadBtn).isDisabled('the password is mandatory');

      await fillIn(selectors.password, '   ');
      assert
        .dom(selectors.uploadBtn)
        .isDisabled('whitespace alone does not unlock save');

      await fillIn(selectors.password, 'secret');
      assert.dom(selectors.uploadBtn).isNotDisabled();
    });

    test('a chosen file becomes a chip that can be cleared', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.p12Chip).doesNotExist();

      await chooseP12();

      assert.dom(selectors.p12Chip).containsText('identity.p12');

      await click(selectors.p12Clear);

      assert.dom(selectors.p12Chip).doesNotExist();
      assert.dom(selectors.uploadBtn).isDisabled('clearing re-locks save');
    });

    test('the provisioning profile picker behaves the same way', async function (assert) {
      await render(TEMPLATE);

      await chooseProfile();

      assert.dom(selectors.profileChip).containsText('team.mobileprovision');

      await click(selectors.profileClear);

      assert.dom(selectors.profileChip).doesNotExist();
    });

    // ─── Upload ────────────────────────────────────────────────────────────────

    test('it uploads the files and the entered details as base64 json', async function (assert) {
      assert.expect(7);

      this.server.post('/organizations/:id/signing-certificates/', (_, req) => {
        // The endpoint declares a JSON parser only and answers a multipart
        // upload with 415, so the request has to stay on application/json.
        assert.strictEqual(
          req.requestHeaders['Content-Type'],
          'application/json'
        );

        const body = JSON.parse(req.requestBody);

        assert.strictEqual(body.name, 'Acme iOS');
        assert.strictEqual(body.bundle_id, 'com.acme.app');
        assert.strictEqual(body.password, 'secret');

        assert.strictEqual(
          body.p12,
          btoa(P12_CONTENT),
          'the p12 is sent base64-encoded rather than as a file part'
        );

        assert.strictEqual(body.mobileprovision, btoa(PROFILE_CONTENT));

        return {};
      });

      await render(TEMPLATE);

      await chooseP12();
      await chooseProfile();
      await fillIn(selectors.name, 'Acme iOS');
      await fillIn(selectors.bundleId, '  com.acme.app  ');
      await fillIn(selectors.password, 'secret');

      await click(selectors.uploadBtn);

      assert.strictEqual(this.uploaded, 1, 'tells the parent to reload');
    });

    test('a successful upload confirms and resets the form', async function (assert) {
      this.server.post('/organizations/:id/signing-certificates/', () => ({}));

      await render(TEMPLATE);

      await chooseP12();
      await chooseProfile();
      await fillIn(selectors.password, 'secret');
      await click(selectors.uploadBtn);

      assert.strictEqual(
        this.notify.successMsg,
        t('cyod.signingCert.uploadSuccess')
      );

      assert.dom(selectors.p12Chip).doesNotExist('the form is cleared');
      assert.dom(selectors.profileChip).doesNotExist();
      assert.dom(selectors.uploadBtn).isDisabled();
    });

    test('a failed upload reports the reason and keeps what was entered', async function (assert) {
      this.server.post(
        '/organizations/:id/signing-certificates/',
        () => ({ detail: 'p12 password is incorrect' }),
        400
      );

      await render(TEMPLATE);

      await chooseP12();
      await chooseProfile();
      await fillIn(selectors.password, 'wrong');
      await click(selectors.uploadBtn);

      assert.strictEqual(this.notify.errorMsg, 'p12 password is incorrect');
      assert.strictEqual(this.notify.successMsg, null);
      assert.strictEqual(this.uploaded, 0, 'the parent does not reload');
      assert.dom(selectors.p12Chip).containsText('identity.p12');
    });

    // ─── Cancel ────────────────────────────────────────────────────────────────

    test('cancelling reports up without uploading', async function (assert) {
      await render(TEMPLATE);

      await chooseP12();
      await click(selectors.cancelBtn);

      assert.strictEqual(this.cancelled, 1);
      assert.strictEqual(this.uploaded, 0);
    });
  }
);

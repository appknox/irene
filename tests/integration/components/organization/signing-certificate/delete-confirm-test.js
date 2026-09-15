import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  root: '[data-test-orgSigningCert-deleteConfirm]',
  title: '[data-test-orgSigningCert-deleteConfirmTitle]',
  info: '[data-test-orgSigningCert-deleteConfirmInfo]',
  confirmBtn: "[data-test-orgSigningCert-deleteAction='confirm']",
  cancelBtn: "[data-test-orgSigningCert-deleteAction='cancel']",
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Organization::SigningCertificate::DeleteConfirm
  @cert={{this.cert}}
  @isDeleting={{this.isDeleting}}
  @onConfirm={{this.onConfirm}}
  @onCancel={{this.onCancel}}
/>`;

module(
  'Integration | Component | organization/signing-certificate/delete-confirm',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');

      this.pushCert = (...args) => {
        const record = this.server.create('signing-certificate', ...args);

        return store.push(
          store.normalize('organization-signing-certificate', record.toJSON())
        );
      };

      this.setProperties({
        cert: this.pushCert({ name: 'Acme iOS Distribution' }),
        isDeleting: false,
        confirmed: 0,
        cancelled: 0,
        onConfirm: () => this.set('confirmed', this.confirmed + 1),
        onCancel: () => this.set('cancelled', this.cancelled + 1),
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('it names the certificate staged for deletion', async function (assert) {
      assert.expect(2);

      await render(TEMPLATE);

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: selectors.title,
        message: t('cyod.signingCert.deleteQuestion', {
          name: 'Acme iOS Distribution',
        }),
      });

      assert.dom(selectors.info).hasText(t('cyod.signingCert.deleteReason'));
    });

    test('an unnamed certificate falls back to a placeholder', async function (assert) {
      this.set('cert', this.pushCert('withoutName'));

      await render(TEMPLATE);

      assert.dom(selectors.title).containsText(t('cyod.signingCert.unnamed'));
    });

    test('both actions carry their labels and are enabled', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.confirmBtn).hasText(t('yesDelete'));

      assert
        .dom(selectors.cancelBtn)
        .hasText(t('cyod.signingCert.deleteNo'))
        .isNotDisabled();
    });

    test('cancelling is blocked while the delete runs', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.cancelBtn).isNotDisabled();

      this.set('isDeleting', true);
      await render(TEMPLATE);

      assert
        .dom(selectors.cancelBtn)
        .isDisabled('the confirmation cannot be dismissed mid-delete');
    });

    // ─── Interaction ───────────────────────────────────────────────────────────

    test('confirming calls back exactly once', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(this.confirmed, 0);
      assert.strictEqual(this.cancelled, 0);

      await click(selectors.confirmBtn);

      assert.strictEqual(this.confirmed, 1);
      assert.strictEqual(this.cancelled, 0, 'confirming does not also cancel');
    });

    test('cancelling calls back without confirming', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.cancelBtn);

      assert.strictEqual(this.cancelled, 1);
      assert.strictEqual(this.confirmed, 0);
    });
  }
);

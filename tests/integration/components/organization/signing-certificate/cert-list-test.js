import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  click,
  find,
  findAll,
  render,
  triggerEvent,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  root: '[data-test-orgSigningCert-certList]',
  card: '[data-test-orgSigningCert-info]',
  cardName: '[data-test-orgSigningCert-cardName]',
  status: '[data-test-orgSigningCert-status]',
  activeBadge: '[data-test-orgSigningCert-activeBadge]',
  activateBtn: '[data-test-orgSigningCert-activateBtn]',
  deleteBtn: '[data-test-orgSigningCert-deleteBtn]',
  deleteTooltip: '[data-test-orgSigningCert-deleteTooltip]',
  skeleton: '[data-test-orgSigningCert-skeleton]',
  skeletonCard: '[data-test-orgSigningCert-skeletonCard]',
  tooltipContent: '[data-test-ak-tooltip-content]',
  metaLabel: '[data-test-orgSigningCert-metaLabel]',
  metaValue: '[data-test-orgSigningCert-metaValue]',
  empty: '[data-test-orgSigningCert-empty]',
  emptyTitle: '[data-test-orgSigningCert-emptyTitle]',
  emptyDescription: '[data-test-orgSigningCert-emptyDescription]',
  emptySvg: '[data-test-orgSigningCert-emptySvg]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Organization::SigningCertificate::CertList
  @certs={{this.certs}}
  @isLoading={{this.isLoading}}
  @isActivating={{this.isActivating}}
  @isProjectScope={{this.isProjectScope}}
  @onActivate={{this.onActivate}}
  @onDelete={{this.onDelete}}
/>`;

module(
  'Integration | Component | organization/signing-certificate/cert-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');

      this.buildRow = (attrs = {}, flags = {}) => {
        const record = this.server.create('signing-certificate', attrs);

        return {
          cert: store.push(
            store.normalize('organization-signing-certificate', record.toJSON())
          ),
          showsActiveBadge: false,
          showsActivate: false,
          isBusy: false,
          deleteDisabled: false,
          ...flags,
        };
      };

      this.setProperties({
        certs: [],
        isLoading: false,
        isActivating: false,
        isProjectScope: false,
        activated: null,
        deleted: null,
        onActivate: (cert) => this.set('activated', cert),
        onDelete: (cert) => this.set('deleted', cert),
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('it renders a card per certificate with its name and expiry', async function (assert) {
      const rows = [this.buildRow(), this.buildRow()];

      this.set('certs', rows);

      await render(TEMPLATE);

      const cards = findAll(selectors.card);

      assert.strictEqual(cards.length, rows.length);

      rows.forEach((row, index) => {
        assert.dom(selectors.cardName, cards[index]).hasText(row.cert.name);
        assert.dom(cards[index]).containsText(row.cert.expiresOn);
      });

      assert.dom(selectors.empty).doesNotExist();
    });

    test('it shows the empty state when the org has no certificates', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.emptyTitle).hasText(t('cyod.signingCert.noneTitle'));

      assert
        .dom(selectors.emptyDescription)
        .hasText(t('cyod.signingCert.none'));

      assert.dom(selectors.emptySvg).exists();
      assert.dom(selectors.card).doesNotExist();
    });

    test('it shows the skeleton while the certificates are being fetched', async function (assert) {
      this.setProperties({ isLoading: true, certs: [this.buildRow()] });

      await render(TEMPLATE);

      assert.dom(selectors.card).doesNotExist('the list waits for the fetch');
      assert.dom(selectors.empty).doesNotExist();
      assert.dom(selectors.skeleton).exists();
      assert.dom(selectors.skeletonCard).exists({ count: 3 });
    });

    // ─── Per-certificate state ─────────────────────────────────────────────────

    test('the active certificate carries a badge and offers no activate action', async function (assert) {
      this.set('certs', [
        this.buildRow('withActiveStatus', { showsActiveBadge: true }),
      ]);

      await render(TEMPLATE);

      assert.dom(selectors.activeBadge).exists();
      assert.dom(selectors.activateBtn).doesNotExist();
    });

    test('an inactive certificate offers the activate action', async function (assert) {
      this.set('certs', [this.buildRow({}, { showsActivate: true })]);

      await render(TEMPLATE);

      assert
        .dom(selectors.activateBtn)
        .hasText(t('cyod.signingCert.makeActive'));

      assert.dom(selectors.activeBadge).doesNotExist();
    });

    test('delete is blocked for the active certificate while siblings exist', async function (assert) {
      this.set('certs', [this.buildRow({}, { deleteDisabled: true })]);

      await render(TEMPLATE);

      assert.dom(selectors.deleteBtn).isDisabled();

      // The button is disabled, so the reason has to come from the tooltip
      // wrapper rather than the button itself.
      await triggerEvent(find(selectors.deleteTooltip), 'mouseenter');

      assert
        .dom(selectors.tooltipContent)
        .hasText(t('cyod.signingCert.deleteActiveHint'));
    });

    // ─── Interaction ───────────────────────────────────────────────────────────

    test('activating reports the certificate that was clicked', async function (assert) {
      const row = this.buildRow({}, { showsActivate: true });

      this.set('certs', [row]);

      await render(TEMPLATE);

      assert.strictEqual(this.activated, null);

      await click(selectors.activateBtn);

      assert.strictEqual(this.activated, row.cert);
      assert.strictEqual(this.deleted, null, 'activating does not delete');
    });

    test('deleting reports the certificate that was clicked', async function (assert) {
      const first = this.buildRow();
      const second = this.buildRow();

      this.set('certs', [first, second]);

      await render(TEMPLATE);

      const buttons = findAll(selectors.deleteBtn);

      await click(buttons[1]);

      assert.strictEqual(
        this.deleted,
        second.cert,
        'reports the row whose button was clicked, not the first'
      );

      assert.strictEqual(this.activated, null);
    });
  }
);

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
  projectCertsHeading: '[data-test-orgSigningCert-projectCertsHeading]',
  orgCertsHeading: '[data-test-orgSigningCert-orgCertsHeading]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Organization::SigningCertificate::CertList
  @projectCerts={{this.projectCerts}}
  @orgCerts={{this.orgCerts}}
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
          scope: 'org',
          showsActiveBadge: false,
          showsActivate: false,
          showsDelete: true,
          isBusy: false,
          deleteDisabled: false,
          ...flags,
        };
      };

      this.setProperties({
        projectCerts: [],
        orgCerts: [],
        isLoading: false,
        isActivating: false,
        isProjectScope: false,
        activated: null,
        deleted: null,
        deletedScope: null,
        onActivate: (cert) => this.set('activated', cert),
        onDelete: (cert, scope) =>
          this.setProperties({ deleted: cert, deletedScope: scope }),
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('it renders a card per certificate with its name and expiry', async function (assert) {
      const rows = [this.buildRow(), this.buildRow()];

      this.set('orgCerts', rows);

      await render(TEMPLATE);

      const cards = findAll(selectors.card);

      assert.strictEqual(cards.length, rows.length);

      rows.forEach((row, index) => {
        assert.dom(selectors.cardName, cards[index]).hasText(row.cert.name);
        assert.dom(cards[index]).containsText(row.cert.expiresOn);
      });

      assert.dom(selectors.empty).doesNotExist();
    });

    test('it shows the empty state when there are no certificates in either scope', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.emptyTitle).hasText(t('cyod.signingCert.noneTitle'));

      assert
        .dom(selectors.emptyDescription)
        .hasText(t('cyod.signingCert.none'));

      assert.dom(selectors.emptySvg).exists();
      assert.dom(selectors.card).doesNotExist();
    });

    test('it shows the skeleton while the certificates are being fetched', async function (assert) {
      this.setProperties({ isLoading: true, orgCerts: [this.buildRow()] });

      await render(TEMPLATE);

      assert.dom(selectors.card).doesNotExist('the list waits for the fetch');
      assert.dom(selectors.empty).doesNotExist();
      assert.dom(selectors.skeleton).exists();
      assert.dom(selectors.skeletonCard).exists({ count: 3 });
    });

    // ─── Per-certificate state ─────────────────────────────────────────────────

    test('the active certificate carries a badge and offers no activate action', async function (assert) {
      this.set('orgCerts', [
        this.buildRow('withActiveStatus', { showsActiveBadge: true }),
      ]);

      await render(TEMPLATE);

      assert.dom(selectors.activeBadge).exists();
      assert.dom(selectors.activateBtn).doesNotExist();
    });

    test('an inactive certificate offers the activate action', async function (assert) {
      this.set('orgCerts', [this.buildRow({}, { showsActivate: true })]);

      await render(TEMPLATE);

      assert
        .dom(selectors.activateBtn)
        .hasText(t('cyod.signingCert.makeActive'));

      assert.dom(selectors.activeBadge).doesNotExist();
    });

    test('delete is blocked for the active certificate while siblings exist', async function (assert) {
      this.set('orgCerts', [this.buildRow({}, { deleteDisabled: true })]);

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

      this.set('orgCerts', [row]);

      await render(TEMPLATE);

      assert.strictEqual(this.activated, null);

      await click(selectors.activateBtn);

      assert.strictEqual(this.activated, row.cert);
      assert.strictEqual(this.deleted, null, 'activating does not delete');
    });

    test('deleting reports the certificate and scope that was clicked', async function (assert) {
      const first = this.buildRow();
      const second = this.buildRow();

      this.set('orgCerts', [first, second]);

      await render(TEMPLATE);

      const buttons = findAll(selectors.deleteBtn);

      await click(buttons[1]);

      assert.strictEqual(
        this.deleted,
        second.cert,
        'reports the row whose button was clicked, not the first'
      );

      assert.strictEqual(this.deletedScope, 'org');
      assert.strictEqual(this.activated, null);
    });

    // ─── Project + org sections ─────────────────────────────────────────────────

    test('project scope groups the project cert and the org certs under separate headings', async function (assert) {
      const projectRow = this.buildRow({}, { scope: 'project' });
      const orgRow = this.buildRow();

      this.setProperties({
        isProjectScope: true,
        projectCerts: [projectRow],
        orgCerts: [orgRow],
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.projectCertsHeading)
        .hasText(t('cyod.signingCert.projectCertificatesHeading'));

      assert
        .dom(selectors.orgCertsHeading)
        .hasText(t('cyod.signingCert.organizationCertificatesHeading'));

      const cards = findAll(selectors.card);

      assert.strictEqual(cards.length, 2);
      assert.dom(selectors.cardName, cards[0]).hasText(projectRow.cert.name);
      assert.dom(selectors.cardName, cards[1]).hasText(orgRow.cert.name);
    });

    test('project scope with no project cert still shows the org certs under their own heading', async function (assert) {
      const orgRow = this.buildRow();

      this.setProperties({ isProjectScope: true, orgCerts: [orgRow] });

      await render(TEMPLATE);

      assert
        .dom(selectors.projectCertsHeading)
        .doesNotExist('nothing to head when the project has no cert');

      assert.dom(selectors.orgCertsHeading).exists();
      assert.dom(selectors.card).exists({ count: 1 });
    });

    test('org scope renders no section headings', async function (assert) {
      this.set('orgCerts', [this.buildRow()]);

      await render(TEMPLATE);

      assert.dom(selectors.projectCertsHeading).doesNotExist();
      assert.dom(selectors.orgCertsHeading).doesNotExist();
    });

    test('an org cert can still be activated and deleted from project scope', async function (assert) {
      const orgRow = this.buildRow({}, { showsActivate: true });

      this.setProperties({ isProjectScope: true, orgCerts: [orgRow] });

      await render(TEMPLATE);

      await click(selectors.activateBtn);

      assert.strictEqual(this.activated, orgRow.cert);

      await click(selectors.deleteBtn);

      assert.strictEqual(this.deleted, orgRow.cert);
      assert.strictEqual(this.deletedScope, 'org');
    });
  }
);

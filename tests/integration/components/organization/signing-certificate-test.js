import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, triggerEvent, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';

// ─── Stubs ─────────────────────────────────────────────────────────────────────
class NotificationsStub extends Service {
  success() {}
  error() {}
}

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  root: '[data-test-orgSigningCert]',
  title: '[data-test-orgSigningCert-title]',
  sectionTitle: '[data-test-orgSigningCert-sectionTitle]',
  openBtn: '[data-test-orgSigningCert-openBtn]',
  panelDescription: '[data-test-orgSettingsPanelHeader-description]',

  drawer: '[data-test-orgSigningCert-drawer]',
  drawerTitle: '[data-test-orgSigningCert-drawerTitle]',
  drawerCloseBtn: '[data-test-orgSigningCert-drawerCloseBtn]',
  tabs: '[data-test-orgSigningCert-tabs]',
  existingTab: '[data-test-orgSigningCert-existingTab] button',

  name: '[data-test-orgSigningCert-name]',
  bundleId: '[data-test-orgSigningCert-bundleId]',
  password: '[data-test-orgSigningCert-password]',
  tip: '[data-test-orgSigningCert-tip]',
  p12: '[data-test-orgSigningCert-p12]',
  p12Chip: '[data-test-orgSigningCert-p12Chip]',
  p12Clear: '[data-test-orgSigningCert-p12Clear]',
  profileChip: '[data-test-orgSigningCert-profileChip]',
  profileClear: '[data-test-orgSigningCert-profileClear]',
  profile: '[data-test-orgSigningCert-profile]',
  uploadBtn: '[data-test-orgSigningCert-uploadBtn]',
  divider: '[data-test-ak-divider]',

  info: '[data-test-orgSigningCert-info]',
  cardName: '[data-test-orgSigningCert-cardName]',
  metaLabel: '[data-test-orgSigningCert-metaLabel]',
  metaValue: '[data-test-orgSigningCert-metaValue]',
  activeBadge: '[data-test-orgSigningCert-activeBadge]',
  activateBtn: '[data-test-orgSigningCert-activateBtn]',
  deleteBtn: '[data-test-orgSigningCert-deleteBtn]',

  empty: '[data-test-orgSigningCert-empty]',
  emptySvg: '[data-test-orgSigningCert-emptySvg]',
  emptyTitle: '[data-test-orgSigningCert-emptyTitle]',
  emptyDescription: '[data-test-orgSigningCert-emptyDescription]',

  deleteConfirm: '[data-test-orgSigningCert-deleteConfirm]',
  deleteConfirmTitle: '[data-test-orgSigningCert-deleteConfirmTitle]',
  deleteConfirmInfo: '[data-test-orgSigningCert-deleteConfirmInfo]',
  deleteConfirmBtn: '[data-test-orgSigningCert-deleteConfirmBtn]',
  deleteCancelBtn: '[data-test-orgSigningCert-deleteCancelBtn]',
  deleteBackBtn: '[data-test-orgSigningCert-deleteBackBtn]',
  nameLabel: '[data-test-orgSigningCert-nameLabel]',
  bundleIdLabel: '[data-test-orgSigningCert-bundleIdLabel]',
  passwordLabel: '[data-test-orgSigningCert-passwordLabel]',
  passwordRequired: '[data-test-orgSigningCert-passwordRequired]',
};

// ─── Templates ─────────────────────────────────────────────────────────────────
const ORG_SCOPE = hbs`<Organization::SigningCertificate />`;
const PROJECT_SCOPE = hbs`<Organization::SigningCertificate @project={{this.project}} />`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
/**
 * The drawer opens on the Add tab; the cert list lives behind the second tab.
 * AkTabs puts the test attribute on the wrapping <li> and the click handler on
 * the inner <button>, so the button is what has to be clicked.
 */
async function openExistingTab() {
  await click(selectors.openBtn);
  await click(selectors.existingTab);
}

/**
 * Registers a `me` whose org membership carries the given role trait. The panel
 * is limited to admins and owners, so the role decides whether it renders at all
 * in project scope.
 */
function setupMe(context, ...traits) {
  const orgMe = context.server.create('organization-me', ...traits);

  class MeStub extends Service {
    org = orgMe;
  }

  context.owner.unregister('service:me');
  context.owner.register('service:me', MeStub);

  return orgMe;
}

module(
  'Integration | Component | organization/signing-certificate',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      const organization = this.server.create('organization');

      class OrganizationStub extends Service {
        selected = organization;
        isCyodEnabled = true;
        isCyodRegistrationEnabled = true;
      }

      this.owner.register('service:organization', OrganizationStub);
      this.owner.register('service:notifications', NotificationsStub);

      setupMe(this, 'admin');

      this.setProperties({
        organization,
        project: this.server.create('project', {
          platform: ENUMS.PLATFORM.IOS,
        }),
      });
    });

    // ─── Panel ───────────────────────────────────────────────────────────────
    test('it renders the panel header and add button', async function (assert) {
      await render(ORG_SCOPE);

      assert.dom(selectors.title).exists();
      assert.dom(selectors.openBtn).exists();
      assert.dom(selectors.panelDescription).exists();
    });

    // ─── Add tab ─────────────────────────────────────────────────────────────
    test('it opens on the add tab with save disabled', async function (assert) {
      await render(ORG_SCOPE);
      await click(selectors.openBtn);

      assert.dom(selectors.tabs).exists();
      assert.dom(selectors.p12).exists();
      assert.dom(selectors.profile).exists();
      assert.dom(selectors.tip).exists();

      assert
        .dom(selectors.uploadBtn)
        .isDisabled('nothing has been supplied yet');

      assert
        .dom(`${selectors.drawer} ${selectors.divider}`)
        .exists(
          { count: 2 },
          'after the tip, and between the p12 password and the profile'
        );

      await click(selectors.drawerCloseBtn);

      assert.dom(selectors.drawer).doesNotExist();
    });

    test('each field carries a label matching the drawer style', async function (assert) {
      await render(ORG_SCOPE);
      await click(selectors.openBtn);

      // The labels are plain AkTypography rather than AkTextField's own @label,
      // so they render at the same weight as the delete-reason label. The input
      // keeps its accessible name through aria-label.
      assert.dom(selectors.nameLabel).hasText(t('cyod.signingCert.name'));
      assert
        .dom(selectors.bundleIdLabel)
        .hasText(t('cyod.signingCert.bundleIdLabel'));
      // The password label also holds the mandatory-field asterisk, so this is a
      // containsText rather than an exact match.
      assert
        .dom(selectors.passwordLabel)
        .containsText(t('cyod.signingCert.password'));

      assert.dom(selectors.nameLabel).hasTagName('label');

      // AkTextField spreads ...attributes onto its <Input>, so the test
      // attribute and aria-label both land on the input itself.
      assert
        .dom(selectors.name)
        .hasAttribute('aria-label', t('cyod.signingCert.name'));
    });

    test('a chosen file becomes a removable chip', async function (assert) {
      await render(ORG_SCOPE);
      await click(selectors.openBtn);

      assert.dom(selectors.p12Chip).doesNotExist();
      assert.dom(selectors.p12).exists();

      await triggerEvent(selectors.p12, 'change', {
        files: [new File(['x'], 'identity.p12')],
      });

      assert.dom(selectors.p12Chip).containsText('identity.p12');

      assert
        .dom(selectors.p12)
        .doesNotExist('the picker is replaced by the chip');

      await click(selectors.p12Clear);

      assert.dom(selectors.p12Chip).doesNotExist();
      assert.dom(selectors.p12).exists('clearing brings the picker back');
    });

    test('save unlocks only once both files and the password are supplied', async function (assert) {
      await render(ORG_SCOPE);
      await click(selectors.openBtn);

      await triggerEvent(selectors.p12, 'change', {
        files: [new File(['x'], 'identity.p12')],
      });

      await triggerEvent(selectors.profile, 'change', {
        files: [new File(['x'], 'team.mobileprovision')],
      });

      assert
        .dom(selectors.uploadBtn)
        .isDisabled('both files are chosen, but the p12 password is mandatory');

      await fillIn(selectors.password, '   ');

      assert
        .dom(selectors.uploadBtn)
        .isDisabled('whitespace is not a password');

      await fillIn(selectors.password, 'hunter2');

      assert.dom(selectors.uploadBtn).isNotDisabled('all three are supplied');

      await fillIn(selectors.password, '');

      assert
        .dom(selectors.uploadBtn)
        .isDisabled('clearing the password locks it again');
    });

    test('the p12 password is marked mandatory', async function (assert) {
      await render(ORG_SCOPE);
      await click(selectors.openBtn);

      assert.dom(selectors.passwordRequired).hasText('*');

      assert
        .dom(selectors.password)
        .hasAttribute(
          'required',
          '',
          'the marker matches the input, so an empty password cannot submit'
        );

      assert
        .dom(selectors.nameLabel)
        .doesNotContainText('*', 'the optional fields carry no marker');
    });

    test('the provisioning profile picker behaves like the p12 one', async function (assert) {
      await render(ORG_SCOPE);
      await click(selectors.openBtn);

      assert.dom(selectors.profileChip).doesNotExist();

      await triggerEvent(selectors.profile, 'change', {
        files: [new File(['x'], 'team.mobileprovision')],
      });

      assert.dom(selectors.profileChip).containsText('team.mobileprovision');

      assert
        .dom(selectors.profile)
        .doesNotExist('the picker is replaced by the chip');

      await click(selectors.profileClear);

      assert.dom(selectors.profileChip).doesNotExist();
      assert.dom(selectors.profile).exists('clearing brings the picker back');
    });

    test('both file inputs are wrapped in a label so the button opens them', async function (assert) {
      // The inputs are display:none and have no id/for pair — the only thing that
      // makes "Choose File" open a picker is the enclosing <label>. Rendered as a
      // <button> instead, the click goes nowhere and the field is unusable.
      await render(ORG_SCOPE);
      await click(selectors.openBtn);

      assert.strictEqual(
        find(selectors.p12).closest('label')?.tagName,
        'LABEL',
        'the p12 input is inside a label'
      );

      assert.strictEqual(
        find(selectors.profile).closest('label')?.tagName,
        'LABEL',
        'the provisioning profile input is inside a label'
      );
    });

    // ─── Existing tab ────────────────────────────────────────────────────────
    test('it shows the empty state on the existing tab when no certificate is configured', async function (assert) {
      await render(ORG_SCOPE);
      await openExistingTab();

      assert.dom(selectors.empty).exists();
      assert.dom(selectors.info).doesNotExist();
      assert.dom(selectors.emptySvg).exists();

      assert
        .dom(selectors.emptyTitle)
        .hasText(t('cyod.signingCert.noneTitle'))
        .hasTagName('h5');

      assert
        .dom(selectors.emptyDescription)
        .hasText(t('cyod.signingCert.none'));
    });

    test('it lists org certs and flags the active one', async function (assert) {
      const active = this.server.create('signing-certificate', 'active');
      this.server.create('signing-certificate');

      await render(ORG_SCOPE);
      await openExistingTab();

      assert.dom(selectors.info).exists({ count: 2 });
      assert.dom(selectors.activeBadge).exists({ count: 1 });
      assert.dom(selectors.activateBtn).exists({ count: 1 });
      assert.dom(selectors.empty).doesNotExist();

      assert.dom(selectors.cardName).hasText(active.name);
      assert.dom(selectors.metaValue).hasText(active.team_id);
    });

    test('an expired cert offers no activate button', async function (assert) {
      this.server.create('signing-certificate', 'active');
      this.server.create('signing-certificate', 'expired');
      this.server.create('signing-certificate');

      await render(ORG_SCOPE);
      await openExistingTab();

      assert.dom(selectors.info).exists({ count: 3 });

      assert
        .dom(selectors.activateBtn)
        .exists(
          { count: 1 },
          'neither the active nor the expired cert offers it'
        );
    });

    test('it formats the expiry rather than showing the raw timestamp', async function (assert) {
      const cert = this.server.create('signing-certificate', 'active');

      await render(ORG_SCOPE);
      await openExistingTab();

      assert
        .dom(selectors.info)
        .doesNotContainText(cert.expires_at, 'no raw ISO string');

      assert
        .dom(selectors.info)
        .containsText(dayjs(cert.expires_at).format('MMMM D, YYYY'));
    });

    test('it disables delete for the active cert while siblings exist', async function (assert) {
      this.server.create('signing-certificate', 'active');
      this.server.create('signing-certificate');

      await render(ORG_SCOPE);
      await openExistingTab();

      const deleteButtons = this.element.querySelectorAll(selectors.deleteBtn);

      assert.strictEqual(deleteButtons.length, 2);

      assert
        .dom(deleteButtons[0])
        .isDisabled('removing the active cert would leave no signing fallback');

      assert
        .dom(deleteButtons[0])
        .hasAttribute('title', t('cyod.signingCert.deleteActiveHint'));

      assert.dom(deleteButtons[1]).isNotDisabled();
    });

    test('a lone active cert can still be deleted', async function (assert) {
      // Exactly one cert is always active, so gating on is_active alone locked an
      // org with a single cert out of ever removing it.
      const cert = this.server.create('signing-certificate', 'active');

      await render(ORG_SCOPE);
      await openExistingTab();

      assert.dom(selectors.activeBadge).exists('it is the active cert');

      assert
        .dom(selectors.deleteBtn)
        .isNotDisabled('nothing else depends on it, so it can go');

      assert.dom(selectors.deleteBtn).hasAttribute('title', t('delete'));

      await click(selectors.deleteBtn);

      assert
        .dom(selectors.deleteConfirm)
        .exists('and the confirmation step is reachable');

      assert.dom(selectors.deleteConfirmTitle).containsText(cert.name);
    });

    test('it activates a cert via the activate endpoint', async function (assert) {
      this.server.create('signing-certificate', 'active');
      const spare = this.server.create('signing-certificate');

      await render(ORG_SCOPE);
      await openExistingTab();
      await click(selectors.activateBtn);

      const activate = this.server.pretender.handledRequests.find((r) =>
        r.url.includes(`/signing-certificates/${spare.id}/activate/`)
      );

      assert.ok(activate, 'posts to the activate endpoint for that cert');

      assert.true(spare.reload().is_active, 'the backend marks it active');
    });

    // ─── Delete confirmation ─────────────────────────────────────────────────
    test('deleting asks for confirmation before calling the endpoint', async function (assert) {
      const cert = this.server.create('signing-certificate');

      await render(ORG_SCOPE);
      await openExistingTab();
      await click(selectors.deleteBtn);

      const deletes = () =>
        this.server.pretender.handledRequests.filter(
          (r) => r.method === 'DELETE'
        );

      assert.strictEqual(
        deletes().length,
        0,
        'the trash icon alone deletes nothing'
      );

      assert.dom(selectors.deleteConfirm).exists();
      assert.dom(selectors.tabs).doesNotExist();

      assert
        .dom(selectors.deleteConfirmTitle)
        .containsText(cert.name, 'names the cert being deleted');

      await click(selectors.deleteCancelBtn);

      assert.strictEqual(deletes().length, 0, 'cancelling deletes nothing');
      assert.dom(selectors.deleteConfirm).doesNotExist();
      assert.dom(selectors.tabs).exists('returns to the list');

      await click(selectors.deleteBtn);
      await click(selectors.deleteConfirmBtn);

      assert.strictEqual(deletes().length, 1, 'confirming runs the delete');
      assert.dom(selectors.deleteConfirm).doesNotExist();
    });

    test('the confirmation puts the warning and the actions under the title', async function (assert) {
      this.server.create('signing-certificate');

      await render(ORG_SCOPE);
      await openExistingTab();
      await click(selectors.deleteBtn);

      const title = find(selectors.deleteConfirmTitle);
      const info = find(selectors.deleteConfirmInfo);

      assert
        .dom(info)
        .hasText(
          t('cyod.signingCert.deleteReason'),
          'the consequence of deleting renders as its own line'
        );

      assert.strictEqual(
        info.parentElement,
        title.parentElement,
        'title and explanation share one block'
      );

      assert
        .dom('[data-test-orgSigningCert-deleteReason]')
        .doesNotExist('the confirmation no longer collects a reason');

      // The actions sit in the scrolling body right under the question rather
      // than pinned to the drawer footer, so they read as part of the prompt.
      assert.strictEqual(
        find(selectors.deleteConfirmBtn).closest(
          `${selectors.deleteConfirm} > *`
        ),
        title.closest(`${selectors.deleteConfirm} > *`),
        'the actions share the body with the question, not a footer'
      );
    });

    test('it deletes the staged cert with a bodyless request', async function (assert) {
      const cert = this.server.create('signing-certificate');
      const other = this.server.create('signing-certificate');

      await render(ORG_SCOPE);
      await openExistingTab();
      await click(selectors.deleteBtn);
      await click(selectors.deleteConfirmBtn);

      const deletes = () =>
        this.server.pretender.handledRequests.filter(
          (r) => r.method === 'DELETE'
        );

      assert.ok(
        deletes()[0].url.endsWith(
          `/api/organizations/${this.organization.id}/signing-certificates/${cert.id}/`
        ),
        'deletes the cert the confirmation was staged for'
      );

      assert.notOk(
        deletes()[0].requestBody,
        'no reason is collected, so the delete carries no body'
      );

      await click(selectors.deleteBtn);
      await click(selectors.deleteConfirmBtn);

      assert.ok(
        deletes()[1].url.endsWith(
          `/api/organizations/${this.organization.id}/signing-certificates/${other.id}/`
        ),
        'the second confirmation deletes the other cert'
      );
    });

    test('the back arrow returns from the confirmation to the list', async function (assert) {
      this.server.create('signing-certificate');

      await render(ORG_SCOPE);
      await openExistingTab();
      await click(selectors.deleteBtn);

      assert.dom(selectors.drawerTitle).hasText(t('confirmation'));

      await click(selectors.deleteBackBtn);

      assert.dom(selectors.deleteConfirm).doesNotExist();
      assert.dom(selectors.tabs).exists();
    });

    // ─── Project scope ───────────────────────────────────────────────────────
    test('project scope shows its single cert with no activate action', async function (assert) {
      const cert = this.server.create('signing-certificate');

      await render(PROJECT_SCOPE);

      assert
        .dom(selectors.sectionTitle)
        .exists('project settings gets the CYOD section heading');

      await openExistingTab();

      assert.dom(selectors.info).exists({ count: 1 });
      assert.dom(selectors.cardName).hasText(cert.name);

      assert
        .dom(selectors.activateBtn)
        .doesNotExist('nothing to switch between in project scope');

      assert.dom(selectors.deleteBtn).exists({ count: 1 });
    });

    test('it emits no section layout of its own', async function (assert) {
      await render(PROJECT_SCOPE);

      assert
        .dom(selectors.divider)
        .doesNotExist('the caller owns the section divider');

      assert.ok(
        /ak-typography-h5/.test(find(selectors.sectionTitle).className),
        'section heading matches its h5 siblings'
      );
    });

    // ─── Visibility gates ────────────────────────────────────────────────────
    test('it hides itself for a non-iOS project', async function (assert) {
      this.project = this.server.create('project', {
        platform: ENUMS.PLATFORM.ANDROID,
      });

      await render(PROJECT_SCOPE);

      assert.dom(selectors.root).doesNotExist();
      assert.dom(selectors.sectionTitle).doesNotExist();
    });

    test('project scope is hidden from a plain member', async function (assert) {
      // The certificate holds the customer's iOS signing identity and the
      // org-scope panel is owner-only, so the project-scope override must not
      // become a way for a member to upload or delete one.
      setupMe(this, 'member');

      await render(PROJECT_SCOPE);

      assert.dom(selectors.root).doesNotExist();
      assert
        .dom(selectors.sectionTitle)
        .doesNotExist('the section heading goes with the panel');
    });

    test('project scope renders for either management role', async function (assert) {
      // `is_admin` and `is_owner` are independent flags, so an owner who is not
      // also flagged admin still gets the panel.
      setupMe(this, 'owner');

      await render(PROJECT_SCOPE);

      assert.dom(selectors.root).exists('an owner sees it');

      setupMe(this, 'admin');

      await render(PROJECT_SCOPE);

      assert.dom(selectors.root).exists('an admin sees it too');
    });

    test('it is hidden when the owner turns CYOD registration off', async function (assert) {
      class OrganizationStub extends Service {
        selected = this.server?.schema?.organizations?.first();
        isCyodEnabled = true;
        isCyodRegistrationEnabled = false;
      }

      this.owner.register('service:organization', OrganizationStub);

      await render(ORG_SCOPE);

      assert.dom(selectors.root).doesNotExist();
    });

    test('it is hidden when the CYOD feature is disabled', async function (assert) {
      class OrganizationStub extends Service {
        isCyodEnabled = false;
        isCyodRegistrationEnabled = false;
      }

      this.owner.register('service:organization', OrganizationStub);

      await render(ORG_SCOPE);

      assert.dom(selectors.root).doesNotExist();
    });
  }
);

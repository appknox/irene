import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';

// ─── Test Selectors ────────────────────────────────────────────────────────────
const SEL = {
  root: '[data-test-fileDetails-dynamicScan-automated-userRoles-root]',
  label: '[data-test-fileDetails-dynamicScan-automated-userRoles-label]',
  pill: '[data-test-fileDetails-dynamicScan-automated-userRoles-pill]',

  pillName: '[data-test-fileDetails-dynamicScan-automated-userRoles-pillName]',
  pillIcon: '[data-test-fileDetails-dynamicScan-automated-userRoles-pillIcon]',

  icon: '[data-test-ak-icon]',
  loader: '[data-test-ak-loader]',
};

// ─── Test Template ────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <FileDetails::DynamicScan::Automated::UserRoles
    @lastAutomatedDynamicScans={{this.scans}}
    @selectedScan={{this.selectedScan}}
    @onRoleChange={{this.onRoleChange}}
  />
`;

// ─── Test Helpers ────────────────────────────────────────────────────────────
const SCAN_STATUS = ENUMS.DYNAMIC_SCAN_STATUS;

// checks if a pill element is selected by checking if it has the 'selected' class
function userRoleIsSelected(pillEl) {
  return /selected/.test(pillEl.className);
}

// creates a dynamicscan (optionally with a named user role) via mirage
function makeScan(server, store, { name, status }) {
  const role = name ? server.create('scenario-user-role', { name }) : null;
  const scan = server.create('dynamicscan', { status, scenarioUserRole: role });

  const normalized = store.normalize('dynamicscan', {
    id: scan.id,
    status: scan.status,
    scenario_user_role: role ? { id: role.id, name: role.name } : null,
  });

  return store.push(normalized);
}

// ─── Test Starts Here ────────────────────────────────────────────────────────────
module(
  'Integration | Component | file-details/dynamic-scan/automated/user-roles',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.store = this.owner.lookup('service:store');

      this.setProperties({
        scans: [],
        selectedScan: null,
        onRoleChange: () => {},
      });
    });

    test('renders one pill per scan with a user role', async function (assert) {
      const roles = ['Admin', 'Guest'];

      const scans = roles.map((role) =>
        makeScan(this.server, this.store, {
          name: role,
          status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
        })
      );

      this.set('scans', scans);

      await render(TEMPLATE);

      assert.dom(SEL.pill).exists({ count: scans.length });

      const roleNames = findAll(SEL.pillName).map((el) =>
        el.textContent.trim()
      );

      assert.deepEqual(roleNames, roles);
    });

    test('omits scans without a user role', async function (assert) {
      const roles = ['Admin', 'Guest'];

      // if the role is 'Guest', don't create a user role
      this.set(
        'scans',
        roles.map((role) =>
          makeScan(this.server, this.store, {
            name: role === 'Guest' ? null : role,
            status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          })
        )
      );

      await render(TEMPLATE);

      assert.dom(SEL.pill).exists({ count: 1 });
      assert.dom(SEL.pillName).hasText(roles[0]);
    });

    test('renders the label and root even with zero scans', async function (assert) {
      await render(TEMPLATE);

      assert.dom(SEL.root).exists();
      assert.dom(SEL.label).hasText(t('userRoles'));
      assert.dom(SEL.pill).doesNotExist();
    });

    test('no pill is marked selected when @selectedScan is null', async function (assert) {
      const admin = makeScan(this.server, this.store, {
        name: 'Admin',
        status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
      });

      this.set('scans', [admin]);

      await render(TEMPLATE);

      assert.false(userRoleIsSelected(find(SEL.pill)), 'no pill is selected');
    });

    test("marks the pill matching @selectedScan's role as selected on initial render", async function (assert) {
      const roles = ['Admin', 'Guest'];

      // create two scans, one for each role and set the selected scan to the guest role
      const scans = roles.map((role) =>
        makeScan(this.server, this.store, {
          name: role,
          status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
        })
      );

      this.setProperties({
        scans,
        selectedScan: scans[1],
      });

      await render(TEMPLATE);

      const [adminPill, guestPill] = findAll(SEL.pill);

      assert.false(userRoleIsSelected(adminPill), 'Admin pill is not selected');
      assert.true(userRoleIsSelected(guestPill), 'Guest pill is selected');
    });

    test('shows a loader instead of a status icon for loading-status roles', async function (assert) {
      const loadingStatuses = [
        SCAN_STATUS.IN_QUEUE,
        SCAN_STATUS.INSTALLING,
        SCAN_STATUS.READY_FOR_INTERACTION,
        SCAN_STATUS.STOP_SCAN_REQUESTED,
      ];

      const scans = loadingStatuses.map((status, index) =>
        makeScan(this.server, this.store, { name: `Role ${index}`, status })
      );

      this.set('scans', scans);

      await render(TEMPLATE);

      assert.dom(SEL.loader).exists({ count: loadingStatuses.length });
      assert.dom(SEL.icon).doesNotExist();
    });

    test('shows the correct icon for each non-loading status', async function (assert) {
      assert.expect(8);

      const cases = [
        { status: SCAN_STATUS.ANALYSIS_COMPLETED, icon: 'check-circle' },
        { status: SCAN_STATUS.ERROR, icon: 'error' },
        { status: SCAN_STATUS.CANCELLED, icon: 'block' },
        { status: SCAN_STATUS.NOT_STARTED, icon: 'info' },
      ];

      const scans = cases.map((c, index) =>
        makeScan(this.server, this.store, {
          name: `Role ${index}`,
          status: c.status,
        })
      );

      this.set('scans', scans);

      await render(TEMPLATE);

      cases.forEach(({ status, icon }) => {
        const scanForCase = scans.find((s) => s.status === status);
        const roleName = scanForCase.scenarioUserRole.name;

        const PILL_SELECTOR = `[data-test-fileDetails-dynamicScan-automated-userRoles-pillWrapper="${roleName}"]`;
        const pillIcon = find(`${PILL_SELECTOR} ${SEL.pillIcon}`);

        assert.dom(pillIcon).exists().hasAttribute('icon', new RegExp(icon));
      });
    });

    test("clicking a pill calls @onRoleChange with that role's scan, and moves the selected styling", async function (assert) {
      const roles = ['Admin', 'Guest'];

      const scans = roles.map((role) =>
        makeScan(this.server, this.store, {
          name: role,
          status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
        })
      );

      const [admin, guest] = scans;

      this.setProperties({
        calledWith: null,
        scans,
        selectedScan: admin,
        onRoleChange: (scan) => this.set('calledWith', scan),
      });

      await render(TEMPLATE);

      const [adminPill, guestPill] = findAll(SEL.pill);

      await click(guestPill);

      assert.strictEqual(
        this.calledWith,
        guest,
        "onRoleChange is called with the clicked role's scan"
      );

      assert.false(
        userRoleIsSelected(adminPill),
        'Admin pill is no longer selected'
      );

      assert.true(userRoleIsSelected(guestPill), 'Guest pill is now selected');
    });

    test('clicking the already-selected pill does not call @onRoleChange', async function (assert) {
      const admin = makeScan(this.server, this.store, {
        name: 'Admin',
        status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
      });

      this.setProperties({
        callCount: 0,
        scans: [admin],
        selectedScan: admin,
        onRoleChange: () => this.set('callCount', this.callCount + 1),
      });

      await render(TEMPLATE);

      await click(SEL.pill);

      assert.strictEqual(
        this.callCount,
        0,
        'onRoleChange does not fire for the already-selected pill'
      );
    });
  }
);

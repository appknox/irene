import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';

import {
  assertAkSelectTriggerExists,
  chooseAkSelectOption,
} from 'irene/tests/helpers/mirage-utils';

// ── Stubs ────────────────────────────────────────────────────────────────────

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

class RouterStub extends Service {
  transitionedTo = null;

  transitionTo(routeName) {
    this.transitionedTo = routeName;
  }
}

class AnalyticsStub extends Service {
  track() {}
}

// ── Selectors ────────────────────────────────────────────────────────────────

const selectors = {
  backBtn: '[data-test-orgIntegrations-serviceNowDetail-backBtn]',
  instanceURLInput:
    '[data-test-orgIntegrations-serviceNowDetail-instanceURLInput]',
  usernameInput: '[data-test-orgIntegrations-serviceNowDetail-usernameInput]',
  passwordInput: '[data-test-orgIntegrations-serviceNowDetail-passwordInput]',
  autoPushToggle: '[data-test-orgIntegrations-serviceNowDetail-autoPushToggle]',
  proceedBtn: '[data-test-orgIntegrations-serviceNowDetail-proceedBtn]',
  tableSelect: '[data-test-orgIntegrations-serviceNowDetail-tableSelect]',
  customTableSearch:
    '[data-test-orgIntegrations-serviceNowDetail-customTableSearch]',
  customTableSearchInput:
    '[data-test-orgIntegrations-serviceNowDetail-customTableSearch] [data-test-ak-autocomplete-text-field]',
  selectedTableInput:
    '[data-test-orgIntegrations-serviceNowDetail-selectedTableInput]',
  clearTableBtn: '[data-test-orgIntegrations-serviceNowDetail-clearTableBtn]',
  mappingRow: '[data-test-orgIntegrations-serviceNowDetail-mappingRow]',
  mappingColumn: '[data-test-orgIntegrations-serviceNowDetail-mappingColumn]',
  integrateBtn: '[data-test-orgIntegrations-serviceNowDetail-integrateBtn]',
  disconnectBtn: '[data-test-orgIntegrations-serviceNowDetail-disconnectBtn]',
  disconnectBtnConfirmation:
    '[data-test-orgIntegrations-serviceNowDetail-disconnectBtnConfirmation]',
  cancelBtnConfirmation:
    '[data-test-orgIntegrations-serviceNowDetail-cancelBtnConfirmation]',
  autoPushDisplay:
    '[data-test-orgIntegrations-serviceNowDetail-autoPushDisplay]',
};

// ── Template ─────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`<Organization::Integrations::ServiceNowDetail @user={{this.user}} />`;

// ── Fixtures ─────────────────────────────────────────────────────────────────

const INSTANCE_URL = 'https://myinstance.service-now.com';
const USERNAME = 'sn_admin';
const PASSWORD = 'Test_p4ss!'; //NOSONAR

const FULL_INTEGRATION = Object.freeze({
  instance_url: INSTANCE_URL,
  username: USERNAME,
  is_complete: true,
  table_name: '1',
  auto_push: false,
  custom_table_name: '',
});

const CUSTOM_TABLES = Object.freeze([
  { name: 'u_security_incident', label: 'Security Incident' },
  { name: 'u_vuln_finding', label: 'Vuln Finding' },
]);

const CUSTOM_COLUMNS = Object.freeze([
  { element: 'u_title', column_label: 'Title', type: 'string' },
  { element: 'u_severity', column_label: 'Severity', type: 'integer' },
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Fill Step 1 credentials and click "Save and Proceed".
 * Caller is responsible for setting up a POST /servicenow route first.
 */
const fillAndProceed = async () => {
  await fillIn(selectors.instanceURLInput, INSTANCE_URL);
  await fillIn(selectors.usernameInput, USERNAME);
  await fillIn(selectors.passwordInput, PASSWORD);
  await click(selectors.proceedBtn);
};

// ── Module ───────────────────────────────────────────────────────────────────

module(
  'Integration | Component | organization/integrations/service-now-detail/index',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);
      await this.owner.lookup('service:organization').load();

      this.owner.register('service:notifications', NotificationsStub);
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);
      this.owner.register('service:analytics', AnalyticsStub);

      this.set('user', null);
    });

    // ── checkIntegration ──────────────────────────────────────────────────

    test('it renders step 1 when integration returns 404', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      await render(TEMPLATE);

      assert.dom(selectors.backBtn).exists('back button visible in step 1');

      assert.dom(selectors.instanceURLInput).exists().isNotDisabled();

      assert.dom(selectors.usernameInput).exists().isNotDisabled();

      assert.dom(selectors.passwordInput).exists().isNotDisabled();

      assert.dom(selectors.autoPushToggle).exists();

      assert
        .dom(selectors.proceedBtn)
        .isNotDisabled()
        .hasText(t('saveAndProceed'));

      assert.dom(selectors.integrateBtn).doesNotExist();

      assert.dom(selectors.disconnectBtn).doesNotExist();

      assert.dom(selectors.tableSelect).doesNotExist();
    });

    test('it pre-fills step 1 when partially saved (is_complete=false)', async function (assert) {
      // Partial save: Step 1 credentials stored, Step 2 not completed.
      this.server.get('/organizations/:id/servicenow', () => ({
        instance_url: INSTANCE_URL,
        username: USERNAME,
        is_complete: false,
      }));

      await render(TEMPLATE);

      assert
        .dom(selectors.instanceURLInput)
        .hasValue(INSTANCE_URL, 'instance URL pre-filled from saved token');

      assert
        .dom(selectors.usernameInput)
        .hasValue(USERNAME, 'username pre-filled from saved token');

      assert
        .dom(selectors.passwordInput)
        .hasNoValue('password is never pre-filled for security');
    });

    test('it renders integrated state when is_complete is true', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => FULL_INTEGRATION);

      await render(TEMPLATE);

      assert
        .dom(selectors.disconnectBtn)
        .isNotDisabled()
        .hasText(t('disconnect'));

      assert
        .dom(selectors.autoPushDisplay)
        .exists('read-only auto-push toggle shown in integrated state');

      assert.dom(selectors.proceedBtn).doesNotExist();

      assert.dom(selectors.integrateBtn).doesNotExist();

      assert.dom(selectors.instanceURLInput).doesNotExist();

      assert
        .dom(selectors.backBtn)
        .exists('back button visible in integrated state');
    });

    test('it shows pleaseTryAgain notification on non-404 checkIntegration error', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(500));

      await render(TEMPLATE);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        t('pleaseTryAgain'),
        'error notification shown on 500 during initial load'
      );

      assert
        .dom(selectors.proceedBtn)
        .exists('falls back to step 1 view after error');
    });

    // ── Step 1: navigation and form ───────────────────────────────────────

    test('it navigates to integrations list when back is clicked from step 1', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      await render(TEMPLATE);

      const router = this.owner.lookup('service:router');

      assert.strictEqual(router.transitionedTo, null, 'no navigation yet');

      await click(selectors.backBtn);

      assert.strictEqual(
        router.transitionedTo,
        'authenticated.dashboard.organization-settings.integrations',
        'navigates to integrations list from step 1'
      );
    });

    test('it stays on step 1 and shows a validation error on empty submit', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      await render(TEMPLATE);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, null, 'no error before submit');

      // Click proceed with no values — changeset validation fires
      await click(selectors.proceedBtn);

      // The exact message is changeset-locale-dependent; assert it was set.
      assert.notStrictEqual(
        notify.errorMsg,
        null,
        'validation error notification shown after empty proceed'
      );

      assert
        .dom(selectors.proceedBtn)
        .exists('stays on step 1 after validation failure');

      assert.dom(selectors.integrateBtn).doesNotExist();
    });

    test('it sends auto_push=true in POST when toggled on in step 1', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      let capturedBody = null;

      this.server.post('/organizations/:id/servicenow', (_, req) => {
        capturedBody = JSON.parse(req.requestBody);
        return new Response(200, {}, {});
      });

      await render(TEMPLATE);

      await fillIn(selectors.instanceURLInput, INSTANCE_URL);
      await fillIn(selectors.usernameInput, USERNAME);
      await fillIn(selectors.passwordInput, PASSWORD);

      // Toggle auto-push on before submitting
      await click(`${selectors.autoPushToggle} [data-test-toggle-input]`);
      await click(selectors.proceedBtn);

      assert.true(
        capturedBody.auto_push,
        'auto_push=true sent when toggle is on'
      );
    });

    test('it advances to step 2 after successful step 1 POST', async function (assert) {
      assert.expect(5); // 4 top-level + 1 inside assertAkSelectTriggerExists

      this.server.get('/organizations/:id/servicenow', () => new Response(404));
      this.server.post(
        '/organizations/:id/servicenow',
        () => new Response(200, {}, {})
      );

      await render(TEMPLATE);

      assert.dom(selectors.proceedBtn).exists('starts on step 1');

      await fillAndProceed();

      assert.dom(selectors.proceedBtn).doesNotExist('left step 1');

      assert
        .dom(selectors.integrateBtn)
        .exists('step 2 integrate button visible');

      assertAkSelectTriggerExists(assert, selectors.tableSelect);

      assert.dom(selectors.instanceURLInput).doesNotExist();
    });

    test('it shows field error from API payload when step 1 POST fails', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      this.server.post(
        '/organizations/:id/servicenow',
        () => new Response(400, {}, { instance_url: ['URL is not reachable'] })
      );

      await render(TEMPLATE);

      await fillIn(selectors.instanceURLInput, INSTANCE_URL);
      await fillIn(selectors.usernameInput, USERNAME);
      await fillIn(selectors.passwordInput, PASSWORD);
      await click(selectors.proceedBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        'URL is not reachable',
        'first field error from API payload shown'
      );

      assert
        .dom(selectors.proceedBtn)
        .exists('stays on step 1 after POST failure');

      assert.dom(selectors.integrateBtn).doesNotExist();
    });

    // ── Step 2: navigation and table selection ────────────────────────────

    test('it returns to step 1 when back is clicked from step 2', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      this.server.post(
        '/organizations/:id/servicenow',
        () => new Response(200, {}, {})
      );

      await render(TEMPLATE);

      await fillAndProceed();

      assert.dom(selectors.integrateBtn).exists('confirms we are in step 2');

      await click(selectors.backBtn);

      assert.dom(selectors.proceedBtn).exists('back to step 1');

      assert.dom(selectors.integrateBtn).doesNotExist();

      assert
        .dom(selectors.instanceURLInput)
        .hasValue(INSTANCE_URL, 'credentials preserved after going back');
    });

    test('it enables integrate button after selecting a standard table', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      this.server.post(
        '/organizations/:id/servicenow',
        () => new Response(200, {}, {})
      );

      await render(TEMPLATE);

      await fillAndProceed();

      assert
        .dom(selectors.integrateBtn)
        .isDisabled('integrate disabled before table selection');

      await chooseAkSelectOption({
        selectTriggerClass: selectors.tableSelect,
        labelToSelect: 'sn_vul_app_vulnerable_item',
      });

      assert
        .dom(selectors.integrateBtn)
        .isNotDisabled('integrate enabled after table selection');
    });

    test('it completes integration with a standard table on success', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      let postCount = 0;

      this.server.post('/organizations/:id/servicenow', (_, req) => {
        postCount++;
        return new Response(200, {}, JSON.parse(req.requestBody));
      });

      await render(TEMPLATE);

      await fillAndProceed();

      await chooseAkSelectOption({
        selectTriggerClass: selectors.tableSelect,
        labelToSelect: 'sn_vul_app_vulnerable_item',
      });

      await click(selectors.integrateBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        postCount,
        2,
        'two POSTs made: step 1 save + step 2 complete'
      );

      assert.strictEqual(
        notify.successMsg,
        t('serviceNowIntegrated'),
        'success notification shown'
      );

      assert.dom(selectors.disconnectBtn).exists('now in integrated state');

      assert.dom(selectors.integrateBtn).doesNotExist();
    });

    test('it shows error notification when step 2 POST fails', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      this.server.post('/organizations/:id/servicenow', (_, req) => {
        const body = JSON.parse(req.requestBody);

        if (body.is_complete) {
          return new Response(
            400,
            {},
            { table_name: ['Selected table does not exist'] }
          );
        }

        return new Response(200, {}, body);
      });

      await render(TEMPLATE);

      await fillAndProceed();

      await chooseAkSelectOption({
        selectTriggerClass: selectors.tableSelect,
        labelToSelect: 'sn_vul_app_vulnerable_item',
      });

      await click(selectors.integrateBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        'Selected table does not exist',
        'field error from step 2 API payload shown'
      );

      assert
        .dom(selectors.integrateBtn)
        .exists('stays on step 2 after failure');

      assert.dom(selectors.disconnectBtn).doesNotExist();
    });

    // ── Step 2: custom table search and column mapping ────────────────────

    test('it shows custom table autocomplete when custom table is selected', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      this.server.post(
        '/organizations/:id/servicenow',
        () => new Response(200, {}, {})
      );

      await render(TEMPLATE);

      await fillAndProceed();

      assert
        .dom(selectors.customTableSearch)
        .doesNotExist('autocomplete hidden before custom is chosen');

      await chooseAkSelectOption({
        selectTriggerClass: selectors.tableSelect,
        labelToSelect: t('serviceNow.customTable'),
      });

      assert
        .dom(selectors.customTableSearch)
        .exists('custom table autocomplete shown');

      assert
        .dom(selectors.integrateBtn)
        .isDisabled('integrate disabled until a custom table is selected');
    });

    test('it fetches and shows table suggestions when searching custom tables', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      this.server.post(
        '/organizations/:id/servicenow',
        () => new Response(200, {}, {})
      );

      this.server.get('/organizations/:id/servicenow/tables', () => ({
        tables: CUSTOM_TABLES,
      }));

      await render(TEMPLATE);

      await fillAndProceed();

      await chooseAkSelectOption({
        selectTriggerClass: selectors.tableSelect,
        labelToSelect: t('serviceNow.customTable'),
      });

      assert
        .dom('[data-test-ak-autocomplete-item]')
        .doesNotExist('no suggestions before search');

      await click(selectors.customTableSearch);
      await fillIn(selectors.customTableSearch, 'security');

      assert
        .dom('[data-test-ak-autocomplete-item]')
        .exists(
          { count: CUSTOM_TABLES.length },
          'one suggestion item per returned table'
        );
    });

    test('it fetches columns and shows mapping rows after selecting a custom table', async function (assert) {
      assert.expect(4); // 1 inside Mirage columns handler + 3 top-level DOM assertions

      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      this.server.post(
        '/organizations/:id/servicenow',
        () => new Response(200, {}, {})
      );

      this.server.get('/organizations/:id/servicenow/tables', () => ({
        tables: CUSTOM_TABLES,
      }));

      this.server.get('/organizations/:id/servicenow/columns', (_, req) => {
        assert.strictEqual(
          req.queryParams.table,
          CUSTOM_TABLES[0].name,
          'columns fetched for the chosen table'
        );

        return { columns: CUSTOM_COLUMNS };
      });

      await render(TEMPLATE);

      await fillAndProceed();

      await chooseAkSelectOption({
        selectTriggerClass: selectors.tableSelect,
        labelToSelect: t('serviceNow.customTable'),
      });

      await click(selectors.customTableSearch);
      await fillIn(selectors.customTableSearch, 'security');

      await click('[data-test-ak-autocomplete-item]');

      assert
        .dom(selectors.selectedTableInput)
        .exists('selected table chip shown after selection');

      assert
        .dom(selectors.customTableSearch)
        .doesNotExist('autocomplete replaced by chip after selection');

      // 9 appknox source keys → 9 mapping rows
      assert
        .dom(selectors.mappingRow)
        .exists(
          { count: 9 },
          '9 mapping rows rendered (one per Appknox source key)'
        );
    });

    test('it clears the selected custom table and resets mapping rows', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      this.server.post(
        '/organizations/:id/servicenow',
        () => new Response(200, {}, {})
      );

      this.server.get('/organizations/:id/servicenow/tables', () => ({
        tables: CUSTOM_TABLES,
      }));

      this.server.get('/organizations/:id/servicenow/columns', () => ({
        columns: CUSTOM_COLUMNS,
      }));

      await render(TEMPLATE);

      await fillAndProceed();

      await chooseAkSelectOption({
        selectTriggerClass: selectors.tableSelect,
        labelToSelect: t('serviceNow.customTable'),
      });

      await click(selectors.customTableSearch);
      await fillIn(selectors.customTableSearch, 'security');

      await click('[data-test-ak-autocomplete-item]');

      assert
        .dom(selectors.selectedTableInput)
        .exists('table selected — pre-state for clear');

      assert
        .dom(selectors.mappingRow)
        .exists('mapping rows present before clear');

      await click(selectors.clearTableBtn);

      assert
        .dom(selectors.selectedTableInput)
        .doesNotExist('chip removed after clear');

      assert
        .dom(selectors.customTableSearch)
        .exists('autocomplete restored after clear');

      assert
        .dom(selectors.mappingRow)
        .doesNotExist('mapping rows removed after clear');

      assert
        .dom(selectors.integrateBtn)
        .isDisabled('integrate disabled again after clear');
    });

    test('it enables integrate and completes integration with a custom table and field mapping', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      let step2Payload = null;

      this.server.post('/organizations/:id/servicenow', (_, req) => {
        const body = JSON.parse(req.requestBody);

        if (body.is_complete) {
          step2Payload = body;
        }

        return new Response(200, {}, body);
      });

      this.server.get('/organizations/:id/servicenow/tables', () => ({
        tables: [CUSTOM_TABLES[0]],
      }));

      this.server.get('/organizations/:id/servicenow/columns', () => ({
        columns: CUSTOM_COLUMNS,
      }));

      await render(TEMPLATE);

      await fillAndProceed();

      await chooseAkSelectOption({
        selectTriggerClass: selectors.tableSelect,
        labelToSelect: t('serviceNow.customTable'),
      });

      await click(selectors.customTableSearch);
      await fillIn(selectors.customTableSearch, 'security');

      await click('[data-test-ak-autocomplete-item]');

      assert
        .dom(selectors.integrateBtn)
        .isDisabled('integrate disabled before any field is mapped');

      // Map the first Appknox source key to the first available SN column.
      // optionIndex:0 selects the first option inside the first matching select.
      await chooseAkSelectOption({
        selectTriggerClass: selectors.mappingColumn,
        optionIndex: 0,
      });

      assert
        .dom(selectors.integrateBtn)
        .isNotDisabled('integrate enabled after at least one mapping');

      await click(selectors.integrateBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('serviceNowIntegrated'),
        'success notification on custom table integration'
      );

      assert.strictEqual(
        step2Payload.custom_table_name,
        CUSTOM_TABLES[0].name,
        'custom_table_name sent in step 2 payload'
      );

      assert.dom(selectors.disconnectBtn).exists('now in integrated state');
    });

    // ── Integrated view: revoke flow ──────────────────────────────────────

    test('it shows revoke confirmation when disconnect is clicked', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => FULL_INTEGRATION);

      await render(TEMPLATE);

      assert.dom(selectors.disconnectBtn).exists();
      assert.dom(selectors.disconnectBtnConfirmation).doesNotExist();
      assert.dom(selectors.cancelBtnConfirmation).doesNotExist();

      await click(selectors.disconnectBtn);

      assert
        .dom(selectors.disconnectBtnConfirmation)
        .isNotDisabled()
        .hasText(t('yesDisconnect'));

      assert
        .dom(selectors.cancelBtnConfirmation)
        .isNotDisabled()
        .hasText(t('cancel'));

      assert
        .dom(selectors.backBtn)
        .doesNotExist('back button hidden during revoke confirmation');
    });

    test('it cancels revoke and returns to integrated state', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => FULL_INTEGRATION);

      await render(TEMPLATE);

      await click(selectors.disconnectBtn);

      assert
        .dom(selectors.disconnectBtnConfirmation)
        .exists('confirmation visible — pre-state');

      await click(selectors.cancelBtnConfirmation);

      assert
        .dom(selectors.disconnectBtnConfirmation)
        .doesNotExist('confirmation dismissed');

      assert
        .dom(selectors.disconnectBtn)
        .exists('disconnect button restored — still integrated');
    });

    test.each(
      'it revokes integration',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        this.server.get(
          '/organizations/:id/servicenow',
          () => FULL_INTEGRATION
        );

        this.server.delete('/organizations/:id/servicenow', () =>
          fail ? new Response(500) : new Response(200, {}, {})
        );

        await render(TEMPLATE);

        await click(selectors.disconnectBtn);

        assert
          .dom(selectors.disconnectBtnConfirmation)
          .exists('confirmation shown — pre-state for revoke');

        await click(selectors.disconnectBtnConfirmation);

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(
            notify.errorMsg,
            t('pleaseTryAgain'),
            'error notification shown after revoke failure'
          );

          assert
            .dom(selectors.disconnectBtnConfirmation)
            .exists('confirmation stays open after failure');

          assert.dom(selectors.disconnectBtn).doesNotExist();
        } else {
          assert.strictEqual(
            notify.successMsg,
            t('serviceNow.willBeRevoked'),
            'success notification shown after revoke'
          );

          assert
            .dom(selectors.disconnectBtn)
            .doesNotExist('no longer integrated');

          assert
            .dom(selectors.proceedBtn)
            .exists('back to step 1 after successful revoke');

          assert.dom(selectors.disconnectBtnConfirmation).doesNotExist();
        }
      }
    );
  }
);

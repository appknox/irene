import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  click,
  find,
  findAll,
  render,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

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
  title: '[data-test-orgDeviceRegistration-title]',
  description: '[data-test-orgDeviceRegistration-description]',
  toggle: '[data-test-orgDeviceRegistration-toggle]',
  // AkToggle puts the test attribute on the wrapping <span> and renders the
  // real checkbox inside it, so assertions and clicks target the input.
  toggleInput: '[data-test-orgDeviceRegistration-toggle] input',
  goToCyodSettings: '[data-test-orgDeviceRegistration-goToCyodSettings]',
  deviceTable: '[data-test-cyodDeviceTable]',
  deviceTableEmpty: '[data-test-cyodDeviceTable-empty]',
  deviceTableEmptyTitle: '[data-test-cyodDeviceTable-emptyTitle]',
  deviceTableEmptyDescription: '[data-test-cyodDeviceTable-emptyDescription]',
  deviceTableRow: '[data-test-cyodDeviceTable-row]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Organization::DeviceRegistration />`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Registers an organization service backed by a real ember-data record pushed
 * from mirage, so the component's `set` + `save` hit the PUT route rather than
 * a hand-written stub. Returns the mirage model and the pushed record.
 */
function setupOrganization(context, ...traits) {
  const store = context.owner.lookup('service:store');
  const organization = context.server.create('organization', ...traits);
  const record = store.push(
    store.normalize('organization', organization.toJSON())
  );

  class OrganizationStub extends Service {
    selected = record;
  }

  context.owner.register('service:organization', OrganizationStub);
  context.setProperties({ store, organization, record });

  return { organization, record };
}

module(
  'Integration | Component | organization/device-registration',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.notify = this.owner.lookup('service:notifications');
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('it renders the CYOD registration switch turned on', async function (assert) {
      setupOrganization(this, 'withCyodEnabled');

      await render(TEMPLATE);

      assert.dom(selectors.title).hasText(t('cyod.registration.title'));

      assert
        .dom(selectors.description)
        .hasText(t('cyod.registration.description'));

      assert.dom(selectors.toggleInput).isChecked().isNotDisabled();
    });

    test('it hides the device table when the switch is off', async function (assert) {
      setupOrganization(this, 'withCyodRegistrationDisabled');

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isNotChecked();
      assert.dom(selectors.deviceTable).doesNotExist();
    });

    test('it lists the organization devices when the switch is on', async function (assert) {
      setupOrganization(this, 'withCyodEnabled');

      const devices = this.server.createList(
        'organization-cyod-registered-device',
        2
      );

      await render(TEMPLATE);

      const rows = findAll(selectors.deviceTableRow);

      assert.strictEqual(rows.length, devices.length);

      devices.forEach((device, index) => {
        assert.dom(rows[index]).containsText(device.name);
      });

      assert.dom(selectors.deviceTableEmpty).doesNotExist();
    });

    test('it links to the account CYOD settings from the empty state', async function (assert) {
      setupOrganization(this, 'withCyodEnabled');

      await render(TEMPLATE);

      assert
        .dom(selectors.deviceTableEmptyTitle)
        .hasText(t('cyod.deviceTable.emptyTitle'));

      assert
        .dom(selectors.deviceTableEmptyDescription)
        .hasText(
          t('cyod.registration.emptyHint'),
          'the panel passes its own hint down to the table'
        );

      assert
        .dom(selectors.goToCyodSettings)
        .hasText(t('cyod.registration.goToCyodSettings'));
    });

    // ─── Toggling ──────────────────────────────────────────────────────────────

    test('toggling off persists the new value on the organization', async function (assert) {
      assert.expect(5);

      const { record } = setupOrganization(this, 'withCyodEnabled');

      this.server.put('/organizations/:id', (schema, req) => {
        const data = JSON.parse(req.requestBody);

        assert.false(
          data.cyod_registration_enabled,
          'sends the value the switch was moved to, not its inverse'
        );

        const organization = schema.organizations.find(req.params.id);
        organization.update(data);

        return organization.toJSON();
      });

      await render(TEMPLATE);
      await click(selectors.toggleInput);

      assert.false(
        record.cyodRegistrationEnabled,
        'the record keeps the persisted value'
      );

      assert.dom(selectors.toggleInput).isNotChecked();
      assert.dom(selectors.deviceTable).doesNotExist();

      assert.strictEqual(
        this.notify.successMsg,
        t('cyod.registration.saved'),
        'confirms the change'
      );
    });

    test('toggling on persists the new value and reveals the device table', async function (assert) {
      assert.expect(5);

      const { record } = setupOrganization(
        this,
        'withCyodRegistrationDisabled'
      );

      this.server.put('/organizations/:id', (schema, req) => {
        const data = JSON.parse(req.requestBody);

        assert.true(data.cyod_registration_enabled);

        const organization = schema.organizations.find(req.params.id);
        organization.update(data);

        return organization.toJSON();
      });

      await render(TEMPLATE);
      await click(selectors.toggleInput);

      assert.true(record.cyodRegistrationEnabled);
      assert.dom(selectors.toggleInput).isChecked();
      assert.dom(selectors.deviceTable).exists();

      assert.strictEqual(this.notify.successMsg, t('cyod.registration.saved'));
    });

    test('the switch is disabled while the save is in flight', async function (assert) {
      setupOrganization(this, 'withCyodEnabled');

      this.server.put(
        '/organizations/:id',
        (schema, req) => {
          const organization = schema.organizations.find(req.params.id);
          organization.update(JSON.parse(req.requestBody));

          return organization.toJSON();
        },
        { timing: 150 }
      );

      await render(TEMPLATE);

      click(selectors.toggleInput);

      await waitFor(`${selectors.toggleInput}:disabled`, { timeout: 500 });
      assert.dom(selectors.toggleInput).isDisabled();

      await waitUntil(() => !find(selectors.toggleInput).disabled, {
        timeout: 1000,
      });

      assert.dom(selectors.toggleInput).isNotDisabled();
    });

    test('a failed save rolls the switch back and reports the error', async function (assert) {
      const { record } = setupOrganization(this, 'withCyodEnabled');

      this.server.put('/organizations/:id', () => ({ detail: 'Nope' }), 400);

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isChecked();

      await click(selectors.toggleInput);

      assert
        .dom(selectors.toggleInput)
        .isChecked('the switch returns to the persisted state');

      assert.true(
        record.cyodRegistrationEnabled,
        'the record is not left holding the rejected value'
      );

      assert.strictEqual(this.notify.errorMsg, 'Nope', 'surfaces the reason');
    });
  }
);

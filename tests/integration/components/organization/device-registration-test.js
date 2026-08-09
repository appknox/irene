import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
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

    test('it renders the CYOD registration switch turned on', async function (assert) {
      setupOrganization(this, 'cyodEnabled');

      await render(TEMPLATE);

      assert
        .dom(selectors.title)
        .hasText(t('cyod.registration.title'))
        .hasTagName('h5', 'title sits at the 16px section size');

      assert.dom(selectors.toggleInput).isChecked();

      assert
        .dom(selectors.description)
        .hasText(t('cyod.registration.description'));
    });

    test('it hides the device table when the switch is off', async function (assert) {
      setupOrganization(this, 'cyodRegistrationDisabled');

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isNotChecked();
      assert.dom(selectors.deviceTable).doesNotExist();
    });

    test('toggling off persists the new value on the organization', async function (assert) {
      const { record } = setupOrganization(this, 'cyodEnabled');

      await render(TEMPLATE);
      await click(selectors.toggleInput);

      const put = this.server.pretender.handledRequests.find(
        (r) => r.method === 'PUT'
      );

      assert.ok(put, 'saves the organization');

      assert.false(
        JSON.parse(put.requestBody).cyod_registration_enabled,
        'sends the value the switch was moved to, not its inverse'
      );

      assert.false(
        record.cyodRegistrationEnabled,
        'the record keeps the persisted value'
      );

      assert.strictEqual(
        this.notify.successMsg,
        t('cyod.registration.saved'),
        'confirms the change'
      );
    });

    test('a failed save rolls the switch back and reports the error', async function (assert) {
      const { record } = setupOrganization(this, 'cyodEnabled');

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

    test('it links to the account CYOD settings from the empty state', async function (assert) {
      setupOrganization(this, 'cyodEnabled');

      await render(TEMPLATE);

      assert.dom(selectors.deviceTableEmpty).exists();

      assert
        .dom(selectors.goToCyodSettings)
        .exists('points members at where they can register a device')
        .hasText(t('cyod.registration.goToCyodSettings'));
    });
  }
);

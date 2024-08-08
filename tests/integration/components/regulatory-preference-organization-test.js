import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render, click, find, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { Response } from 'miragejs';

import Service from '@ember/service';

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

module(
  'Integration | Component | regulatory-preference-organization',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      await this.server.createList('organization', 1);
      await this.owner.lookup('service:organization').load();

      this.owner.register('service:notifications', NotificationsStub);

      const preference = this.server.create('organization-preference');

      this.setProperties({ preference });
    });

    test('it renders regulatory preferences section correctly', async function (assert) {
      this.server.get('organizations/:id/preference', (schema) => {
        return schema.organizationPreferences.first().toJSON();
      });

      await render(hbs`<RegulatoryPreferenceOrganization />`);

      assert
        .dom('[data-test-preferences-title]')
        .hasText('t:regulatoryPreferences:()');

      assert
        .dom('[data-test-preferences-subtitle]')
        .hasText('t:regulatoryPreferencesChooseForAll:()');

      assert
        .dom('[data-test-preferences-desc]')
        .hasText('t:regulatoryPreferencesWarning:()');

      assert
        .dom(
          '[data-test-ak-form-label]',
          find('[data-test-preference="PCI-DSS"]')
        )
        .hasText('PCI-DSS');

      assert
        .dom(
          '[data-test-ak-form-label]',
          find('[data-test-preference="HIPAA"]')
        )
        .hasText('HIPAA');

      assert
        .dom('[data-test-ak-form-label]', find('[data-test-preference="GDPR"]'))
        .hasText('GDPR');

      assert
        .dom('[data-test-ak-form-label]', find('[data-test-preference="NIST"]'))
        .hasText('NIST');

      assert
        .dom('[data-test-ak-form-label]', find('[data-test-preference="SAMA"]'))
        .hasText('SAMA');
    });

    test('it renders regulatory list tooltip', async function (assert) {
      this.server.get('organizations/:id/preference', (schema) => {
        return schema.organizationPreferences.first().toJSON();
      });

      await render(hbs`<RegulatoryPreferenceOrganization />`);

      const pcidssContainer = find('[data-test-preference="PCI-DSS"]');
      const hipaaContainer = find('[data-test-preference="HIPAA"]');
      const gdprContainer = find('[data-test-preference="GDPR"]');
      const nistContainer = find('[data-test-preference="NIST"]');
      const samaContainer = find('[data-test-preference="SAMA"]');

      // pci-dss
      await triggerEvent(
        `#${pcidssContainer.id} [data-test-ak-tooltip-root]`,
        'mouseenter'
      );

      assert
        .dom('[data-test-ak-tooltip-content]')
        .hasText('t:pcidssExpansion:()');

      await triggerEvent(
        `#${pcidssContainer.id} [data-test-ak-tooltip-root]`,
        'mouseleave'
      );

      assert.dom('[data-test-ak-tooltip-content]').doesNotExist();

      // hipaa
      await triggerEvent(
        `#${hipaaContainer.id} [data-test-ak-tooltip-root]`,
        'mouseenter'
      );

      assert
        .dom('[data-test-ak-tooltip-content]')
        .hasText('t:hipaaExpansion:()');

      await triggerEvent(
        `#${hipaaContainer.id} [data-test-ak-tooltip-root]`,
        'mouseleave'
      );

      assert.dom('[data-test-ak-tooltip-content]').doesNotExist();

      // gdpr
      await triggerEvent(
        `#${gdprContainer.id} [data-test-ak-tooltip-root]`,
        'mouseenter'
      );

      assert
        .dom('[data-test-ak-tooltip-content]')
        .hasText('t:gdprExpansion:()');

      await triggerEvent(
        `#${gdprContainer.id} [data-test-ak-tooltip-root]`,
        'mouseleave'
      );

      assert.dom('[data-test-ak-tooltip-content]').doesNotExist();

      // nist
      await triggerEvent(
        `#${nistContainer.id} [data-test-ak-tooltip-root]`,
        'mouseenter'
      );

      assert
        .dom('[data-test-ak-tooltip-content]')
        .hasText('t:nistExpansion:()');

      await triggerEvent(
        `#${nistContainer.id} [data-test-ak-tooltip-root]`,
        'mouseleave'
      );

      assert.dom('[data-test-ak-tooltip-content]').doesNotExist();

      // sama
      await triggerEvent(
        `#${samaContainer.id} [data-test-ak-tooltip-root]`,
        'mouseenter'
      );

      assert
        .dom('[data-test-ak-tooltip-content]')
        .hasText('t:samaExpansion:()');

      await triggerEvent(
        `#${samaContainer.id} [data-test-ak-tooltip-root]`,
        'mouseleave'
      );

      assert.dom('[data-test-ak-tooltip-content]').doesNotExist();
    });

    test('it renders regulatory inclusion status based on organization preference', async function (assert) {
      this.server.get('organizations/:id/preference', (schema) => {
        const json = schema.organizationPreferences.first().toJSON();
        json.report_preference.show_pcidss = true;
        json.report_preference.show_hipaa = false;
        json.report_preference.show_gdpr = true;
        json.report_preference.show_nist = true;
        json.report_preference.show_sama = true;

        return json;
      });

      await render(hbs`<RegulatoryPreferenceOrganization />`);

      assert
        .dom(
          '[data-test-preference-checkbox]',
          find('[data-test-preference="PCI-DSS"]')
        )
        .isChecked();

      assert
        .dom(
          '[data-test-preference-checkbox]',
          find('[data-test-preference="HIPAA"]')
        )
        .isNotChecked();

      assert
        .dom(
          '[data-test-preference-checkbox]',
          find('[data-test-preference="GDPR"]')
        )
        .isChecked();

      assert
        .dom(
          '[data-test-preference-checkbox]',
          find('[data-test-preference="NIST"]')
        )
        .isChecked();

      assert
        .dom(
          '[data-test-preference-checkbox]',
          find('[data-test-preference="SAMA"]')
        )
        .isChecked();
    });

    test('it toggles regulatory preference on label click', async function (assert) {
      this.server.get('organizations/:id/preference', (schema) => {
        const json = schema.organizationPreferences.first().toJSON();
        json.report_preference.show_pcidss = false;
        json.report_preference.show_hipaa = false;
        json.report_preference.show_gdpr = false;
        json.report_preference.show_nist = false;
        json.report_preference.show_sama = false;

        return json;
      });

      this.server.put('organizations/:id/preference', (schema, request) => {
        const data = JSON.parse(request.requestBody);

        schema.organizationPreferences
          .find(request.params.id)
          .update(data)
          .toJSON();

        // TODO: need to figure out why passing response obj is not working
        return new Response(204);
      });

      await render(hbs`<RegulatoryPreferenceOrganization />`);

      const pcidssContainer = find('[data-test-preference="PCI-DSS"]');
      const hipaaContainer = find('[data-test-preference="HIPAA"]');
      const gdprContainer = find('[data-test-preference="GDPR"]');
      const nistContainer = find('[data-test-preference="NIST"]');
      const samaContainer = find('[data-test-preference="SAMA"]');

      assert
        .dom('[data-test-preference-checkbox]', pcidssContainer)
        .isNotDisabled()
        .isNotChecked();

      assert
        .dom('[data-test-preference-checkbox]', hipaaContainer)
        .isNotDisabled()
        .isNotChecked();

      assert
        .dom('[data-test-preference-checkbox]', gdprContainer)
        .isNotDisabled()
        .isNotChecked();

      assert
        .dom('[data-test-preference-checkbox]', nistContainer)
        .isNotDisabled()
        .isNotChecked();

      assert
        .dom('[data-test-preference-checkbox]', samaContainer)
        .isNotDisabled()
        .isNotChecked();

      await click(`#${pcidssContainer.id} [data-test-ak-form-label]`);

      assert
        .dom('[data-test-preference-checkbox]', pcidssContainer)
        .isChecked();

      await click(`#${hipaaContainer.id} [data-test-ak-form-label]`);

      assert.dom('[data-test-preference-checkbox]', hipaaContainer).isChecked();

      await click(`#${gdprContainer.id} [data-test-ak-form-label]`);

      assert.dom('[data-test-preference-checkbox]', gdprContainer).isChecked();

      await click(`#${nistContainer.id} [data-test-ak-form-label]`);

      assert.dom('[data-test-preference-checkbox]', nistContainer).isChecked();

      await click(`#${samaContainer.id} [data-test-ak-form-label]`);

      assert.dom('[data-test-preference-checkbox]', samaContainer).isChecked();

      await click(`#${pcidssContainer.id} [data-test-ak-form-label]`);

      assert
        .dom('[data-test-preference-checkbox]', pcidssContainer)
        .isNotChecked();

      await click(`#${hipaaContainer.id} [data-test-ak-form-label]`);

      assert
        .dom('[data-test-preference-checkbox]', hipaaContainer)
        .isNotChecked();

      await click(`#${gdprContainer.id} [data-test-ak-form-label]`);

      assert
        .dom('[data-test-preference-checkbox]', gdprContainer)
        .isNotChecked();

      await click(`#${nistContainer.id} [data-test-ak-form-label]`);

      assert
        .dom('[data-test-preference-checkbox]', nistContainer)
        .isNotChecked();

      await click(`#${samaContainer.id} [data-test-ak-form-label]`);

      assert
        .dom('[data-test-preference-checkbox]', samaContainer)
        .isNotChecked();
    });

    test('it does not toggle regulatory preference on error', async function (assert) {
      const errorObj = {
        report_preference: {
          non_field_errors: [
            'Invalid data. Expected a dictionary, but got str.',
          ],
        },
      };

      this.server.get('organizations/:id/preference', (schema) => {
        return schema.organizationPreferences.first().toJSON();
      });

      this.server.put('organizations/:id/preference', () => {
        return new Response(400, {}, errorObj);
      });

      await render(hbs`<RegulatoryPreferenceOrganization />`);

      const pref = this.preference.report_preference;
      const notify = this.owner.lookup('service:notifications');

      const pcidssContainer = find('[data-test-preference="PCI-DSS"]');
      const hipaaContainer = find('[data-test-preference="HIPAA"]');
      const gdprContainer = find('[data-test-preference="GDPR"]');
      const nistContainer = find('[data-test-preference="NIST"]');
      const samaContainer = find('[data-test-preference="SAMA"]');

      await click(`#${pcidssContainer.id} [data-test-ak-form-label]`);

      // no change to state
      assert
        .dom('[data-test-preference-checkbox]', pcidssContainer)
        [pref.show_pcidss ? 'isChecked' : 'isNotChecked']();

      assert.strictEqual(
        notify.errorMsg,
        errorObj.report_preference.non_field_errors[0]
      );

      notify.errorMsg = null;

      await click(`#${hipaaContainer.id} [data-test-ak-form-label]`);

      // no change to state
      assert
        .dom('[data-test-preference-checkbox]', hipaaContainer)
        [pref.show_hipaa ? 'isChecked' : 'isNotChecked']();

      assert.strictEqual(
        notify.errorMsg,
        errorObj.report_preference.non_field_errors[0]
      );

      notify.errorMsg = null;

      await click(`#${gdprContainer.id} [data-test-ak-form-label]`);

      // no change to state
      assert
        .dom('[data-test-preference-checkbox]', gdprContainer)
        [pref.show_gdpr ? 'isChecked' : 'isNotChecked']();

      assert.strictEqual(
        notify.errorMsg,
        errorObj.report_preference.non_field_errors[0]
      );

      notify.errorMsg = null;

      await click(`#${nistContainer.id} [data-test-ak-form-label]`);

      // no change to state
      assert
        .dom('[data-test-preference-checkbox]', nistContainer)
        [pref.show_nist ? 'isChecked' : 'isNotChecked']();

      assert.strictEqual(
        notify.errorMsg,
        errorObj.report_preference.non_field_errors[0]
      );

      notify.errorMsg = null;

      await click(`#${samaContainer.id} [data-test-ak-form-label]`);

      // no change to state
      assert
        .dom('[data-test-preference-checkbox]', samaContainer)
        [pref.show_sama ? 'isChecked' : 'isNotChecked']();

      assert.strictEqual(
        notify.errorMsg,
        errorObj.report_preference.non_field_errors[0]
      );
    });
  }
);

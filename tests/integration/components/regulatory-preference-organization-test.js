import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { underscore } from '@ember/string';
import { Response } from 'miragejs';

function serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).map((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });
  return serializedPayload;
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
    });

    test('it renders regulatory preferences section correctly', async function (assert) {
      this.server.create('organization-preference');
      this.server.get('organizations/:id/preference', (schema) => {
        return serializer(schema.organizationPreferences.first());
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
      assert.dom('[data-test-preferences-options]').exists();
    });

    test('it renders supported regulatory list', async function (assert) {
      this.server.create('organization-preference');
      this.server.get('organizations/:id/preference', (schema) => {
        return serializer(schema.organizationPreferences.first());
      });

      await render(hbs`<RegulatoryPreferenceOrganization />`);

      assert.dom('[data-test-preferences]').exists();

      assert.dom('[data-test-preference-pcidss]').exists();
      const pcidss = this.element.querySelector(
        '[data-test-preference-pcidss-label]'
      );
      assert.equal(pcidss.innerHTML.trim(), 'PCI-DSS');
      assert.equal(pcidss.getAttribute('title'), 't:pcidssExpansion:()');

      assert.dom('[data-test-preference-hipaa]').exists();
      const hipaa = this.element.querySelector(
        '[data-test-preference-hipaa-label]'
      );
      assert.equal(hipaa.innerHTML.trim(), 'HIPAA');
      assert.equal(hipaa.getAttribute('title'), 't:hipaaExpansion:()');

      assert.dom('[data-test-preference-gdpr]').exists();
      const gdpr = this.element.querySelector(
        '[data-test-preference-gdpr-label]'
      );
      assert.equal(gdpr.innerHTML.trim(), 'GDPR');
      assert.equal(gdpr.getAttribute('title'), 't:gdprExpansion:()');
    });

    test('it renders regulatory inclusion status based on organization preference', async function (assert) {
      this.server.create('organization-preference', {
        reportPreference: {
          show_pcidss: true,
          show_hipaa: false,
          show_gdpr: false,
        },
      });
      this.server.get('organizations/:id/preference', (schema, request) => {
        return serializer(
          schema.organizationPreferences.find(request.params.id)
        );
      });

      await render(hbs`<RegulatoryPreferenceOrganization />`);

      const pcidss = this.element.querySelector(
        '[data-test-preference-pcidss-checkbox]'
      );
      assert.true(pcidss.checked);

      const hipaa = this.element.querySelector(
        '[data-test-preference-hipaa-checkbox]'
      );

      assert.false(hipaa.checked);

      const gdpr = this.element.querySelector(
        '[data-test-preference-gdpr-checkbox]'
      );

      assert.false(gdpr.checked);
    });

    test('it toggles regulatory preference on label click', async function (assert) {
      const orgPrefs = this.server.create('organization-preference');
      this.server.get('organizations/:id/preference', (schema, request) => {
        return serializer(
          schema.organizationPreferences.find(request.params.id)
        );
      });

      this.server.put('organizations/:id/preference', (schema, request) => {
        const body = JSON.parse(request.requestBody);
        const pref = schema.organizationPreferences.find(request.params.id);
        pref.reportPreference = body.reportPreference;
        pref.save();
        return serializer(pref);
      });

      await render(hbs`<RegulatoryPreferenceOrganization />`);

      const pcidssInput = this.element.querySelector(
        '[data-test-preference-pcidss-checkbox]'
      );
      const pcidssLabel = this.element.querySelector(
        '[data-test-preference-pcidss-label]'
      );

      await click(pcidssLabel);
      assert.equal(pcidssInput.checked, !orgPrefs.reportPreference.show_pcidss);

      await click(pcidssLabel);
      assert.equal(pcidssInput.checked, orgPrefs.reportPreference.show_pcidss);
    });

    test('it updates regulatory preference on toggle', async function (assert) {
      const orgPrefs = this.server.create('organization-preference');
      this.server.get('organizations/:id/preference', (schema, request) => {
        return serializer(
          schema.organizationPreferences.find(request.params.id)
        );
      });

      this.server.put('organizations/:id/preference', (schema, request) => {
        const body = JSON.parse(request.requestBody);
        const pref = schema.organizationPreferences.find(request.params.id);
        pref.reportPreference = body.reportPreference;
        pref.save();
        return serializer(pref);
      });

      await render(hbs`<RegulatoryPreferenceOrganization />`);

      const pcidssInput = this.element.querySelector(
        '[data-test-preference-pcidss-checkbox]'
      );
      await click(pcidssInput);
      assert.equal(pcidssInput.checked, !orgPrefs.reportPreference.show_pcidss);

      const hipaaInput = this.element.querySelector(
        '[data-test-preference-hipaa-checkbox]'
      );
      await click(hipaaInput);
      assert.equal(hipaaInput.checked, !orgPrefs.reportPreference.show_hipaa);

      const gdprInput = this.element.querySelector(
        '[data-test-preference-gdpr-checkbox]'
      );
      await click(gdprInput);
      assert.equal(gdprInput.checked, !orgPrefs.reportPreference.show_gdpr);
    });

    test('it does not toggle regulatory preference on error', async function (assert) {
      this.server.create('organization-preference');
      this.server.get('organizations/:id/preference', (schema, request) => {
        return serializer(
          schema.organizationPreferences.find(request.params.id)
        );
      });

      this.server.put('organizations/:id/preference', () => {
        return new Response(
          400,
          {},
          {
            report_preference: {
              non_field_errors: [
                'Invalid data. Expected a dictionary, but got str.',
              ],
            },
          }
        );
      });

      await render(hbs`<RegulatoryPreferenceOrganization />`);

      const pcidssInput = this.element.querySelector(
        '[data-test-preference-pcidss-checkbox]'
      );
      const pcidssInitialValue = pcidssInput.checked;
      await click(pcidssInput);
      assert.equal(pcidssInput.checked, pcidssInitialValue);
      await click(pcidssInput);
      assert.equal(pcidssInput.checked, pcidssInitialValue);

      const hipaaInput = this.element.querySelector(
        '[data-test-preference-hipaa-checkbox]'
      );
      const hipaaInitialValue = hipaaInput.checked;
      await click(hipaaInput);
      assert.equal(hipaaInput.checked, hipaaInitialValue);

      const gdprInput = this.element.querySelector(
        '[data-test-preference-gdpr-checkbox]'
      );
      const gdprInitialValue = gdprInput.checked;
      await click(gdprInput);
      assert.equal(gdprInput.checked, gdprInitialValue);
    });
  }
);

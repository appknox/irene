import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { underscore } from '@ember/string';

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

    test('it renders preferences for all regulatory', async function (assert) {
      this.server.create('organization-preference');
      this.server.get('organizations/:id/preference', (schema) => {
        return serializer(schema.organizationPreferences.first());
      });

      await render(hbs`<RegulatoryPreferenceOrganization />`);

      assert.dom('[data-test-preferences]').exists();
      assert.dom('[data-test-preference-pcidss]').exists();
      assert.dom('[data-test-preference-hipaa]').exists();
      assert.dom('[data-test-preference-asvs]').exists();
      assert.dom('[data-test-preference-mstg]').exists();
      assert.dom('[data-test-preference-cwe]').exists();
      assert.dom('[data-test-preference-gdpr]').exists();
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
        '[data-test-pcidss-input]'
      );
      const pcidssLabel = this.element.querySelector(
        '[data-test-pcidss-label]'
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
        '[data-test-pcidss-input]'
      );
      await click(pcidssInput);
      assert.equal(pcidssInput.checked, !orgPrefs.reportPreference.show_pcidss);

      const hipaaInput = this.element.querySelector('[data-test-hipaa-input]');
      await click(hipaaInput);
      assert.equal(hipaaInput.checked, !orgPrefs.reportPreference.show_hipaa);

      const asvsInput = this.element.querySelector('[data-test-asvs-input]');
      await click(asvsInput);
      assert.equal(asvsInput.checked, !orgPrefs.reportPreference.show_asvs);

      const mstgInput = this.element.querySelector('[data-test-mstg-input]');
      await click(mstgInput);
      assert.equal(mstgInput.checked, !orgPrefs.reportPreference.show_mstg);

      const cweInput = this.element.querySelector('[data-test-cwe-input]');
      await click(cweInput);
      assert.equal(cweInput.checked, !orgPrefs.reportPreference.show_cwe);

      const gdprInput = this.element.querySelector('[data-test-gdpr-input]');
      await click(gdprInput);
      assert.equal(gdprInput.checked, !orgPrefs.reportPreference.show_gdpr);
    });
  }
);

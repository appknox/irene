import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { underscore } from '@ember/string';
import checkboxStyles from 'irene/components/tri-state-checkbox/index.scss';

function serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).map((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });
  return serializedPayload;
}

module(
  'Integration | Component | regulatory-preference-profile',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    test('it does not render component if project is not passed', async function (assert) {
      await render(hbs`<RegulatoryPreferenceProfile />`);
      assert.dom('[data-test-preferences]').doesNotExist();
    });

    test('it does not render component if profile does not exists for the project', async function (assert) {
      this.set(
        'project',
        this.server.create('project', 1, { activeProfileId: null })
      );
      await render(
        hbs`<RegulatoryPreferenceProfile @project={{this.project}} />`
      );
      assert.dom('[data-test-preferences]').doesNotExist();

      this.set(
        'profile',
        this.server.create('project', 1, { activeProfileId: 100 })
      );
      await render(
        hbs`<RegulatoryPreferenceProfile @project={{this.project}} />`
      );
      assert.dom('[data-test-preferences]').doesNotExist();
    });

    test('it renders preferences for all regulatory', async function (assert) {
      const projects = this.server.createList('project', 1, {
        activeProfileId: 1,
      });
      this.set('project', projects[0]);

      this.server.createList('profile', 1);
      this.server.get('profiles/:id', (schema) => {
        return serializer(schema['profiles'].find(1));
      });

      await render(
        hbs`<RegulatoryPreferenceProfile @project={{this.project}}/>`
      );

      assert.dom('[data-test-preference-pcidss]').hasText('PCI-DSS');
      assert.dom('[data-test-preference-hipaa]').hasText('HIPAA');
      assert.dom('[data-test-preference-asvs]').hasText('ASVS');
      assert.dom('[data-test-preference-mstg]').hasText('MSTG');
      assert.dom('[data-test-preference-cwe]').hasText('CWE');
      assert.dom('[data-test-preference-gdpr]').hasText('GDPR');
    });

    test('it toggles preference value for the corresponding regulatory on click', async function (assert) {
      const projects = this.server.createList('project', 1, {
        activeProfileId: 1,
      });
      this.set('project', projects[0]);

      const profiles = this.server.createList('profile', 1, {
        reportPreference: {
          show_pcidss: {
            value: true,
            is_inherited: false,
          },
          show_hipaa: {
            value: true,
            is_inherited: false,
          },
          show_asvs: {
            value: true,
            is_inherited: true,
          },
          show_mstg: {
            value: true,
            is_inherited: true,
          },
          show_cwe: {
            value: false,
            is_inherited: false,
          },
          show_gdpr: {
            value: false,
            is_inherited: false,
          },
        },
      });
      const profile = profiles[0];

      this.server.get('profiles/:id', (schema) => {
        return serializer(schema['profiles'].find(1));
      });

      this.server.put('profiles/:id/show_pcidss', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        const profile = schema['profiles'].find(request.params.id);
        profile.reportPreference.show_pcidss = {
          value: body.value,
          is_inherited: false,
        };
        profile.save();

        return profile.reportPreference.show_pcidss;
      });

      this.server.put('profiles/:id/show_hipaa', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        const profile = schema['profiles'].find(request.params.id);
        profile.reportPreference.show_hipaa = {
          value: body.value,
          is_inherited: false,
        };
        profile.save();

        return profile.reportPreference.show_hipaa;
      });

      this.server.put('profiles/:id/show_asvs', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        const profile = schema['profiles'].find(request.params.id);
        profile.reportPreference.show_asvs = {
          value: body.value,
          is_inherited: false,
        };
        profile.save();

        return profile.reportPreference.show_asvs;
      });

      this.server.put('profiles/:id/show_mstg', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        const profile = schema['profiles'].find(request.params.id);
        profile.reportPreference.show_mstg = {
          value: body.value,
          is_inherited: false,
        };
        profile.save();

        return profile.reportPreference.show_mstg;
      });

      this.server.put('profiles/:id/show_cwe', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        const profile = schema['profiles'].find(request.params.id);
        profile.reportPreference.show_cwe = {
          value: body.value,
          is_inherited: false,
        };
        profile.save();

        return profile.reportPreference.show_cwe;
      });

      this.server.put('profiles/:id/show_gdpr', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        const profile = schema['profiles'].find(request.params.id);
        profile.reportPreference.show_gdpr = {
          value: body.value,
          is_inherited: false,
        };
        profile.save();

        return profile.reportPreference.show_gdpr;
      });

      await render(
        hbs`<RegulatoryPreferenceProfile @project={{this.project}}/>`
      );

      const pcidss = this.element.querySelector(
        '[data-test-preference-pcidss]'
      );
      const pcidssInitialValue = profile.reportPreference.show_pcidss.value;
      const pcidssInput = pcidss.querySelector('[data-test-input]');
      assert.equal(pcidssInput.checked, pcidssInitialValue);
      await click(pcidssInput);
      assert.equal(pcidssInput.checked, !pcidssInitialValue);

      const hipaa = this.element.querySelector('[data-test-preference-hipaa]');
      const hipaaInitialValue = profile.reportPreference.show_hipaa.value;
      const hipaaInput = hipaa.querySelector('[data-test-input]');
      assert.equal(hipaaInput.checked, hipaaInitialValue);
      await click(hipaaInput);
      assert.equal(hipaaInput.checked, !hipaaInitialValue);

      const asvs = this.element.querySelector('[data-test-preference-asvs]');
      const asvsInitialValue = profile.reportPreference.show_asvs.value;
      const asvsInput = asvs.querySelector('[data-test-input]');
      assert.equal(asvsInput.checked, asvsInitialValue);
      await click(asvsInput);
      assert.equal(asvsInput.checked, !asvsInitialValue);

      const mstg = this.element.querySelector('[data-test-preference-mstg]');
      const mstgInitialValue = profile.reportPreference.show_mstg.value;
      const mstgInput = mstg.querySelector('[data-test-input]');
      assert.equal(mstgInput.checked, mstgInitialValue);
      await click(mstgInput);
      assert.equal(mstgInput.checked, !mstgInitialValue);

      const cwe = this.element.querySelector('[data-test-preference-cwe]');
      const cweInitialValue = profile.reportPreference.show_cwe.value;
      const cweInput = cwe.querySelector('[data-test-input]');
      assert.equal(cweInput.checked, cweInitialValue);
      await click(cweInput);
      assert.equal(cweInput.checked, !cweInitialValue);

      const gdpr = this.element.querySelector('[data-test-preference-gdpr]');
      const gdprInitialValue = profile.reportPreference.show_gdpr.value;
      const gdprInput = gdpr.querySelector('[data-test-input]');
      assert.equal(gdprInput.checked, gdprInitialValue);
      await click(gdprInput);
      assert.equal(gdprInput.checked, !gdprInitialValue);
    });

    test('it displays overridden state with reset button if a preference is updated', async function (assert) {
      const projects = this.server.createList('project', 1, {
        activeProfileId: 1,
      });
      this.set('project', projects[0]);

      this.server.createList('profile', 1, {
        reportPreference: {
          show_pcidss: {
            value: false,
            is_inherited: true,
          },
        },
      });
      this.server.get('profiles/:id', (schema) => {
        return serializer(schema['profiles'].find(1));
      });

      this.server.put('profiles/:id/show_pcidss', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        const profile = schema['profiles'].find(request.params.id);
        profile.reportPreference.show_pcidss = {
          value: body.value,
          is_inherited: false,
        };
        profile.save();

        return profile.reportPreference.show_pcidss;
      });

      await render(
        hbs`<RegulatoryPreferenceProfile @project={{this.project}}/>`
      );

      let pcidss = this.element.querySelector('[data-test-preference-pcidss]');
      let pcidssInput = pcidss.querySelector('[data-test-input]');
      let pcidssCheck = pcidss.querySelector('[data-test-check]');

      assert.equal(pcidssInput.checked, false);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['inherited']));
      assert.equal(pcidss.querySelector('[data-test-reset]'), null);

      await click(pcidssInput);
      assert.equal(pcidssInput.checked, true);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['overridden']));
      assert.notEqual(pcidss.querySelector('[data-test-reset]'), null);

      await click(pcidssInput);
      assert.equal(pcidssInput.checked, false);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['overridden']));
      assert.notEqual(pcidss.querySelector('[data-test-reset]'), null);
    });

    test('it dismisses overridden state on reset button click', async function (assert) {
      const projects = this.server.createList('project', 1, {
        activeProfileId: 1,
      });
      this.set('project', projects[0]);

      this.server.createList('profile', 1, {
        reportPreference: {
          show_pcidss: {
            value: true,
            is_inherited: false,
          },
        },
      });
      this.server.get('profiles/:id', (schema) => {
        return serializer(schema['profiles'].find(1));
      });

      this.server.delete('profiles/:id/show_pcidss', (schema, request) => {
        const profile = schema['profiles'].find(request.params.id);
        profile.reportPreference.show_pcidss = {
          value: false,
          is_inherited: true,
        };
        profile.save();

        return profile.reportPreference.show_pcidss;
      });

      await render(
        hbs`<RegulatoryPreferenceProfile @project={{this.project}}/>`
      );

      let pcidss = this.element.querySelector('[data-test-preference-pcidss]');
      let pcidssCheck = pcidss.querySelector('[data-test-check]');
      let pcidssInput = pcidss.querySelector('[data-test-input]');
      let pcidssReset = pcidss.querySelector('[data-test-reset]');

      assert.equal(pcidssInput.checked, true);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['overridden']));
      assert.notEqual(pcidssReset, null);

      await click(pcidssReset);

      assert.equal(pcidssInput.checked, false);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['inherited']));
      assert.equal(pcidss.querySelector('[data-test-reset]'), null);
    });
  }
);

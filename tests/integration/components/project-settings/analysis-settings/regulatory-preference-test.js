import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { underscore } from '@ember/string';
import { Response } from 'miragejs';
import checkboxStyles from 'irene/components/tri-state-checkbox/index.scss';

function serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).map((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });
  return serializedPayload;
}

module(
  'Integration | Component | project-settings/analysis-settings/regulatory-preference',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    test('it does not render component if project is not passed', async function (assert) {
      await render(
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference />`
      );

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-regulatoryPreferences-root]'
        )
        .doesNotExist();
    });

    test('it does not render component if profile does not exists for the project', async function (assert) {
      this.set(
        'project',
        this.server.create('project', 1, { activeProfileId: null })
      );

      this.server.get('profiles/:id', (schema, request) => {
        return serializer(schema['profiles'].find(request.params.id));
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}} />`
      );

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-regulatoryPreferences-root]'
        )
        .doesNotExist();

      const profile = this.server.create('profile', 1);

      this.project = this.server.create('project', {
        activeProfileId: profile.id,
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}} />`
      );

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-regulatoryPreferences-root]'
        )
        .exists();
    });

    test('it renders regulatory preferences section correctly', async function (assert) {
      const profile = this.server.create('profile');
      const project = this.server.create('project', {
        activeProfileId: profile.id,
      });

      this.set('project', project);

      this.server.get('profiles/:id', (schema, request) => {
        return serializer(schema['profiles'].find(request.params.id));
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}}/>`
      );

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-regulatoryPreferences-title]'
        )
        .hasText('t:regulatoryPreferences:()');

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-regulatoryPreferences-desc]'
        )
        .hasText(
          't:regulatoryPreferencesChooseForProfile:() t:regulatoryPreferencesWarning:()'
        );

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-regulatoryPreferences-note]'
        )
        .hasText('(t:regulatoryPreferencesProfileNote:())');

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-regulatoryPreferences-options]'
        )
        .exists();
    });

    test('it renders preferences for optional regulatories', async function (assert) {
      const profile = this.server.create('profile');
      const project = this.server.create('project', {
        activeProfileId: profile.id,
      });
      this.set('project', project);

      this.server.get('profiles/:id', (schema, request) => {
        return serializer(schema['profiles'].find(request.params.id));
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}}/>`
      );

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-regulatoryPreferences-pcidss]'
        )
        .hasText('t:pcidss:()');

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-regulatoryPreferences-hipaa]'
        )
        .hasText('t:hipaa:()');

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-regulatoryPreferences-gdpr]'
        )
        .hasText('t:gdpr:()');
    });

    test('it toggles preference value for the corresponding regulatory on click', async function (assert) {
      const profile = this.server.create('profile', {
        reportPreference: {
          show_pcidss: {
            value: true,
            is_inherited: false,
          },
          show_hipaa: {
            value: true,
            is_inherited: false,
          },
          show_gdpr: {
            value: false,
            is_inherited: false,
          },
        },
      });
      const project = this.server.create('project', {
        activeProfileId: profile.id,
      });

      this.set('project', project);

      this.server.get('profiles/:id', (schema, request) => {
        return serializer(schema['profiles'].find(request.params.id));
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
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}}/>`
      );

      const pcidss = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences-pcidss]'
      );
      const pcidssInitialValue = profile.reportPreference.show_pcidss.value;
      const pcidssInput = pcidss.querySelector('[data-test-input]');
      assert.strictEqual(pcidssInput.checked, pcidssInitialValue);
      await click(pcidssInput);
      assert.strictEqual(pcidssInput.checked, !pcidssInitialValue);

      const hipaa = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences-hipaa]'
      );
      const hipaaInitialValue = profile.reportPreference.show_hipaa.value;
      const hipaaInput = hipaa.querySelector('[data-test-input]');
      assert.strictEqual(hipaaInput.checked, hipaaInitialValue);
      await click(hipaaInput);
      assert.strictEqual(hipaaInput.checked, !hipaaInitialValue);

      const gdpr = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences-gdpr]'
      );

      const gdprInitialValue = profile.reportPreference.show_gdpr.value;
      const gdprInput = gdpr.querySelector('[data-test-input]');
      assert.strictEqual(gdprInput.checked, gdprInitialValue);
      await click(gdprInput);
      assert.strictEqual(gdprInput.checked, !gdprInitialValue);
    });

    test('it does not toggle preference value on error', async function (assert) {
      const profile = this.server.create('profile');
      const project = this.server.create('project', {
        activeProfileId: profile.id,
      });
      this.set('project', project);

      this.server.get('profiles/:id', (schema, request) => {
        return serializer(schema['profiles'].find(request.params.id));
      });

      this.server.put('profiles/:id/show_pcidss', () => {
        return new Response(400, {}, { value: ['Must be a valid boolean.'] });
      });

      this.server.put('profiles/:id/show_hipaa', () => {
        return new Response(400, {}, { value: ['Must be a valid boolean.'] });
      });

      this.server.put('profiles/:id/show_gdpr', () => {
        return new Response(400, {}, { value: ['Must be a valid boolean.'] });
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}}/>`
      );

      const pcidss = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences-pcidss]'
      );
      const pcidssInitialValue = profile.reportPreference.show_pcidss.value;
      const pcidssInput = pcidss.querySelector('[data-test-input]');
      assert.strictEqual(pcidssInput.checked, pcidssInitialValue);
      await click(pcidssInput);
      assert.strictEqual(pcidssInput.checked, pcidssInitialValue);
      await click(pcidssInput);
      assert.strictEqual(pcidssInput.checked, pcidssInitialValue);

      const hipaa = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences-hipaa]'
      );
      const hipaaInitialValue = profile.reportPreference.show_hipaa.value;
      const hipaaInput = hipaa.querySelector('[data-test-input]');
      assert.strictEqual(hipaaInput.checked, hipaaInitialValue);
      await click(hipaaInput);
      assert.strictEqual(hipaaInput.checked, hipaaInitialValue);

      const gdpr = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences-gdpr]'
      );
      const gdprInitialValue = profile.reportPreference.show_gdpr.value;
      const gdprInput = gdpr.querySelector('[data-test-input]');
      assert.strictEqual(gdprInput.checked, gdprInitialValue);
      await click(gdprInput);
      assert.strictEqual(gdprInput.checked, gdprInitialValue);
    });

    test('it displays overridden state with reset button if a preference is updated', async function (assert) {
      const profile = this.server.create('profile', {
        reportPreference: {
          show_pcidss: {
            value: false,
            is_inherited: true,
          },
        },
      });
      const project = this.server.create('project', {
        activeProfileId: profile.id,
      });
      this.set('project', project);

      this.server.get('profiles/:id', (schema, request) => {
        return serializer(schema['profiles'].find(request.params.id));
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
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}}/>`
      );

      let pcidss = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences-pcidss]'
      );
      let pcidssInput = pcidss.querySelector('[data-test-input]');
      let pcidssCheck = pcidss.querySelector('[data-test-check]');

      assert.false(pcidssInput.checked);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['inherited']));
      assert.strictEqual(pcidss.querySelector('[data-test-reset]'), null);

      await click(pcidssInput);
      assert.true(pcidssInput.checked);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['overridden']));
      assert.notEqual(pcidss.querySelector('[data-test-reset]'), null);

      await click(pcidssInput);
      assert.false(pcidssInput.checked);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['overridden']));
      assert.notEqual(pcidss.querySelector('[data-test-reset]'), null);
    });

    test('it dismisses overridden state on reset button click', async function (assert) {
      const profile = this.server.create('profile', {
        reportPreference: {
          show_pcidss: {
            value: true,
            is_inherited: false,
          },
        },
      });
      const project = this.server.create('project', {
        activeProfileId: profile.id,
      });
      this.set('project', project);

      this.server.get('profiles/:id', (schema, request) => {
        return serializer(schema['profiles'].find(request.params.id));
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
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}}/>`
      );

      let pcidss = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences-pcidss]'
      );
      let pcidssCheck = pcidss.querySelector('[data-test-check]');
      let pcidssInput = pcidss.querySelector('[data-test-input]');
      let pcidssReset = pcidss.querySelector('[data-test-reset]');

      assert.true(pcidssInput.checked);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['overridden']));
      assert.notEqual(pcidssReset, null);

      await click(pcidssReset);

      assert.false(pcidssInput.checked);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['inherited']));
      assert.strictEqual(pcidss.querySelector('[data-test-reset]'), null);
    });
  }
);

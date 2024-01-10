import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import checkboxStyles from 'irene/components/tri-state-checkbox/index.scss';

module(
  'Integration | Component | project-settings/analysis-settings/regulatory-preference',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      // Store service
      this.store = this.owner.lookup('service:store');
    });

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
        this.server.create('project', 1, { active_profile_id: null })
      );

      this.server.get('profiles/:id', (schema, request) => {
        return schema['profiles'].find(request.params.id).toJSON();
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

      const project = this.server.create('project', {
        active_profile_id: profile.id,
      });

      this.set(
        'project',
        this.store.push(this.store.normalize('project', project.toJSON()))
      );

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
        active_profile_id: profile.id,
      });

      this.set(
        'project',
        this.store.push(this.store.normalize('project', project.toJSON()))
      );

      this.server.get('profiles/:id', (schema, request) => {
        return schema['profiles'].find(request.params.id).toJSON();
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
        active_profile_id: profile.id,
      });

      this.set(
        'project',
        this.store.push(this.store.normalize('project', project.toJSON()))
      );

      this.server.get('profiles/:id', (schema, request) => {
        return schema['profiles'].find(request.params.id).toJSON();
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}}/>`
      );

      const optionalRegulatoriesLabels = [
        't:pcidss:()',
        't:hipaa:()',
        't:gdpr:()',
        't:nist:()',
      ];

      optionalRegulatoriesLabels.map((regLabel) =>
        assert
          .dom(
            `[data-test-projectSetting-analysisSettings-regulatoryPreferences="${regLabel}"]`
          )
          .hasText(regLabel)
      );
    });

    test('it toggles preference value for the corresponding regulatory on click', async function (assert) {
      const profile = this.server.create('profile', {
        report_preference: {
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
          show_nist: {
            value: false,
            is_inherited: false,
          },
        },
      });

      const project = this.server.create('project', {
        active_profile_id: profile.id,
      });

      this.set(
        'project',
        this.store.push(this.store.normalize('project', project.toJSON()))
      );

      this.server.get('profiles/:id', (schema, request) => {
        return schema['profiles'].find(request.params.id).toJSON();
      });

      this.server.put('profiles/:id/show_pcidss', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        const profile = schema['profiles'].find(request.params.id);
        profile.report_preference.show_pcidss = {
          value: body.value,
          is_inherited: false,
        };
        profile.save();

        return profile.report_preference.show_pcidss;
      });

      this.server.put('profiles/:id/show_hipaa', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        const profile = schema['profiles'].find(request.params.id);
        profile.report_preference.show_hipaa = {
          value: body.value,
          is_inherited: false,
        };
        profile.save();

        return profile.report_preference.show_hipaa;
      });

      this.server.put('profiles/:id/show_gdpr', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        const profile = schema['profiles'].find(request.params.id);
        profile.report_preference.show_gdpr = {
          value: body.value,
          is_inherited: false,
        };
        profile.save();

        return profile.report_preference.show_gdpr;
      });

      this.server.put('profiles/:id/show_nist', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        const profile = schema['profiles'].find(request.params.id);
        profile.report_preference.show_nist = {
          value: body.value,
          is_inherited: false,
        };
        profile.save();

        return profile.report_preference.show_nist;
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}}/>`
      );

      const pcidss = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:pcidss:()"]'
      );
      const pcidssInitialValue = profile.report_preference.show_pcidss.value;
      const pcidssInput = pcidss.querySelector('[data-test-input]');
      assert.strictEqual(pcidssInput.checked, pcidssInitialValue);
      await click(pcidssInput);
      assert.strictEqual(pcidssInput.checked, !pcidssInitialValue);

      const hipaa = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:hipaa:()"]'
      );
      const hipaaInitialValue = profile.report_preference.show_hipaa.value;
      const hipaaInput = hipaa.querySelector('[data-test-input]');
      assert.strictEqual(hipaaInput.checked, hipaaInitialValue);
      await click(hipaaInput);
      assert.strictEqual(hipaaInput.checked, !hipaaInitialValue);

      const gdpr = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:gdpr:()"]'
      );

      const gdprInitialValue = profile.report_preference.show_gdpr.value;
      const gdprInput = gdpr.querySelector('[data-test-input]');
      assert.strictEqual(gdprInput.checked, gdprInitialValue);
      await click(gdprInput);
      assert.strictEqual(gdprInput.checked, !gdprInitialValue);

      const nist = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:nist:()"]'
      );

      const nistInitialValue = profile.report_preference.show_nist.value;
      const nistInput = nist.querySelector('[data-test-input]');
      assert.strictEqual(nistInput.checked, nistInitialValue);
      await click(nistInput);
      assert.strictEqual(gdprInput.checked, !nistInitialValue);
    });

    test('it does not toggle preference value on error', async function (assert) {
      const profile = this.server.create('profile', {
        report_preference: {
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
          show_nist: {
            value: false,
            is_inherited: false,
          },
        },
      });

      const project = this.server.create('project', {
        active_profile_id: profile.id,
      });

      this.set(
        'project',
        this.store.push(this.store.normalize('project', project.toJSON()))
      );

      this.server.get('profiles/:id', (schema, request) => {
        return schema['profiles'].find(request.params.id).toJSON();
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

      this.server.put('profiles/:id/show_nist', () => {
        return new Response(400, {}, { value: ['Must be a valid boolean.'] });
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}}/>`
      );

      const pcidss = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:pcidss:()"]'
      );
      const pcidssInitialValue = profile.report_preference.show_pcidss.value;
      const pcidssInput = pcidss.querySelector('[data-test-input]');
      assert.strictEqual(pcidssInput.checked, pcidssInitialValue);

      await click(pcidssInput);
      assert.strictEqual(pcidssInput.checked, pcidssInitialValue);

      const hipaa = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:hipaa:()"]'
      );
      const hipaaInitialValue = profile.report_preference.show_hipaa.value;
      const hipaaInput = hipaa.querySelector('[data-test-input]');
      assert.strictEqual(hipaaInput.checked, hipaaInitialValue);
      await click(hipaaInput);
      assert.strictEqual(hipaaInput.checked, hipaaInitialValue);

      const gdpr = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:gdpr:()"]'
      );
      const gdprInitialValue = profile.report_preference.show_gdpr.value;
      const gdprInput = gdpr.querySelector('[data-test-input]');
      assert.strictEqual(gdprInput.checked, gdprInitialValue);
      await click(gdprInput);
      assert.strictEqual(gdprInput.checked, gdprInitialValue);

      const nist = this.element.querySelector(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:nist:()"]'
      );
      const nistInitialValue = profile.report_preference.show_nist.value;
      const nistInput = nist.querySelector('[data-test-input]');
      assert.strictEqual(nistInput.checked, nistInitialValue);
      await click(nistInput);
      assert.strictEqual(nistInput.checked, nistInitialValue);
    });

    test('it displays overridden state with reset button if a preference is updated', async function (assert) {
      const profile = this.server.create('profile', {
        report_preference: {
          show_pcidss: {
            value: false,
            is_inherited: true,
          },
        },
      });
      const project = this.server.create('project', {
        active_profile_id: profile.id,
      });

      this.set(
        'project',
        this.store.push(this.store.normalize('project', project.toJSON()))
      );

      this.server.get('profiles/:id', (schema, request) => {
        return schema['profiles'].find(request.params.id).toJSON();
      });

      this.server.put('profiles/:id/show_pcidss', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        const profile = schema['profiles'].find(request.params.id);
        const updatedValue = { value: body.value, is_inherited: false };

        profile.report_preference.show_pcidss = updatedValue;
        profile.save();

        return updatedValue;
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}}/>`
      );

      let pcidss = find(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:pcidss:()"]'
      );

      let pcidssCheck = pcidss.querySelector('[data-test-check]');
      let pcidssInput = pcidss.querySelector('[data-test-checkbox]');

      assert.false(pcidssInput.checked);
      assert.false(pcidssCheck.classList.contains(checkboxStyles['overriden']));
      assert.strictEqual(pcidss.querySelector('[data-test-reset]'), null);

      await click(pcidssInput);

      pcidss = find(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:pcidss:()"]'
      );
      pcidssCheck = pcidss.querySelector('[data-test-check]');
      pcidssInput = pcidss.querySelector('[data-test-input]');

      assert.true(pcidssInput.checked);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['overridden']));
      assert.notEqual(pcidss.querySelector('[data-test-reset]'), null);

      await click(pcidssInput);

      pcidss = find(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:pcidss:()"]'
      );
      pcidssCheck = pcidss.querySelector('[data-test-check]');
      pcidssInput = pcidss.querySelector('[data-test-input]');

      assert.false(pcidssInput.checked);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['overridden']));
      assert.notEqual(pcidss.querySelector('[data-test-reset]'), null);
    });

    test('it dismisses overridden state on reset button click', async function (assert) {
      const profile = this.server.create('profile', {
        report_preference: {
          show_pcidss: {
            value: true,
            is_inherited: false,
          },
        },
      });
      const project = this.server.create('project', {
        active_profile_id: profile.id,
      });

      this.set(
        'project',
        this.store.push(this.store.normalize('project', project.toJSON()))
      );

      this.server.get('profiles/:id', (schema, request) => {
        return schema['profiles'].find(request.params.id).toJSON();
      });

      this.server.delete('profiles/:id/show_pcidss', (schema, request) => {
        const profile = schema['profiles'].find(request.params.id);
        const resetValue = { value: false, is_inherited: true };

        profile.report_preference.show_pcidss = resetValue;
        profile.save();

        return resetValue;
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::RegulatoryPreference @project={{this.project}}/>`
      );

      let pcidss = find(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:pcidss:()"]'
      );
      let pcidssCheck = pcidss.querySelector('[data-test-check]');
      let pcidssInput = pcidss.querySelector('[data-test-input]');
      let pcidssReset = pcidss.querySelector('[data-test-reset]');

      assert.true(pcidssInput.checked);
      assert.true(pcidssCheck.classList.contains(checkboxStyles['overridden']));
      assert.notEqual(pcidssReset, null);

      await click(pcidssReset);

      pcidss = find(
        '[data-test-projectSetting-analysisSettings-regulatoryPreferences="t:pcidss:()"]'
      );
      pcidssCheck = pcidss.querySelector('[data-test-check]');
      pcidssInput = pcidss.querySelector('[data-test-input]');

      assert.false(pcidssInput.checked);
      assert.strictEqual(pcidss.querySelector('[data-test-reset]'), null);
    });
  }
);

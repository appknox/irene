import { underscore } from '@ember/string';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

function profile_serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).forEach((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });

  return serializedPayload;
}

module(
  'Integration | Component | project-settings/analysis-settings/report-preference',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.project = this.server.create('project', {
        activeProfileId: 1,
        isManualScanAvailable: true,
      });

      this.server.get('/profiles/:id/', (schema, req) => {
        return profile_serializer(schema['profiles'].find(req.params.id));
      });

      //Common Selectors
      const dynamicScanCheckbox =
        '[data-test-projectSetting-analysisSettings-reportPreference="t:dynamicScan:()"]';

      const manualScanCheckbox =
        '[data-test-projectSetting-analysisSettings-reportPreference="t:manualScan:()"]';

      const apiScanCheckbox =
        '[data-test-projectSetting-analysisSettings-reportPreference="t:apiScan:()"]';

      this.setProperties({
        dynamicScanCheckbox,
        manualScanCheckbox,
        apiScanCheckbox,
      });
    });

    test('it renders', async function (assert) {
      this.server.create('profile');

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-reportPreference-headerText]'
        )
        .exists()
        .hasText('t:reportPreferences:()');

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-reportPreference-headerDesc]'
        )
        .exists()
        .hasText('t:reportPreferencesChooseTypes:()');

      assert.dom(this.dynamicScanCheckbox).exists();

      assert.dom(this.manualScanCheckbox).exists();

      assert.dom(this.apiScanCheckbox).exists();
    });

    test('dynamic scan preference is checked if show_dynamic_scan report preference value is "true"', async function (assert) {
      const report_preference = {
        show_dynamic_scan: true,
      };

      this.profile = this.server.create('profile', {
        report_preference,
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );
      assert.dom(this.dynamicScanCheckbox).isChecked();
    });

    test('dynamic scan preference is not checked if show_dynamic_scan report preference value is "false"', async function (assert) {
      const report_preference = {
        show_dynamic_scan: false,
      };

      this.profile = this.server.create('profile', {
        report_preference,
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );

      assert.dom(this.dynamicScanCheckbox).isNotChecked();
    });

    test('it toggles dynamic scan preference when dynamic scan checkbox is clicked', async function (assert) {
      const report_preference = {
        show_dynamic_scan: true,
      };

      this.profile = this.server.create('profile', {
        report_preference,
      });

      this.server.put('profiles/:id/report_preference', (schema, request) => {
        const profile = schema['profiles'].find(request.params.id);

        profile.report_preference.show_dynamic_scan =
          !profile.report_preference.show_dynamic_scan;
        profile.save();

        return profile.report_preference.show_dynamic_scan;
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );

      await click(this.dynamicScanCheckbox);

      assert.dom(this.dynamicScanCheckbox).isNotChecked();

      await click(this.dynamicScanCheckbox);

      assert.dom(this.dynamicScanCheckbox).isChecked();
    });

    test('manual scan preference is checked if show_manual_scan report preference value is "true"', async function (assert) {
      let report_preference = {
        show_manual_scan: true,
      };

      this.profile = this.server.create('profile', {
        report_preference,
      });

      this.server.get('/profiles/:id/', (schema, req) => {
        return profile_serializer(schema['profiles'].find(req.params.id));
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );

      assert.dom(this.manualScanCheckbox).isChecked();
    });

    test('manual scan preference is not checked if show_manual_scan report preference value is "false"', async function (assert) {
      const report_preference = {
        show_manual_scan: false,
      };

      this.profile = this.server.create('profile', {
        report_preference,
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );

      assert.dom(this.manualScanCheckbox).isNotChecked();
    });

    test('it toggles manual scan preference when manual scan checkbox is clicked', async function (assert) {
      const report_preference = {
        show_manual_scan: false,
      };

      this.profile = this.server.create('profile', {
        report_preference,
      });

      this.server.put('profiles/:id/report_preference', (schema, request) => {
        const profile = schema['profiles'].find(request.params.id);

        profile.report_preference.show_manual_scan =
          !profile.report_preference.show_manual_scan;
        profile.save();

        return profile.report_preference.show_manual_scan;
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );

      await click(this.manualScanCheckbox);

      assert.dom(this.manualScanCheckbox).isChecked();

      await click(this.manualScanCheckbox);

      assert.dom(this.manualScanCheckbox).isNotChecked();
    });

    test('api scan preference is checked if show_api_scan report preference value is "true"', async function (assert) {
      let report_preference = {
        show_api_scan: true,
      };

      this.profile = this.server.create('profile', {
        report_preference,
      });

      this.server.get('/profiles/:id/', (schema, req) => {
        return profile_serializer(schema['profiles'].find(req.params.id));
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );

      assert.dom(this.apiScanCheckbox).isChecked();
    });

    test('api scan preference is not checked if show_api_scan report preference value is "false"', async function (assert) {
      const report_preference = {
        show_api_scan: false,
      };

      this.profile = this.server.create('profile', {
        report_preference,
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );

      assert.dom(this.apiScanCheckbox).isNotChecked();
    });

    test('it toggles api scan preference when api scan checkbox is clicked', async function (assert) {
      const report_preference = {
        show_api_scan: true,
      };

      this.profile = this.server.create('profile', {
        report_preference,
      });

      this.server.put('profiles/:id/report_preference', (schema, request) => {
        const profile = schema['profiles'].find(request.params.id);

        profile.report_preference.show_api_scan =
          !profile.report_preference.show_api_scan;
        profile.save();

        return profile.report_preference.show_api_scan;
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );

      await click(this.apiScanCheckbox);

      assert.dom(this.apiScanCheckbox).isNotChecked();

      await click(this.apiScanCheckbox);

      assert.dom(this.apiScanCheckbox).isChecked();
    });

    test('it hides manual scan preference when manual scan is disabled', async function (assert) {
      this.project.isManualScanAvailable = false;
      this.profile = this.server.create('profile');

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-reportPreference-manualScanContainer]'
        )
        .doesNotExist();
    });
  }
);

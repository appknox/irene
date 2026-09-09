import { underscore } from '@ember/string';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
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
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.project = this.server.create('project', {
        activeProfileId: 1,
        isManualScanAvailable: true,
      });

      this.server.get('/profiles/:id/', (schema, req) => {
        return profile_serializer(schema['profiles'].find(req.params.id));
      });

      //Common Selectors
      const dynamicScanCheckbox = `[data-test-projectSetting-analysisSettings-reportPreference="${t('dynamicScan')}"]`;

      const manualScanCheckbox = `[data-test-projectSetting-analysisSettings-reportPreference="${t('manualScan')}"]`;

      const apiScanCheckbox = `[data-test-projectSetting-analysisSettings-reportPreference="${t('apiScan')}"]`;

      const needsReviewCheckbox = `[data-test-projectSetting-analysisSettings-reportPreference="${t('knoxIq.needsReviewAnalyses')}"]`;

      this.setProperties({
        dynamicScanCheckbox,
        manualScanCheckbox,
        apiScanCheckbox,
        needsReviewCheckbox,
      });

      // The Needs Review option only applies where KnoxIQ is switched on, so
      // the org has to be loaded before it can render.
      this.enableKnoxiq = async (knoxiq = true) => {
        this.server.createList('organization', 1);

        const orgId = this.server.schema.organizations.all().models[0]?.id;

        this.server.create('organization-me', { id: orgId });

        this.server.get('/organizations/:id/me', (schema, req) =>
          schema.organizationMes.find(`${req.params.id}`)?.toJSON()
        );

        const organization = this.owner.lookup('service:organization');

        await organization.load();

        organization.selected?.set('aiFeatures', {
          ...(organization.selected?.aiFeatures ?? {}),
          knoxiq,
        });
      };
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
        .hasText(t('reportPreferences'));

      assert
        .dom(
          '[data-test-projectSetting-analysisSettings-reportPreference-headerDesc]'
        )
        .exists()
        .hasText(t('reportPreferencesChooseTypes'));

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
      const report_preference = {
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
      const report_preference = {
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

    // ─── Needs Review analyses ───────────────────────────────────────────────
    test('needs review analyses preference is hidden when KnoxIQ is off for the org', async function (assert) {
      await this.enableKnoxiq(false);

      this.server.create('profile');

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );

      assert.dom(this.dynamicScanCheckbox).exists('the other options remain');
      assert.dom(this.needsReviewCheckbox).doesNotExist();
    });

    test.each(
      'needs review analyses preference reflects show_needs_review_analyses',
      [[true], [false]],
      async function (assert, [showNeedsReviewAnalyses]) {
        await this.enableKnoxiq();

        this.profile = this.server.create('profile', {
          report_preference: {
            show_needs_review_analyses: showNeedsReviewAnalyses,
          },
        });

        await render(
          hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
        );

        if (showNeedsReviewAnalyses) {
          assert.dom(this.needsReviewCheckbox).isChecked();
        } else {
          assert.dom(this.needsReviewCheckbox).isNotChecked();
        }
      }
    );

    test('it toggles needs review analyses preference, leaving the rest untouched', async function (assert) {
      await this.enableKnoxiq();

      this.profile = this.server.create('profile', {
        report_preference: {
          show_dynamic_scan: true,
          show_api_scan: false,
          show_manual_scan: true,
          show_needs_review_analyses: false,
        },
      });

      this.server.put('profiles/:id/report_preference', (schema, request) => {
        const profile = schema['profiles'].find(request.params.id);

        this.putBody = JSON.parse(request.requestBody);

        profile.report_preference = {
          ...profile.report_preference,
          ...this.putBody,
        };

        profile.save();

        return profile.report_preference;
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
      );

      await click(this.needsReviewCheckbox);

      assert.dom(this.needsReviewCheckbox).isChecked();

      assert.deepEqual(
        this.putBody,
        {
          show_dynamic_scan: true,
          show_api_scan: false,
          show_manual_scan: true,
          show_needs_review_analyses: true,
        },
        'the endpoint receives the whole preference set, not just the toggle'
      );

      await click(this.needsReviewCheckbox);

      assert.dom(this.needsReviewCheckbox).isNotChecked();
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

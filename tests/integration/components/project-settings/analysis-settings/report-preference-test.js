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

module('Integration | Component | report-preference', function (hooks) {
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
  });

  test('it renders', async function (assert) {
    this.server.create('profile');

    await render(
      hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
    );
    assert.dom('[data-test-show-dynamic-scan-checkbox]').exists();
    assert.dom('[data-test-show-manual-scan-checkbox]').exists();
    assert.dom('[data-test-show-api-scan-checkbox]').exists();
  });

  test('dynamic scan preference is checked if show_dynamic_scan report preference value is "true"', async function (assert) {
    const reportPreference = {
      show_dynamic_scan: true,
    };

    this.profile = this.server.create('profile', {
      reportPreference,
    });

    await render(
      hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
    );
    assert.dom('[data-test-show-dynamic-scan-checkbox]').isChecked();
  });

  test('dynamic scan preference is not checked if show_dynamic_scan report preference value is "false"', async function (assert) {
    const reportPreference = {
      show_dynamic_scan: false,
    };

    this.profile = this.server.create('profile', {
      reportPreference,
    });

    await render(
      hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
    );
    assert.dom('[data-test-show-dynamic-scan-checkbox]').isNotChecked();
  });

  test('it toggles dynamic scan preference when dynamic scan checkbox is clicked', async function (assert) {
    const reportPreference = {
      show_dynamic_scan: true,
    };

    this.profile = this.server.create('profile', {
      reportPreference,
    });

    this.server.put('profiles/:id/report_preference', (schema, request) => {
      const profile = schema['profiles'].find(request.params.id);
      profile.reportPreference.show_dynamic_scan =
        !profile.reportPreference.show_dynamic_scan;
      profile.save();
      return profile.reportPreference.show_dynamic_scan;
    });

    await render(
      hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
    );
    await click('[data-test-show-dynamic-scan-checkbox]');
    assert.dom('[data-test-show-dynamic-scan-checkbox]').isNotChecked();

    await click('[data-test-show-dynamic-scan-checkbox]');
    assert.dom('[data-test-show-dynamic-scan-checkbox]').isChecked();
  });

  test('manual scan preference is checked if show_manual_scan report preference value is "true"', async function (assert) {
    let reportPreference = {
      show_manual_scan: true,
    };

    this.profile = this.server.create('profile', {
      reportPreference,
    });

    this.server.get('/profiles/:id/', (schema, req) => {
      return profile_serializer(schema['profiles'].find(req.params.id));
    });

    await render(
      hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
    );
    assert.dom('[data-test-show-manual-scan-checkbox]').isChecked();
  });

  test('manual scan preference is not checked if show_manual_scan report preference value is "false"', async function (assert) {
    const reportPreference = {
      show_manual_scan: false,
    };

    this.profile = this.server.create('profile', {
      reportPreference,
    });

    await render(
      hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
    );
    assert.dom('[data-test-show-manual-scan-checkbox]').isNotChecked();
  });

  test('it toggles manual scan preference when manual scan checkbox is clicked', async function (assert) {
    const reportPreference = {
      show_manual_scan: false,
    };

    this.profile = this.server.create('profile', {
      reportPreference,
    });

    this.server.put('profiles/:id/report_preference', (schema, request) => {
      const profile = schema['profiles'].find(request.params.id);
      profile.reportPreference.show_manual_scan =
        !profile.reportPreference.show_manual_scan;
      profile.save();
      return profile.reportPreference.show_manual_scan;
    });

    await render(
      hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
    );
    await click('[data-test-show-manual-scan-checkbox]');
    assert.dom('[data-test-show-manual-scan-checkbox]').isChecked();
    await click('[data-test-show-manual-scan-checkbox]');
    assert.dom('[data-test-show-manual-scan-checkbox]').isNotChecked();
  });

  test('api scan preference is checked if show_api_scan report preference value is "true"', async function (assert) {
    let reportPreference = {
      show_api_scan: true,
    };

    this.profile = this.server.create('profile', {
      reportPreference,
    });

    this.server.get('/profiles/:id/', (schema, req) => {
      return profile_serializer(schema['profiles'].find(req.params.id));
    });

    await render(
      hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
    );
    assert.dom('[data-test-show-api-scan-checkbox]').isChecked();
  });

  test('api scan preference is not checked if show_api_scan report preference value is "false"', async function (assert) {
    const reportPreference = {
      show_api_scan: false,
    };

    this.profile = this.server.create('profile', {
      reportPreference,
    });

    await render(
      hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
    );
    assert.dom('[data-test-show-api-scan-checkbox]').isNotChecked();
  });

  test('it toggles api scan preference when api scan checkbox is clicked', async function (assert) {
    const reportPreference = {
      show_api_scan: true,
    };

    this.profile = this.server.create('profile', {
      reportPreference,
    });

    this.server.put('profiles/:id/report_preference', (schema, request) => {
      const profile = schema['profiles'].find(request.params.id);
      profile.reportPreference.show_api_scan =
        !profile.reportPreference.show_api_scan;
      profile.save();
      return profile.reportPreference.show_api_scan;
    });

    await render(
      hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
    );
    await click('[data-test-show-api-scan-checkbox]');
    assert.dom('[data-test-show-api-scan-checkbox]').isNotChecked();
    await click('[data-test-show-api-scan-checkbox]');
    assert.dom('[data-test-show-api-scan-checkbox]').isChecked();
  });

  test('it hides manual scan preference when manual scan is disabled', async function (assert) {
    this.project.isManualScanAvailable = false;
    this.profile = this.server.create('profile');

    await render(
      hbs`<ProjectSettings::AnalysisSettings::ReportPreference @project={{this.project}} />`
    );
    assert.dom('[data-test-manual-scan-container]').doesNotExist();
  });
});

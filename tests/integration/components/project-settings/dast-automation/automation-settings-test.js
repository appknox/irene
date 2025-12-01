import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
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

const selectors = {
  dynScanAutoRoot:
    '[data-test-projectSettings-dastAutomation-autoSettings-root]',
  dynScanAutoToggle:
    '[data-test-projectSettings-dastAutomationSettings-dynamicscanAutomationToggle] [data-test-toggle-input]',
  dynamicscanModeToggleLabel:
    '[data-test-projectSettings-dastAutomationSettings-dynamicscanAutomationToggleLabel]',
};

module(
  'Integration | Component | project-settings/general-settings/dynamicscan-automation-settings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      // Server mocks
      this.server.get('/v3/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/v3/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.create('ds-automation-preference', {
        dynamic_scan_automation_enabled: false,
      });

      this.server.get(
        '/v2/projects/:projectId/scan_parameter_groups',
        function (schema) {
          const results = schema.scanParameterGroups.all().models;

          return {
            count: results.length,
            next: null,
            previous: null,
            results,
          };
        }
      );

      this.server.get('/v2/profiles/:id/automation_preference', (schema, req) =>
        schema.dsAutomationPreferences.find(`${req.queryParams.id}`)?.toJSON()
      );

      this.server.get(
        '/v2/projects/:id/available_automated_devices',
        (schema) => {
          const results = schema.availableAutomatedDevices.all().models;

          return { count: results.length, next: null, previous: null, results };
        }
      );

      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');
      const file = this.server.create('file', 1);
      const project = this.server.create('project', {
        id: 1,
        last_file: file,
      });

      const normalizedProject = store.normalize('project', {
        ...project.toJSON(),
      });

      this.setProperties({
        project: store.push(normalizedProject),
      });
    });

    test('it renders', async function (assert) {
      await render(hbs`
        <ProjectSettings::DastAutomation::AutomationSettings
          @project={{this.project}}
          @profileId={{this.project.activeProfileId}}
          @featureAvailable={{true}}
        />
      `);

      assert.dom(selectors.dynScanAutoRoot).exists();

      assert
        .dom('[data-test-projectSettings-dastAutomationSettings-headerTitle]')
        .exists()
        .hasText(t('dynamicScanAutomation'));

      assert
        .dom(
          '[data-test-projectSettings-dastAutomationSettings-headerInfoChip]'
        )
        .exists()
        .hasText(t('experimentalFeature'));

      assert
        .dom(
          '[data-test-projectSettings-dastAutomationSettings-headerInfoDescNote]'
        )
        .exists()
        .hasText(t('dynScanAutoSchedNote'));
    });

    test('it toggles scheduled automation', async function (assert) {
      this.server.put('v2/profiles/:id/automation_preference', (_, req) => {
        const reqBody = JSON.parse(req.requestBody);

        return {
          dynamic_scan_automation_enabled:
            reqBody.dynamic_scan_automation_enabled,
          id: req.params.id,
        };
      });

      await render(hbs`
        <ProjectSettings::DastAutomation::AutomationSettings
          @project={{this.project}}
          @profileId={{this.project.activeProfileId}}
          @featureAvailable={{true}}
        />
      `);

      assert.dom(selectors.dynScanAutoRoot).exists();

      assert
        .dom(selectors.dynamicscanModeToggleLabel)
        .exists()
        .containsText(t('enableAutomation'));

      assert.dom(selectors.dynScanAutoToggle).exists().isNotChecked();

      await click(selectors.dynScanAutoToggle);

      assert.dom(selectors.dynScanAutoToggle).isChecked();

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.successMsg, t('scheduledAutomationSuccessOn'));

      await click(selectors.dynScanAutoToggle);

      assert.dom(selectors.dynScanAutoToggle).isNotChecked();

      assert.strictEqual(notify.successMsg, t('scheduledAutomationSuccessOff'));
    });
  }
);

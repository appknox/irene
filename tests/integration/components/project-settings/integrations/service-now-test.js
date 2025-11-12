import Service from '@ember/service';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { Response } from 'miragejs';

import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

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

// Get Analysis Risk
const getAnalysisRisklabel = (risk) =>
  analysisRiskStatus([risk, ENUMS.ANALYSIS.COMPLETED, false]).label;

module(
  'Integration | Component | project-settings/integrations/service-now',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      // Server Mocks
      this.server.get('/v3/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      // Services
      this.owner.register('service:notifications', NotificationsStub);

      const notifyService = this.owner.lookup('service:notifications');
      const store = this.owner.lookup('service:store');

      // Models
      const project = this.server.create('project');
      const normalizedProject = store.normalize('project', project.toJSON());

      this.setProperties({
        store,
        notifyService,
        project: store.push(normalizedProject),
      });
    });

    test('it renders with no ServiceNow integration', async function (assert) {
      this.server.get('/projects/:id/servicenow', () => {
        return new Response(400, {}, { detail: 'Servicenow not integrated' });
      });

      await render(
        hbs`<ProjectSettings::Integrations::ServiceNow @project={{this.project}} />`
      );

      assert
        .dom('[data-test-org-integration-card-title="ServiceNow"]')
        .hasText(t('serviceNow.title'));

      assert.dom('[data-test-org-integration-card-logo]').exists();

      assert
        .dom('[data-test-org-integration-card-integrated-chip]')
        .doesNotExist();

      assert.dom('[data-test-org-integration-card-selectBtn]').doesNotExist();

      assert
        .dom('[data-test-org-integration-card-connectBtn]')
        .hasText(t('connect'));
    });

    test('it opens and closes threshold config drawer', async function (assert) {
      this.server.get('/projects/:id/servicenow', () => {
        return new Response(400, {});
      });

      await render(
        hbs`<ProjectSettings::Integrations::ServiceNow @project={{this.project}} />`
      );

      assert
        .dom('[data-test-prjSettings-integrations-configDrawer]')
        .doesNotExist();

      assert
        .dom('[data-test-org-integration-card-selectBtn]')
        .hasText(t('selectThreshold'));

      await click('[data-test-org-integration-card-selectBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-configDrawer-root]')
        .exists();

      assert
        .dom('[data-test-prjSettings-integrations-configDrawer-title]')
        .hasText(t('serviceNowIntegration'));

      assert
        .dom(
          '[data-test-prjSettings-integrations-serviceNow-configDrawer-note]'
        )
        .hasText(t('otherTemplates.selectServiceNowRisk'));

      assert
        .dom('[data-test-prjSettings-integrations-configDrawer-cancelBtn]')
        .hasText(t('cancel'));

      await click(
        '[data-test-prjSettings-integrations-configDrawer-cancelBtn]'
      );

      assert
        .dom('[data-test-prjSettings-integrations-configDrawer]')
        .doesNotExist();
    });

    test.each(
      'It shows an error message when no threshold is selected after clicking save in config drawer',
      [
        [
          {
            risk_threshold: ['This field may not be null.'],
          },
          () => t('invalidRisk'),
        ],
      ],
      async function (assert, [error, message]) {
        this.server.get('/projects/:id/servicenow', () => {
          return new Response(400, {});
        });

        this.server.post('/projects/:id/servicenow', () => {
          return new Response(400, {}, { ...error });
        });

        await render(
          hbs`<ProjectSettings::Integrations::ServiceNow @project={{this.project}} />`
        );

        await click('[data-test-org-integration-card-selectBtn]');

        assert
          .dom(`[data-test-prjSettings-integrations-configDrawer-root`)
          .exists();

        await click(
          '[data-test-prjSettings-integrations-configDrawer-saveBtn]'
        );

        assert.strictEqual(this.notifyService.errorMsg, message());
      }
    );

    test('it saves the selected threshold when I select a valid threshold from the config drawer', async function (assert) {
      assert.expect(4);

      this.server.get('/projects/:id/servicenow', () => {
        return new Response(400, {});
      });

      this.server.post('/projects/:id/servicenow', (_, request) => {
        const requestBody = JSON.parse(request.requestBody);

        // Create a ServiceNow Config for this request
        const createdServiceNowConfig = this.server.create(
          'servicenow-config',
          requestBody
        );

        this.set('createdServiceNowConfig', createdServiceNowConfig);

        return new Response(201, {}, { id: request.params.id, ...requestBody });
      });

      await render(
        hbs`<ProjectSettings::Integrations::ServiceNow @project={{this.project}} />`
      );

      await click('[data-test-org-integration-card-selectBtn]');

      assert
        .dom(
          '[data-test-prjSettings-integrations-serviceNow-configDrawer-thresholdTitle]'
        )
        .hasText(t('threshold'));

      await clickTrigger(
        '[data-test-prjSettings-integrations-serviceNow-configDrawer-thresholdList]'
      );

      // Select second threshold in power select dropdown
      await selectChoose(
        '.select-threshold-class',
        '.ember-power-select-option',
        1
      );

      await click('[data-test-prjSettings-integrations-configDrawer-saveBtn]');

      await click('[data-test-org-integration-card-manageBtn]');

      // Created in the create request block
      const createdServiceNowConfig = this.createdServiceNowConfig;

      assert
        .dom('[data-test-prjSettings-integrations-serviceNow-riskHeaderText]')
        .hasText(t('threshold'));

      assert
        .dom('[data-test-prjSettings-integrations-serviceNow-risk]')
        .hasText(getAnalysisRisklabel(createdServiceNowConfig.risk_threshold));

      assert.strictEqual(
        this.notifyService.successMsg,
        t('integratedServiceNow')
      );
    });

    test('it deletes selected risk threshold when delete trigger is clicked', async function (assert) {
      assert.expect(8);

      const createdServiceNowConfig = this.server.create('servicenow-config');

      this.server.get('/projects/:id/servicenow', () => {
        return new Response(201, {}, { ...createdServiceNowConfig.toJSON() });
      });

      this.server.delete('/projects/:id/servicenow', () => {
        return new Response(200, {});
      });

      await render(
        hbs`<ProjectSettings::Integrations::ServiceNow @project={{this.project}} />`
      );

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-serviceNow-riskHeaderText]')
        .hasText(t('threshold'));

      assert
        .dom('[data-test-prjSettings-integrations-serviceNow-risk]')
        .hasText(getAnalysisRisklabel(createdServiceNowConfig.risk_threshold));

      await click(
        '[data-test-prjSettings-integrations-configDrawer-deleteBtn]'
      );

      assert
        .dom('[data-test-prjSettings-integrations-snProject-confirmDelete]')
        .containsText(t('confirmBox.removeServiceNow'));

      assert
        .dom('[data-test-prjSettings-integrations-snProject-confirmDeleteBtn]')
        .containsText(t('yesDelete'));

      await click(
        '[data-test-prjSettings-integrations-snProject-confirmDeleteBtn]'
      );

      assert.strictEqual(
        this.notifyService.successMsg,
        t('serviceNow.riskThresholdRemoved')
      );

      assert
        .dom('[data-test-prjSettings-integrations-serviceNow-riskHeaderText]')
        .doesNotExist();

      assert
        .dom('[data-test-prjSettings-integrations-serviceNow-risk]')
        .doesNotExist();

      await click(
        '[data-test-prjSettings-integrations-configDrawer-cancelBtn]'
      );

      // Check for select button
      assert
        .dom('[data-test-org-integration-card-selectBtn]')
        .hasText(t('selectThreshold'));
    });

    test('it edits the project when a new threshold is selected', async function (assert) {
      assert.expect(5);

      const createdServiceNowConfig = this.server.create('servicenow-config', {
        project: this.project.id,
        risk_threshold: ENUMS.RISK.HIGH,
      });

      this.server.get('/projects/:id/servicenow', () => {
        return new Response(201, {}, { ...createdServiceNowConfig.toJSON() });
      });

      this.server.post('/projects/:id/servicenow', (schema, req) => {
        const requestBody = JSON.parse(req.requestBody);

        this.set('requestBody', requestBody);

        return schema.servicenowConfigs
          .where((prj) => prj.project === req.params.id)
          .models[0].update(requestBody)
          .toJSON();
      });

      await render(
        hbs`<ProjectSettings::Integrations::ServiceNow @project={{this.project}} />`
      );

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-serviceNow-riskHeaderText]')
        .hasText(t('threshold'));

      assert
        .dom('[data-test-prjSettings-integrations-serviceNow-risk]')
        .hasText(getAnalysisRisklabel(createdServiceNowConfig.risk_threshold));

      await click('[data-test-prjSettings-integrations-serviceNow-editBtn]');

      await clickTrigger(
        '[data-test-prjSettings-integrations-serviceNow-configDrawer-thresholdList]'
      );

      // Select first (LOW) threshold in power select dropdown
      await selectChoose(
        '.select-threshold-class',
        '.ember-power-select-option',
        0
      );

      // Triggers PUT request for update
      await click('[data-test-prjSettings-integrations-configDrawer-saveBtn]');

      assert.strictEqual(
        this.notifyService.successMsg,
        t('serviceNow.riskThresholdUpdated')
      );

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-serviceNow-riskHeaderText]')
        .hasText(t('threshold'));

      assert
        .dom('[data-test-prjSettings-integrations-serviceNow-risk]')
        .hasText(getAnalysisRisklabel(this.requestBody.risk_threshold));
    });
  }
);

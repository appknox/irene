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
  'Integration | Component | project-settings/integrations/slack',
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

      this.server.createList('organization', 1);
      await this.owner.lookup('service:organization').load();

      const slackIntegrationInfo = {
        channel_id: 'C12345678',
        api_token: 'xoxb-1234567890-0987654321-ABCDEF123456',
      };

      this.server.get('/organizations/:id/slack', () => {
        return slackIntegrationInfo;
      });

      this.setProperties({
        store,
        notifyService,
        project: store.push(normalizedProject),
      });
    });

    test('it renders with no Slack integration', async function (assert) {
      this.server.get('/projects/:id/slack', () => {
        return new Response(400, {}, { detail: 'Slack not integrated' });
      });

      await render(
        hbs`<ProjectSettings::Integrations::Slack @project={{this.project}} />`
      );

      assert
        .dom('[data-test-org-integration-card-title="Slack"]')
        .hasText(t('slack.title'));

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
      this.server.get('/projects/:id/slack', () => {
        return new Response(400, {});
      });

      await render(
        hbs`<ProjectSettings::Integrations::Slack @project={{this.project}} />`
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
        .hasText(t('slackIntegration'));

      assert
        .dom('[data-test-prjSettings-integrations-slack-configDrawer-note]')
        .hasText(t('otherTemplates.selectSlackRisk'));

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
        this.server.get('/projects/:id/slack', () => {
          return new Response(400, {});
        });

        this.server.post('/projects/:id/slack', () => {
          return new Response(400, {}, { ...error });
        });

        await render(
          hbs`<ProjectSettings::Integrations::Slack @project={{this.project}} />`
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

      this.server.get('/projects/:id/slack', () => {
        return new Response(400, {});
      });

      this.server.post('/projects/:id/slack', (_, request) => {
        const requestBody = JSON.parse(request.requestBody);

        // Create a Slack Config for this request
        const createdSlackConfig = this.server.create(
          'slack-config',
          requestBody
        );

        this.set('createdSlackConfig', createdSlackConfig);

        return new Response(201, {}, { id: request.params.id, ...requestBody });
      });

      await render(
        hbs`<ProjectSettings::Integrations::Slack @project={{this.project}} />`
      );

      await click('[data-test-org-integration-card-selectBtn]');

      assert
        .dom(
          '[data-test-prjSettings-integrations-slack-configDrawer-thresholdTitle]'
        )
        .hasText(t('threshold'));

      await clickTrigger(
        '[data-test-prjSettings-integrations-slack-configDrawer-thresholdList]'
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
      const createdSlackConfig = this.createdSlackConfig;

      assert
        .dom('[data-test-prjSettings-integrations-slack-riskHeaderText]')
        .hasText(t('threshold'));

      assert
        .dom('[data-test-prjSettings-integrations-slack-risk]')
        .hasText(getAnalysisRisklabel(createdSlackConfig.risk_threshold));

      assert.strictEqual(this.notifyService.successMsg, t('slackIntegrated'));
    });

    test('it deletes selected risk threshold when delete trigger is clicked', async function (assert) {
      assert.expect(8);

      const createdSlackConfig = this.server.create('slack-config');

      this.server.get('/projects/:id/slack', () => {
        return new Response(201, {}, { ...createdSlackConfig.toJSON() });
      });

      this.server.delete('/projects/:id/slack', () => {
        return new Response(200, {});
      });

      await render(
        hbs`<ProjectSettings::Integrations::Slack @project={{this.project}} />`
      );

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-slack-riskHeaderText]')
        .hasText(t('threshold'));

      assert
        .dom('[data-test-prjSettings-integrations-slack-risk]')
        .hasText(getAnalysisRisklabel(createdSlackConfig.risk_threshold));

      await click(
        '[data-test-prjSettings-integrations-configDrawer-deleteBtn]'
      );

      assert
        .dom('[data-test-prjSettings-integrations-slackProject-confirmDelete]')
        .containsText(t('confirmBox.removeSlack'));

      assert
        .dom(
          '[data-test-prjSettings-integrations-slackProject-confirmDeleteBtn]'
        )
        .containsText(t('yesDelete'));

      await click(
        '[data-test-prjSettings-integrations-slackProject-confirmDeleteBtn]'
      );

      assert.strictEqual(
        this.notifyService.successMsg,
        t('slack.riskThresholdRemoved')
      );

      assert
        .dom('[data-test-prjSettings-integrations-slack-riskHeaderText]')
        .doesNotExist();

      assert
        .dom('[data-test-prjSettings-integrations-slack-risk]')
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

      const createdSlackConfig = this.server.create('slack-config', {
        project: this.project.id,
        risk_threshold: ENUMS.RISK.HIGH,
      });

      this.server.get('/projects/:id/slack', () => {
        return new Response(201, {}, { ...createdSlackConfig.toJSON() });
      });

      this.server.post('/projects/:id/slack', (schema, req) => {
        const requestBody = JSON.parse(req.requestBody);

        this.set('requestBody', requestBody);

        return schema.slackConfigs
          .where((prj) => prj.project === req.params.id)
          .models[0].update(requestBody)
          .toJSON();
      });

      await render(
        hbs`<ProjectSettings::Integrations::Slack @project={{this.project}} />`
      );

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-slack-riskHeaderText]')
        .hasText(t('threshold'));

      assert
        .dom('[data-test-prjSettings-integrations-slack-risk]')
        .hasText(getAnalysisRisklabel(createdSlackConfig.risk_threshold));

      await click('[data-test-prjSettings-integrations-slack-editBtn]');

      await clickTrigger(
        '[data-test-prjSettings-integrations-slack-configDrawer-thresholdList]'
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
        t('slack.riskThresholdUpdated')
      );

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-slack-riskHeaderText]')
        .hasText(t('threshold'));

      assert
        .dom('[data-test-prjSettings-integrations-slack-risk]')
        .hasText(getAnalysisRisklabel(this.requestBody.risk_threshold));
    });
  }
);

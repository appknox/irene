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
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';
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
  'Integration | Component | project-settings/integrations/jira-project',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.notifyService = this.owner.lookup('service:notifications');

      this.server.get('/organizations/:id/jira_projects', (schema) => {
        const results = schema.organizationJiraprojects.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.createList('organization', 1);
      await this.owner.lookup('service:organization').load();

      this.server.get('/v3/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/v3/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.createList('organization-me', 1);
      const jiraProjects = this.server.createList(
        'organization-jiraproject',
        2
      );

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
        store,
        project: store.push(normalizedProject),
        jiraProjects,
      });
    });

    test('it renders with no JIRA projects', async function (assert) {
      this.server.get('/organizations/:id/jira_projects', () => {
        return { count: 0, next: null, previous: null, results: [] };
      });

      await render(
        hbs`<ProjectSettings::Integrations::JiraProject @project={{this.project}} />`
      );

      assert
        .dom('[data-test-org-integration-card-title="JIRA"]')
        .hasText(t('jira'));

      assert.dom('[data-test-org-integration-card-logo]').exists();

      assert
        .dom('[data-test-org-integration-card-integrated-chip]')
        .doesNotExist();

      assert.dom('[data-test-org-integration-card-connectBtn]').doesNotExist();

      assert.dom('[data-test-org-integration-card-selectBtn]').exists();

      await click('[data-test-org-integration-card-selectBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-configDrawer-root]')
        .exists();

      assert
        .dom('[data-test-prjSettings-integrations-configDrawer-title]')
        .hasText(t('jiraIntegration'));

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-noProject]')
        .containsText(t('jiraNoProject'));

      assert
        .dom(
          '[data-test-prjSettings-integrations-jiraProject-noProject-integrationLink]'
        )

        .hasText(t('clickingHere'))
        .hasAttribute(
          'href',
          new RegExp('organization/settings/integrations', 'i')
        );
    });

    test('it renders select button with atleast one JIRA project', async function (assert) {
      await render(
        hbs`<ProjectSettings::Integrations::JiraProject @project={{this.project}} />`
      );

      assert
        .dom('[data-test-org-integration-card-title="JIRA"]')
        .hasText(t('jira'));

      assert.dom('[data-test-org-integration-card-logo]').exists();

      assert
        .dom('[data-test-org-integration-card-integrated-chip]')
        .doesNotExist();

      assert.dom('[data-test-org-integration-card-connectBtn]').doesNotExist();

      assert.dom('[data-test-org-integration-card-selectBtn]').exists();

      await click('[data-test-org-integration-card-selectBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-noProject]')
        .doesNotExist();

      assert
        .dom(
          '[data-test-prjSettings-integrations-jiraProject-noProject-integrationLink]'
        )
        .doesNotExist();

      assert
        .dom('[data-test-prjSettings-integrations-configDrawer-title]')
        .hasText(t('jiraIntegration'));

      assert
        .dom(
          '[data-test-prjSettings-integrations-jiraProject-configDrawer-headerText]'
        )
        .hasText(t('otherTemplates.selectJIRAAccount'));

      assert
        .dom('[data-test-org-integration-card-selectBtn]')
        .hasText(t('selectProject'));
    });

    test('it opens and closes project config drawer', async function (assert) {
      assert.expect(8);

      await render(
        hbs`<ProjectSettings::Integrations::JiraProject @project={{this.project}} />`
      );

      assert
        .dom(`[data-test-prjSettings-integrations-configDrawer]`)
        .doesNotExist();

      assert.dom('[data-test-org-integration-card-selectBtn]').exists();

      await click('[data-test-org-integration-card-selectBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-configDrawer-root]')
        .exists();

      assert
        .dom(
          '[data-test-prjSettings-integrations-jiraProject-configDrawer-headerText]'
        )
        .hasText(t('otherTemplates.selectJIRAAccount'));

      assert
        .dom(
          '[data-test-prjSettings-integrations-jiraProject-configDrawer-note]'
        )
        .containsText(t('note'));

      compareInnerHTMLWithIntlTranslation(assert, {
        selector:
          '[data-test-prjSettings-integrations-jiraProject-configDrawer-note]',
        message: t('otherTemplates.selectJIRAAccountNote'),
        doIncludesCheck: true,
      });

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
      'It shows an error message when no project repo or threshold is selected after clicking save in config drawer',
      [
        [
          {
            project_key: ['This field may not be null.'],
          },
          () => t('invalidProject'),
        ],
        [
          {
            risk_threshold: ['This field may not be null.'],
          },
          () => t('invalidRisk'),
        ],
      ],
      async function (assert, [error, message]) {
        this.server.post('/projects/:id/jira', () => {
          return new Response(400, {}, { ...error });
        });

        await render(
          hbs`<ProjectSettings::Integrations::JiraProject @project={{this.project}} />`
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

    test('it renders the fetched JIRA Projects on the config drawer correctly', async function (assert) {
      await render(
        hbs`<ProjectSettings::Integrations::JiraProject @project={{this.project}} />`
      );

      await click('[data-test-org-integration-card-selectBtn]');

      await clickTrigger(
        `[data-test-prjSettings-integrations-jiraProject-configDrawer-repoList]`
      );

      const projectDropdownList = this.element.querySelectorAll(
        '.ember-power-select-option'
      );

      assert.strictEqual(
        projectDropdownList.length,
        this.jiraProjects.length,
        'JIRA Project count on dropdown list is correct'
      );

      for (let i = 0; i < this.jiraProjects.length; i++) {
        const jiraProject = this.jiraProjects[i];

        assert
          .dom(`[data-option-index="${i}"]`) // From power-select api
          .containsText(`${jiraProject.name}`);
      }
    });

    test('it saves the selected project when I select a valid repo from the config drawer', async function (assert) {
      assert.expect(7);

      this.server.get('/projects/:id/jira', () => {
        return new Response(404, {}, { detail: 'No connected JIRA project' });
      });

      this.server.post('/projects/:id/jira', (_, request) => {
        const requestBody = JSON.parse(request.requestBody);

        // Since the first item is selected
        assert.strictEqual(
          requestBody.project_key,
          this.jiraProjects[0].key,
          'Selected project "key" is equal to first item "key" on dropdown list'
        );

        assert.strictEqual(
          requestBody.project_name,
          this.jiraProjects[0].name,
          'Selected project "name" is equal to first item name on dropdown list'
        );

        // Create a JIRA Repo for this request
        const createdJiraPrj = this.server.create('jira-repo', requestBody);

        this.set('createdJiraPrj', createdJiraPrj);

        return new Response(201, {}, { id: request.params.id, ...requestBody });
      });

      await render(
        hbs`<ProjectSettings::Integrations::JiraProject @project={{this.project}} />`
      );

      await click('[data-test-org-integration-card-selectBtn]');

      await clickTrigger(
        '[data-test-prjSettings-integrations-jiraProject-configDrawer-repoList]'
      );

      // Select first repo in power select dropdown
      await selectChoose('.select-repo-class', '.ember-power-select-option', 0);

      await clickTrigger(
        '[data-test-prjSettings-integrations-jiraProject-configDrawer-thresholdList]'
      );

      // Select second threshold in power select dropdown
      await selectChoose(
        '.select-threshold-class',
        '.ember-power-select-option',
        1
      );

      await click('[data-test-prjSettings-integrations-configDrawer-saveBtn]');

      // Created in the create request block
      const createdJiraPrj = this.createdJiraPrj;

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-repoHeaderText]')
        .hasText(t('repo'));

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-riskHeaderText]')
        .hasText(t('threshold'));

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-repoKeyAndName]')
        .hasText(
          `${createdJiraPrj.project_key}-${createdJiraPrj.project_name}`
        );

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-risk]')
        .hasText(getAnalysisRisklabel(createdJiraPrj.risk_threshold));

      assert.strictEqual(this.notifyService.successMsg, t('integratedJIRA'));
    });

    test('it deletes selected project when delete trigger is clicked', async function (assert) {
      assert.expect();

      const createdJiraPrj = this.server.create('jira-repo');

      this.server.get('/projects/:id/jira', () => {
        return new Response(201, {}, { ...createdJiraPrj.toJSON() });
      });

      this.server.delete('/projects/:id/jira', () => {
        return new Response(200, {});
      });

      await render(
        hbs`<ProjectSettings::Integrations::JiraProject @project={{this.project}} />`
      );

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-repoHeaderText]')
        .hasText(t('repo'));

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-riskHeaderText]')
        .hasText(t('threshold'));

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-repoKeyAndName]')
        .hasText(
          `${createdJiraPrj.project_key}-${createdJiraPrj.project_name}`
        );

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-risk]')
        .hasText(getAnalysisRisklabel(createdJiraPrj.risk_threshold));

      await click(
        '[data-test-prjSettings-integrations-configDrawer-deleteBtn]'
      );

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-confirmDelete]')
        .containsText(t('confirmBox.removeJIRA'));

      assert
        .dom(
          '[data-test-prjSettings-integrations-jiraProject-confirmDeleteBtn]'
        )
        .containsText(t('yesDelete'));

      await click(
        '[data-test-prjSettings-integrations-jiraProject-confirmDeleteBtn]'
      );

      assert.strictEqual(
        this.notifyService.successMsg,
        t('projectRemoved'),
        'Displays the right success message'
      );

      assert
        .dom('[ data-test-prjSettings-integrations-jiraProject-repoHeaderText]')
        .doesNotExist();

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-riskHeaderText]')
        .doesNotExist();

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-repoKeyAndName]')
        .doesNotExist();

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-risk]')
        .doesNotExist();

      await click(
        '[data-test-prjSettings-integrations-configDrawer-cancelBtn]'
      );

      // Check for select button
      assert
        .dom('[data-test-org-integration-card-selectBtn]')
        .hasText(t('selectProject'));
    });

    test('it edits the project when a new repo is selected', async function (assert) {
      assert.expect();

      const createdJiraPrj = this.server.create('jira-repo', {
        project: this.project.id,
        risk_threshold: ENUMS.RISK.HIGH,
      });

      this.server.create('organization-jiraproject', {
        key: createdJiraPrj.project_key,
        name: createdJiraPrj.project_name,
      });

      this.server.get('/projects/:id/jira', () => {
        return new Response(201, {}, { ...createdJiraPrj.toJSON() });
      });

      this.server.put('/projects/:id/jira', (schema, req) => {
        const requestBody = JSON.parse(req.requestBody);

        this.set('requestBody', requestBody);

        return schema.jiraRepos
          .where((prj) => prj.project === req.params.id)
          .models[0].update(requestBody)
          .toJSON();
      });

      await render(
        hbs`<ProjectSettings::Integrations::JiraProject @project={{this.project}} />`
      );

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[ data-test-prjSettings-integrations-jiraProject-repoHeaderText]')
        .hasText(t('repo'));

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-riskHeaderText]')
        .hasText(t('threshold'));

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-repoKeyAndName]')
        .hasText(
          `${createdJiraPrj.project_key}-${createdJiraPrj.project_name}`
        );

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-risk]')
        .hasText(getAnalysisRisklabel(createdJiraPrj.risk_threshold));

      // Flow for updating the existing JiraIntegration
      await click('[data-test-prjSettings-integrations-jiraProject-editBtn]');

      await clickTrigger(
        '[data-test-prjSettings-integrations-jiraProject-configDrawer-repoList]'
      );

      // Select first repo in power select dropdown
      await selectChoose('.select-repo-class', '.ember-power-select-option', 0);

      await clickTrigger(
        '[data-test-prjSettings-integrations-jiraProject-configDrawer-thresholdList]'
      );

      // Select first (LOW) threshold in power select dropdown
      await selectChoose(
        '.select-threshold-class',
        '.ember-power-select-option',
        0
      );

      // Triggers PUT request for update
      await click('[data-test-prjSettings-integrations-configDrawer-saveBtn]');

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-repoKeyAndName]')
        .containsText(
          `${this.requestBody.project_key}-${this.requestBody.project_name}`
        );

      assert
        .dom('[data-test-prjSettings-integrations-jiraProject-risk]')
        .hasText(getAnalysisRisklabel(this.requestBody.risk_threshold));

      assert.strictEqual(this.notifyService.successMsg, t('projectUpdated'));
    });
  }
);

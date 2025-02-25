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
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

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

module(
  'Integration | Component | project-settings/general-settings/jira-project',
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

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/v2/files/:id', (schema, req) => {
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
        last_file_id: file.id,
      });

      const normalizedProject = store.normalize('project', {
        ...project.toJSON(),
      });

      this.setProperties({
        project: store.push(normalizedProject),
        jiraProjects,
      });
    });

    test('it renders with no JIRA projects', async function (assert) {
      this.server.get('/organizations/:id/jira_projects', () => {
        return { count: 0, next: null, previous: null, results: [] };
      });

      await render(
        hbs`<ProjectSettings::GeneralSettings::JiraProject @project={{this.project}} />`
      );

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-root]')
        .exists();

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-headerText]')
        .exists()
        .hasText(t('jiraIntegration'));

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-noProject]')
        .exists()
        .hasText(t('jiraNoProject'));

      assert
        .dom(
          '[data-test-projectSettings-genSettings-jiraProject-noProject-integrationLink]'
        )
        .exists()
        .hasText(t('clickingHere'));
    });

    test('it renders select button with atleast one JIRA project', async function (assert) {
      await render(
        hbs`<ProjectSettings::GeneralSettings::JiraProject @project={{this.project}} />`
      );

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-root]')
        .exists();

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-noProject]')
        .doesNotExist();

      assert
        .dom(
          '[data-test-projectSettings-genSettings-jiraProject-noProject-integrationLink]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-projectSettings-genSettings-jiraProject-selectProjectText]'
        )
        .exists()
        .hasText(t('otherTemplates.selectJIRAAccount'));

      assert
        .dom(
          '[data-test-projectSettings-genSettings-jiraProject-selectProjectBtn]'
        )
        .exists()
        .hasText(t('selectProject'));
    });

    test('it opens and closes project edit modal', async function (assert) {
      assert.expect(9);

      await render(
        hbs`<ProjectSettings::GeneralSettings::JiraProject @project={{this.project}} />`
      );

      assert
        .dom(`[data-test-projectSettings-genSettings-jiraProject-editModal]`)
        .doesNotExist();

      await click(
        '[data-test-projectSettings-genSettings-jiraProject-selectProjectBtn]'
      );

      assert
        .dom(`[data-test-projectSettings-genSettings-jiraProject-editModal]`)
        .exists();

      assert
        .dom(`[data-test-genSettings-jiraProject-editModal-title]`)
        .exists()
        .hasText(t('otherTemplates.selectJIRAAccount'));

      assert
        .dom('[data-test-genSettings-jiraProject-editModal-note]')
        .containsText(t('note'));

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: '[data-test-genSettings-jiraProject-editModal-note]',
        message: t('otherTemplates.selectJIRAAccountNote'),
        doIncludesCheck: true,
      });

      assert
        .dom(
          `[data-test-genSettings-jiraProject-editModal-cancelSaveProjectBtn]`
        )
        .exists()
        .hasText(t('cancel'));

      await click(
        '[data-test-genSettings-jiraProject-editModal-cancelSaveProjectBtn]'
      );

      assert
        .dom(`[data-test-projectSettings-genSettings-jiraProject-editModal]`)
        .doesNotExist();
    });

    test.each(
      'It shows an error message when no project repo or threshold is selected after clicking save in edit modal',
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
          hbs`<ProjectSettings::GeneralSettings::JiraProject @project={{this.project}} />`
        );

        await click(
          '[data-test-projectSettings-genSettings-jiraProject-selectProjectBtn]'
        );

        assert
          .dom(`[data-test-projectSettings-genSettings-jiraProject-editModal]`)
          .exists();

        await click(
          '[data-test-genSettings-jiraProject-editModal-saveProjectBtn]'
        );

        assert.strictEqual(this.notifyService.errorMsg, message());
      }
    );

    test('it renders the fetched JIRA Projects on the edit modal correctly', async function (assert) {
      await render(
        hbs`<ProjectSettings::GeneralSettings::JiraProject @project={{this.project}} />`
      );

      await click(
        '[data-test-projectSettings-genSettings-jiraProject-selectProjectBtn]'
      );

      await clickTrigger(
        `[data-test-genSettings-jiraProject-editModal-repoList]`
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

    test('it saves the selected project when I select a valid repo from the edit modal', async function (assert) {
      assert.expect(7);

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

        return new Response(201, {}, this.jiraProjects[0].toJSON());
      });

      await render(
        hbs`<ProjectSettings::GeneralSettings::JiraProject @project={{this.project}} />`
      );

      await click(
        '[data-test-projectSettings-genSettings-jiraProject-selectProjectBtn]'
      );

      await clickTrigger(
        `[data-test-genSettings-jiraProject-editModal-repoList]`
      );

      // Select first repo in power select dropdown
      await selectChoose('.select-repo-class', '.ember-power-select-option', 0);

      await clickTrigger(
        '[data-test-genSettings-jiraProject-editModal-thresholdList]'
      );

      // Select second threshold in power select dropdown
      await selectChoose(
        '.select-threshold-class',
        '.ember-power-select-option',
        1
      );

      await click(
        '[data-test-genSettings-jiraProject-editModal-saveProjectBtn]'
      );

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-keyAndName]')
        .containsText(
          `${this.jiraProjects[0].key}-${this.jiraProjects[0].name}`
        );
      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-risk]')
        .containsText(`Medium`);

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-editPrjIcon]')
        .exists();

      assert
        .dom(
          '[data-test-projectSettings-genSettings-jiraProject-deletePrjIcon]'
        )
        .exists();

      assert.strictEqual(this.notifyService.successMsg, t('integratedJIRA'));
    });

    test('it deletes selected project when delete trigger is clicked', async function (assert) {
      this.server.post('/projects/:id/jira', () => {
        return {
          id: 1,
          ...this.jiraProjects[0].toJSON(),
        };
      });

      this.server.delete('/projects/:id/jira', () => {
        return {};
      });

      await render(
        hbs`<ProjectSettings::GeneralSettings::JiraProject @project={{this.project}} />`
      );

      await click(
        '[data-test-projectSettings-genSettings-jiraProject-selectProjectBtn]'
      );

      await clickTrigger(
        `[data-test-genSettings-jiraProject-editModal-repoList]`
      );

      // Select first repo in power select dropdown
      await selectChoose('.select-repo-class', '.ember-power-select-option', 0);

      await clickTrigger(
        '[data-test-genSettings-jiraProject-editModal-thresholdList]'
      );

      // Select first threshold in power select dropdown
      await selectChoose(
        '.select-threshold-class',
        '.ember-power-select-option',
        0
      );

      await click(
        '[data-test-genSettings-jiraProject-editModal-saveProjectBtn]'
      );

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-keyAndName]')
        .containsText(
          `${this.jiraProjects[0].key}-${this.jiraProjects[0].name}`
        );
      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-risk]')
        .containsText(`Low`);

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-editPrjIcon]')
        .exists();

      assert
        .dom(
          '[data-test-projectSettings-genSettings-jiraProject-deletePrjIcon]'
        )
        .exists();

      await click(
        '[data-test-projectSettings-genSettings-jiraProject-deletePrjIcon]'
      );

      assert.dom('[data-test-ak-modal-header]').exists();

      await click('[data-test-confirmbox-confirmBtn]');

      assert.strictEqual(
        this.notifyService.successMsg,
        t('projectRemoved'),
        'Displays the right success message'
      );

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-keyAndName]')
        .doesNotExist();

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-risk]')
        .doesNotExist();

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-editPrjIcon]')
        .doesNotExist();

      assert
        .dom(
          '[data-test-projectSettings-genSettings-jiraProject-deletePrjIcon]'
        )
        .doesNotExist();

      // Check for select button
      assert
        .dom(
          '[data-test-projectSettings-genSettings-jiraProject-selectProjectBtn]'
        )
        .exists()
        .hasText(t('selectProject'));
    });

    test('it edits the project when a new repo is selected', async function (assert) {
      this.server.post('/projects/:id/jira', () => {
        return { id: 1, ...this.jiraProjects[0].toJSON() };
      });

      this.server.put('/projects/:id/jira', (_, request) => {
        const requestBody = JSON.parse(request.requestBody);

        const targetedProject = this.jiraProjects.find(
          (project) => project.key === requestBody.project_key
        );

        return { ...targetedProject.toJSON(), id: request.params.id };
      });

      await render(
        hbs`<ProjectSettings::GeneralSettings::JiraProject @project={{this.project}} />`
      );

      await click(
        '[data-test-projectSettings-genSettings-jiraProject-selectProjectBtn]'
      );

      await clickTrigger(
        `[data-test-genSettings-jiraProject-editModal-repoList]`
      );

      // Select first repo in power select dropdown
      await selectChoose('.select-repo-class', '.ember-power-select-option', 0);

      await clickTrigger(
        '[data-test-genSettings-jiraProject-editModal-thresholdList]'
      );

      // Select first threshold in power select dropdown
      await selectChoose(
        '.select-threshold-class',
        '.ember-power-select-option',
        0
      );

      await click(
        '[data-test-genSettings-jiraProject-editModal-saveProjectBtn]'
      );

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-keyAndName]')
        .containsText(
          `${this.jiraProjects[0].key}-${this.jiraProjects[0].name}`
        );

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-risk]')
        .containsText(`Low`);

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-editPrjIcon]')
        .exists();

      assert
        .dom(
          '[data-test-projectSettings-genSettings-jiraProject-deletePrjIcon]'
        )
        .exists();

      assert.strictEqual(this.notifyService.successMsg, t('integratedJIRA'));

      // Flow for updating the existing JiraIntegration
      await click(
        '[data-test-projectSettings-genSettings-jiraProject-editPrjIcon]'
      );

      await clickTrigger(
        '[data-test-genSettings-jiraProject-editModal-repoList]'
      );

      // Select first repo in power select dropdown
      await selectChoose('.select-repo-class', '.ember-power-select-option', 1);

      await clickTrigger(
        '[data-test-genSettings-jiraProject-editModal-thresholdList]'
      );

      // Select second threshold in power select dropdown
      await selectChoose(
        '.select-threshold-class',
        '.ember-power-select-option',
        1
      );

      // Triggers PUT request for update
      await click(
        '[data-test-genSettings-jiraProject-editModal-saveProjectBtn]'
      );

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-keyAndName]')
        .containsText(
          `${this.jiraProjects[1].key}-${this.jiraProjects[1].name}`
        );

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-risk]')
        .containsText(`Medium`);

      assert
        .dom('[data-test-projectSettings-genSettings-jiraProject-editPrjIcon]')
        .exists();

      assert
        .dom(
          '[data-test-projectSettings-genSettings-jiraProject-deletePrjIcon]'
        )
        .exists();

      assert.strictEqual(this.notifyService.successMsg, t('projectUpdated'));
    });
  }
);

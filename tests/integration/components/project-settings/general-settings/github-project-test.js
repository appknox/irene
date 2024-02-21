import Service from '@ember/service';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import {
  clickTrigger,
  selectChoose,
} from 'ember-power-select/test-support/helpers';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { Response } from 'miragejs';
import { faker } from '@faker-js/faker';

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

const createGithubRepos = () => {
  const repo = faker.lorem.slug();
  const account = faker.lorem.slug();

  return {
    full_name: `${faker.lorem.slug()}/${repo}`,
    html_url: `https://github.com/${repo}`,
    name: repo,
    owner: {
      name: null,
      login: account,
    },
  };
};

module(
  'Integration | Component | project-settings/general-settings/github-project',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.notifyService = this.owner.lookup('service:notifications');

      this.server.get('/projects/:id/github', (schema) => {
        const results = schema.githubRepos.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.post('/projects/:id/github', (_, req) => {
        const requestBody = JSON.parse(req.requestBody);
        return { ...requestBody, id: req.params.id };
      });

      this.server.createList('organization', 1);
      await this.owner.lookup('service:organization').load();

      const store = this.owner.lookup('service:store');
      const file = this.server.create('file', 1);
      const project = this.server.create('project', {
        id: 1,
        last_file_id: file.id,
      });

      const normalizedProject = store.normalize('project', {
        ...project.toJSON(),
      });

      const orgGithubRepos = [1, 2, 3].map(createGithubRepos);

      // Common selectors
      const editModalSelector =
        '[data-test-projectSettings-genSettings-githubProject-editModal]';

      const editModalSaveBtn =
        '[data-test-genSettings-githubProject-editModal-saveProjectBtn]';

      const selectProjectBtn =
        '[data-test-projectSettings-genSettings-githubProject-selectProjectBtn]';

      const repoListSelector =
        '[data-test-genSettings-githubProject-editModal-repoList]';

      const thresholdListSelector =
        '[data-test-genSettings-githubProject-editModal-thresholdList]';

      const accountAndRepoNameSelector =
        '[data-test-projectSettings-genSettings-githubProject-accountAndRepo]';

      const editPrjIconBtn =
        '[data-test-projectSettings-genSettings-githubProject-editPrjIcon]';

      const deletePrjIconBtn =
        '[data-test-projectSettings-genSettings-githubProject-deletePrjIcon]';

      const prjRiskValSelector =
        '[data-test-projectSettings-genSettings-githubProject-risk]';

      this.setProperties({
        project: store.push(normalizedProject),
        orgGithubRepos,
        // Selectors
        editModalSelector,
        editModalSaveBtn,
        selectProjectBtn,
        repoListSelector,
        accountAndRepoNameSelector,
        editPrjIconBtn,
        thresholdListSelector,
        prjRiskValSelector,
        deletePrjIconBtn,
      });

      this.server.get('/organizations/:id/github_repos', () => {
        return { results: orgGithubRepos };
      });
    });

    test('it renders with no github repos', async function (assert) {
      this.server.get('/organizations/:id/github_repos', () => {
        return { count: 0, next: null, previous: null, results: [] };
      });

      this.server.get('/projects/:id/github', () => {
        return {};
      });

      await render(
        hbs`<ProjectSettings::GeneralSettings::GithubProject @project={{this.project}} />`
      );

      assert
        .dom('[data-test-projectSettings-genSettings-githubProject-root]')
        .exists();

      assert
        .dom('[data-test-projectSettings-genSettings-githubProject-headerText]')
        .exists()
        .hasText('t:githubIntegration:()');

      assert
        .dom(
          '[data-test-projectSettings-genSettings-githubProject-noReposInfoText]'
        )
        .exists()
        .containsText('t:github:()')
        .containsText('t:gotoSettings:()');

      assert
        .dom(
          '[data-test-projectSettings-genSettings-githubProject-orgSettingsLink]'
        )
        .exists()
        .hasText('t:clickingHere:()');
    });

    test('it renders select button with atleast one github repo and no selected project', async function (assert) {
      this.server.get('/projects/:id/github', () => {
        return {};
      });

      await render(
        hbs`<ProjectSettings::GeneralSettings::GithubProject @project={{this.project}} />`
      );

      assert
        .dom('[data-test-projectSettings-genSettings-githubProject-root]')
        .exists();

      assert
        .dom('[data-test-projectSettings-genSettings-githubProject-noProject]')
        .doesNotExist();

      assert
        .dom(
          '[data-test-projectSettings-genSettings-githubProject-noProject-integrationLink]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-projectSettings-genSettings-githubProject-selectProjectText]'
        )
        .exists()
        .hasText('t:otherTemplates.selectGHRepo:()');

      assert.dom(this.selectProjectBtn).exists().hasText('t:selectProject:()');
    });

    test('it opens and closes project edit modal', async function (assert) {
      this.server.get('/projects/:id/github', () => {
        return {};
      });

      await render(
        hbs`<ProjectSettings::GeneralSettings::GithubProject @project={{this.project}} />`
      );

      assert.dom(this.editModalSelector).doesNotExist();

      await click(this.selectProjectBtn);

      assert.dom(this.editModalSelector).exists();

      assert
        .dom(`[data-test-genSettings-githubProject-editModal-title]`)
        .exists()
        .hasText('t:otherTemplates.selectGHRepo:()');

      assert.dom(this.editModalSaveBtn).exists().hasText('t:save:()');

      const cancelBtnSelector =
        '[data-test-genSettings-githubProject-editModal-cancelSaveProjectBtn]';

      assert.dom(cancelBtnSelector).exists().hasText('t:cancel:()');

      await click(cancelBtnSelector);

      assert.dom(this.editModalSelector).doesNotExist();
    });

    test.each(
      'It shows an error message when no project repo or threshold is selected after clicking save in edit modal',
      [
        [
          {
            account: ['This field may not be null.'],
            repo: ['This field may not be null.'],
          },
          't:invalidProject:()',
        ],
        [
          {
            risk_threshold: ['This field may not be null.'],
          },
          't:invalidRisk:()',
        ],
      ],
      async function (assert, [error, message]) {
        this.server.post('/projects/:id/github', () => {
          this.set('hasAttemptedCreatingRepo', true);

          return new Response(400, {}, { ...error });
        });

        await render(
          hbs`<ProjectSettings::GeneralSettings::GithubProject @project={{this.project}} />`
        );

        await click(this.selectProjectBtn);

        assert.dom(this.editModalSelector).exists();

        await click(this.editModalSaveBtn);

        if (this.hasAttemptedCreatingRepo) {
          assert.strictEqual(this.notifyService.errorMsg, message);
        }
      }
    );

    test('it renders the fetched github repos on the edit modal correctly', async function (assert) {
      this.server.get('/projects/:id/github', () => {
        return {};
      });

      await render(
        hbs`<ProjectSettings::GeneralSettings::GithubProject @project={{this.project}} />`
      );

      await click(this.selectProjectBtn);

      await clickTrigger(this.repoListSelector);

      const projectDropdownList = this.element.querySelectorAll(
        '.ember-power-select-option'
      );

      assert.strictEqual(
        projectDropdownList.length,
        this.orgGithubRepos.length,
        'Github repo count on dropdown list is correct'
      );

      for (let i = 0; i < this.orgGithubRepos.length; i++) {
        const githubRepo = this.orgGithubRepos[i];

        assert
          .dom(`[data-option-index="${i}"]`) // From power-select api
          .containsText(`${githubRepo.full_name}`);
      }
    });

    test('it saves valid selected repo', async function (assert) {
      this.server.get('/projects/:id/github', () => {
        return {};
      });

      await render(
        hbs`<ProjectSettings::GeneralSettings::GithubProject @project={{this.project}} />`
      );

      await click(this.selectProjectBtn);

      await clickTrigger(this.repoListSelector);

      // Select first repo in power select dropdown
      await selectChoose('.select-repo-class', '.ember-power-select-option', 0);

      await clickTrigger(this.thresholdListSelector);

      // Select second threshold in power select dropdown
      await selectChoose(
        '.select-threshold-class',
        '.ember-power-select-option',
        1
      );

      await click(this.editModalSaveBtn);

      assert
        .dom(this.accountAndRepoNameSelector)
        .containsText(
          `${this.orgGithubRepos[0].owner.login}/${this.orgGithubRepos[0].name}`
        );

      assert.dom(this.prjRiskValSelector).containsText('Medium');

      assert.dom(this.editPrjIconBtn).exists();

      assert.dom(this.deletePrjIconBtn).exists();

      assert.strictEqual(this.notifyService.successMsg, `t:repoIntegrated:()`);
    });

    test('it deletes selected repo when delete trigger is clicked', async function (assert) {
      this.server.delete('/projects/:id/github', () => {
        return {};
      });

      await render(
        hbs`<ProjectSettings::GeneralSettings::GithubProject @project={{this.project}} />`
      );

      await click(this.selectProjectBtn);

      await clickTrigger(this.repoListSelector);

      // Select first repo in power select dropdown
      await selectChoose('.select-repo-class', '.ember-power-select-option', 0);

      await clickTrigger(this.thresholdListSelector);

      // Select first threshold in power select dropdown
      await selectChoose(
        '.select-threshold-class',
        '.ember-power-select-option',
        0
      );

      await click(this.editModalSaveBtn);

      assert
        .dom(this.accountAndRepoNameSelector)
        .containsText(
          `${this.orgGithubRepos[0].owner.login}/${this.orgGithubRepos[0].name}`
        );

      assert.dom(this.prjRiskValSelector).containsText(`Low`);

      assert.dom(this.editPrjIconBtn).exists();

      assert.dom(this.deletePrjIconBtn).exists();

      await click(this.deletePrjIconBtn);

      assert.dom('[data-test-ak-modal-header]').exists();

      await click('[data-test-confirmbox-confirmBtn]');

      assert.strictEqual(
        this.notifyService.successMsg,
        't:projectRemoved:()',
        'Displays the right success message'
      );

      assert.dom(this.accountAndRepoNameSelector).doesNotExist();

      assert.dom(this.prjRiskValSelector).doesNotExist();

      assert.dom(this.editPrjIconBtn).doesNotExist();

      assert.dom(this.deletePrjIconBtn).doesNotExist();

      // Check for select button
      assert.dom(this.selectProjectBtn).exists().hasText('t:selectProject:()');
    });

    test('it edits the project when a new repo is selected', async function (assert) {
      this.server.put('/projects/:id/github', (_, req) => {
        const requestBody = JSON.parse(req.requestBody);

        const targetedRepo = this.orgGithubRepos.find(
          (repo) => repo.name === requestBody.repo
        );

        return { ...targetedRepo, id: req.params.id };
      });

      await render(
        hbs`<ProjectSettings::GeneralSettings::GithubProject @project={{this.project}} />`
      );

      await click(this.selectProjectBtn);

      await clickTrigger(this.repoListSelector);

      // Select first repo in power select dropdown
      await selectChoose('.select-repo-class', '.ember-power-select-option', 0);

      await clickTrigger(this.thresholdListSelector);

      // Select first threshold in power select dropdown
      await selectChoose(
        '.select-threshold-class',
        '.ember-power-select-option',
        0
      );

      const savePrjBtn = this.editModalSaveBtn;

      await click(savePrjBtn);

      assert
        .dom(this.accountAndRepoNameSelector)
        .containsText(
          `${this.orgGithubRepos[0].owner.login}/${this.orgGithubRepos[0].name}`
        );

      assert.dom(this.prjRiskValSelector).containsText(`Low`);

      assert.dom(this.editPrjIconBtn).exists();

      assert.dom(this.deletePrjIconBtn).exists();

      assert.strictEqual(this.notifyService.successMsg, 't:repoIntegrated:()');

      // Flow for updating the existing JiraIntegration
      await click(this.editPrjIconBtn);

      await clickTrigger(this.repoListSelector);

      // Select first repo in power select dropdown
      await selectChoose('.select-repo-class', '.ember-power-select-option', 1);

      await clickTrigger(this.thresholdListSelector);

      // Select second threshold in power select dropdown
      await selectChoose(
        '.select-threshold-class',
        '.ember-power-select-option',
        1
      );

      // Triggers PUT request for update
      await click(savePrjBtn);

      assert
        .dom(this.accountAndRepoNameSelector)
        .containsText(
          `${this.orgGithubRepos[1].owner.login}/${this.orgGithubRepos[1].name}`
        );

      assert.dom(this.prjRiskValSelector).containsText(`Medium`);

      assert.dom(this.editPrjIconBtn).exists();

      assert.dom(this.deletePrjIconBtn).exists();

      assert.strictEqual(this.notifyService.successMsg, 't:projectUpdated:()');
    });
  }
);

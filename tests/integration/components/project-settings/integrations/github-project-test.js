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
import { faker } from '@faker-js/faker';

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

const creatOrgRepo = (propsOverride = {}) => {
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
    ...propsOverride,
  };
};

// Get Analysis Risk
const getAnalysisRisklabel = (risk) =>
  analysisRiskStatus([risk, ENUMS.ANALYSIS.COMPLETED, false]).label;

module(
  'Integration | Component | project-settings/integrations/github-project',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

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

      // Creates organization github repositories
      const orgGithubRepos = [1, 2, 3].map(() => creatOrgRepo());

      this.server.get('/organizations/:id/github_repos', () => {
        return {
          count: orgGithubRepos.length,
          next: null,
          previous: null,
          results: orgGithubRepos,
        };
      });

      // Common selectors
      const projectConfigDrawerSelector =
        '[data-test-prjSettings-integrations-configDrawer-root]';

      const configDrawerSaveBtn =
        '[data-test-prjSettings-integrations-configDrawer-saveBtn]';

      const repoListSelector =
        '[data-test-prjSettings-integrations-githubProject-configDrawer-repoList]';

      const thresholdListSelector =
        '[data-test-prjSettings-integrations-githubProject-configDrawer-thresholdList]';

      const accountAndRepoNameSelector =
        '[data-test-prjSettings-integrations-githubProject-accountAndRepo]';

      const prjRiskValSelector =
        '[data-test-projectSettings-integrations-githubProject-risk]';

      this.setProperties({
        project: store.push(normalizedProject),
        orgGithubRepos,
        // Selectors
        projectConfigDrawerSelector,
        configDrawerSaveBtn,
        repoListSelector,
        accountAndRepoNameSelector,
        thresholdListSelector,
        prjRiskValSelector,
      });
    });

    test('it renders with no github repos', async function (assert) {
      this.server.get('/organizations/:id/github_repos', () => {
        return { count: 0, next: null, previous: null, results: [] };
      });

      this.server.get('/projects/:id/github', () => {
        return new Response(404, {}, {});
      });

      await render(
        hbs`<ProjectSettings::Integrations::GithubProject @project={{this.project}} />`
      );

      assert
        .dom('[data-test-org-integration-card-title="Github"]')
        .hasText(t('github'));

      assert.dom('[data-test-org-integration-card-logo]').exists();

      assert
        .dom('[data-test-org-integration-card-integrated-chip]')
        .doesNotExist();

      assert.dom('[data-test-org-integration-card-connectBtn]').doesNotExist();

      assert.dom('[data-test-org-integration-card-selectBtn]').exists();

      await click('[data-test-org-integration-card-selectBtn]');

      assert.dom(this.projectConfigDrawerSelector).exists();

      assert
        .dom(
          '[data-test-projectSettings-integrations-githubProject-noReposInfoText]'
        )
        .containsText(t('githubNoProject'));

      assert
        .dom(
          '[data-test-projectSettings-integrations-githubProject-orgSettingsLink]'
        )

        .hasText(t('clickingHere'))
        .hasAttribute(
          'href',
          new RegExp('organization/settings/integrations', 'i')
        );
    });

    test('it renders select button with atleast one github repo and no selected project', async function (assert) {
      this.server.get('/projects/:id/github', () => {
        return new Response(404, {}, { detail: 'No connected repository' });
      });

      await render(
        hbs`<ProjectSettings::Integrations::GithubProject @project={{this.project}} />`
      );

      assert
        .dom('[data-test-org-integration-card-title="Github"]')
        .hasText(t('github'));

      assert.dom('[data-test-org-integration-card-logo]').exists();

      assert
        .dom('[data-test-org-integration-card-integrated-chip]')
        .doesNotExist();

      assert.dom('[data-test-org-integration-card-selectBtn]').exists();

      await click('[data-test-org-integration-card-selectBtn]');

      assert
        .dom(
          '[data-test-projectSettings-integrations-githubProject-noReposInfoText]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-prjSettings-integrations-githubProject-configDrawer-headerText]'
        )
        .hasText(t('otherTemplates.selectGHRepo'));

      assert.dom(this.configDrawerSaveBtn).hasText(t('save'));
    });

    test('it opens and closes project config drawer', async function (assert) {
      this.server.get('/projects/:id/github', () => {
        return {};
      });

      await render(
        hbs`<ProjectSettings::Integrations::GithubProject @project={{this.project}} />`
      );

      assert.dom(this.projectConfigDrawerSelector).doesNotExist();

      await click('[data-test-org-integration-card-selectBtn]');

      assert.dom(this.projectConfigDrawerSelector).exists();

      assert
        .dom(
          `[data-test-prjSettings-integrations-githubProject-configDrawer-headerText]`
        )
        .hasText(t('otherTemplates.selectGHRepo'));

      assert.dom(this.configDrawerSaveBtn).hasText(t('save'));

      const cancelBtnSelector =
        '[data-test-prjSettings-integrations-configDrawer-cancelBtn]';

      assert.dom(cancelBtnSelector).hasText(t('cancel'));

      await click(cancelBtnSelector);

      assert.dom(this.projectConfigDrawerSelector).doesNotExist();
    });

    test.each(
      'It shows an error message when no project repo or threshold is selected after clicking save in config drawer',
      [
        [
          {
            account: ['This field may not be null.'],
            repo: ['This field may not be null.'],
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
        this.server.post('/projects/:id/github', () => {
          this.set('hasAttemptedCreatingRepo', true);

          return new Response(400, {}, { ...error });
        });

        this.server.get('/projects/:id/github', () => {
          return new Response(404, {}, { detail: 'No connected repository' });
        });

        await render(
          hbs`<ProjectSettings::Integrations::GithubProject @project={{this.project}} />`
        );

        await click('[data-test-org-integration-card-selectBtn]');

        assert.dom(this.projectConfigDrawerSelector).exists();

        await click(this.configDrawerSaveBtn);

        if (this.hasAttemptedCreatingRepo) {
          assert.strictEqual(this.notifyService.errorMsg, message());
        }
      }
    );

    test('it renders the fetched github repos on the config drawer correctly', async function (assert) {
      this.server.get('/projects/:id/github', () => {
        return new Response(404, {}, { detail: 'No connected repository' });
      });

      await render(
        hbs`<ProjectSettings::Integrations::GithubProject @project={{this.project}} />`
      );

      await click('[data-test-org-integration-card-selectBtn]');

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
      assert.expect(7);

      this.server.post('/projects/:id/github', (schema, req) => {
        const requestBody = JSON.parse(req.requestBody);

        // Create a Github Repo for this request
        const createdGithubPrj = this.server.create('github-repo', requestBody);

        this.set('createdGithubPrj', createdGithubPrj);

        return new Response(201, {}, { id: req.params.id, ...requestBody });
      });

      this.server.get('/projects/:id/github', () => {
        return new Response(404, {}, { detail: 'No connected repository' });
      });

      await render(
        hbs`<ProjectSettings::Integrations::GithubProject @project={{this.project}} />`
      );

      await click('[data-test-org-integration-card-selectBtn]');

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

      await click(this.configDrawerSaveBtn);

      assert
        .dom('[data-test-org-integration-card-integrated-chip]')
        .hasText(t('integrated'));

      assert
        .dom('[data-test-org-integration-card-manageBtn]')
        .containsText(t('manage'));

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom(
          '[data-test-prjSettings-integrations-githubProject-repoHeaderText]'
        )
        .hasText(t('repo'));

      assert
        .dom(
          '[data-test-prjSettings-integrations-githubProject-riskHeaderText]'
        )
        .hasText(t('threshold'));

      assert
        .dom(this.accountAndRepoNameSelector)
        .containsText(
          `${this.createdGithubPrj.account}/${this.createdGithubPrj.repo}`
        );

      assert
        .dom(this.prjRiskValSelector)
        .hasText(getAnalysisRisklabel(this.createdGithubPrj.risk_threshold));

      assert.strictEqual(this.notifyService.successMsg, t('repoIntegrated'));
    });

    test('it deletes selected repo when delete trigger is clicked', async function (assert) {
      assert.expect(10);

      const createdGithubPrj = this.server.create('github-repo');

      this.server.get('/projects/:id/github', () => {
        return new Response(201, {}, { ...createdGithubPrj.toJSON() });
      });

      this.server.delete('/projects/:id/github', () => {
        return new Response(200, {});
      });

      await render(
        hbs`<ProjectSettings::Integrations::GithubProject @project={{this.project}} />`
      );

      assert
        .dom('[data-test-org-integration-card-integrated-chip]')
        .hasText(t('integrated'));

      assert
        .dom('[data-test-org-integration-card-manageBtn]')
        .containsText(t('manage'));

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom(this.accountAndRepoNameSelector)
        .containsText(`${createdGithubPrj.account}/${createdGithubPrj.repo}`);

      assert
        .dom(this.prjRiskValSelector)
        .hasText(getAnalysisRisklabel(createdGithubPrj.risk_threshold));

      await click(
        '[data-test-prjsettings-integrations-configdrawer-deletebtn]'
      );

      assert
        .dom('[data-test-prjSettings-integrations-configDrawer-title]')
        .containsText(t('githubIntegration'));

      assert
        .dom('[data-test-prjSettings-integrations-githubProject-confirmDelete]')
        .containsText(t('yesDelete'));

      await click(
        '[data-test-prjSettings-integrations-githubProject-confirmDelete]'
      );

      assert.strictEqual(
        this.notifyService.successMsg,
        t('projectRemoved'),
        'Displays the right success message'
      );

      assert.dom(this.accountAndRepoNameSelector).doesNotExist();

      assert.dom(this.prjRiskValSelector).doesNotExist();

      // Check for select button
      assert
        .dom('[data-test-org-integration-card-selectBtn]')
        .hasText(t('selectProject'));
    });

    test('it edits the project when a new repo is selected', async function (assert) {
      assert.expect(9);

      const createdGithubPrj = this.server.create('github-repo', {
        project: this.project.id,
        risk_threshold: ENUMS.RISK.HIGH,
      });

      const orgGithubRepos = [
        ...this.orgGithubRepos,
        creatOrgRepo({
          name: createdGithubPrj.repo,
          owner: {
            name: null,
            login: createdGithubPrj.account,
          },
        }),
      ];

      this.server.get('/organizations/:id/github_repos', () => {
        return {
          count: orgGithubRepos.length,
          next: null,
          previous: null,
          results: orgGithubRepos,
        };
      });

      this.server.get('/projects/:id/github', () => {
        return new Response(201, {}, { ...createdGithubPrj.toJSON() });
      });

      this.server.put('/projects/:id/github', (schema, req) => {
        const requestBody = JSON.parse(req.requestBody);

        this.set('requestBody', requestBody);

        return schema.githubRepos
          .where((prj) => prj.project === req.params.id)
          .models[0].update(requestBody)
          .toJSON();
      });

      await render(
        hbs`<ProjectSettings::Integrations::GithubProject @project={{this.project}} />`
      );

      assert
        .dom('[data-test-org-integration-card-integrated-chip]')
        .hasText(t('integrated'));

      assert
        .dom('[data-test-org-integration-card-manageBtn]')
        .containsText(t('manage'));

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom(this.accountAndRepoNameSelector)
        .containsText(`${createdGithubPrj.account}/${createdGithubPrj.repo}`);

      assert
        .dom(this.prjRiskValSelector)
        .hasText(getAnalysisRisklabel(createdGithubPrj.risk_threshold));

      assert
        .dom('[data-test-prjSettings-integrations-githubProject-editBtn]')
        .exists();

      // Flow for updating the existing Github Integration
      await click('[data-test-prjSettings-integrations-githubProject-editBtn]');

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
      await click(this.configDrawerSaveBtn);

      assert.strictEqual(this.notifyService.successMsg, t('projectUpdated'));

      assert
        .dom('[data-test-org-integration-card-manageBtn]')
        .containsText(t('manage'));

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom(this.accountAndRepoNameSelector)
        .containsText(`${this.requestBody.account}/${this.requestBody.repo}`);

      assert.dom(this.prjRiskValSelector).containsText(`Medium`);
    });
  }
);

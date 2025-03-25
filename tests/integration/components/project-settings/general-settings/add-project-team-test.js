import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  click,
  fillIn,
  findAll,
  render,
  triggerEvent,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

module(
  'Integration | Component | project-settings/general-settings/add-project-team',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      // Server mocks
      this.server.get('/organizations/:id/teams', (schema) => {
        const results = schema.organizationTeams.all().models;
        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/organizations/:id/users', (schema, req) =>
        schema.organizationUsers.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.createList('organization', 1);
      this.server.createList('organization-me', 1);
      const orgTeamModels = this.server.createList('organization-team', 3);

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

      this.setProperties({
        project: store.push(normalizedProject),
        orgTeamModels,
      });
    });

    test('it renders', async function (assert) {
      await render(
        hbs`<ProjectSettings::GeneralSettings::AddProjectTeam @project={{this.project}} />`
      );

      assert
        .dom('[data-test-projectSettings-generalSettings-addProjectTeam-root]')
        .exists();

      assert
        .dom('[data-test-generalSettings-addProjectTeam-buttonIcon]')
        .exists()
        .hasAttribute('icon', 'material-symbols:groups');

      assert
        .dom('[data-test-generalSettings-addProjectTeam-button]')
        .exists()
        .hasText(t('addTeam'));
    });

    test('it renders project teams drawer with table', async function (assert) {
      await render(
        hbs`<ProjectSettings::GeneralSettings::AddProjectTeam @project={{this.project}} />`
      );

      assert.dom('[data-test-generalSettings-addProjectTeam-button]').exists();

      await click('[data-test-generalSettings-addProjectTeam-button]');

      assert
        .dom('[data-test-generalSettings-addProjectTeam-drawerContainer]')
        .exists();

      assert
        .dom('[data-test-addProjectTeam-drawerContainer-title]')
        .exists()
        .containsText(t('projectSettings.drawerTitles.addTeam'));

      assert
        .dom('[data-test-addProjectTeam-drawerContainer-closeIconBtn]')
        .exists();

      assert
        .dom('[data-test-addProjectTeam-drawerContainer-tableRoot]')
        .exists();

      assert
        .dom('[data-test-addProjectTeam-drawerContainer-tableSearchTextField]')
        .exists();

      assert
        .dom(
          '[data-test-addProjectTeam-drawerContainer-tableSearchTextField-icon]'
        )
        .exists();

      // Sanity check for table items
      const projectTeams = findAll(
        '[data-test-addProjectTeam-drawerContainer-tableRow]'
      );

      assert.strictEqual(projectTeams.length, this.orgTeamModels.length);

      projectTeams.forEach((team, idx) => {
        assert
          .dom(team)
          .exists()
          .containsText(`${this.orgTeamModels[idx].name}`);
      });
    });

    test('it searches teams list', async function (assert) {
      this.server.get('/organizations/:id/teams', (schema, req) => {
        this.set('query', req.queryParams.q);

        const results = schema.organizationTeams
          .all()
          .models.filter((team) => team.name.includes(req.queryParams.q));

        return { count: results.length, next: null, previous: null, results };
      });

      await render(
        hbs`<ProjectSettings::GeneralSettings::AddProjectTeam @project={{this.project}} />`
      );

      assert.dom('[data-test-generalSettings-addProjectTeam-button]').exists();

      await click('[data-test-generalSettings-addProjectTeam-button]');

      let teamsRows = findAll(
        '[data-test-addProjectTeam-drawerContainer-tableRow]'
      );

      assert.strictEqual(teamsRows.length, this.orgTeamModels.length);

      // Search Query is set to name of the first team item
      await fillIn(
        `[data-test-addProjectTeam-drawerContainer-tableSearchTextField]`,
        this.orgTeamModels[0].name
      );

      await triggerEvent(
        '[data-test-addProjectTeam-drawerContainer-tableSearchTextField]',
        'keyup'
      );

      assert
        .dom('[data-test-addProjectTeam-drawerContainer-tableSearchTextField]')
        .isNotDisabled()
        .hasValue(this.orgTeamModels[0].name);

      assert.strictEqual(this.query, this.orgTeamModels[0].name);

      teamsRows = findAll(
        '[data-test-addProjectTeam-drawerContainer-tableRow]'
      );

      assert.strictEqual(
        teamsRows.length,
        this.orgTeamModels.filter((t) => t.name.includes(this.query)).length
      );
    });
  }
);

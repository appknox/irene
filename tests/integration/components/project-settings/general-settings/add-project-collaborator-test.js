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
  'Integration | Component | project-settings/general-settings/add-project-collaborator',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      // Server mocks
      this.server.get('/organizations/:id/members', (schema) => {
        const results = schema.organizationMembers.all().models;
        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/organizations/:id/users', (schema, req) =>
        schema.organizationUsers.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/v3/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/v3/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.createList('organization', 1);
      this.server.createList('organization-me', 1);
      this.server.createList('organization-project', 3);

      await this.owner.lookup('service:organization').load();

      const store = this.owner.lookup('service:store');
      const file = this.server.create('file', 1);
      const project = this.server.create('project', {
        id: 1,
        last_file: file,
      });

      const normalizedProject = store.normalize('project', {
        ...project.toJSON(),
      });

      this.project = store.push(normalizedProject);
    });

    test('it renders', async function (assert) {
      await render(
        hbs`<ProjectSettings::GeneralSettings::AddProjectCollaborator @project={{this.project}} />`
      );

      assert
        .dom(
          '[data-test-projectSettings-generalSettings-addProjectCollab-root]'
        )
        .exists();

      assert
        .dom('[data-test-generalSettings-addProjectCollab-buttonIcon]')
        .exists()
        .hasAttribute('icon', 'material-symbols:person');

      assert
        .dom('[data-test-generalSettings-addProjectCollab-button]')
        .exists()
        .hasText(t('addCollaborator'));
    });

    test('it renders project collaborator drawer with table', async function (assert) {
      this.server.createList('organization-member', 3);
      const orgUserModels = this.server.createList('organization-user', 3);

      await render(
        hbs`<ProjectSettings::GeneralSettings::AddProjectCollaborator @project={{this.project}} />`
      );

      assert
        .dom('[data-test-generalSettings-addProjectCollab-button]')
        .exists();

      await click('[data-test-generalSettings-addProjectCollab-button]');

      assert
        .dom('[data-test-generalSettings-addProjectCollab-drawerContainer]')
        .exists();

      assert
        .dom('[data-test-addProjectCollab-drawerContainer-title]')
        .exists()
        .containsText(t('projectSettings.drawerTitles.addCollaborator'));

      assert
        .dom('[data-test-addProjectCollab-drawerContainer-closeIconBtn]')
        .exists();

      assert
        .dom('[data-test-addProjectCollab-drawerContainer-tableRoot]')
        .exists();

      assert
        .dom(
          '[data-test-addProjectCollab-drawerContainer-tableSearchTextField]'
        )
        .exists();

      assert
        .dom(
          '[data-test-addProjectCollab-drawerContainer-tableSearchTextField-icon]'
        )
        .exists();

      // Sanity check for table items
      const collaborators = findAll(
        '[data-test-addProjectCollab-drawerContainer-tableRow]'
      );

      assert.strictEqual(collaborators.length, orgUserModels.length);

      collaborators.forEach((collab, idx) => {
        assert
          .dom(collab)
          .exists()
          .containsText(`${orgUserModels[idx].username}`);
      });
    });

    test('it searches collaborators list', async function (assert) {
      this.server.get('/organizations/:id/members', (schema, req) => {
        this.set('query', req.queryParams.q);

        const results = schema.organizationMembers
          .all()
          .models.filter((member) => {
            const user = schema.organizationUsers.find(member.member);
            return user.username.includes(req.queryParams.q);
          });

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.createList('organization-member', 3);
      const orgUserModels = this.server.createList('organization-user', 3);

      await render(
        hbs`<ProjectSettings::GeneralSettings::AddProjectCollaborator @project={{this.project}} />`
      );

      assert
        .dom('[data-test-generalSettings-addProjectCollab-button]')
        .exists();

      await click('[data-test-generalSettings-addProjectCollab-button]');

      let orgUsersRows = findAll(
        '[data-test-addProjectCollab-drawerContainer-tableRow]'
      );

      assert.strictEqual(orgUsersRows.length, orgUserModels.length);

      // Search Query is set to username of the first collaborator item
      await fillIn(
        `[data-test-addProjectCollab-drawerContainer-tableSearchTextField]`,
        orgUserModels[0].username
      );

      await triggerEvent(
        '[data-test-addProjectCollab-drawerContainer-tableSearchTextField]',
        'keyup'
      );

      assert
        .dom(
          '[data-test-addProjectCollab-drawerContainer-tableSearchTextField]'
        )
        .isNotDisabled()
        .hasValue(orgUserModels[0].username);

      assert.strictEqual(this.query, orgUserModels[0].username);

      orgUsersRows = findAll(
        '[data-test-addProjectCollab-drawerContainer-tableRow]'
      );

      assert.strictEqual(orgUsersRows.length, 1);
    });
  }
);

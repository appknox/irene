import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';
import { Response } from 'miragejs';

class RealtimeStub extends Service {
  ProjectCollaboratorCounter = 0;
}

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
  'Integration | Component | project-settings/general-settings/collaborators-table',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      // Server mocks
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
      await this.owner.lookup('service:organization').load();

      this.owner.register('service:realtime', RealtimeStub);
      this.owner.register('service:notifications', NotificationsStub);

      this.server.createList('organization-me', 1);
      const orgUsers = this.server.createList('organization-user', 3);

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
        orgUsers,
      });
    });

    test('it renders loading state and empty state if collaborators list is empty', async function (assert) {
      this.server.get(
        '/organizations/:id/projects/:projectID/collaborators',
        () => {
          return {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };
        },
        { timing: 150 }
      );

      render(
        hbs`<ProjectSettings::GeneralSettings::CollaboratorsTable @project={{this.project}} />`
      );

      await waitFor(
        '[data-test-projectSettings-generalSettings-collaboratorsTableLoader]',
        { timeout: 150 }
      );

      assert
        .dom(
          '[data-test-projectSettings-generalSettings-collaboratorsTableLoader]'
        )
        .exists();

      await waitFor(
        '[data-test-projectSettings-generalSettings-collaboratorsTableEmpty]',
        {
          timeout: 150,
        }
      );

      assert
        .dom(
          '[data-test-projectSettings-generalSettings-collaboratorsTableEmpty]'
        )
        .exists()
        .containsText(t('noCollaborators'));
    });

    test('it renders collaborators list', async function (assert) {
      this.server.get(
        '/organizations/:id/projects/:projectID/collaborators',
        (schema) => {
          const results = schema.projectCollaborators.all().models;
          return { count: results.length, next: null, previous: null, results };
        }
      );

      this.prjCollaborators = this.server.createList('project-collaborator', 3);

      await render(
        hbs`<ProjectSettings::GeneralSettings::CollaboratorsTable @project={{this.project}} />`
      );

      assert
        .dom('[data-test-projectSettings-generalSettings-collaboratorsTable]')
        .exists();

      const collaboratorRows = findAll(
        '[data-test-generalSettings-collaboratorsTable-row]'
      );

      collaboratorRows.forEach((row, idx) => {
        const username = this.prjCollaborators[idx].username;

        assert
          .dom(
            '[data-test-generalSettings-collaboratorsTable-collaboratorInfo]',
            row
          )
          .exists()
          .containsText(username)
          .containsText(this.orgUsers[idx].email);

        const checkboxSelector = `[data-test-generalSettings-collaboratorsTable-editAccess="${username}"]`;

        if (this.prjCollaborators[idx].write) {
          assert.dom(checkboxSelector, row).exists().isChecked();
        } else {
          assert.dom(checkboxSelector, row).exists().isNotChecked();
        }

        assert
          .dom(
            `[data-test-generalSettings-collaboratorsTable-deleteIcon="${username}"]`,
            row
          )
          .exists();
      });
    });

    test("it edits a collaborator's write access", async function (assert) {
      this.server.get(
        '/organizations/:id/projects/:projectID/collaborators',
        (schema) => {
          const results = schema.projectCollaborators.all().models;
          return { count: results.length, next: null, previous: null, results };
        }
      );

      this.server.put(
        '/organizations/:orgID/projects/:projectID/collaborators/:id',
        (schema, req) => {
          const reqBody = JSON.parse(req.requestBody);
          this.set('accessChecked', reqBody.write);

          const collaborator = schema.projectCollaborators
            .find(req.params.id)
            ?.toJSON();

          return { ...collaborator, ...reqBody };
        }
      );

      // Set write access of first collaborator to false originally
      this.prjCollaborators = [false, true].map((write, idx) =>
        this.server.create('project-collaborator', { id: idx + 1, write })
      );

      await render(
        hbs`<ProjectSettings::GeneralSettings::CollaboratorsTable @project={{this.project}} />`
      );

      assert
        .dom('[data-test-projectSettings-generalSettings-collaboratorsTable]')
        .exists();

      const collaboratorRows = findAll(
        '[data-test-generalSettings-collaboratorsTable-row]'
      );

      // Gets first collaborator in list
      const firstCollaborator = this.prjCollaborators[0];

      assert
        .dom(
          '[data-test-generalSettings-collaboratorsTable-collaboratorInfo]',
          collaboratorRows[0]
        )
        .exists()
        .containsText(firstCollaborator.username)
        .containsText(this.orgUsers[0].email);

      const checkboxSelector = `[data-test-generalSettings-collaboratorsTable-editAccess="${firstCollaborator.username}"]`;
      assert.dom(checkboxSelector, collaboratorRows[0]).exists().isNotChecked();

      await click(checkboxSelector);

      assert.dom(checkboxSelector, collaboratorRows[0]).exists().isChecked();

      await click(checkboxSelector);

      assert.dom(checkboxSelector, collaboratorRows[0]).exists().isNotChecked();
    });

    test.each(
      'it deletes a collaborator',
      [true, false],
      async function (assert, pass) {
        this.server.get(
          '/organizations/:id/projects/:projectID/collaborators',
          (schema) => {
            let results = schema.projectCollaborators.all().models;
            results = this.userRemoved ? results.slice(1) : results;

            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          }
        );

        this.server.delete(
          '/organizations/:orgID/projects/:projectID/collaborators/:id',
          () => {
            if (!pass) {
              return new Response(500, {}, { errors: ['server error'] });
            }

            this.set('userRemoved', true);
            return new Response(204);
          }
        );

        this.prjCollaborators = this.server.createList(
          'project-collaborator',
          2
        );

        await render(
          hbs`<ProjectSettings::GeneralSettings::CollaboratorsTable @project={{this.project}} />`
        );

        assert
          .dom('[data-test-projectSettings-generalSettings-collaboratorsTable]')
          .exists();

        let collaboratorRows = findAll(
          '[data-test-generalSettings-collaboratorsTable-row]'
        );

        assert.strictEqual(collaboratorRows.length, 2);

        // Gets first collaborator in list
        const firstCollaborator = this.prjCollaborators[0];

        assert
          .dom(
            '[data-test-generalSettings-collaboratorsTable-collaboratorInfo]',
            collaboratorRows[0]
          )
          .exists()
          .containsText(firstCollaborator.username)
          .containsText(this.orgUsers[0].email);

        const deleteIcon = `[data-test-generalSettings-collaboratorsTable-deleteIcon="${firstCollaborator.username}"]`;
        assert.dom(deleteIcon, collaboratorRows[0]).exists();

        await click(deleteIcon);

        await click('[data-test-confirmbox-confirmBtn]');

        if (pass) {
          const notify = this.owner.lookup('service:notifications');

          assert.strictEqual(notify.successMsg, t('collaboratorRemoved'));

          collaboratorRows = findAll(
            '[data-test-generalSettings-collaboratorsTable-row]'
          );

          assert.strictEqual(collaboratorRows.length, 1);
        } else {
          const notify = this.owner.lookup('service:notifications');

          assert.strictEqual(notify.errorMsg, t('pleaseTryAgain'));

          collaboratorRows = findAll(
            '[data-test-generalSettings-collaboratorsTable-row]'
          );

          assert.strictEqual(collaboratorRows.length, 2);
        }
      }
    );
  }
);

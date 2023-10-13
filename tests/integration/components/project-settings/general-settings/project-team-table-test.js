import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';
import { Response } from 'miragejs';

class RealtimeStub extends Service {
  ProjectNonTeamCounter = 0;
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
  'Integration | Component | project-settings/general-settings/project-team-table',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      // Server mocks
      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get(
        '/organizations/:orgID/teams/:teamID/projects/:id',
        (schema, req) => {
          return schema.projectTeams.find(req.params.id)?.toJSON();
        }
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
      });
    });

    test('it renders loading state and empty state if teams list is empty', async function (assert) {
      this.server.get(
        '/organizations/:orgID/projects/:projectID/teams',
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
        hbs`<ProjectSettings::GeneralSettings::ProjectTeamTable @project={{this.project}} />`
      );

      await waitFor(
        '[data-test-projectSettings-generalSettings-projectTeamTableLoader]',
        { timeout: 150 }
      );

      assert
        .dom(
          '[data-test-projectSettings-generalSettings-projectTeamTableLoader]'
        )
        .exists();

      await waitFor(
        '[data-test-projectSettings-generalSettings-projectTeamTableEmpty]',
        {
          timeout: 150,
        }
      );

      assert
        .dom(
          '[data-test-projectSettings-generalSettings-projectTeamTableEmpty]'
        )
        .exists()
        .containsText('t:noTeams:()');
    });

    test('it renders project teams list', async function (assert) {
      this.server.get(
        '/organizations/:orgID/projects/:projectID/teams',
        (schema) => {
          const results = schema.projectTeams.all().models;
          return { count: results.length, next: null, previous: null, results };
        }
      );

      this.prjTeams = this.server.createList('project-team', 3);

      await render(
        hbs`<ProjectSettings::GeneralSettings::ProjectTeamTable @project={{this.project}} />`
      );

      assert
        .dom('[data-test-projectSettings-generalSettings-projectTeamTable]')
        .exists();

      const prjTeamRows = findAll(
        '[data-test-generalSettings-projectTeamTable-row]'
      );

      prjTeamRows.forEach((row, idx) => {
        const team = this.prjTeams[idx];

        assert
          .dom('[data-test-generalSettings-projectTeamTable-teamInfoLink]', row)
          .exists()
          .containsText(team.name);

        assert
          .dom('[data-test-generalSettings-projectTeamTable-teamInfo]', row)
          .exists()
          .containsText(team.members_count)
          .containsText('t:members:()');

        const checkboxSelector = `[data-test-generalSettings-projectTeamTable-editAccess="${team.name}"]`;

        if (this.prjTeams[idx].write) {
          assert.dom(checkboxSelector, row).exists().isChecked();
        } else {
          assert.dom(checkboxSelector, row).exists().isNotChecked();
        }

        assert
          .dom(
            `[data-test-generalSettings-projectTeamTable-deleteIcon="${team.name}"]`,
            row
          )
          .exists();
      });
    });

    test("it edits a team's write access", async function (assert) {
      this.server.get(
        '/organizations/:id/projects/:projectID/teams',
        (schema) => {
          const results = schema.projectTeams.all().models;
          return { count: results.length, next: null, previous: null, results };
        }
      );

      this.server.put(
        '/organizations/:orgID/teams/:teamID/projects/:id',
        (schema, req) => {
          const reqBody = JSON.parse(req.requestBody);
          this.set('accessChecked', reqBody.write);

          const team = schema.projectTeams.find(req.params.id)?.toJSON();

          return { ...team, ...reqBody };
        }
      );

      // Set write access of first team to false originally
      this.prjTeams = [false, true].map((write, idx) =>
        this.server.create('project-team', { id: idx + 1, write })
      );

      await render(
        hbs`<ProjectSettings::GeneralSettings::ProjectTeamTable @project={{this.project}} />`
      );

      assert
        .dom('[data-test-projectSettings-generalSettings-projectTeamTable]')
        .exists();

      const teamsTable = findAll(
        '[data-test-generalSettings-projectTeamTable-row]'
      );

      // Gets first team in list
      const firstTeam = this.prjTeams[0];

      assert
        .dom(
          '[data-test-generalSettings-projectTeamTable-teamInfo]',
          teamsTable[0]
        )
        .exists()
        .containsText(firstTeam.name)
        .containsText(firstTeam.members_count);

      const checkboxSelector = `[data-test-generalSettings-projectTeamTable-editAccess="${firstTeam.name}"]`;
      assert.dom(checkboxSelector, teamsTable[0]).exists().isNotChecked();

      await click(checkboxSelector);

      assert.dom(checkboxSelector, teamsTable[0]).exists().isChecked();
      assert.ok(this.accessChecked);

      const notify = this.owner.lookup('service:notifications');
      assert.strictEqual(notify.successMsg, 't:permissionChanged:()');

      await click(checkboxSelector);

      assert.dom(checkboxSelector, teamsTable[0]).exists().isNotChecked();
      assert.notOk(this.accessChecked);

      assert.strictEqual(notify.successMsg, 't:permissionChanged:()');
    });

    test.each(
      'it deletes a team',
      [true, false],
      async function (assert, pass) {
        this.server.get(
          '/organizations/:id/projects/:projectID/teams',
          (schema) => {
            let results = schema.projectTeams.all().models;
            results = this.teamRemoved ? results.slice(1) : results;

            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          }
        );

        this.server.delete(
          '/organizations/:orgID/teams/:teamID/projects/:id',
          () => {
            if (!pass) {
              return new Response(500, {}, { errors: ['server error'] });
            }

            this.set('teamRemoved', true);
            return new Response(204);
          }
        );

        // Set write access of first team to false originally
        this.prjTeams = this.server.createList('project-team', 2);

        await render(
          hbs`<ProjectSettings::GeneralSettings::ProjectTeamTable @project={{this.project}} />`
        );

        assert
          .dom('[data-test-projectSettings-generalSettings-projectTeamTable]')
          .exists();

        let prjTeamRows = findAll(
          '[data-test-generalSettings-projectTeamTable-row]'
        );

        assert.strictEqual(prjTeamRows.length, 2);

        // Gets first team in list
        const firstTeam = this.prjTeams[0];

        assert
          .dom(
            '[data-test-generalSettings-projectTeamTable-teamInfo]',
            prjTeamRows[0]
          )
          .exists()
          .containsText(firstTeam.name)
          .containsText(firstTeam.members_count);

        const deleteIcon = `[data-test-generalSettings-projectTeamTable-deleteIcon="${firstTeam.name}"]`;
        assert.dom(deleteIcon, prjTeamRows[0]).exists();

        await click(deleteIcon);

        await click('[data-test-confirmbox-confirmBtn]');

        if (pass) {
          const notify = this.owner.lookup('service:notifications');

          assert.strictEqual(notify.successMsg, 't:teamRemoved:()');

          prjTeamRows = findAll(
            '[data-test-generalSettings-projectTeamTable-row]'
          );

          assert.strictEqual(prjTeamRows.length, 1);
        } else {
          const notify = this.owner.lookup('service:notifications');

          assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');

          prjTeamRows = findAll(
            '[data-test-generalSettings-projectTeamTable-row]'
          );

          assert.strictEqual(prjTeamRows.length, 2);
        }
      }
    );
  }
);

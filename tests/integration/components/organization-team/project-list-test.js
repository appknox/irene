import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import {
  click,
  render,
  findAll,
  fillIn,
  triggerEvent,
} from '@ember/test-helpers';

import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import { capitalize } from '@ember/string';
import { Response } from 'miragejs';

import Service from '@ember/service';

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
  'Integration | Component | organization-team/project-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');
      const organizationMe = store.createRecord('organization-me', {
        is_owner: true,
        is_admin: true,
      });

      class OrganizationMeStub extends Service {
        org = organizationMe;
      }

      const organizationProjects = this.server.createList(
        'organization-project',
        2
      );

      const projects = this.server.createList('project', 2);

      const [team] = this.server.createList('organization-team', 1);

      const organizationTeam = store.createRecord('organization-team', {
        id: team.id,
        name: team.name,
        membersCount: team.members_count,
        projectsCount: team.projects_count,
        organization: team.organization,
      });

      await this.owner.lookup('service:organization').load();

      this.setProperties({
        organization: this.owner.lookup('service:organization').selected,
        organizationTeam,
        organizationProjects,
        projects,
      });

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it renders project-list', async function (assert) {
      this.set('handleActiveAction', () => {});

      this.server.get('/organizations/:id/teams/:teamId/projects', (schema) => {
        const results = schema.organizationProjects.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      await render(
        hbs(
          `<OrganizationTeam::ProjectList @organization={{this.organization}} @team={{this.organizationTeam}} @handleActiveAction={{this.handleActiveAction}} />`
        )
      );

      assert.dom('[data-test-teamProjectList-title]').hasText(t('projects'));

      assert
        .dom('[data-test-teamProjectList-description]')
        .hasText(t('teamProjectsDesc'));

      assert
        .dom('[data-test-teamProjectList-addProjectBtn]')
        .isNotDisabled()
        .hasText(t('addProject'));

      const projectHeaderRows = findAll('[data-test-teamProjectList-thead] th');

      assert.dom(projectHeaderRows[0]).hasText(capitalize(t('project')));
      assert.dom(projectHeaderRows[1]).hasText(t('accessPermissions'));
      assert.dom(projectHeaderRows[2]).hasText(t('action'));

      const projectContentRows = findAll('[data-test-teamProjectList-row]');

      assert.strictEqual(
        projectContentRows.length,
        this.organizationProjects.length
      );

      const projectContentRow = projectContentRows[0].querySelectorAll(
        '[data-test-teamProjectList-cell]'
      );

      assert.dom(projectContentRow[0]).hasText(this.projects[0].package_name);

      assert
        .dom('[data-test-ak-form-label]', projectContentRow[1])
        .hasText(t('allowEdit'));

      assert
        .dom('[data-test-accessPermission-checkbox]', projectContentRow[1])
        [this.organizationProjects[0].write ? 'isChecked' : 'isNotChecked']();

      assert
        .dom('[data-test-teamProjectList-actionBtn]', projectContentRow[2])
        .isNotDisabled();
    });

    // TODO: remove skip once ui is uncommmented
    test.skip('test project-list search', async function (assert) {
      this.set('handleActiveAction', () => {});

      this.server.get(
        '/organizations/:id/teams/:teamId/projects',
        (schema, req) => {
          this.set('query', req.queryParams.q);

          const results = schema.organizationProjects.all().models;

          return { count: results.length, next: null, previous: null, results };
        }
      );

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      await render(
        hbs(
          `<OrganizationTeam::ProjectList @organization={{this.organization}} @team={{this.organizationTeam}} @handleActiveAction={{this.handleActiveAction}} />`
        )
      );

      assert.dom('[data-test-teamProjectList-title]').hasText(t('projects'));
      assert.dom('[data-test-teamProjectList-searchInput]').hasNoValue();
      assert.notOk(this.query);

      await fillIn('[data-test-teamProjectList-searchInput]', 'test');
      await triggerEvent('[data-test-teamProjectList-searchInput]', 'keyup');

      assert
        .dom('[data-test-teamProjectList-searchInput]')
        .hasValue(this.query);

      assert.strictEqual(this.query, 'test');
    });

    test.each(
      'test project-list project write access',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        this.set('handleActiveAction', () => {});

        this.server.get(
          '/organizations/:id/teams/:teamId/projects',
          (schema) => {
            const results = schema.organizationProjects.all().models;

            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          }
        );

        this.server.get('/v2/projects/:id', (schema, req) => {
          return schema.projects.find(`${req.params.id}`)?.toJSON();
        });

        this.server.put(
          '/organizations/:id/teams/:teamId/projects/:projectId',
          () => {
            return fail ? new Response(500) : {};
          }
        );

        await render(
          hbs(
            `<OrganizationTeam::ProjectList @organization={{this.organization}} @team={{this.organizationTeam}} @handleActiveAction={{this.handleActiveAction}} />`
          )
        );

        const contentRows = findAll('[data-test-teamProjectList-row]');

        assert.strictEqual(
          contentRows.length,
          this.organizationProjects.length
        );

        const contentRow = contentRows[0].querySelectorAll(
          '[data-test-teamProjectList-cell]'
        );

        assert
          .dom('[data-test-ak-form-label]', contentRow[1])
          .hasText(t('allowEdit'));

        assert
          .dom('[data-test-accessPermission-checkbox]', contentRow[1])
          .isNotDisabled()
          [this.organizationProjects[0].write ? 'isChecked' : 'isNotChecked']();

        await click('[data-test-accessPermission-checkbox]');

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, t('pleaseTryAgain'));
        } else {
          assert.strictEqual(notify.successMsg, t('permissionChanged'));
        }
      }
    );

    test.each(
      'test project-list project remove',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        this.setProperties({
          handleActiveAction: () => {},
          projectRemoved: false,
        });

        this.server.get(
          '/organizations/:id/teams/:teamId/projects',
          (schema) => {
            const results = this.projectRemoved
              ? schema.organizationProjects.all().models.slice(1)
              : schema.organizationProjects.all().models;

            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          }
        );

        this.server.get('/v2/projects/:id', (schema, req) => {
          return schema.projects.find(`${req.params.id}`)?.toJSON();
        });

        this.server.delete(
          '/organizations/:id/teams/:teamId/projects/:projectId',
          () => {
            return new Response(fail ? 500 : 204);
          }
        );

        this.server.get('/organizations/:id/teams/:teamId', (schema, req) =>
          schema.organizationTeams.find(`${req.params.id}`)?.toJSON()
        );

        await render(
          hbs(
            `<OrganizationTeam::ProjectList @organization={{this.organization}} @team={{this.organizationTeam}} @handleActiveAction={{this.handleActiveAction}} />`
          )
        );

        const contentRows = findAll('[data-test-teamProjectList-row]');

        assert.strictEqual(contentRows.length, this.projects.length);

        const contentRow = contentRows[0].querySelectorAll(
          '[data-test-teamProjectList-cell]'
        );

        assert
          .dom('[data-test-teamProjectList-actionBtn]', contentRow[2])
          .isNotDisabled();

        await click(
          `#${contentRow[2].id} [data-test-teamProjectList-actionBtn]`
        );

        assert.dom('[data-test-ak-modal-header]').hasText(t('confirm'));

        assert
          .dom('[data-test-confirmBox-cancelBtn]')
          .isNotDisabled()
          .hasText(t('cancel'));

        assert
          .dom('[data-test-confirmBox-confirmBtn]')
          .isNotDisabled()
          .hasText(capitalize(t('remove')));

        assert
          .dom('[data-test-confirmBox-description]')
          .hasText(t('confirmBox.removeTeamProject'));

        if (!fail) {
          this.set('projectRemoved', true);
        }

        await click('[data-test-confirmBox-confirmBtn]');

        const notify = this.owner.lookup('service:notifications');

        const latestRows = findAll('[data-test-teamProjectList-row]');

        if (fail) {
          assert.strictEqual(notify.errorMsg, t('pleaseTryAgain'));

          assert.strictEqual(latestRows.length, this.projects.length);
        } else {
          assert.strictEqual(notify.successMsg, t('projectRemoved'));

          assert.strictEqual(latestRows.length, this.projects.length - 1);
        }
      }
    );
  }
);

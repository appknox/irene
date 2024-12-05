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
import { Response } from 'miragejs';

import Service from '@ember/service';

class OrganizationMeStub extends Service {
  org = {
    is_owner: true,
    is_admin: true,
    is_member: false,
  };
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
  'Integration | Component | organization-team/add-team-project',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const projects = this.server.createList('project', 5);

      const store = this.owner.lookup('service:store');
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
        projects,
      });

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it renders add-team-project', async function (assert) {
      this.server.get('organizations/:id/projects', (schema) => {
        const results = schema.projects.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
        <OrganizationTeam::AddTeamProject @team={{this.organizationTeam}} @organization={{this.organization}}>
            <:actionContent as |ac|>
                <button data-test-action-btn type="button" disabled={{ac.actionDisabled}} {{on 'click' ac.action}}>{{ac.actionLabel}}</button>
            </:actionContent>
        </OrganizationTeam::AddTeamProject>
    `);

      assert.dom('[data-test-addProjectList-title]').hasText(t('addProject'));

      assert
        .dom('[data-test-addProjectList-description]')
        .hasText(t('addTeamProjectDesc'));

      assert
        .dom('[data-test-addProjectList-searchInput]')
        .isNotDisabled()
        .hasNoValue();

      const headerRow = findAll('[data-test-addProjectList-thead] th');

      assert.dom(headerRow[0]).hasText(t('name'));
      assert.dom(headerRow[1]).hasText(t('action'));

      const contentRows = findAll('[data-test-addProjectList-row]');

      const contentRow = contentRows[0].querySelectorAll(
        '[data-test-addProjectList-cell]'
      );

      assert.dom(contentRow[0]).hasText(this.projects[0].package_name);

      assert
        .dom('[data-test-checkbox]', contentRow[1])
        .isNotChecked()
        .isNotDisabled();

      assert
        .dom('[data-test-action-btn]')
        .isDisabled()
        .hasText(t('addProject'));
    });

    test('test add-team-project search', async function (assert) {
      this.server.get('organizations/:id/projects', (schema, req) => {
        this.set('query', req.queryParams.q);

        const results = schema.projects.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
        <OrganizationTeam::AddTeamProject @team={{this.organizationTeam}} @organization={{this.organization}}>
            <:actionContent as |ac|>
                <button data-test-action-btn type="button" disabled={{ac.actionDisabled}} {{on 'click' ac.action}}>{{ac.actionLabel}}</button>
            </:actionContent>
        </OrganizationTeam::AddTeamProject>
      `);

      assert
        .dom('[data-test-addProjectList-searchInput]')
        .isNotDisabled()
        .hasNoValue();

      assert.notOk(this.query);

      await fillIn('[data-test-addProjectList-searchInput]', 'test');
      await triggerEvent('[data-test-addProjectList-searchInput]', 'keyup');

      assert.dom('[data-test-addProjectList-searchInput]').hasValue(this.query);
    });

    test.each(
      'test add-team-project add projects action',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        this.server.get('organizations/:id/projects', (schema) => {
          const results = schema.projects.all().models;

          return { count: results.length, next: null, previous: null, results };
        });

        this.server.put(
          '/organizations/:id/teams/:teamId/projects/:projectId',
          (schema, req) => {
            schema.db.projects.remove(req.params.projectId);

            return fail ? new Response(500) : { id: req.params.teamId };
          }
        );

        this.server.get('/organizations/:id/teams/:teamId', (schema, req) =>
          schema.organizationTeams.find(`${req.params.id}`)?.toJSON()
        );

        await render(hbs`
          <OrganizationTeam::AddTeamProject @team={{this.organizationTeam}} @organization={{this.organization}}>
              <:actionContent as |ac|>
                  <button data-test-action-btn type="button" disabled={{ac.actionDisabled}} {{on 'click' ac.action}}>{{ac.actionLabel}}</button>
              </:actionContent>
          </OrganizationTeam::AddTeamProject>
        `);

        assert
          .dom('[data-test-action-btn]')
          .isDisabled()
          .hasText(t('addProject'));

        const contentRows = findAll('[data-test-addProjectList-row]');

        assert.strictEqual(contentRows.length, this.projects.length);

        const firstRow = contentRows[0].querySelectorAll(
          '[data-test-addProjectList-cell]'
        );

        const secondRow = contentRows[1].querySelectorAll(
          '[data-test-addProjectList-cell]'
        );

        // both checkbox unchecked
        assert
          .dom('[data-test-checkbox]', firstRow[1])
          .isNotChecked()
          .isNotDisabled();

        assert
          .dom('[data-test-checkbox]', secondRow[1])
          .isNotChecked()
          .isNotDisabled();

        // check first
        await click(`#${firstRow[1].id} [data-test-checkbox]`);

        assert
          .dom('[data-test-checkbox]', firstRow[1])
          .isChecked()
          .isNotDisabled();

        assert.dom('[data-test-action-btn]').isNotDisabled();

        // check second
        await click(`#${secondRow[1].id} [data-test-checkbox]`);

        assert
          .dom('[data-test-checkbox]', secondRow[1])
          .isChecked()
          .isNotDisabled();

        await click('[data-test-action-btn]');

        const notify = this.owner.lookup('service:notifications');

        const latestRows = () => findAll('[data-test-addProjectList-row]');

        if (fail) {
          assert.strictEqual(notify.errorMsg, t('pleaseTryAgain'));
          assert.strictEqual(latestRows().length, this.projects.length);
        } else {
          assert.strictEqual(notify.successMsg, t('teamProjectAdded'));
          assert.strictEqual(latestRows().length, this.projects.length - 2);
        }
      }
    );
  }
);

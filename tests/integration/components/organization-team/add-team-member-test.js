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
import { setupIntl } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
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
  'Integration | Component | organization-team/add-team-member',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

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

      const organizationUsers = this.server.createList('organization-user', 5);

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
        organizationUsers,
      });

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it renders add-team-member', async function (assert) {
      this.server.get('organizations/:id/users', (schema) => {
        const results = schema.organizationUsers.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
        <OrganizationTeam::AddTeamMember @team={{this.organizationTeam}} @organization={{this.organization}}>
            <:actionContent as |ac|>
                <button data-test-action-btn type="button" disabled={{ac.actionDisabled}} {{on 'click' ac.action}}>{{ac.actionLabel}}</button>
            </:actionContent>
        </OrganizationTeam::AddTeamMember>
    `);

      assert.dom('[data-test-addUserList-title]').hasText('t:addUsers:()');

      assert
        .dom('[data-test-addUserList-description]')
        .hasText('t:addTeamMemberDesc:()');

      assert
        .dom('[data-test-addUserList-searchInput]')
        .isNotDisabled()
        .hasNoValue();

      const headerRow = findAll('[data-test-addUserList-thead] th');

      assert.dom(headerRow[0]).hasText('t:name:()');
      assert.dom(headerRow[1]).hasText('t:action:()');

      const contentRows = findAll('[data-test-addUserList-row]');

      const contentRow = contentRows[0].querySelectorAll(
        '[data-test-addUserList-cell]'
      );

      assert.dom(contentRow[0]).hasText(this.organizationUsers[0].username);

      assert
        .dom('[data-test-checkbox]', contentRow[1])
        .isNotChecked()
        .isNotDisabled();

      assert
        .dom('[data-test-action-btn]')
        .isDisabled()
        .hasText('t:addUsers:()');
    });

    test('test add-team-member search', async function (assert) {
      this.server.get('organizations/:id/users', (schema, req) => {
        this.set('query', req.queryParams.q);

        const results = schema.organizationUsers.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
        <OrganizationTeam::AddTeamMember @team={{this.organizationTeam}} @organization={{this.organization}}>
            <:actionContent as |ac|>
                <button data-test-action-btn type="button" disabled={{ac.actionDisabled}} {{on 'click' ac.action}}>{{ac.actionLabel}}</button>
            </:actionContent>
        </OrganizationTeam::AddTeamMember>
      `);

      assert
        .dom('[data-test-addUserList-searchInput]')
        .isNotDisabled()
        .hasNoValue();

      assert.notOk(this.query);

      await fillIn('[data-test-addUserList-searchInput]', 'test');
      await triggerEvent('[data-test-addUserList-searchInput]', 'keyup');

      assert.dom('[data-test-addUserList-searchInput]').hasValue(this.query);
    });

    test.each(
      'test add-team-member add user action',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        this.set('usersAdded', false);

        this.server.get('organizations/:id/users', (schema) => {
          const results = this.usersAdded
            ? schema.organizationUsers.all().models.slice(2)
            : schema.organizationUsers.all().models;

          return { count: results.length, next: null, previous: null, results };
        });

        this.server.put(
          '/organizations/:id/teams/:teamId/members/:memId',
          () => {
            return fail ? new Response(500) : {};
          }
        );

        this.server.get('/organizations/:id/teams/:teamId', (schema, req) =>
          schema.organizationTeams.find(`${req.params.id}`)?.toJSON()
        );

        await render(hbs`
          <OrganizationTeam::AddTeamMember @team={{this.organizationTeam}} @organization={{this.organization}}>
              <:actionContent as |ac|>
                  <button data-test-action-btn type="button" disabled={{ac.actionDisabled}} {{on 'click' ac.action}}>{{ac.actionLabel}}</button>
              </:actionContent>
          </OrganizationTeam::AddTeamMember>
        `);

        assert
          .dom('[data-test-action-btn]')
          .isDisabled()
          .hasText('t:addUsers:()');

        const contentRows = findAll('[data-test-addUserList-row]');

        assert.strictEqual(contentRows.length, this.organizationUsers.length);

        const firstRow = contentRows[0].querySelectorAll(
          '[data-test-addUserList-cell]'
        );

        const secondRow = contentRows[1].querySelectorAll(
          '[data-test-addUserList-cell]'
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

        if (!fail) {
          this.set('usersAdded', true);
        }

        await click('[data-test-action-btn]');

        const notify = this.owner.lookup('service:notifications');
        const latestRows = findAll('[data-test-addUserList-row]');

        if (fail) {
          assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');
          assert.strictEqual(latestRows.length, this.organizationUsers.length);
        } else {
          assert.strictEqual(notify.successMsg, 't:teamMemberAdded:()');

          assert.strictEqual(
            latestRows.length,
            this.organizationUsers.length - 2
          );
        }
      }
    );
  }
);

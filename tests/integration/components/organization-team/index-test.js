import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import {
  click,
  render,
  fillIn,
  findAll,
  triggerEvent,
} from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import { Response } from 'miragejs';

import Service from '@ember/service';

class RouterStub extends Service {
  currentRouteName = '';
  queryParams = null;

  transitionTo({ queryParams }) {
    this.queryParams = queryParams;
  }
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

module('Integration | Component | organization-team', function (hooks) {
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

    const organizationTeams = this.server.createList('organization-team', 3);

    await this.owner.lookup('service:organization').load();

    this.setProperties({
      organization: this.owner.lookup('service:organization').selected,
      organizationTeams,
      queryParams: { team_limit: 10, team_offset: 0, team_query: '' },
    });

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:router', RouterStub);
  });

  test.each(
    'it renders organization-team',
    ['owner', 'admin', 'member'],
    async function (assert, userRole) {
      const me = this.owner.lookup('service:me');

      if (userRole === 'admin') {
        me.org.is_owner = false;
      } else if (userRole == 'member') {
        me.org.is_owner = false;
        me.org.is_admin = false;
      }

      this.server.get('/organizations/:id/teams', (schema) => {
        const results = schema.organizationTeams.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(
        hbs`<OrganizationTeam @queryParams={{this.queryParams}} @organization={{this.organization}} />`
      );

      assert
        .dom('[data-test-orgTeamSearch-input]')
        .isNotDisabled()
        .hasNoValue();

      if (userRole === 'member') {
        assert.dom('[data-test-orgCreateTeam-btn]').doesNotExist();
      } else {
        assert
          .dom('[data-test-orgCreateTeam-btn]')
          .isNotDisabled()
          .hasText('t:createTeam:()');
      }

      const teamList = findAll('[data-test-orgTeamOverview]');

      assert.strictEqual(teamList.length, this.organizationTeams.length);

      assert
        .dom('[data-test-orgTeamOverview-name]', teamList[0])
        .hasText(this.organizationTeams[0].name);

      assert
        .dom('[data-test-orgTeamOverview-membersCount]', teamList[0])
        .hasText(`t:users:() ${this.organizationTeams[0].members_count}`);

      assert
        .dom('[data-test-orgTeamOverview-projectsCount]', teamList[0])
        .hasText(`t:projects:() ${this.organizationTeams[0].projects_count}`);
    }
  );

  test('test organization-team search input & query', async function (assert) {
    this.server.get('/organizations/:id/teams', (schema, req) => {
      this.set('query', req.queryParams.q);

      const results = schema.organizationTeams.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(
      hbs`<OrganizationTeam @queryParams={{this.queryParams}} @organization={{this.organization}} />`
    );

    assert.dom('[data-test-orgTeamSearch-input]').isNotDisabled().hasNoValue();
    assert.notOk(this.query);

    await fillIn('[data-test-orgTeamSearch-input]', 'test');
    await triggerEvent('[data-test-orgTeamSearch-input]', 'keyup');

    assert.dom('[data-test-orgTeamSearch-input]').hasValue('test');
    assert.strictEqual(this.query, 'test');
  });

  test.each(
    'test organization-team create team',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      const server = this.server;

      this.server.get('/organizations/:id/teams', (schema) => {
        const results = schema.organizationTeams
          .all()
          .models.sortBy('created_on');

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.post('/organizations/:id/teams', (schema, req) => {
        return fail
          ? new Response(500)
          : server.create('organization-team', {
              name: JSON.parse(req.requestBody).name,
              created_on: Date(),
            });
      });

      await render(
        hbs`<OrganizationTeam @queryParams={{this.queryParams}} @organization={{this.organization}} />`
      );

      assert
        .dom('[data-test-orgCreateTeam-btn]')
        .isNotDisabled()
        .hasText('t:createTeam:()');

      const teamList = findAll('[data-test-orgTeamOverview]');

      assert.strictEqual(teamList.length, this.organizationTeams.length);

      await click('[data-test-orgCreateTeam-btn]');

      assert.dom('[data-test-ak-modal-header]').hasText('t:createTeam:()');

      assert.dom('[data-test-form-label]').hasText('t:createTeamInputLabel:()');

      assert
        .dom('[data-test-orgCreateTeam-input]')
        .hasNoValue()
        .isNotDisabled();

      assert
        .dom('[data-test-orgCreateTeam-submitBtn]')
        .hasText('t:createTeam:()')
        .isNotDisabled();

      // empty input case
      await click('[data-test-orgCreateTeam-submitBtn]');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, 't:enterTeamName:()');

      // fill value
      await fillIn('[data-test-orgCreateTeam-input]', 'testTeam');

      await click('[data-test-orgCreateTeam-submitBtn]');

      if (fail) {
        assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');

        assert.dom('[data-test-ak-modal-header]').exists();
        assert.dom('[data-test-orgCreateTeam-submitBtn]').exists();

        assert
          .dom('[data-test-orgCreateTeam-input]')
          .exists()
          .hasValue('testTeam');

        assert.strictEqual(teamList.length, this.organizationTeams.length);
      } else {
        assert.strictEqual(notify.successMsg, 't:teamCreated:()');

        assert.dom('[data-test-ak-modal-header]').doesNotExist();
        assert.dom('[data-test-orgCreateTeam-submitBtn]').doesNotExist();
        assert.dom('[data-test-orgCreateTeam-input]').doesNotExist();

        const teamList = findAll('[data-test-orgTeamOverview]');

        assert.strictEqual(teamList.length, this.organizationTeams.length + 1);

        assert
          .dom('[data-test-orgTeamOverview-name]', teamList[0])
          .hasText('testTeam');
      }
    }
  );
});

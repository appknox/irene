import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, findAll } from '@ember/test-helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';

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

module('Integration | Component | organization-team', function (hooks) {
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

    const organizationTeams = this.server.createList('organization-team', 3);

    await this.owner.lookup('service:organization').load();

    this.setProperties({
      organization: this.owner.lookup('service:organization').selected,
      organizationTeams,
      queryParams: { team_limit: 10, team_offset: 0, team_query: '' },
    });

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
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
          .hasText(t('createTeam'));
      }

      const teamList = findAll('[data-test-orgTeamOverview]');

      assert.strictEqual(teamList.length, this.organizationTeams.length);

      assert
        .dom('[data-test-orgTeamOverview-name]', teamList[0])
        .hasText(this.organizationTeams[0].name);

      assert
        .dom('[data-test-orgTeamOverview-membersCount]', teamList[0])
        .hasText(`${t('users')} ${this.organizationTeams[0].members_count}`);

      assert
        .dom('[data-test-orgTeamOverview-projectsCount]', teamList[0])
        .hasText(
          `${t('projects')} ${this.organizationTeams[0].projects_count}`
        );
    }
  );
});

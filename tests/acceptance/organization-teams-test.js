import { module, test } from 'qunit';

import {
  click,
  visit,
  findAll,
  currentURL,
  fillIn,
  triggerEvent,
} from '@ember/test-helpers';

import { setupApplicationTest } from 'ember-qunit';
import { setupRequiredEndpoints } from '../helpers/acceptance-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isPendoEnabled() {
    return false;
  }

  isCrispEnabled() {
    return false;
  }
}

class WebsocketStub extends Service {
  async connect() {}

  async configure() {}
}

module('Acceptance | organization teams', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    const organizationTeams = this.server.createList('organization-team', 3);

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.setProperties({
      organizationTeams,
    });
  });

  test('test organization-team search input & query', async function (assert) {
    this.server.get('/organizations/:id/teams', (schema, req) => {
      this.set('query', req.queryParams.q);

      const results = schema.organizationTeams.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await visit('/dashboard/organization/teams');

    assert.dom('[data-test-orgTeamSearch-input]').isNotDisabled().hasNoValue();
    assert.notOk(this.query);

    await fillIn('[data-test-orgTeamSearch-input]', 'test');
    await triggerEvent('[data-test-orgTeamSearch-input]', 'keyup');

    assert.dom('[data-test-orgTeamSearch-input]').hasValue('test');
    assert.strictEqual(this.query, 'test');

    assert.ok(currentURL().includes('team_query=test'));
  });

  test.each(
    'test organization-team create team',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      const notify = this.owner.lookup('service:notifications');

      notify.setDefaultClearDuration(0);

      const server = this.server;

      this.server.get('/organizations/:id/teams', (schema) => {
        const results = schema.organizationTeams.all().models.sort((a, b) => {
          return (
            new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
          );
        });

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.post('/organizations/:id/teams', (schema, req) => {
        return fail
          ? new Response(500)
          : server
              .create('organization-team', {
                name: JSON.parse(req.requestBody).name,
                created_on: new Date().toISOString(),
              })
              .toJSON();
      });

      this.server.get('/organizations/:id', (schema, req) =>
        schema.organizations.find(`${req.params.id}`)?.toJSON()
      );

      await visit('/dashboard/organization/teams');

      assert
        .dom('[data-test-orgCreateTeam-btn]')
        .isNotDisabled()
        .hasText(t('createTeam'));

      const teamList = findAll('[data-test-orgTeamOverview]');

      assert.strictEqual(teamList.length, this.organizationTeams.length);

      await click('[data-test-orgCreateTeam-btn]');

      assert.dom('[data-test-ak-modal-header]').hasText(t('createTeam'));

      assert.dom('[data-test-form-label]').hasText(t('createTeamInputLabel'));

      assert
        .dom('[data-test-orgCreateTeam-input]')
        .hasNoValue()
        .isNotDisabled();

      assert
        .dom('[data-test-orgCreateTeam-submitBtn]')
        .hasText(t('createTeam'))
        .isNotDisabled();

      // empty input case
      await click('[data-test-orgCreateTeam-submitBtn]');

      // TODO: find a way to check notification message

      // fill value
      await fillIn('[data-test-orgCreateTeam-input]', 'testTeam');

      await click('[data-test-orgCreateTeam-submitBtn]');

      if (fail) {
        assert.dom('[data-test-ak-modal-header]').exists();
        assert.dom('[data-test-orgCreateTeam-submitBtn]').exists();

        assert
          .dom('[data-test-orgCreateTeam-input]')
          .exists()
          .hasValue('testTeam');

        assert.strictEqual(teamList.length, this.organizationTeams.length);
      } else {
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
